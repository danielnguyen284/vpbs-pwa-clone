import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  passwordHash: string;
  cash_balance: number;
  role: 'normal' | 'vip';
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    cash_balance: { type: Number, default: 0 },
    role: { type: String, enum: ['normal', 'vip'], default: 'normal' },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
