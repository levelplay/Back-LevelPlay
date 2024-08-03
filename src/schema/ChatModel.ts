import {Schema, Document, model} from 'mongoose';
import UsersModel from './UsersModel';
import ContactModel from './ContactModel';
interface IModel extends Document{
  message: string,
  receiverId: Schema.Types.ObjectId,
  contactId: Schema.Types.ObjectId,
  senderId: Schema.Types.ObjectId,
  createdAt: Date,
}

const ChatSchema = new Schema<IModel>({
  receiverId: {
    type: Schema.Types.String,
    required: true,
  },
  contactId: {
    type: Schema.Types.String,
    required: true,
    ref: ContactModel
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