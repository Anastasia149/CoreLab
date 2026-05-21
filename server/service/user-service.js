const UserModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const pool = require('../db');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const courseService = require('./course-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');

class UserService{
    /**
     * В JWT нельзя класть avatar (data URL), courses и пр. — токен раздувается,
     * cookie refreshToken превышает лимит браузера (~4KB), /refresh падает.
     */
    getJwtPayload(userLike) {
      return {
        id: userLike.id,
        email: userLike.email,
        name: userLike.name ?? '',
        role: userLike.role,
        isActivated: userLike.isActivated ?? userLike.is_activated ?? false,
      };
    }

    async registration(name, email, password, role){
      const candidate = await UserModel.findByEmail(email);
      if(candidate){
        throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`)
      }

      const allowedRoles = ['student', 'teacher'];
      const finalRole = allowedRoles.includes(role) ? role : 'student';

      const hashPassword = await bcrypt.hash(password, 3);
      const activationLink = uuid.v4();

      const user = await UserModel.create(name, email, hashPassword, activationLink, finalRole);
      await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);

      const userDto = new UserDto(user); // id, email, isActivated, role, name
      const tokens = tokenService.generateTokens(this.getJwtPayload(userDto));
      await tokenService.saveToken(userDto.id, tokens.refreshToken);

      const userWithCourses = await this.buildUserData(user);
      return { ...tokens, user: userWithCourses };
    }

    async activate(activationLink){
      const user = await UserModel.findByActivationLink( activationLink );
      if(!user){
        throw ApiError.BadRequest('Неккоректная ссылка активации');
      }
      await UserModel.activateUser(activationLink);

      const userWithCourses = await this.buildUserData(user);
      const tokens = tokenService.generateTokens(this.getJwtPayload(userWithCourses));

      await tokenService.saveToken(userWithCourses.id, tokens.refreshToken);

      return { ...tokens, user: userWithCourses };
    }

    async login(email, password){
      const user = await UserModel.findByEmail(email);
      if(!user){
        throw ApiError.BadRequest('Пользователь с таким email не найден') ;
      }
      const isPassEquales = await bcrypt.compare(password, user.password);
      if(!isPassEquales){
        throw ApiError.BadRequest('Неверный пароль');
      }
      const userWithCourses = await this.buildUserData(user);
      const tokens = tokenService.generateTokens(this.getJwtPayload(userWithCourses));

      await tokenService.saveToken(userWithCourses.id, tokens.refreshToken);
      return { ...tokens, user: userWithCourses};
    }

    async buildUserData(user){
      const userDto = new UserDto(user);
      const courses = userDto.role === 'student'
        ? await courseService.getStudentEnrollments(userDto.id)
        : [];

      return { ...userDto, courses };
    }

    async logout(refreshToken){
      const token = await tokenService.removeToken(refreshToken);
      return token;
    }

    async refresh(refreshToken){
      if(!refreshToken) {
        throw ApiError.UnauthorizedError(); 
      }
      const userData = tokenService.validateRefreshToken(refreshToken);
      const tokenFromDb = await tokenService.findToken(refreshToken);
      if(!userData || !tokenFromDb){
        throw ApiError.UnauthorizedError();
      }
      const user = await UserModel.findById(userData.id);
      const userWithCourses = await this.buildUserData(user);
      const tokens = tokenService.generateTokens(this.getJwtPayload(userWithCourses));
      
      await tokenService.saveToken(userWithCourses.id, tokens.refreshToken);
      return { ...tokens, user: userWithCourses};
    }

    async getAllUsers(){
      const users = await UserModel.getAllUsers();
      return users;
    }

    mergeOptionalText(currentVal, incoming) {
      if (incoming === undefined) {
        return currentVal ?? null;
      }
      if (incoming === null || incoming === '') {
        return null;
      }
      return String(incoming);
    }

    assertAvatarFormat(avatarValue) {
      if (avatarValue == null || avatarValue === '') {
        return;
      }
      const s = String(avatarValue).trim();
      if (s.startsWith('http://') || s.startsWith('https://')) {
        return;
      }
      if (s.startsWith('data:')) {
        const head = s.substring(0, 200);
        // jpeg/png; опционально charset=... перед base64
        if (!/^data:image\/(jpe?g|png);(?:charset=[^;]+;)?base64,/i.test(head)) {
          throw ApiError.BadRequest('Аватар: допустимы только JPG или PNG.');
        }
        return;
      }
      throw ApiError.BadRequest('Аватар: допустимы только JPG или PNG.');
    }

    async updateProfile(userId, { name, email, avatar, aboutMe, certificates, career }) {
      const current = await UserModel.findById(userId);
      if (!current) {
        throw ApiError.BadRequest('Пользователь не найден');
      }
      if (email !== current.email) {
        const existing = await UserModel.findByEmail(email);
        if (existing && String(existing.id) !== String(userId)) {
          throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`);
        }
      }
      const nextAvatar =
        avatar === undefined
          ? (current.avatar ?? null)
          : (avatar == null || avatar === '' ? null : avatar);
      if (avatar !== undefined) {
        this.assertAvatarFormat(nextAvatar);
      }
      try {
        await UserModel.updateProfile(userId, {
          name,
          email,
          avatar: nextAvatar,
          about_me: this.mergeOptionalText(current.about_me, aboutMe),
          certificates: this.mergeOptionalText(current.certificates, certificates),
          career: this.mergeOptionalText(current.career, career),
        });
      } catch (e) {
        console.error('UserModel.updateProfile', e);
        if (e && e.code === '42703') {
          throw ApiError.BadRequest(
            'В базе нет колонок профиля. Выполните скрипт server/sql/users_profile_columns_all.sql (или add_user_avatar.sql и add_teacher_profile_texts.sql).'
          );
        }
        throw new ApiError(500, 'Не удалось сохранить профиль');
      }
      const updated = await UserModel.findById(userId);
      return this.buildUserData(updated);
    }

    async deleteAccount(userId) {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw ApiError.BadRequest('Пользователь не найден');
      }

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        await client.query(`DELETE FROM submissions WHERE student_id = $1`, [userId]);
        await client.query(`DELETE FROM student_courses WHERE student_id = $1`, [userId]);

        const teacherCourses = await client.query(
          `SELECT id FROM courses WHERE author_id = $1`,
          [userId]
        );
        for (const row of teacherCourses.rows) {
          await client.query(`DELETE FROM courses WHERE id = $1`, [row.id]);
        }

        await client.query(`DELETE FROM tokens WHERE user_id = $1`, [userId]);
        await client.query(`DELETE FROM users WHERE id = $1`, [userId]);

        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        console.error('deleteAccount', e);
        throw new ApiError(500, 'Не удалось удалить аккаунт');
      } finally {
        client.release();
      }
    }
}

module.exports = new UserService();
