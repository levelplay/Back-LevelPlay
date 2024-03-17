import {Request, Response} from 'express';
import {envVariables, HttpStatus} from "../core/env-variables";
import {Auth} from "./Auth";
import {errorMessage, successMessage} from "../core/HttpFunction";
import {AdminUserService} from "../services/AdminUserService";

export class AdminAuth extends Auth {
    _adminUserService : AdminUserService;
    constructor() {
        super();
        this._adminUserService = new AdminUserService();
    }
    async resetAdmin(req: Request , res: Response ){
        if(req.query.password != envVariables.adminReset) {
            res.status(HttpStatus.forbidden).send(errorMessage("Not Allowed"));
            return;
        }
        await this._adminUserService.resetAdmin();
        res.status(HttpStatus.ok).send(successMessage(null,'ok'));
    }

    tryParse(value: any){
        try {
            const num = parseInt(value);
            return num;
        }catch (e) {
            return 30
        }
    }
}