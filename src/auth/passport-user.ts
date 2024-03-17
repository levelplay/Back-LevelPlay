import passport from 'passport';
import localPassport from 'passport-local';
import jwtPassport, {ExtractJwt} from 'passport-jwt';
import usersModel from "../schema/UsersModel";
import {compare} from "bcrypt";
import {envVariables} from "../core/env-variables";
import UsersModel from "../schema/UsersModel";
import {Role} from "../enums/user";
const LOGIN_ERROR = 'Invalid user email and password';
const Strategy = localPassport.Strategy;
const jwtStrategy = jwtPassport.Strategy;
export const userPassport = {
      local: 'Local',
      jwt: 'Jwt',
      admin: 'admin',
};

passport.use(userPassport.local, new Strategy({usernameField: 'email', passwordField: 'password'},
  async function(email, password, cb) {
      return usersModel.findOne({email, deletedAt: null}).then(async (user)=>{
            if(!user) return cb(LOGIN_ERROR, false, {message: LOGIN_ERROR});
            const result = await compare(password, user.password);
            if(!result) return cb(LOGIN_ERROR, false, {message: LOGIN_ERROR});
            if(user.isBlocked ) return cb(LOGIN_ERROR, false, {message: 'Please contact admin to unblock'});
            cb(null, user,{message: 'User login'});
      }).catch((err)=>{
            cb(err);
      })
}));

passport.use(userPassport.jwt,  new jwtStrategy({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: envVariables.auth.jwtSecret
},  async function (jwtToken, done) {
      const user = await UsersModel.findOne({email: jwtToken.email});
      if(user && user.deletedAt) done(undefined, false);
      if(user) return done(undefined, user, jwtToken);
      return done(undefined, false);
}));

passport.use(userPassport.admin,  new jwtStrategy({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: envVariables.auth.jwtSecret
},  async function (jwtToken, done) {
      const user = await UsersModel.findOne({email: jwtToken.email});
      if(user?.role != Role.ADMIN) return done('Not Allowed', false)
      if(user) return done(undefined, user, jwtToken);
      return done(undefined, false);
}));
