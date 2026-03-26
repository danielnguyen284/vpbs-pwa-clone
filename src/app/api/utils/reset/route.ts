import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';
import Portfolio from '@/models/Portfolio';
import RealizedPnL from '@/models/RealizedPnL';
import { verifyToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    await connectToDatabase();
    const user = await User.findById(payload.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Wipe user's data
    await Order.deleteMany({ userId: user._id });
    await Portfolio.deleteMany({ userId: user._id });
    await RealizedPnL.deleteMany({ userId: user._id });
    
    // Reset cash balance
    user.cash_balance = 0;
    await user.save();

    return NextResponse.json({ message: 'Đã reset toàn bộ dữ liệu thành công', balance: 0 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
