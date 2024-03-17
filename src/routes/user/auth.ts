import express from 'express';
import {errorHandler} from "../../helper/errorHandler";
import passport from "passport";
import {UserAuth} from "../../controller/UserAuth";
import {userPassport} from "../../auth/passport-user";
import {bodyValidator, queryValidator, userOtp, userRegister} from '../../core/http-validators';
import Joi from "joi";

const auth = new UserAuth();
const router = express.Router();
const facebookBody = Joi.object({
  token: Joi.string().optional()
});
router.post('/login', passport.authenticate(userPassport.local, {session: false}),  errorHandler(auth.login.bind(auth)));
router.post('/refresh', errorHandler(auth.refresh.bind(auth)));
router.post('/register', bodyValidator(userRegister), errorHandler(auth.register.bind(auth)));
router.post('/forget-password', bodyValidator(userRegister), errorHandler(auth.forgetPassword.bind(auth)));
router.get('/otp',queryValidator(userOtp), errorHandler(auth.sendOtp.bind(auth)));
router.get('/logout', passport.authenticate(userPassport.jwt, {session: false}), errorHandler(auth.logout.bind(auth)));

export default router;
