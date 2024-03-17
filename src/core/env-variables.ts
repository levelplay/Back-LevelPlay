import {config} from 'dotenv';
config();

const envVariables = {
  port: parseInt(process.env.PORT || '3000'),
  urls: process.env.ALLOW_URLS || '',
  salt: process.env.SALT || '',
  emailVarify: process.env.EMAIL_VARIFY_TOKEN || '',
  baseUrl: process.env.BASEURL || '' ,
  adminReset: process.env.ADMIN_RESET || '',
  adminEmail: process.env.ADMIN_EMAIL || '',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  sessionSecret: process.env.SESSION_SECRET || '',
  auth: {
    jwtSecret: process.env.JWT_SECRET || '',
    accessTokenTimeOut: process.env.JWT_TIME || '',
    refreshTokenTimeOut: parseInt(process.env.JWT_REFRESH_TOKEN_TIME_IN_DAY || '1'),
    refreshTokenSecret: process.env.REFRESH_TOKEN_JWT_SECRET || '',
  },
  email: {
      port: parseInt(process.env.EMAIL_PORT || '465') ,
      host: process.env.EMAIL_HOST || '',
      user: process.env.EMAIL_USER || '',
      password: process.env.EMAIL_PASSWORD || '',
      from: process.env.EMAIL_FROM || ''
  },
  databases: {
    url: process.env.DB_URL || '',
  },
};

const HttpStatus = {
  notFound: 404,
  ok: 200,
  created: 202,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  serverError: 500
}

export {
  envVariables,
  HttpStatus
};

