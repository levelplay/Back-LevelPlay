import LogModel from "../schema/LogModel";
export enum LogType {
    emailValidation = 'emailValidation'
}
export class LogService {
    async addLog(type: LogType, key: string, data: string){
        const model = new LogModel({ name: type, key,  data  });
        await model.save();
    }

    async addEmailLog(key: string, data: string){
        const model = new LogModel({ name:LogType.emailValidation , key,  data  });
        await model.save();
    }
}