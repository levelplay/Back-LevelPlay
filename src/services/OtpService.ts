import OtpModel, {OtpRoles} from "../schema/OtpModel";
import add from "date-fns/add";
export class OtpService {
    getOtp(email: string, otp: string, role: OtpRoles,){
        return OtpModel.findOne({email, role, otp, expireAt: {$gte: new Date()}});
    }
    createOtp(email: string,otp: string, role: OtpRoles){
        const model = new OtpModel({email, role, otp, expireAt: add(new Date(), {minutes: 10})})
        return model.save();
    }
}