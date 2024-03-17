import {Schema, Document, model} from 'mongoose';
interface IModel extends Document{
  token: string,
  type: number,
  userId: string,
  createdAt: Date,
  expireAt: Date,
}

const modelSchema = new Schema<IModel>({
  token: {
    type: Schema.Types.String,
    required: true,
  },
  userId: {
    type: Schema.Types.String,
    required: true,
  },
  type: {
    type: Schema.Types.Number,
    required: true,
  },
  expireAt: {
    type: Schema.Types.Date,
    default: new Date(),
  },
});


export default model('refreshToken', modelSchema );