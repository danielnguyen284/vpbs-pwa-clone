import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectToDatabase from "@/lib/mongodb";
import Portfolio from "@/models/Portfolio";
import { verifyToken } from "@/lib/auth";
import { fetchRealtimeStocks, fetchTradingHistoryDates } from "@/lib/vps";

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

		// Extract unique symbols for batch fetching
		const symbols = Array.from(new Set(portfolios.map((p) => p.symbol)));
		const realtimeData = await fetchRealtimeStocks(symbols);

		// Enrich with current market price
		const enriched = await Promise.all(
			portfolios.map(async (p: any) => {
				const today = new Date();
				const rt = realtimeData[p.symbol];

				let currentPrice = p.avg_price; // fallback to avg_price
				let refPrice = p.avg_price;
				let ceilPrice = p.avg_price * 1.07;
				let floorPrice = p.avg_price * 0.93;

				if (rt) {
					currentPrice = rt.lastPrice || rt.r || p.avg_price;
					refPrice = rt.r !== undefined ? rt.r : currentPrice;
					ceilPrice = rt.c !== undefined ? rt.c : currentPrice * 1.07;
					floorPrice = rt.f !== undefined ? rt.f : currentPrice * 0.93;
				}

				let available_qty = 0;
				let t0_qty = 0;
				let t1_qty = 0;
				let t2_qty = 0; // Everything >= 2 will be available

				if (p.lots && p.lots.length > 0) {
					const earliestLotTs = p.lots.reduce((min: number, lot: any) => {
						const ls = new Date(lot.date).getTime();
						return ls < min ? ls : min;
					}, new Date().getTime());

					const tradingDates = await fetchTradingHistoryDates(p.symbol, new Date(earliestLotTs), today);
					const tradingDateStrs = tradingDates.map(t => new Date(t * 1000).toISOString().split("T")[0]);
					
					// Get today's ICT date components
					const todayICT = new Date(today.getTime() + 7 * 3600 * 1000);
					const todayICTStr = todayICT.toISOString().split("T")[0];

					p.lots.forEach((lot: any) => {
						const lotDate = new Date(lot.date);
						const lotICT = new Date(lotDate.getTime() + 7 * 3600 * 1000);
						const lotICTStr = lotICT.toISOString().split("T")[0];
						
						let diffDays = 0;
						if (lotICTStr === todayICTStr) {
							// Exactly today -> T0
							diffDays = 0;
						} else {
							// 1. Count past trading days from API that are > lotICTStr and < todayICTStr
							for (const tStr of tradingDateStrs) {
								if (tStr > lotICTStr && tStr < todayICTStr) {
									diffDays++;
								}
							}
							
							// 2. Count today if it's a weekday
							if (todayICTStr > lotICTStr) {
								const dayOfWeek = todayICT.getUTCDay(); // UTC of shifted gives 0-6 correct for ICT
								if (dayOfWeek !== 0 && dayOfWeek !== 6) {
									diffDays++;
								}
							}
						}

						if (diffDays <= 0) t0_qty += lot.qty;
						else if (diffDays === 1) t1_qty += lot.qty;
						else available_qty += lot.qty;
					});
				}

				// Add 0.15% fee to avg_price to show actual break-even price
				const trueAvgPrice = p.avg_price * 1.0015;

				const marketValue = currentPrice * p.total_qty * 1000;
				const costValue = trueAvgPrice * p.total_qty * 1000;
				const unrealizedPnl = marketValue - costValue;
				const unrealizedPnlPercent =
					costValue > 0 ? (unrealizedPnl / costValue) * 100 : 0;

				const old_qty = p.total_qty - t0_qty;
				const dailyChange = currentPrice - refPrice;
				const dailyChangePercent = refPrice > 0 ? (dailyChange / refPrice) * 100 : 0;
				const dailyPnl = (dailyChange * old_qty * 1000) + ((currentPrice - trueAvgPrice) * t0_qty * 1000);

				return {
					_id: p._id,
					symbol: p.symbol,
					avg_price: trueAvgPrice,
					total_qty: p.total_qty,
					available_qty,
					t0_qty,
					t1_qty,
					t2_qty,
					current_price: currentPrice,
					ref_price: refPrice,
					ceil_price: ceilPrice,
					floor_price: floorPrice,
					market_value: marketValue,
					cost_value: costValue,
					unrealized_pnl: unrealizedPnl,
					unrealized_pnl_percent: unrealizedPnlPercent,
					daily_change_percent: dailyChangePercent,
					daily_pnl: dailyPnl,
				};
			}),
		);

		return NextResponse.json({ portfolios: enriched });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
