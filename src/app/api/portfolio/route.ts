import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectToDatabase from "@/lib/mongodb";
import Portfolio from "@/models/Portfolio";
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

		const portfolios = await Portfolio.find({ userId: payload.userId });

		// Enrich with current market price
		const enriched = await Promise.all(
			portfolios.map(async (p: any) => {
				// Using today for current price
				const today = new Date();
				const ohlc = await fetchDailyOHLC(p.symbol, today);

				let currentPrice = p.avg_price; // fallback to avg_price
				if (ohlc && ohlc.c) {
					currentPrice = ohlc.c; // latest close
				}

				const todayUTC = Date.UTC(
					today.getUTCFullYear(),
					today.getUTCMonth(),
					today.getUTCDate(),
				);
				let available_qty = 0;
				let t0_qty = 0;
				let t1_qty = 0;
				const t2_qty = 0; // Everything >= 2 is available directly, but returning 0 for UI

				if (p.lots) {
					p.lots.forEach((lot: any) => {
						const lotDate = new Date(lot.date);
						const lotUTC = Date.UTC(
							lotDate.getUTCFullYear(),
							lotDate.getUTCMonth(),
							lotDate.getUTCDate(),
						);
						const diffDays = Math.floor(
							(todayUTC - lotUTC) / (1000 * 3600 * 24),
						);

						if (diffDays <= 0) t0_qty += lot.qty;
						else if (diffDays === 1) t1_qty += lot.qty;
						else available_qty += lot.qty;
					});
				}

				const marketValue = currentPrice * p.total_qty * 1000;
				const costValue = p.avg_price * p.total_qty * 1000;
				const unrealizedPnl = marketValue - costValue;
				const unrealizedPnlPercent =
					costValue > 0 ? (unrealizedPnl / costValue) * 100 : 0;

				return {
					_id: p._id,
					symbol: p.symbol,
					avg_price: p.avg_price,
					total_qty: p.total_qty,
					available_qty,
					t0_qty,
					t1_qty,
					t2_qty,
					current_price: currentPrice,
					market_value: marketValue,
					cost_value: costValue,
					unrealized_pnl: unrealizedPnl,
					unrealized_pnl_percent: unrealizedPnlPercent,
				};
			}),
		);

		return NextResponse.json({ portfolios: enriched });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
