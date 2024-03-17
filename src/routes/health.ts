import express from 'express';


// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/', (_req: express.Request, _res: express.Response)=>{
  _res.send('running..');
});

export default router;
