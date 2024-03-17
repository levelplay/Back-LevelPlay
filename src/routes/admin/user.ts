import express from 'express';
import {errorHandler} from "../../helper/errorHandler";
import { UserController } from '../../controller/UserContoller';
import passport from "passport";
import {userPassport} from "../../auth/passport-user";
import Joi from "joi";
import {bodyValidator} from "../../core/http-validators";

const auth = new UserController();
// eslint-disable-next-line new-cap
const router = express.Router();
export const pointAdd = Joi.object({
  points: Joi.number().required(),
  userId: Joi.string().required()
});

export const blockModel = Joi.object({
  userId: Joi.string().required()
});

router.get('/', passport.authenticate(userPassport.admin, {session: false}),
  errorHandler(auth.getUsers.bind(auth)));

  router.post('/', passport.authenticate(userPassport.admin, {session: false}),
  errorHandler(auth.getUsersFilter.bind(auth)));

router.post('/block', passport.authenticate(userPassport.admin, {session: false}),
  bodyValidator(blockModel),
  errorHandler(auth.adminBlock.bind(auth)));

router.post('/user-delete/:id', passport.authenticate(userPassport.jwt, {session: false}),
errorHandler(auth.userDelete.bind(auth)));
export default router;
