import mongoose, { Schema, Document } from 'mongoose';

export interface ILot {
  qty: number;
  date: Date;
}

export interface IPortfolio extends Document {
  userId: mongoose.Types.ObjectId;
  symbol: string;
  avg_price: number;
  total_qty: number;
  lots: ILot[];
}

const LotSchema = new Schema({
  qty: { type: Number, required: true },
  date: { type: Date, required: true }
}, { _id: false });

const PortfolioSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    symbol: { type: String, required: true },
    avg_price: { type: Number, required: true },
    total_qty: { type: Number, required: true },
    lots: { type: [LotSchema], default: [] },
  },
  { timestamps: true }
);

// Ensure a user can only have one portfolio entry per symbol
PortfolioSchema.index({ userId: 1, symbol: 1 }, { unique: true });

export default mongoose.models.Portfolio || mongoose.model<IPortfolio>('Portfolio', PortfolioSchema);
