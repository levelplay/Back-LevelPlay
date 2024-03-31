import Joi from "joi";
import {Request, Response} from "express";
import {HttpStatus} from "./env-variables";
import {errorMessage} from "./HttpFunction";

export const userRegister = Joi.object({
    email: Joi.string().required().email(),
    username: Joi.string().required(),
    code: Joi.string().required(),
    password: Joi.string().min(6)
})

export const userOtp = Joi.object({
    email: Joi.string().required().email(),
    type: Joi.number().required(),
})

export const updateUser = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    username: Joi.string().required(),
    about: Joi.string().required(),
})

export const updateUserSetting = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    username: Joi.string().required(),
    about: Joi.string().required(),
})


export const bodyValidator = (schema: Joi.Schema)=>{
    return (req: Request, res: Response, next: Function)=> {
        const result =  schema.validate(req.body);
        if(result.error){
            res.status(HttpStatus.badRequest).json(errorMessage(result.error.details[0].message || ''))
            return;
        }
        next();
    }
}

export const queryValidator = (schema: Joi.Schema)=>{
    return (req: Request, res: Response, next: Function)=> {
        const result =  schema.validate(req.query);
        if(result.error){
            res.status(HttpStatus.badRequest).json(errorMessage(result.error.details[0].message || ''))
            return;
        }
        next();
    }
}