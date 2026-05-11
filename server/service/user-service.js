const UserModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const courseService = require('./course-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');

class UserService{
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
      const tokens = tokenService.generateTokens({...userDto});
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
      const tokens = tokenService.generateTokens({...userWithCourses});

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
      const tokens = tokenService.generateTokens({...userWithCourses});

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
      const tokens = tokenService.generateTokens({...userWithCourses});
      
      await tokenService.saveToken(userWithCourses.id, tokens.refreshToken);
      return { ...tokens, user: userWithCourses};
    }

    async getAllUsers(){
      const users = await UserModel.getAllUsers();
      return users;
    }
}

module.exports = new UserService();
