import {Schema, Document, model} from 'mongoose';
export enum OtpRoles {
  NEW_ACCOUNT= 1,
  FORGET_PASSWORD= 2
}
interface IOtp extends Document{
  email: string,
  otp: string,
  createdAt: Date,
  expireAt: Date,
  role: number,
}

const modelSchema = new Schema<IOtp>({
  email: {
    type: Schema.Types.String,
    required: [true, 'Email is Required'],
  },
  role: {
    type: Schema.Types.Number,
    required: [true, 'Role is Required'],
  },
  otp: {
    type: Schema.Types.String,
    required: [true, 'Otp is Required'],
  },
  createdAt: {
    type: Schema.Types.Date,
    default: new Date(),
  },
  expireAt: {
    type: Schema.Types.Date,
    default: new Date(),
  },
});

export default model('otp', modelSchema );
