const jwt = require('jsonwebtoken');
const tokenModel = require('../models/token-model');

class TokenService{
    generateTokens(payload){
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: '30m'});
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: '30d'});
        return {   
            accessToken, 
            refreshToken
        };
    }

    validateAccessToken(token){
        try{
            const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            return userData;
        } catch(e){
            return null;
        }
    }

    validateRefreshToken(token){
        try{
            const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            return userData;
        } catch(e){
            return null;
        }
    }

    async saveToken(userId, refreshToken){
        return tokenModel.save(userId, refreshToken);
    }

    async removeToken(refreshToken){
        return tokenModel.removeToken(refreshToken);
    }

    async findToken(refreshToken){
        return tokenModel.findByRefreshToken(refreshToken);
    }
}

module.exports = new TokenService();