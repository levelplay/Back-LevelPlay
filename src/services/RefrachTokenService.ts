import {envVariables} from "../core/env-variables";
import add from 'date-fns/add';
import {Role} from "../enums/user";
import RefrachTokenModel from "../schema/RefrachTokenModel";
import usersModel from "../schema/UsersModel";
export class RefrachTokenService {
    async save(token: string , userId: string  ,role: Role) {
        const newModel =
            new RefrachTokenModel(
                {
                    token,
                    userId,
                    type: role,
                    expireAt: add(new Date(), {days: envVariables.auth.refreshTokenTimeOut}),
                    createdAt: new Date()
                });
        await newModel.save();
        console.log(userId);
        await usersModel.updateOne({_id: userId}, {$set: {
          lastActive: new Date()
          }})
        return true;
    }
    async remove(userId: string) {
        await RefrachTokenModel.deleteMany({userId: userId});
        return true;
    }

    async getToken(token: string) {
        return RefrachTokenModel.findOne({token, expireAt: {$gt: new Date()}});
    }
}