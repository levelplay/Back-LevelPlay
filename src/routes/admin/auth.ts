import express from 'express';
import {errorHandler} from "../../helper/errorHandler";
import {AdminAuth} from "../../controller/AdminAuth";

const auth = new AdminAuth();
const router = express.Router();

router.get('/reset', errorHandler(auth.resetAdmin.bind(auth)));

export default router;
