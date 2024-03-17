import {envVariables} from "../core/env-variables";
import UsersModel from "../schema/UsersModel";
import {Role, UserProvider} from "../enums/user";

export class AdminUserService {
    async resetAdmin() {
        await UsersModel.deleteOne({email: envVariables.adminEmail});
        const newModel =
            new UsersModel(
                {email: envVariables.adminEmail,
                    password: envVariables.adminPassword,
                    username: 'Super Admin',
                    firstName: 'Super',
                    lastName: 'Admin',
                    role: Role.ADMIN,
                    provider: UserProvider.EMAIL,
                    createdAt: new Date()
                });
        await newModel.save();
        return true;
    }
}