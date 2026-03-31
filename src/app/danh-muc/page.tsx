"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { TrendingUp, TrendingDown, X } from "lucide-react";

interface PortfolioItem {
	_id: string;
	symbol: string;
	avg_price: number;
	total_qty: number;
	available_qty: number;
	t0_qty: number;
	t1_qty: number;
	t2_qty: number;
	current_price: number;
	ref_price: number;
	market_value: number;
	cost_value: number;
	unrealized_pnl: number;
	unrealized_pnl_percent: number;
	daily_change_percent: number;
	daily_pnl: number;
}

export default function PortfolioPage() {
	const [items, setItems] = useState<PortfolioItem[]>([]);
	const [balance, setBalance] = useState(0);
	const [loading, setLoading] = useState(true);
	const [activeItem, setActiveItem] = useState<PortfolioItem | null>(null);
	const router = useRouter();

	useEffect(() => {
		Promise.all([
			fetch("/api/auth/me").then((res) => res.json()),
			fetch("/api/portfolio").then((res) => res.json()),
		]).then(([userData, portfolioData]) => {
			if (userData.user) setBalance(userData.user.cash_balance);
			if (portfolioData.portfolios) setItems(portfolioData.portfolios);
			setLoading(false);
		});
	}, []);

	const totalCost = items.reduce((acc, curr) => acc + curr.cost_value, 0);
	const totalMarket = items.reduce((acc, curr) => acc + curr.market_value, 0);
	const totalPnl = totalMarket - totalCost;
	const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;
	const totalDailyPnl = items.reduce((acc, curr) => acc + (curr.daily_pnl || 0), 0);
	const totalAssets = balance + totalMarket;

	const formatMoney = (val: number | null | undefined) =>
		(val || 0).toLocaleString("vi-VN");

	const pnlColor = (val: number) =>
		val >= 0 ? "var(--text-success)" : "var(--text-danger)";

	return (
		<>
			{/* Header */}
			<header
				className="header"
				style={{
					height: 56,
					borderBottom: "none",
					background: "var(--bg-primary)",
				}}
			>
				<div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em" }}>
					Danh mục
				</div>
			</header>

			<main className="screen-container" style={{ padding: "0 16px 16px" }}>
				{loading ? (
					<div style={{ padding: "40px 0", textAlign: "center" }}>
						<div className="loading-shimmer" style={{ height: 120, marginBottom: 16 }} />
						<div className="loading-shimmer" style={{ height: 60, marginBottom: 8 }} />
						<div className="loading-shimmer" style={{ height: 60 }} />
					</div>
				) : (
					<>
						{/* Summary Card */}
						<div className="gradient-card" style={{ marginBottom: 20 }}>
							{/* Total Assets Row */}
							<div style={{ marginBottom: 16 }}>
								<div style={{ color: "var(--text-secondary)", fontSize: 12, marginBottom: 4 }}>
									Tổng tài sản
								</div>
								<div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em" }}>
									{formatMoney(totalAssets)}
									<span style={{ fontSize: 14, fontWeight: 500, marginLeft: 4 }}>đ</span>
								</div>
							</div>

							{/* Stats Grid */}
							<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
								<div style={{ background: "var(--glass-bg)", borderRadius: "var(--radius-sm)", padding: "10px 12px" }}>
									<div style={{ color: "var(--text-secondary)", fontSize: 11, marginBottom: 4 }}>
										Giá trị thị trường
									</div>
									<div style={{ fontSize: 14, fontWeight: 600 }}>
										{formatMoney(totalMarket)} đ
									</div>
								</div>
								<div style={{ background: "var(--glass-bg)", borderRadius: "var(--radius-sm)", padding: "10px 12px" }}>
									<div style={{ color: "var(--text-secondary)", fontSize: 11, marginBottom: 4 }}>
										Tiền mặt
									</div>
									<div style={{ fontSize: 14, fontWeight: 600 }}>
										{formatMoney(balance)} đ
									</div>
								</div>
							</div>

							{/* P&L Row */}
							<div style={{
								display: "flex",
								justifyContent: "space-between",
								marginTop: 12,
								paddingTop: 12,
								borderTop: "1px solid rgba(255,255,255,0.06)",
							}}>
								<div>
									<div style={{ color: "var(--text-secondary)", fontSize: 11, marginBottom: 2 }}>
										Lãi/lỗ dự kiến
									</div>
									<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
										<span style={{ fontSize: 14, fontWeight: 600, color: pnlColor(totalPnl) }}>
											{totalPnl > 0 ? "+" : ""}{formatMoney(totalPnl)} đ
										</span>
										<span style={{
											fontSize: 12,
											fontWeight: 500,
											color: pnlColor(totalPnl),
											background: totalPnl >= 0 ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
											padding: "2px 6px",
											borderRadius: 4,
										}}>
											{totalPnl > 0 ? "+" : ""}{totalPnlPercent.toFixed(2)}%
										</span>
									</div>
								</div>
								<div style={{ textAlign: "right" }}>
									<div style={{ color: "var(--text-secondary)", fontSize: 11, marginBottom: 2 }}>
										Trong ngày
									</div>
									<span style={{ fontSize: 14, fontWeight: 600, color: pnlColor(totalDailyPnl) }}>
										{totalDailyPnl > 0 ? "+" : ""}{formatMoney(totalDailyPnl)} đ
									</span>
								</div>
							</div>
						</div>

						{/* Stock List Header */}
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								padding: "0 4px 10px",
								color: "var(--text-muted)",
								fontSize: 11,
								fontWeight: 500,
								textTransform: "uppercase",
								letterSpacing: "0.05em",
							}}
						>
							<span style={{ flex: 1.2 }}>Mã CK</span>
							<span style={{ flex: 1, textAlign: "right" }}>Giá vốn</span>
							<span style={{ flex: 0.8, textAlign: "right" }}>KL</span>
							<span style={{ flex: 1.4, textAlign: "right" }}>Lãi/lỗ</span>
						</div>

						{/* Stock Rows */}
						{items.length === 0 ? (
							<div style={{
								textAlign: "center",
								padding: "40px 0",
								color: "var(--text-muted)",
								fontSize: 14,
							}}>
								Chưa có chứng khoán nào trong danh mục
							</div>
						) : (
							items.map((stock, idx) => {
								const chg = stock.daily_change_percent || 0;
								const chgColor = chg > 0 ? "var(--text-success)" : chg < 0 ? "var(--text-danger)" : "var(--text-secondary)";
								const pnl = stock.unrealized_pnl;

								return (
									<div
										key={stock._id || idx}
										onClick={() => setActiveItem(stock)}
										className="glass-card"
										style={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											padding: "12px 14px",
											marginBottom: 8,
											cursor: "pointer",
											transition: "background 0.15s ease",
										}}
									>
										{/* Symbol */}
										<div style={{ flex: 1.2 }}>
											<div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
												{stock.symbol}
											</div>
											<div style={{ fontSize: 12, color: chgColor }}>
												{stock.current_price.toFixed(2)} ({chg >= 0 ? "+" : ""}
												{chg.toFixed(2)}%)
											</div>
										</div>

										{/* Avg Cost */}
										<div style={{ flex: 1, textAlign: "right", fontSize: 13, fontWeight: 500 }}>
											{stock.avg_price.toFixed(2)}
										</div>

										{/* Quantity */}
										<div style={{ flex: 0.8, textAlign: "right", fontSize: 13, fontWeight: 500 }}>
											{formatMoney(stock.total_qty)}
										</div>

										{/* PNL */}
										<div style={{ flex: 1.4, textAlign: "right" }}>
											<div style={{
												fontSize: 13,
												fontWeight: 600,
												color: pnlColor(pnl),
												marginBottom: 2,
											}}>
												{pnl > 0 ? "+" : ""}{formatMoney(pnl)} đ
											</div>
											<div style={{
												fontSize: 11,
												color: pnlColor(pnl),
												display: "flex",
												alignItems: "center",
												justifyContent: "flex-end",
												gap: 2,
											}}>
												{pnl >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
												{stock.unrealized_pnl_percent.toFixed(2)}%
											</div>
										</div>
									</div>
								);
							})
						)}

						{/* Detail Bottom Sheet */}
						{activeItem && (
							<>
								<div className="backdrop" onClick={() => setActiveItem(null)} />
								<div className="bottom-sheet" style={{ padding: "16px 20px 32px" }}>
									<div className="bottom-sheet-handle" />

									{/* Header */}
									<div style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										marginBottom: 20,
									}}>
										<h3 style={{ fontSize: 18, fontWeight: 700 }}>
											{activeItem.symbol}
										</h3>
										<button
											onClick={() => setActiveItem(null)}
											style={{
												background: "var(--glass-bg)",
												border: "none",
												borderRadius: 8,
												padding: 6,
												color: "var(--text-secondary)",
												cursor: "pointer",
											}}
										>
											<X size={18} />
										</button>
									</div>

									{/* Detail rows */}
									<div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 14 }}>
										{[
											{ label: "Tổng khối lượng", value: formatMoney(activeItem.total_qty) },
											{ label: "KL khả dụng", value: formatMoney(activeItem.available_qty) },
											{ label: "Giá vốn TB", value: activeItem.avg_price.toFixed(2) },
											{ label: "Giá hiện tại", value: activeItem.current_price.toFixed(2) },
											{ label: "Giá trị vốn", value: `${formatMoney(activeItem.cost_value)} đ` },
											{ label: "Giá trị thị trường", value: `${formatMoney(activeItem.market_value)} đ` },
										].map((row, i) => (
											<div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
												<span style={{ color: "var(--text-secondary)" }}>{row.label}</span>
												<span style={{ fontWeight: 500 }}>{row.value}</span>
											</div>
										))}

										<div style={{ height: 1, background: "var(--border-color)" }} />

										<div style={{ display: "flex", justifyContent: "space-between" }}>
											<span style={{ color: "var(--text-secondary)" }}>Lãi/lỗ dự kiến</span>
											<span style={{ fontWeight: 600, color: pnlColor(activeItem.unrealized_pnl) }}>
												{activeItem.unrealized_pnl > 0 ? "+" : ""}
												{formatMoney(activeItem.unrealized_pnl)} đ ({activeItem.unrealized_pnl_percent.toFixed(2)}%)
											</span>
										</div>
									</div>

									{/* Buy / Sell buttons */}
									<div style={{ display: "flex", gap: 10, marginTop: 20 }}>
										<button
											className="btn-buy"
											style={{ fontFamily: "var(--font-family)" }}
											onClick={() => {
												setActiveItem(null);
												router.push(`/dat-lenh?symbol=${activeItem.symbol}&side=M`);
											}}
										>
											MUA
										</button>
										<button
											className="btn-sell"
											style={{ fontFamily: "var(--font-family)" }}
											onClick={() => {
												setActiveItem(null);
												router.push(`/dat-lenh?symbol=${activeItem.symbol}&side=B`);
											}}
										>
											BÁN
										</button>
									</div>
								</div>
							</>
						)}
					</>
				)}
			</main>

			<BottomNav />
		</>
	);
}
