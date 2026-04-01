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

				if (rt && rt.lastPrice) {
					currentPrice = rt.lastPrice;
					refPrice = rt.r !== undefined ? rt.r : rt.lastPrice;
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
					const todayUTCStr = today.toISOString().split("T")[0]; // Use to track if today overlaps

					p.lots.forEach((lot: any) => {
						const lotDate = new Date(lot.date);
						const lotUTC = Date.UTC(
							lotDate.getUTCFullYear(),
							lotDate.getUTCMonth(),
							lotDate.getUTCDate(),
						) / 1000;

						const lotDateStr = lotDate.toISOString().split("T")[0];
						
						let diffDays = 0;
						if (lotDateStr === todayUTCStr) {
							// Exactly today -> T0 regardless of API response mapping
							diffDays = 0;
						} else {
							for (const t of tradingDates) {
								if (t > lotUTC) diffDays++;
							}
						}

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

				const old_qty = p.total_qty - t0_qty;
				const dailyChange = currentPrice - refPrice;
				const dailyChangePercent = refPrice > 0 ? (dailyChange / refPrice) * 100 : 0;
				const dailyPnl = (dailyChange * old_qty * 1000) + ((currentPrice - p.avg_price) * t0_qty * 1000);

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
