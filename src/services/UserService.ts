import { Role, UserProvider } from "../enums/user";
import UsersModel from "../schema/UsersModel";
import RefrachTokenModel from "../schema/RefrachTokenModel";
import {generatePassword} from "../core/hash";
import { endOfDay, parse, startOfDay } from "date-fns";
import WinModel from "../schema/WinModel";
const sortOption = ['createdAt', 'totalSpend',  'points',  'createdAt',  'lastActive' ]
const orderOption = [1,  1,-1]
interface IFilter {
    username?: string,
    email?: string,
    provider?: string,
    isBlocked?: boolean,
    role?: number,
    limit: number,
    skip: number,
}
 const  accountType = [
    'all',
    'google',
    'facebook',
    'email',
 ]

export class UserService {

    async getUserById(userId: string){
        return UsersModel.findOne({_id: userId });
    }

    async getUserWin(){
        return WinModel.findOne().sort({ createdAt: -1 });
    }
   
    async userDelete(userId: string,){
        await UsersModel.deleteOne({_id: userId});
    }
    async adminBlock(userId: string){
        const user = await UsersModel.findById(userId);
        if(user){
            await RefrachTokenModel.deleteMany({userId});
            await UsersModel.updateOne({_id: userId}, {
                $set: {
                    isBlocked: !user.isBlocked
                }
            })
        }
    }

    async updateWaterMark(userId: string, watermark: boolean){
        await UsersModel.updateOne({_id: userId}, {
            $set: {
                watermark: watermark
            }
        })
    }
    async updateUpdateById(userId: string){
        return UsersModel.updateOne({_id: userId}, {
            $set: {
                lastActive: new Date()
            }
        });
    }
   
    async getUserByEmail(email: string){
        return UsersModel.findOne({email: email });
    }
    async getUserByUsename(username: string){
        return UsersModel.findOne({username: username });
    }
   
    async createUser(email: string, username: string, password: string) {
        const model = new UsersModel({email, password, isVerified: true, 
            isBlocked: false, lastActive: new Date(), provider: UserProvider.EMAIL,
            notification: true, role: Role.USER, username: username,
            isFreeCredited: true,
            createdAt: new Date()
        });
        await model.save();
        return model;
    }
    async createSocialUser(email: string, username: string, social: UserProvider) {
        const model = new UsersModel({email, password: '', isVerified: true,
            isBlocked: false, lastActive: new Date(), provider: social,
            notification: true, role: Role.USER, username: username,
            createdAt: new Date()
        });
        await model.save();
        return model;
    }
    async updatePassword(email: string, password: string){
        const code = await  generatePassword(password);

        return UsersModel.updateOne({email}, {$set: {password: code}});
    }
    async updateUser(userId: string, data: any){
        return UsersModel.updateOne({_id: userId}, {$set: data});
    }

    async updateProfile(userId: string, url: string){
        return UsersModel.updateOne({_id: userId}, {$set: {
            pic: url
        }});
    }
    async getUsers(user: IFilter){
        const filter = [];
        if(user.username){
            filter.push({username: {$regex: user.username, $options: 'i'}});
        }
        if(user.email){
            filter.push({email: {$regex: user.email, $options: 'i'}});
        }
        if(user.provider){
            filter.push({provider: user.provider});
        }
        if(user.isBlocked){
            filter.push({isBlocked: user.isBlocked});
        }
        if(user.role){
            filter.push({role: user.role});
        }
        return UsersModel.find().sort({createdAt: 'desc'}).skip(user.skip).limit(user.limit);
    }

    async getUsersFilter( body: any){
        const filter = [];
        if(body.username){
            filter.push({$or: [{username: {$regex: body.username, $options: 'i'}}, {email: {$regex: body.username, $options: 'i'}}]});
        }
        if( typeof body.status != 'undefined' && body.status != null  ){
            filter.push({isBlocked:  body.status==0 });
        }
        if( typeof body.account != 'undefined' && body.account != 0 && body.account != null  ){
            filter.push({provider:  accountType[ body.account  ] ?? 'email' });
        }
        if( typeof body.maxSpending != 'undefined' && body.maxSpending != null  ){
            filter.push({totalSpend: {$lte:body.maxSpending } });
        }
        if( typeof body.minSpending != 'undefined' && body.minSpending != null  ){
            filter.push({totalSpend: {$gte:body.minSpending } });
        }
        if( typeof body.maxCredits != 'undefined' && body.maxCredits != null  ){
            filter.push({points: {$lte:body.maxCredits } });
        }
        if( typeof body.minCredits != 'undefined' && body.minCredits != null  ){
            filter.push({points: {$gte:body.minCredits } });
        }

        if( typeof body.maxLastLogin != 'undefined' && body.maxLastLogin != '' && body.maxLastLogin != null ){
            filter.push({lastActive: {$lte: endOfDay(parse(body.maxLastLogin, 'yyyy-MM-dd', new Date())) } });
        }
        if( typeof body.minLastLogin != 'undefined' && body.minLastLogin != '' && body.minLastLogin != null ){
            filter.push({lastActive: {$gte: startOfDay(parse(body.minLastLogin, 'yyyy-MM-dd', new Date())) } });
        }

        if( typeof body.maxJoinDate != 'undefined' && body.maxJoinDate != '' && body.maxJoinDate != null ){
            filter.push({createdAt: {$lte: endOfDay(parse(body.maxJoinDate, 'yyyy-MM-dd', new Date())) } });
        }
        if( typeof body.minJoinDate != 'undefined' && body.minJoinDate != ''  && body.minJoinDate != null){
            filter.push({createdAt: {$gte: startOfDay(parse(body.minJoinDate, 'yyyy-MM-dd', new Date())) } });
        }
      
        if( body.userType == 1 ) {
            filter.push({totalSpend: {$gt: 0}});
        }
        if( body.userType == 2  ) {
            filter.push({totalSpend: 0});
        }
        if( body.userType == 3) {
            filter.push({isBlocked: true});
        }
        if( body.userType == 4 ) {
            filter.push({isBlocked: false});
        }
        if( body.userType == 5 ){
            filter.push({deletedAt: {$exists:true}})
          }
          if( body.userType == 6 ){
            filter.push({deletedAt: {$exists:false}})
          }
        let data =  [];
        let filterCount = 0;
        const count = await UsersModel.count();

        if(filter.length){
            data =  await UsersModel.find({$and: filter}).sort({[sortOption[body.sortBy] || sortOption[0]]: orderOption[body.orderBy] || orderOption[0] } as any ).skip(body.skip || 0).limit( body.take == 'all'? 100000000: body.take || 10);
            filterCount = await UsersModel.count({$and: filter});
        }else{
            data = await UsersModel.find().sort({[sortOption[body.sortBy] || sortOption[0]]: orderOption[body.orderBy] || orderOption[0] } as any).skip(body.skip || 0).limit(body.take == 'all'? 100000000: body.take || 10);
            filterCount = count;
        }
        const blocked = await UsersModel.count({isBlocked: true});
        const unPaid =await UsersModel.count({totalSpend: 0});
        const paid = await UsersModel.count({totalSpend: {$gt: 0}});
        return {data, states: {count, blocked, unPaid, paid, filterCount}};
        
    }
}