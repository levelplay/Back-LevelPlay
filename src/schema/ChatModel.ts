import {Schema, Document, model} from 'mongoose';
import UsersModel from './UsersModel';
interface IModel extends Document{
  message: string,
  receiverId: Schema.Types.ObjectId,
  senderId: Schema.Types.ObjectId,
  createdAt: Date,
}

const ChatSchema = new Schema<IModel>({
  receiverId: {
    type: Schema.Types.String,
    required: true,
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: UsersModel
  },
  message: {
    type: Schema.Types.String,
    required: true,
  },
  createdAt: {
    type: Schema.Types.Date,
    default: new Date(),
  },
});


export default model('chat', ChatSchema );