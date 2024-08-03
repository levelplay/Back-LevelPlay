import {Schema, Document, model} from 'mongoose';
import UsersModel from './UsersModel';
interface IModel extends Document{
  userId: Schema.Types.ObjectId,
  otherUser: Schema.Types.ObjectId,
  createdAt: Date,
}

const ContactSchema = new Schema<IModel>({
  userId: {
    type: Schema.Types.String,
    required: true,
  },
  otherUser: {
    type: Schema.Types.ObjectId,
    ref: UsersModel
  },
  createdAt: {
    type: Schema.Types.Date,
    default: new Date(),
  },
});


export default model('contact', ContactSchema );