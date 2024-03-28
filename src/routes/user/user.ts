import express from 'express';
import {errorHandler} from "../../helper/errorHandler";
import passport from "passport";
import {userPassport} from "../../auth/passport-user";
import {UserController} from "../../controller/UserContoller";
import {bodyValidator, updateUser, updateUserSetting} from "../../core/http-validators";
import multer from "multer";

const upload = multer({
  storage:  multer.diskStorage(
    {destination: 'uploads/profile',
      filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + `.${file.mimetype.split('/')[1]}`)
      }
    })
});
const controller = new UserController();
const router = express.Router();

router.post('/update', passport.authenticate(userPassport.jwt, {session: false}), bodyValidator(updateUser),
    errorHandler(controller.updateUser.bind(controller)));

router.get('/leaderboard',
    errorHandler(controller.leaderboard.bind(controller)));

router.post('/update/profile', passport.authenticate(userPassport.jwt, {session: false}),
  upload.single('pic'),
  errorHandler(controller.updateProfile.bind(controller)));

router.post('/setting', passport.authenticate(userPassport.jwt, {session: false}), bodyValidator(updateUserSetting),
    errorHandler(controller.updateUser.bind(controller)));

router.delete('/',passport.authenticate(userPassport.jwt, {session: false}),
  errorHandler(controller.deleteMe.bind(controller)));

export default router;
