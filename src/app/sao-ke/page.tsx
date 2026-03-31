"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { ChevronLeft, TrendingUp, TrendingDown } from "lucide-react";

interface PnLItem {
	_id: string;
	symbol: string;
	sell_date: string;
	quantity: number;
	buy_price: number;
	sell_price: number;
	pnl_value: number;
	pnl_percent: number;
}

export default function RealizedPnLPage() {
	const [history, setHistory] = useState<PnLItem[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch("/api/pnl")
			.then((res) => res.json())
			.then((data) => {
				if (data.history) setHistory(data.history);
				setLoading(false);
			});
	}, []);

	const formatMoney = (val: number) => val.toLocaleString("vi-VN");
	const totalPnL = history.reduce((sum, item) => sum + item.pnl_value, 0);
	const pnlColor = (val: number) => val >= 0 ? "var(--text-success)" : "var(--text-danger)";

	return (
		<>
			<header className="header" style={{ borderBottom: "none", background: "var(--bg-primary)" }}>
				<div style={{ fontSize: 18, fontWeight: 700 }}>Sao kê</div>
			</header>

			<main className="screen-container" style={{ padding: 16 }}>
				{/* Summary Card */}
				<div className="gradient-card" style={{ marginBottom: 20, textAlign: "center" }}>
					<div style={{ color: "var(--text-secondary)", fontSize: 12, marginBottom: 6 }}>
						Tổng Lãi/Lỗ đã thực hiện
					</div>
					<div style={{
						fontSize: 26,
						fontWeight: 700,
						color: pnlColor(totalPnL),
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						gap: 8,
					}}>
						{totalPnL >= 0 ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
						{totalPnL > 0 ? "+" : ""}
						{formatMoney(totalPnL)} đ
					</div>
				</div>

				{loading ? (
					<div>
						{[1, 2, 3].map((i) => (
							<div key={i} className="loading-shimmer" style={{ height: 100, marginBottom: 8 }} />
						))}
					</div>
				) : history.length === 0 ? (
					<div style={{
						textAlign: "center",
						padding: "40px 0",
						color: "var(--text-muted)",
						fontSize: 14,
					}}>
						Chưa có giao dịch chốt lời/lỗ nào
					</div>
				) : (
					<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
						{history.map((item) => (
							<div key={item._id} className="glass-card" style={{ padding: 16 }}>
								{/* Top row: symbol + PnL */}
								<div style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									marginBottom: 12,
								}}>
									<div style={{ fontSize: 16, fontWeight: 700 }}>{item.symbol}</div>
									<div style={{ textAlign: "right" }}>
										<div style={{ fontWeight: 700, color: pnlColor(item.pnl_value), fontSize: 14 }}>
											{item.pnl_value > 0 ? "+" : ""}
											{formatMoney(item.pnl_value)} đ
										</div>
										<div style={{
											fontSize: 12,
											color: pnlColor(item.pnl_percent),
											display: "flex",
											alignItems: "center",
											justifyContent: "flex-end",
											gap: 3,
											marginTop: 2,
										}}>
											{item.pnl_percent >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
											{item.pnl_percent > 0 ? "+" : ""}
											{item.pnl_percent.toFixed(2)}%
										</div>
									</div>
								</div>

								{/* Details */}
								<div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
									<div style={{ display: "flex", justifyContent: "space-between" }}>
										<span className="text-secondary">Khối lượng</span>
										<span>{item.quantity.toLocaleString("vi-VN")}</span>
									</div>
									<div style={{ display: "flex", justifyContent: "space-between" }}>
										<span className="text-secondary">Giá mua</span>
										<span>{item.buy_price.toLocaleString("vi-VN", { maximumFractionDigits: 2 })}</span>
									</div>
									<div style={{ display: "flex", justifyContent: "space-between" }}>
										<span className="text-secondary">Giá bán</span>
										<span>{item.sell_price.toLocaleString("vi-VN")}</span>
									</div>
									<div style={{
										borderTop: "1px solid var(--border-color)",
										paddingTop: 6,
										marginTop: 2,
										display: "flex",
										justifyContent: "space-between",
									}}>
										<span className="text-secondary">Ngày bán</span>
										<span>{new Date(item.sell_date).toLocaleDateString("vi-VN")}</span>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</main>

			<BottomNav />
		</>
	);
}
