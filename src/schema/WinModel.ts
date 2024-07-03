import {Schema, Document, model} from 'mongoose';
export interface IWin extends Document{
  username: string,
  userId: string,
  createdAt: Date,
  updatedAt: Date,
  deletedAt?: Date,
}

const modelSchema = new Schema<IWin>({
  username: {
    type: Schema.Types.String,
  },
  userId: {
    type: Schema.Types.String,
    required: true,
  },
  createdAt: {
    type: Schema.Types.Date,
    default: new Date(),
  },
  updatedAt: {
    type: Schema.Types.Date,
    default: new Date(),
  },
  deletedAt: {
    type: Schema.Types.Date,
    default: null,
  },
});

export default model('win', modelSchema );
