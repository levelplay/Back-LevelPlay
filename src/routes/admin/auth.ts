import express from 'express';
import {errorHandler} from "../../helper/errorHandler";
import {AdminAuth} from "../../controller/AdminAuth";
import passport from "passport";
import {userPassport} from "../../auth/passport-user";

const auth = new AdminAuth();
const router = express.Router();

router.get('/reset', errorHandler(auth.resetAdmin.bind(auth)));

router.get('/dashboard',
  passport.authenticate(userPassport.admin, {session: false}),
  errorHandler(auth.getDashboardData.bind(auth)));

router.get('/dashboard/rev',
  passport.authenticate(userPassport.admin, {session: false}),
  errorHandler(auth.getDashboardMonthRavnu.bind(auth)));

export default router;
