import {Schema, Document, model} from 'mongoose';
import UsersModel from './UsersModel';
interface IModel extends Document{
  message: string,
  userId: Schema.Types.ObjectId,
  createdAt: Date,
}

const GlobleChatSchema = new Schema<IModel>({
  userId: {
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


export default model('globleChat', GlobleChatSchema );