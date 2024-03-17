import {generatePassword} from "../core/hash";

export function passwordHash(next: any) {
    // @ts-ignore
    const user = this;
    user.updatedAt = new Date();
    if (user.isModified('password')) {
        console.log(user.password, 'user.password');
        generatePassword(user.password).then((e)=>{
            user.password = e;
            next();
        }).catch((e)=>{
            throw e;
        });
    }
}

export function updateDate(next: any) {
    // @ts-ignore
    const user = this;
    user.updatedAt = new Date();
    next();
}