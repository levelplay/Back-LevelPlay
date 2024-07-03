import {Schema, Document, model} from 'mongoose';
export interface IWin extends Document{
  data: any,
  createdAt: Date,
  updatedAt: Date,
  deletedAt?: Date,
}

const modelSchema = new Schema<IWin>({
  data: {
    type: Schema.Types.Map,
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
