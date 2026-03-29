import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  symbol: string;
  side: 'M' | 'B'; // MUA or BAN
  price: number;
  quantity: number;
  order_date: Date;
  status: 'Khớp hết' | 'Từ chối' | 'Chờ khớp';
  filled_price?: number;
  fee?: number;
  tax?: number;
}

const OrderSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    symbol: { type: String, required: true },
    side: { type: String, enum: ['M', 'B'], required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    order_date: { type: Date, required: true },
    status: { type: String, enum: ['Khớp hết', 'Từ chối', 'Chờ khớp'], default: 'Chờ khớp' },
    filled_price: { type: Number },
    fee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
