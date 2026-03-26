import mongoose, { Schema, Document } from 'mongoose';

export interface IRealizedPnL extends Document {
  userId: mongoose.Types.ObjectId;
  symbol: string;
  sell_date: Date;
  quantity: number;
  buy_price: number;
  sell_price: number;
  pnl_value: number;
  pnl_percent: number;
}

const RealizedPnLSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    symbol: { type: String, required: true },
    sell_date: { type: Date, required: true },
    quantity: { type: Number, required: true },
    buy_price: { type: Number, required: true },
    sell_price: { type: Number, required: true },
    pnl_value: { type: Number, required: true },
    pnl_percent: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.RealizedPnL || mongoose.model<IRealizedPnL>('RealizedPnL', RealizedPnLSchema);
