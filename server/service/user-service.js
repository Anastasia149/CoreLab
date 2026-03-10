const UserModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
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

      return { ...tokens, user: userDto};
    }

    async activate(activationLink){
      const user = await UserModel.findByActivationLink( activationLink );
      if(!user){
        throw ApiError.BadRequest('Неккоректная ссылка активации');
      }
      await UserModel.activateUser(activationLink);
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
      const userDto = new UserDto(user);
      const tokens = tokenService.generateTokens({...userDto});

      await tokenService.saveToken(userDto.id, tokens.refreshToken);
      return { ...tokens, user: userDto};
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
      const userDto = new UserDto(user);
      const tokens = tokenService.generateTokens({...userDto});
      
      await tokenService.saveToken(userDto.id, tokens.refreshToken);
      return { ...tokens, user: userDto};
    }

    async getAllUsers(){
      const users = await UserModel.getAllUsers();
      return users;
    }
}

module.exports = new UserService();
