import {Schema, Document, model} from 'mongoose';
import {passwordHash} from "../database/schema";
export interface IUser extends Document{
  username: string,
  email: string,
  password: string,
  provider: string,
  notification: boolean,
  pic: string,
  isVerified: boolean,
  isBlocked: boolean,
  blockedAt: Date,
  createdAt: Date,
  updatedAt: Date,
  deletedAt?: Date,
  lastActive: Date,
  role: number,
  win: number,
  tempWin: number,
}

const modelSchema = new Schema<IUser>({
  username: {
    type: Schema.Types.String,
    required: [true, 'Username is Required'],
  },
  email: {
    unique: true,
    type: Schema.Types.String,
  },
  password: {
    type: Schema.Types.String,
  },
  role: {
    type: Schema.Types.Number,
    required: [true, 'Role is Required'],
  },
  win: {
    type: Schema.Types.Number,
    default: 0
  },
  tempWin: {
    type: Schema.Types.Number,
    default: 0
  },
  provider: {
    type: Schema.Types.String,
    required: [true, 'Provider is Required'],
  },
  notification: {
    type: Schema.Types.Boolean,
    default: true,
    required: [true, 'Notification is Required'],
  },
  isVerified: {
    type: Schema.Types.Boolean,
    default: false,
    required: [true, 'IsVerified is Required'],
  },
  isBlocked: {
    type: Schema.Types.Boolean,
    default: false,
    required: [true, 'IsBlocked is Required'],
  },
  pic: {
    type: Schema.Types.String,
    default: ''
  },
  blockedAt: {
    type: Schema.Types.Date,
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
  lastActive: {
    type: Schema.Types.Date,
    default: new Date(),
  },

});

modelSchema.pre('save', passwordHash);
// modelSchema.pre('updateOne', passwordHash);

modelSchema.set('toJSON', {
  transform: ( _: unknown, result: any)=>{
    delete result.password;
    return result;
  }
});

export default model('user', modelSchema );
