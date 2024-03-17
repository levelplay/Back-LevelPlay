import {Request, Response} from "express";
import {HttpStatus} from "../core/env-variables";
import {errorMessage} from "../core/HttpFunction";

export function errorHandler(fun: Function) {
    return async (req: Request, res: Response, next: Function) => {
        try {
           await fun(req, res, next);
        }catch (e :any){
            console.log(e);
            res.status(e.status || HttpStatus.serverError).send(errorMessage(e.message));
        }
    }
}