const userService = require('../service/user-service');
const {validationResult} = require('express-validator');
const ApiError = require('../exceptions/api-error');

class UserController{
    async registration(req, res, next){
        try{
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                return next(ApiError.BadRequest('Ошибка при валидации', errors.array()));
            }
            const {name, email, password, role} = req.body;
            const userData = await userService.registration(name, email, password, role);
            res.cookie('refreshToken', userData.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000, 
                httpOnly: true,
                sameSite: 'lax',
                secure: false
            });
            return res.json(userData)
            
        } catch(e){
            next(e);
        }
        
    }

    async login(req, res, next){
        try{
            const {email, password} = req.body;
            const userData = await userService.login(email,password);
            res.cookie('refreshToken', userData.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000, 
                httpOnly: true,
                sameSite: 'lax',
                secure: false
            });
            return res.json(userData)
        } catch(e){
            next(e);
        }
    }

    async logout(req, res, next){
        try{
            const {refreshToken} = req.cookies;
            const token = await userService.logout(refreshToken);
            res.clearCookie('refreshToken');
            return res.json(token);
        } catch(e){
            next(e);
        }
    }

    async activation(req, res, next){
        try{
            const activationLink = req.params.link;
            const userData = await userService.activate(activationLink);

            res.cookie('refreshToken', userData.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                sameSite: 'lax',
                secure: false
            });

            // можно передать accessToken через query (или лучше хранить на клиенте)
            return res.redirect(`${process.env.CLIENT_URL}?token=${userData.accessToken}`);
        } catch(e){
            next(e);
        }
    }

    async refresh(req, res, next){
        try{
            const {refreshToken} = req.cookies;
            const userData = await userService.refresh(refreshToken);
            res.cookie('refreshToken', userData.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000, 
                httpOnly: true,
                sameSite: 'lax',
                secure: false
            });
            return res.json(userData)
        } catch(e){
            next(e);
        }
    }

    
    async getUsers(req, res, next){
        try{
            const users = await userService.getAllUsers();
            return res.json(users);
        } catch(e){
            next(e);
        }
    }
}

module.exports = new UserController();
