import {Schema, Document, model} from 'mongoose';
interface IModel extends Document{
  name: string,
  key: string,
  data: any,
  createdAt: Date,
}

const logSchema = new Schema<IModel>({
  name: {
    type: Schema.Types.String,
    required: true,
  },
  key: {
    type: Schema.Types.String,
    required: true,
  },
  data: {
    type: Schema.Types.String,
    required: true,
  },
  createdAt: {
    type: Schema.Types.Date,
    default: new Date(),
  },
});


export default model('logs', logSchema );