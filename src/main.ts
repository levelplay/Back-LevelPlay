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
import { Server } from "socket.io";
import { createServer }  from 'node:http';
import { SocketService } from './services/SocketService';
import cron from 'node-cron';
import UsersModel from './schema/UsersModel';
import WinModel from './schema/WinModel';
// Initialize the express engine
const exp: express.Application = express();
const socketService = new SocketService();
exp.use('/uploads', express.static('uploads'))
// add middlewares
exp.use(passport.initialize());
// app.use(helmet({}));
exp.use(bodyParser.json({}));
exp.use(cors({
  // origin: envVariables.urls.split(','),
  origin: '*',
  allowedHeaders: '*',
  methods: ['POST', 'GET', "PUT", 'HEAD', 'DELETE'],
}));
exp.use(compression());
// add database services
mongoose.connect(envVariables.databases.url).then(async ()=>{
  console.log('database connected');
}).catch((e)=>{
  console.log(`database not connected => ${e}`);
});

// security for express

exp.disable('x-powered-by');
exp.get('/api', (req, res)=>{
  res.send('ok');
})
// add routers
routers.forEach((e)=>{
  exp.use(`/api/${e.path}` , e.router);
});
const app = createServer(exp);
const io = new Server(app, {
  cors: {
    origin: '*'
  }
});

io.on('connection', socketService.connented.bind(socketService))
// io.on('disconnect', socketService.disconnected.bind(socketService))

// for 6 hour * * */6 * * *
cron.schedule('* */5 * * * *', async ()=>{
  const user = await UsersModel.findOne().sort({tempOrder: -1});
  if( user ){
    const newWinModel = new WinModel({ username: user.username, userId: user.id, createdAt: new Date()  })
    await newWinModel.save();
    await UsersModel.updateMany({}, { $set: { tempWin: 0 } });
  }
});

// Server setup
app.listen(envVariables.port, () => {
  console.log(`Server is running http://localhost:${envVariables.port}/`);
});
