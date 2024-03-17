// Import the express in typescript file
import express from 'express';
import cors from 'cors';
import routers from './routes';
import {envVariables} from './core/env-variables';
import compression from 'compression';
import * as mongoose from 'mongoose';
import passport from "passport";
import './auth/passport-user';
import bodyParser from "body-parser";

// Initialize the express engine
const app: express.Application = express();
app.use('/uploads', express.static('uploads'))
// add middlewares
app.use(passport.initialize());
// app.use(helmet({}));
app.use(bodyParser.json({}));
app.use(cors({
  // origin: envVariables.urls.split(','),
  origin: '*',
  allowedHeaders: '*',
  methods: ['POST', 'GET', "PUT", 'HEAD', 'DELETE'],
}));
app.use(compression());
// add database services
mongoose.connect(envVariables.databases.url).then(async ()=>{
  console.log('database connected');
}).catch((e)=>{
  console.log(`database not connected => ${e}`);
});

// security for express

app.disable('x-powered-by');
app.get('/api', (req, res)=>{
  res.send('ok');
})
// add routers
routers.forEach((e)=>{
  app.use(`/api/${e.path}` , e.router);
});
// Server setup
app.listen(envVariables.port, () => {
  console.log(`Server is running http://localhost:${envVariables.port}/`);
});
