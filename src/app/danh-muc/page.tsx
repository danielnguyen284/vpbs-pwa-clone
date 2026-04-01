"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { TrendingUp, TrendingDown, X, Eye, EyeOff, ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";

type SortKey = "symbol" | "avg_price" | "total_qty" | "unrealized_pnl" | null;
type SortDirection = "asc" | "desc";

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
	ceil_price: number;
	floor_price: number;
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
	const [hideData, setHideData] = useState(false);
	const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: null, direction: "desc" });
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

	const handleSort = (key: SortKey) => {
		let direction: SortDirection = "desc";
		if (sortConfig.key === key && sortConfig.direction === "desc") {
			direction = "asc";
		}
		setSortConfig({ key, direction });
	};

	const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
		if (sortConfig.key !== columnKey) return <ChevronsUpDown size={12} style={{ opacity: 0.3 }} />;
		return sortConfig.direction === "desc" ? <ChevronDown size={12} /> : <ChevronUp size={12} />;
	};

	const sortedItems = [...items].sort((a, b) => {
		if (!sortConfig.key) return 0;
		const aVal = a[sortConfig.key];
		const bVal = b[sortConfig.key];
		
		if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
		if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
		return 0;
	});

	const formatMoney = (val: number | null | undefined) =>
		Math.round(val || 0).toLocaleString("vi-VN");

	const pnlColor = (val: number) => {
		if (Math.abs(val) < 0.01) return "#eab308";
		return val > 0 ? "var(--text-success)" : "var(--text-danger)";
	};

	const pnlBgColor = (val: number) => {
		if (Math.abs(val) < 0.01) return "rgba(234, 179, 8, 0.1)"; // Yellow bg
		return val > 0 ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)"; // Green bg or Red bg
	};

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
							<div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
								<div>
									<div style={{ color: "var(--text-secondary)", fontSize: 12, marginBottom: 4 }}>
										Tổng tài sản
									</div>
									<div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 6 }}>
										{hideData ? "***" : formatMoney(totalAssets)}
										{!hideData && <span style={{ fontSize: 14, fontWeight: 500 }}>đ</span>}
									</div>
								</div>
								<button
									onClick={() => setHideData(!hideData)}
									style={{
										background: "none",
										border: "none",
										padding: 6,
										cursor: "pointer",
										color: "var(--text-secondary)",
										display: "flex",
										alignItems: "center",
										justifyContent: "center"
									}}
								>
									{hideData ? <EyeOff size={20} /> : <Eye size={20} />}
								</button>
							</div>

							{/* Stats Grid */}
							<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
								<div style={{ background: "var(--glass-bg)", borderRadius: "var(--radius-sm)", padding: "10px 12px" }}>
									<div style={{ color: "var(--text-secondary)", fontSize: 11, marginBottom: 4 }}>
										Giá trị vốn
									</div>
									<div style={{ fontSize: 14, fontWeight: 600 }}>
										{hideData ? "***" : `${formatMoney(totalCost)} đ`}
									</div>
								</div>
								<div style={{ background: "var(--glass-bg)", borderRadius: "var(--radius-sm)", padding: "10px 12px" }}>
									<div style={{ color: "var(--text-secondary)", fontSize: 11, marginBottom: 4 }}>
										Giá trị thị trường
									</div>
									<div style={{ fontSize: 14, fontWeight: 600 }}>
										{hideData ? "***" : `${formatMoney(totalMarket)} đ`}
									</div>
								</div>
							</div>

							{/* P&L Row */}
							<div style={{
								display: "flex",
								justifyContent: "space-between",
								marginTop: 12,
								paddingTop: 12,
								borderTop: "1px solid var(--border-color)",
							}}>
								<div>
									<div style={{ color: "var(--text-secondary)", fontSize: 11, marginBottom: 2 }}>
										Lãi/lỗ dự kiến
									</div>
									<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
										<span style={{ fontSize: 14, fontWeight: 600, color: hideData ? "var(--text-secondary)" : pnlColor(totalPnl) }}>
											{hideData ? "***" : `${totalPnl > 0 ? "+" : ""}${formatMoney(totalPnl)} đ`}
										</span>
										<span style={{
											fontSize: 12,
											fontWeight: 500,
											color: pnlColor(totalPnl),
											background: pnlBgColor(totalPnl),
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
									<span style={{ fontSize: 14, fontWeight: 600, color: hideData ? "var(--text-secondary)" : pnlColor(totalDailyPnl) }}>
										{hideData ? "***" : `${totalDailyPnl > 0 ? "+" : ""}${formatMoney(totalDailyPnl)} đ`}
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
							<div onClick={() => handleSort("symbol")} style={{ flex: 1.6, display: "flex", alignItems: "center", gap: 2, cursor: "pointer" }}>
								Mã CK <SortIcon columnKey="symbol" />
							</div>
							<div onClick={() => handleSort("avg_price")} style={{ flex: 0.9, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2, cursor: "pointer" }}>
								Giá vốn <SortIcon columnKey="avg_price" />
							</div>
							<div onClick={() => handleSort("total_qty")} style={{ flex: 0.7, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2, cursor: "pointer" }}>
								KL <SortIcon columnKey="total_qty" />
							</div>
							<div onClick={() => handleSort("unrealized_pnl")} style={{ flex: 1.2, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2, cursor: "pointer" }}>
								Lãi/lỗ <SortIcon columnKey="unrealized_pnl" />
							</div>
						</div>

						{/* Stock Rows */}
						{sortedItems.length === 0 ? (
							<div style={{
								textAlign: "center",
								padding: "40px 0",
								color: "var(--text-muted)",
								fontSize: 14,
							}}>
								Chưa có chứng khoán nào trong danh mục
							</div>
						) : (
							sortedItems.map((stock, idx) => {
								const chg = stock.daily_change_percent || 0;
								
								let chgColor = "var(--text-secondary)";
								const eps = 0.01; // tolerance
								
								if (Math.abs(stock.current_price - stock.ceil_price) < eps) {
									chgColor = "#c026d3"; // Tím (Trần)
								} else if (Math.abs(stock.current_price - stock.floor_price) < eps) {
									chgColor = "#06b6d4"; // Xanh lơ (Sàn)
								} else if (Math.abs(stock.current_price - stock.ref_price) < eps) {
									chgColor = "#eab308"; // Vàng (Tham chiếu)
								} else if (chg > 0) {
									chgColor = "var(--text-success)"; // Xanh lá
								} else if (chg < 0) {
									chgColor = "var(--text-danger)"; // Đỏ
								}

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
										<div style={{ flex: 1.6, minWidth: 0 }}>
											<div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
												{stock.symbol}
											</div>
											<div style={{ fontSize: 12, color: chgColor, whiteSpace: "nowrap" }}>
												{stock.current_price.toFixed(2)} ({chg > 0 ? "+" : ""}
												{chg.toFixed(2)}%)
											</div>
										</div>

										{/* Avg Cost */}
										<div style={{ flex: 0.9, textAlign: "right", fontSize: 13, fontWeight: 500 }}>
											{stock.avg_price.toFixed(2)}
										</div>

										{/* Quantity */}
										<div style={{ flex: 0.7, textAlign: "right", fontSize: 13, fontWeight: 500 }}>
											{hideData ? "***" : formatMoney(stock.total_qty)}
										</div>

										{/* PNL */}
										<div style={{ flex: 1.2, textAlign: "right" }}>
											<div style={{
												fontSize: 13,
												fontWeight: 600,
												color: hideData ? "var(--text-secondary)" : pnlColor(pnl),
												marginBottom: 2,
											}}>
												{hideData ? "***" : `${pnl > 0 ? "+" : ""}${formatMoney(pnl)} đ`}
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
										justifyContent: "flex-end",
										alignItems: "center",
										marginBottom: 10,
									}}>
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

									<div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 14 }}>
										{/* Section 1 */}
										{[
											{ label: "Mã chứng khoán", value: activeItem.symbol },
											{ label: "Tổng khối lượng CK", value: hideData ? "***" : formatMoney(activeItem.total_qty) },
											{ label: "Giá vốn trung bình", value: hideData ? "***" : activeItem.avg_price.toFixed(2) },
											{ label: "Gốc đầu tư", value: hideData ? "***" : `${formatMoney(activeItem.cost_value)} đ` },
											{ label: "Giá trị thị trường", value: hideData ? "***" : `${formatMoney(activeItem.market_value)} đ` },
										].map((row, i) => (
											<div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
												<span style={{ color: "var(--text-secondary)" }}>{row.label}</span>
												<span style={{ fontWeight: 500 }}>{row.value}</span>
											</div>
										))}

										<div style={{ display: "flex", justifyContent: "space-between" }}>
											<span style={{ color: "var(--text-secondary)" }}>Lãi/lỗ dự kiến</span>
											<span style={{ fontWeight: 600, color: hideData ? "var(--text-secondary)" : pnlColor(activeItem.unrealized_pnl) }}>
												{hideData ? "***" : `${activeItem.unrealized_pnl > 0 ? "+" : ""}${formatMoney(activeItem.unrealized_pnl)} đ `}
												{!hideData && `(${activeItem.unrealized_pnl_percent.toFixed(2)}%)`}
												{hideData && `${activeItem.unrealized_pnl_percent > 0 ? "+" : ""}${activeItem.unrealized_pnl_percent.toFixed(2)}%`}
											</span>
										</div>

										<div style={{ height: 1, background: "var(--border-color)", margin: "4px 0" }} />

										{/* Section 2 */}
										{[
											{ label: "Khối lượng CK khả dụng", value: hideData ? "***" : formatMoney(activeItem.available_qty) },
											{ label: "CK chờ về", value: hideData ? "***" : `T0: ${activeItem.t0_qty} T1: ${activeItem.t1_qty} T2: ${activeItem.t2_qty}` },
											{ label: "Tỉ trọng trong danh mục", value: totalMarket > 0 ? `${((activeItem.market_value / totalMarket) * 100).toFixed(2)}%` : "0%" },
										].map((row, i) => (
											<div key={`bottom-${i}`} style={{ display: "flex", justifyContent: "space-between" }}>
												<span style={{ color: "var(--text-secondary)" }}>{row.label}</span>
												<span style={{ fontWeight: 500 }}>{row.value}</span>
											</div>
										))}
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
