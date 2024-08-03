import express from 'express';
import {errorHandler} from "../../helper/errorHandler";
import passport from "passport";
import {userPassport} from "../../auth/passport-user";
import {UserController} from "../../controller/UserContoller";
import {bodyValidator, getChatId, queryValidator, updateUser, updateUserSetting} from "../../core/http-validators";
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

router.get('/chat', passport.authenticate(userPassport.jwt, {session: false}), queryValidator(getChatId),
    errorHandler(controller.getChat.bind(controller)));

    router.get('/contact', passport.authenticate(userPassport.jwt, {session: false}),
    errorHandler(controller.getContact.bind(controller)));
    router.post('/contact', passport.authenticate(userPassport.jwt, {session: false}), queryValidator(getChatId),
    errorHandler(controller.addContact.bind(controller)));
    router.delete('/contact', passport.authenticate(userPassport.jwt, {session: false}), queryValidator(getChatId),
    errorHandler(controller.removeContact.bind(controller)));

router.get('/leaderboard',
    errorHandler(controller.leaderboard.bind(controller)));

router.get('/lastWin',
      errorHandler(controller.getUserWin.bind(controller)));

router.post('/update/profile', passport.authenticate(userPassport.jwt, {session: false}),
  upload.single('pic'),
  errorHandler(controller.updateProfile.bind(controller)));

router.post('/setting', passport.authenticate(userPassport.jwt, {session: false}), bodyValidator(updateUserSetting),
    errorHandler(controller.updateUser.bind(controller)));

router.delete('/',passport.authenticate(userPassport.jwt, {session: false}),
  errorHandler(controller.deleteMe.bind(controller)));

export default router;
