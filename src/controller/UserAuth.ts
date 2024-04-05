import {Request, Response} from 'express';
import {HttpStatus} from "../core/env-variables";
import {Auth} from "./Auth";
import {errorMessage, successMessage} from "../core/HttpFunction";
import {UserService} from "../services/UserService";
import {OtpRoles} from "../schema/OtpModel";
import {generateOTP} from "../core/hash";
import { LogService } from '../services/LogService';

export class UserAuth extends Auth {
    _userService: UserService;
    _logService: LogService;
    constructor() {
        super();
        this._userService = new UserService();
        this._logService = new LogService();
    }

    async login(req: Request , res: Response){
        const user:any =req.user || {};
        await this._userService.updateUpdateById(user._id);
        await this.createToken(user, user.role, res);
    }

    async refresh(req: Request , res: Response){
        const token = req.body['token'];
        const data = await this._refreshTokenService.getToken(token);
        if(!data) return res.status(HttpStatus.unauthorized).send(errorMessage("Invalid Token"));
        const user = await this._userService.getUserById(data.userId);
        if(!user) return res.status(HttpStatus.unauthorized).send(errorMessage("Invalid Token") );
        await this.createToken(user, user.role, res);
    }

    async register(req: Request, res: Response){
        const body = req.body;
        const otp = await this._otpService.getOtp(body.email, body.code, OtpRoles.NEW_ACCOUNT);
        if(!otp){
            res.status(HttpStatus.badRequest).json(errorMessage('Invalid otp'));
            return;
        }
        let oldUser = await this._userService.getUserByEmail( body.email);
        if(oldUser){
            if(oldUser.deletedAt){
                res.status(HttpStatus.badRequest).json(errorMessage('Your account deleted. Please contact admin.'));
                return;
            }
            res.status(HttpStatus.badRequest).json(errorMessage('User already exist'));
            return;
        }
        oldUser = await this._userService.getUserByUsename( body.username);
        if(oldUser){
            res.status(HttpStatus.badRequest).json(errorMessage('User already exist'));
            return;
        }
        const user = await this._userService.createUser(body.email,  body.username ,body.password);
        return this.createToken(user, user.role, res);
    }

    async forgetPassword(req: Request, res: Response){
        const body = req.body;
        const otp = await this._otpService.getOtp(body.email, body.code, OtpRoles.FORGET_PASSWORD);
        if(!otp){
            res.status(HttpStatus.badRequest).json(errorMessage('Invalid otp'));
            return;
        }
        await this._userService.updatePassword(body.email, body.password);
        res.status(HttpStatus.ok).json(successMessage(null, 'Password updated please login'));
    }

    async sendOtp(req: Request, res: Response){
        const query: any = req.query;
        const user = await this._userService.getUserByEmail(query.email);
        if(user?.deletedAt){
            res.status(HttpStatus.badRequest).json(errorMessage('Your account deleted. Please contact admin.'));
            return;
        }
        const otp = generateOTP(6);
        if(query.type === OtpRoles.NEW_ACCOUNT.toString()) {
            if(user){
                res.status(HttpStatus.badRequest).json(errorMessage('User Already exist.'));
                return;
            }
            await this._otpService.createOtp(query.email, otp, OtpRoles.NEW_ACCOUNT);
            await this._email.otp(query.email, otp);
            res.send(successMessage(null, 'Please check email.'));
        }else{
            if(user){
                await this._otpService.createOtp(query.email, otp, OtpRoles.FORGET_PASSWORD);
                 await this._email.otp(query.email, otp);
                res.send(successMessage(null, 'Please check email.'));
            }
        }
    }
}