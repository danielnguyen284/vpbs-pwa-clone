import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Order from "@/models/Order";
import Portfolio from "@/models/Portfolio";
import RealizedPnL from "@/models/RealizedPnL";
import { verifyToken } from "@/lib/auth";
import { fetchDailyOHLC } from "@/lib/vps";

export async function GET() {
	try {
		const token = cookies().get("token")?.value;
		if (!token)
			return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
		const payload = await verifyToken(token);
		if (!payload)
			return NextResponse.json({ error: "Invalid token" }, { status: 401 });

		await connectToDatabase();
		// Return all orders for the user, sorted by descending date
		const orders = await Order.find({ userId: payload.userId }).sort({
			createdAt: -1,
		});
		return NextResponse.json({ orders });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function POST(req: Request) {
	try {
		const token = cookies().get("token")?.value;
		if (!token)
			return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
		const payload = await verifyToken(token);
		if (!payload)
			return NextResponse.json({ error: "Invalid token" }, { status: 401 });

		const { symbol, side, price, quantity, order_date } = await req.json();
		if (!symbol || !side || !price || !quantity || !order_date) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		await connectToDatabase();

		const user = await User.findById(payload.userId);
		if (!user)
			return NextResponse.json({ error: "User not found" }, { status: 404 });

		const totalValue = price * quantity * 1000;
		const fee = totalValue * 0.0015; // 0.15% fee
		const costAfterFee = totalValue + fee;
		const proceedsAfterFee = totalValue - fee;
		const requestedDate = new Date(order_date);

		// Default status
		let status = "Chờ khớp";
		let filledPrice: number | undefined;

		// Fetch VPS data to match order
		const ohlc = await fetchDailyOHLC(symbol, requestedDate);

		let isMatched = false;

		if (ohlc) {
			// If requested price is within range, it matches immediately.
			if (price <= ohlc.h && price >= ohlc.l) {
				status = "Khớp hết";
				filledPrice = price;
				isMatched = true;
			} else {
				return NextResponse.json(
					{
						error: `Giá đặt (${price.toLocaleString("vi-VN")}) nằm ngoài biên độ giao dịch của ngày này (${ohlc.l.toLocaleString("vi-VN")} - ${ohlc.h.toLocaleString("vi-VN")} VND).`,
					},
					{ status: 400 },
				);
			}
		} else {
			return NextResponse.json(
				{ error: "Không tìm thấy dữ liệu lịch sử giá giao dịch cho ngày này." },
				{ status: 400 },
			);
		}

		const portfolioDoc = await Portfolio.findOne({ userId: user._id, symbol });

		if (side === "M") {
			// BUY
			if (user.cash_balance < costAfterFee) {
				return NextResponse.json(
					{ error: "Sức mua không đủ (Không đủ trả phí 0.15%)" },
					{ status: 400 },
				);
			}

			if (isMatched) {
				user.cash_balance -= costAfterFee;
				await user.save();

				if (portfolioDoc) {
					const newTotalQty = portfolioDoc.total_qty + quantity;
					const totalCost =
						portfolioDoc.avg_price * portfolioDoc.total_qty * 1000 +
						costAfterFee;
					portfolioDoc.avg_price = totalCost / (newTotalQty * 1000);
					portfolioDoc.total_qty = newTotalQty;
					portfolioDoc.lots.push({ qty: quantity, date: requestedDate });
					await portfolioDoc.save();
				} else {
					await Portfolio.create({
						userId: user._id,
						symbol,
						avg_price: costAfterFee / (quantity * 1000), // Adjusted for fee
						total_qty: quantity,
						lots: [{ qty: quantity, date: requestedDate }],
					});
				}
			}
		} else if (side === "B") {
			// SELL
			if (!portfolioDoc) {
				return NextResponse.json(
					{ error: "Không có cổ phiếu này trong danh mục" },
					{ status: 400 },
				);
			}

			// Calculate available_qty for sell day (diffDays >= 2)
			const orderTsUTC = Date.UTC(
				requestedDate.getUTCFullYear(),
				requestedDate.getUTCMonth(),
				requestedDate.getUTCDate(),
			);
			let availableQty = 0;
			const availableLots: { lot: any; index: number }[] = [];

			portfolioDoc.lots.forEach((lot: any, idx: number) => {
				const lotTsUTC = Date.UTC(
					lot.date.getUTCFullYear(),
					lot.date.getUTCMonth(),
					lot.date.getUTCDate(),
				);
				const diffDays = Math.floor(
					(orderTsUTC - lotTsUTC) / (1000 * 3600 * 24),
				);
				if (diffDays >= 2) {
					availableQty += lot.qty;
					availableLots.push({ lot, index: idx });
				}
			});

			if (availableQty < quantity) {
				return NextResponse.json(
					{
						error: `Số lượng khả dụng không đủ (K.Dụng: ${availableQty}, Cần bán: ${quantity})`,
					},
					{ status: 400 },
				);
			}

			if (isMatched) {
				user.cash_balance += proceedsAfterFee;
				await user.save();

				let remainingToSell = quantity;

				// Sort available lots by date ascending (FIFO)
				availableLots.sort(
					(a, b) =>
						new Date(a.lot.date).getTime() - new Date(b.lot.date).getTime(),
				);

				// Mutate array based on FIFO
				for (const al of availableLots) {
					if (remainingToSell <= 0) break;
					const lotInDb = portfolioDoc.lots[al.index];
					if (lotInDb.qty <= remainingToSell) {
						remainingToSell -= lotInDb.qty;
						lotInDb.qty = 0;
					} else {
						lotInDb.qty -= remainingToSell;
						remainingToSell = 0;
					}
				}

				// Remove empty lots and update total
				portfolioDoc.lots = portfolioDoc.lots.filter((l: any) => l.qty > 0);
				portfolioDoc.total_qty -= quantity;

				const buyValue = portfolioDoc.avg_price * quantity * 1000;
				const pnlValue = proceedsAfterFee - buyValue;
				const pnlPercent = buyValue === 0 ? 0 : (pnlValue / buyValue) * 100;

				await RealizedPnL.create({
					userId: user._id,
					symbol,
					sell_date: requestedDate,
					quantity,
					buy_price: portfolioDoc.avg_price,
					sell_price: price, // Base price
					pnl_value: pnlValue, // Actual money made minus fee minus original buy cost (where buy cost includes buy fee)
					pnl_percent: pnlPercent,
				});

				if (portfolioDoc.total_qty === 0) {
					await portfolioDoc.deleteOne();
				} else {
					await portfolioDoc.save();
				}
			}
		}

		const order = await Order.create({
			userId: user._id,
			symbol,
			side,
			price,
			quantity,
			order_date: requestedDate,
			status,
			filled_price: filledPrice,
			fee: isMatched ? fee : 0,
		});

		return NextResponse.json({ message: "Order processed", order });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
