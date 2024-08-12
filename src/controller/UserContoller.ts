import {Request, Response} from 'express';
import { HttpStatus} from "../core/env-variables";
import { errorMessage, successMessage } from "../core/HttpFunction";
import {UserService} from "../services/UserService";
import UsersModel from '../schema/UsersModel';
import {EmailService} from "../email-service/EmailService";
import WinModel from '../schema/WinModel';
import { addMinutes, formatDistance } from 'date-fns';
import ChatModel from '../schema/ChatModel';
import ContactModel from '../schema/ContactModel';
import GlobleChatModel from '../schema/GlobleChatModel';
export class UserController  {
    _userService: UserService;
    _emailService: EmailService;
    constructor() {
        this._userService = new UserService();
        this._emailService = new EmailService();
    }

    async getUsers(req: Request, res: Response){
        const users = await this._userService.getUsers(req.query as any);
        res.status(HttpStatus.ok).json(successMessage({users}, ''));
    }

    async leaderboard(req: Request, res: Response){
        const users = await UsersModel.find({ win: { $ne: 0 } }).sort({win: -1}).limit(10).select(['username', 'win']);
        const win = await WinModel.findOne().sort({ createdAt: -1 });
        const lastWin = new Date(win?.createdAt || new Date());
        const time = addMinutes(lastWin, 30);
        const diff = formatDistance(new Date(),time);
        const current = new Date();
        res.status(HttpStatus.ok).json(successMessage({users,diff,time, lastWin, current}, ''));
    }

    async getUserWin(req: Request, res: Response){
        const win = await WinModel.findOne().sort({ createdAt: -1 });
        const time = addMinutes(new Date(win?.createdAt || new Date()), 5);
        const diff = formatDistance(new Date(), time);
        res.status(HttpStatus.ok).json(successMessage({win,diff}, ''));
    }

    async getUsersFilter(req: Request, res: Response){
        const users = await this._userService.getUsersFilter( req.body);
        res.status(HttpStatus.ok).json(successMessage(users, ''));
    }

    async userDelete(req: Request, res: Response){
        await this._userService.userDelete(req.params.id);
        res.status(HttpStatus.ok).json(successMessage(null, 'User Deleted'));
    }

    async adminBlock(req: Request, res: Response){
        await this._userService.adminBlock(req.body.userId);
        res.status(HttpStatus.ok).json(successMessage(null, 'User updated'));
    }

    async updateUser(req: Request, res: Response){
        const user: any = req?.user;
        await this._userService.updateUser(user?._id, req.body);
        res.status(HttpStatus.ok).json(successMessage(null, 'User Updated'));
    }

    async getChat(req: Request, res: Response){
        const count:string = req.query.count as string;
        const limit:string = req.query.limit as string;
        const chats = await ChatModel.find({ 
            contactId: req.query.contactId,
         }).skip(parseInt(count || '0')).limit(parseInt(limit || '0')).populate(['senderId', 'receiverId']).sort({ createdAt: -1 })
        res.status(HttpStatus.ok).json(successMessage(chats, 'User Updated'));
    }

    async getChatGloble(req: Request, res: Response){
        const count:string = req.query.count as string;
        const limit:string = req.query.limit as string;
        const chats = await GlobleChatModel.where()
        .skip(parseInt(count || '0'))
        .limit(parseInt(limit || '0'))
        .populate(['userId'])
        .sort({ createdAt: -1 }).exec()
        res.status(HttpStatus.ok).json(successMessage(chats, 'User Updated'));
    }
    async getContact(req: Request, res: Response){
        const user: any = req?.user;
        const contacts = await ContactModel.find({ 
            $or: [
                {
                    userId: user?._id
                },
                {
                    otherUser: user?._id
                }
            ]
         }).populate(['userId', 'otherUser']).sort({ createdAt: -1 });
        const contactsIds = contacts.map(e=> e._id);
        const chats = [];
        for(let contactsId of contactsIds){
            const chat = await ChatModel.findOne({ contactId: contactsId }).sort({  createdAt: -1  })
            if( chat ){
                chats.push(chat?.toJSON());
            }
        }
        res.status(HttpStatus.ok).json(successMessage({contacts, chats}, 'User Updated'));
    }

    async addContact(req: Request, res: Response){
        const user: any = req?.user;
        const otherUser = await UsersModel.findOne({ email: req.query.email });
        if(!otherUser){
            res.status(HttpStatus.badRequest).json(errorMessage('User Not Found'));
            return;
        }
        const contactNew = new ContactModel({ 
            userId: user?._id,
            otherUser: otherUser._id
         })
        await contactNew.save();
        res.status(HttpStatus.ok).json(successMessage(null, 'Contact added'));
    }

    async removeContact(req: Request, res: Response){
         await ContactModel.deleteOne({ 
            _id: req.query.id,
         });
        res.status(HttpStatus.ok).json(successMessage(null, 'Contact removed'));
    }

    async updateProfile(req: Request, res: Response){
        const user: any = req?.user;
        await this._userService.updateProfile(user?._id, req.file?.path || '');
        res.status(HttpStatus.ok).json(successMessage(null, 'User Updated'));
    }

    async deleteMe(req: Request, res: Response){
        const user: any = req?.user;
        await UsersModel.updateOne({_id: user._id}, {$set: {deletedAt: new Date()}})
        res.status(HttpStatus.ok).json(successMessage('User Deleted', ''));
    }
}