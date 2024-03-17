import {Request, Response} from 'express';
import {envVariables} from "../core/env-variables";
import jwt from 'jsonwebtoken';
import {RefrachTokenService} from "../services/RefrachTokenService";
import {Role} from "../enums/user";
import {successMessage} from "../core/HttpFunction";
import {EmailService} from "../email-service/EmailService";
import {OtpService} from "../services/OtpService";

export class Auth {
    _refreshTokenService: RefrachTokenService;
    _email: EmailService;
    _otpService: OtpService;
    constructor() {
        this._refreshTokenService = new RefrachTokenService();
        this._email = new EmailService();
        this._otpService = new OtpService();
    }

    async createToken(user: any , type: Role, res: Response){
        const token = jwt.sign({ email: user.email || '', id: user._id || '', role: user.role },
            envVariables.auth.jwtSecret,{expiresIn:  envVariables.auth.accessTokenTimeOut} );
        const refreshToken = jwt.sign({ email: user.email || '', id: user._id || '', role: user.role},
            envVariables.auth.refreshTokenSecret );
        await this._refreshTokenService.remove(user._id.toString());
        await this._refreshTokenService.save(refreshToken, user._id || '', type);
        res
            .cookie('RefreshToken', refreshToken, {httpOnly: true, sameSite: 'strict'})
            .header('Authorization', `Bearer ${token}`)
            .send({user: user, token: `Bearer ${token}`, refreshToken: refreshToken });
    }

    async logout(req: Request , res: Response){
        const user:any =req.user || {};
        await this._refreshTokenService.remove(user._id.toString());
        res.send(successMessage(null, 'Logout Successfully'));
    }

}