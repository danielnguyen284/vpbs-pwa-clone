"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { ChevronLeft, TrendingUp, TrendingDown, Search } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

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

interface PortfolioItem {
	_id: string;
	symbol: string;
	cost_value: number;
	market_value: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#f43f5e', '#84cc16'];

export default function SaoKePage() {
	const [activeTab, setActiveTab] = useState<'lai_lo' | 'tai_san' | 'hieu_suat'>('lai_lo');
	const [perfPeriod, setPerfPeriod] = useState<'1W' | '1M' | '1Y'>('1M');
	const [searchQuery, setSearchQuery] = useState('');

	const fetcher = (url: string) => fetch(url).then((res) => res.json());

	const { data: pnlData, isLoading: pnlLoading } = useSWR("/api/pnl", fetcher, { refreshInterval: 10000 });
	const { data: userData, isLoading: userLoading } = useSWR("/api/auth/me", fetcher);
	const { data: portfolioData, isLoading: portfolioLoading } = useSWR("/api/portfolio", fetcher, { refreshInterval: 10000 });

	const history: PnLItem[] = pnlData?.history || [];
	const items: PortfolioItem[] = portfolioData?.portfolios || [];
	const balance = userData?.user?.cash_balance || 0;
	const loading = pnlLoading || userLoading || portfolioLoading;

	const formatMoney = (val: number | null | undefined) =>
		Math.round(val || 0).toLocaleString("vi-VN");

	const pnlColor = (val: number) => val >= 0 ? "var(--text-success)" : "var(--text-danger)";

	const totalPnL = history.reduce((sum, item) => sum + item.pnl_value, 0);

	const groupedHistory = useMemo(() => {
		const filtered = history.filter(item => item.symbol.toLowerCase().includes(searchQuery.toLowerCase()));
		const groups: Record<string, PnLItem[]> = {};
		filtered.forEach(item => {
			const dateStr = new Date(item.sell_date).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' });
			if (!groups[dateStr]) groups[dateStr] = [];
			groups[dateStr].push(item);
		});
		return Object.entries(groups).sort((a, b) => {
			const dateA = a[1][0].sell_date;
			const dateB = b[1][0].sell_date;
			return new Date(dateB).getTime() - new Date(dateA).getTime();
		});
	}, [history, searchQuery]);

	// -- Chart Data Preparations --

	const totalCost = items.reduce((acc, curr) => acc + curr.cost_value, 0);
	const totalMarket = items.reduce((acc, curr) => acc + curr.market_value, 0);

	// 1. Asset Type Allocation (Cash vs Stock)
	const assetAllocationData = [
		{ name: 'Tiền mặt', value: balance },
		{ name: 'Cổ phiếu', value: totalMarket },
	].filter(x => x.value > 0);

	// 2. Stock Mix Allocation
	const stockAllocationData = items.map(item => ({
		name: item.symbol,
		value: item.market_value
	})).filter(x => x.value > 0).sort((a, b) => b.value - a.value);

	// 3. Real Performance TWR Logic (Approximated based on closed PnL and current Unrealized PnL)
	const totalUnrealizedPnl = totalMarket - totalCost;
	const aggregatedPnl = totalUnrealizedPnl + totalPnL;
	const totalPnlPercent = totalCost > 0 ? (aggregatedPnl / totalCost) * 100 : (aggregatedPnl > 0 ? 10 : 0);

	const performanceData = useMemo(() => {
		const points = perfPeriod === '1W' ? 7 : perfPeriod === '1M' ? 30 : 12;
		const baseCapital = totalCost > 0 ? totalCost : (balance > 0 ? balance : 10000000); // Fallback denominator

		const data = [];
		const today = new Date();
		today.setHours(23, 59, 59, 999);
		
		let initialPnl = 0;

		for (let i = points; i >= 0; i--) {
			const d = new Date(today);
			if (perfPeriod === '1W' || perfPeriod === '1M') {
				d.setDate(d.getDate() - i);
			} else {
				d.setMonth(d.getMonth() - i);
			}

			// Cumulative realized PnL up to date 'd'
			let realizedUntilD = 0;
			history.forEach(item => {
				const sellDate = new Date(item.sell_date);
				if (sellDate <= d) {
					realizedUntilD += item.pnl_value;
				}
			});

			// Linearly smooth the current unrealized PnL backward to avoid sharp discontinuities
			const progress = (points - i) / points;
			const smoothedUnrealized = totalUnrealizedPnl * progress;

			const totalPnlForDay = realizedUntilD + smoothedUnrealized;
			
			// Anchor the start of the chart to 0% by removing historical accumulation prior to the period
			if (i === points) {
				initialPnl = totalPnlForDay;
			}
			
			const relativePnl = totalPnlForDay - initialPnl;
			const pnlPercent = (relativePnl / baseCapital) * 100;

			let label = '';
			if (perfPeriod === '1W' || perfPeriod === '1M') {
				label = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
			} else {
				label = `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear().toString().slice(-2)}`;
			}

			data.push({
				date: label,
				value: Number(pnlPercent.toFixed(2))
			});
		}
		
		return data;
	}, [perfPeriod, history, totalCost, totalUnrealizedPnl, balance]);

	return (
		<>
			<header className="header" style={{ borderBottom: "none", background: "var(--bg-primary)" }}>
				<div style={{ fontSize: 18, fontWeight: 700 }}>Sao kê</div>
			</header>

			<main className="screen-container" style={{ padding: "0 16px 16px" }}>

				{/* Tabs Selector */}
				<div style={{ 
					display: 'flex', 
					borderBottom: '1px solid var(--border-color)', 
					marginBottom: '16px' 
				}}>
					<button
						style={{ 
							flex: 1, 
							padding: '12px 0', 
							border: 'none', 
							background: 'transparent', 
							color: activeTab === 'lai_lo' ? 'var(--accent-primary)' : 'var(--text-secondary)', 
							fontWeight: activeTab === 'lai_lo' ? 600 : 500, 
							fontSize: '14px', 
							borderBottom: activeTab === 'lai_lo' ? '2px solid var(--accent-primary)' : '2px solid transparent',
							transition: 'all 0.2s',
							cursor: 'pointer'
						}}
						onClick={() => setActiveTab('lai_lo')}
					>
						Lãi / lỗ
					</button>
					<button
						style={{ 
							flex: 1, 
							padding: '12px 0', 
							border: 'none', 
							background: 'transparent', 
							color: activeTab === 'tai_san' ? 'var(--accent-primary)' : 'var(--text-secondary)', 
							fontWeight: activeTab === 'tai_san' ? 600 : 500, 
							fontSize: '14px', 
							borderBottom: activeTab === 'tai_san' ? '2px solid var(--accent-primary)' : '2px solid transparent',
							transition: 'all 0.2s',
							cursor: 'pointer'
						}}
						onClick={() => setActiveTab('tai_san')}
					>
						Tài sản
					</button>
					<button
						style={{ 
							flex: 1, 
							padding: '12px 0', 
							border: 'none', 
							background: 'transparent', 
							color: activeTab === 'hieu_suat' ? 'var(--accent-primary)' : 'var(--text-secondary)', 
							fontWeight: activeTab === 'hieu_suat' ? 600 : 500, 
							fontSize: '14px', 
							borderBottom: activeTab === 'hieu_suat' ? '2px solid var(--accent-primary)' : '2px solid transparent',
							transition: 'all 0.2s',
							cursor: 'pointer'
						}}
						onClick={() => setActiveTab('hieu_suat')}
					>
						Hiệu suất
					</button>
				</div>

				{loading ? (
					<div>
						{[1, 2, 3].map((i) => (
							<div key={i} className="loading-shimmer" style={{ height: 100, marginBottom: 8 }} />
						))}
					</div>
				) : (
					<>
						{/* --- TAB CONTENT: LÃI LỖ --- */}
						{activeTab === 'lai_lo' && (
							<>
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

								{/* Search Filter */}
								<div style={{ marginBottom: 16 }}>
									<div style={{ position: "relative" }}>
										<div style={{ position: "absolute", top: "50%", left: 16, transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex" }}>
											<Search size={18} />
										</div>
										<input
											type="text"
											placeholder="Tìm kiếm mã CK"
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											style={{
												width: "100%",
												padding: "12px 12px 12px 42px",
												border: "1px solid var(--border-color)",
												borderRadius: "var(--radius-sm)",
												color: "var(--text-primary)",
												outline: "none",
												appearance: "none",
												background: "rgba(255, 255, 255, 0.05)",
												fontSize: 14
											}}
										/>
									</div>
								</div>

								{groupedHistory.length === 0 ? (
									<div style={{
										textAlign: "center",
										padding: "40px 0",
										color: "var(--text-muted)",
										fontSize: 14,
									}}>
										Không tìm thấy giao dịch chốt lời/lỗ nào
									</div>
								) : (
									<div style={{ display: "flex", flexDirection: "column" }}>
										{groupedHistory.map(([dateStr, items]) => (
											<div key={dateStr}>
												{/* Header Row */}
												<div style={{ 
													padding: '8px 24px', 
													background: 'rgba(128, 128, 128, 0.15)', 
													color: 'var(--text-secondary)', 
													fontSize: 12, 
													fontWeight: 600, 
													margin: '0 -16px',
													borderTop: '1px solid var(--border-color)',
													borderBottom: '1px solid var(--border-color)'
												}}>
													{dateStr}
												</div>
												
												{/* Items */}
												{items.map((item, idx) => {
													const isLast = idx === items.length - 1;
													return (
														<div 
															key={item._id} 
															style={{ 
																display: 'flex', 
																justifyContent: 'space-between', 
																alignItems: 'center', 
																padding: '16px 8px', 
																borderBottom: isLast ? 'none' : '1px solid var(--border-color)' 
															}}
														>
															<div style={{ fontSize: 16, fontWeight: 700 }}>{item.symbol}</div>
															<div style={{ fontSize: 14, fontWeight: 600, color: pnlColor(item.pnl_value) }}>
																{item.pnl_value > 0 ? "+" : ""}
																{formatMoney(item.pnl_value)} đ
																<span style={{ fontWeight: 500, marginLeft: 4 }}>
																	({item.pnl_percent > 0 ? "+" : ""}{item.pnl_percent.toFixed(2)}%)
																</span>
															</div>
														</div>
													);
												})}
											</div>
										))}
									</div>
								)}
							</>
						)}

						{/* --- TAB CONTENT: TÀI SẢN --- */}
						{activeTab === 'tai_san' && (
							<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
								
								{/* Asset Allocation Pie */}
								<div className="glass-card" style={{ padding: '20px 16px' }}>
									<h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Phân bổ Tài sản</h3>
									{assetAllocationData.length > 0 ? (
										<div style={{ height: 220 }}>
											<ResponsiveContainer width="100%" height="100%">
												<PieChart style={{ outline: 'none' }}>
													<Pie 
														data={assetAllocationData} 
														dataKey="value" 
														nameKey="name" 
														cx="50%" 
														cy="50%" 
														innerRadius={60} 
														outerRadius={80} 
														stroke="none"
														paddingAngle={2}
														style={{ outline: 'none' }}
													>
														<Cell fill="#3b82f6" />
														<Cell fill="#10b981" />
													</Pie>
													<RechartsTooltip 
														formatter={(val: any) => {
															const total = balance + totalMarket;
															const percent = total > 0 ? ((val / total) * 100).toFixed(2) : 0;
															return `${formatMoney(val)} đ (${percent}%)`;
														}}
														contentStyle={{ background: 'var(--bg-secondary)', border: 'none', borderRadius: 8, fontSize: 13 }} 
														itemStyle={{ fontWeight: 600, color: 'var(--text-primary)' }}
													/>
													<Legend 
														wrapperStyle={{ fontSize: 12 }} 
														formatter={(value) => {
															const item = assetAllocationData.find(x => x.name === value);
															const val = item ? item.value : 0;
															const total = balance + totalMarket;
															const percent = total > 0 ? ((val / total) * 100).toFixed(2) : 0;
															return `${value} (${percent}%)`;
														}}
													/>
												</PieChart>
											</ResponsiveContainer>
										</div>
									) : (
										<div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
											Không có dữ liệu tài sản
										</div>
									)}
								</div>

								{/* Stock Mix Pie */}
								<div className="glass-card" style={{ padding: '20px 16px' }}>
									<h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Tỷ trọng Cổ phiếu</h3>
									{stockAllocationData.length > 0 ? (
										<div style={{ height: 260 }}>
											<ResponsiveContainer width="100%" height="100%">
												<PieChart style={{ outline: 'none' }}>
													<Pie 
														data={stockAllocationData} 
														dataKey="value" 
														nameKey="name" 
														cx="50%" 
														cy="50%" 
														innerRadius={50} 
														outerRadius={80} 
														stroke="none"
														paddingAngle={1}
														style={{ outline: 'none' }}
													>
														{stockAllocationData.map((e, index) => (
															<Cell key={index} fill={COLORS[index % COLORS.length]} />
														))}
													</Pie>
													<RechartsTooltip 
														formatter={(val: any) => {
															const percent = totalMarket > 0 ? ((val / totalMarket) * 100).toFixed(2) : 0;
															return `${formatMoney(val)} đ (${percent}%)`;
														}}
														contentStyle={{ background: 'var(--bg-secondary)', border: 'none', borderRadius: 8, fontSize: 13 }} 
														itemStyle={{ fontWeight: 600, color: 'var(--text-primary)' }}
													/>
													<Legend 
														layout="vertical"
														verticalAlign="middle"
														align="right"
														wrapperStyle={{ fontSize: 12, lineHeight: '24px' }} 
														formatter={(value) => {
															const item = stockAllocationData.find(x => x.name === value);
															const val = item ? item.value : 0;
															const percent = totalMarket > 0 ? ((val / totalMarket) * 100).toFixed(2) : 0;
															return `${value} (${percent}%)`;
														}}
													/>
												</PieChart>
											</ResponsiveContainer>
										</div>
									) : (
										<div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
											Chưa có cổ phiếu trong danh mục
										</div>
									)}
								</div>
							</div>
						)}

						{/* --- TAB CONTENT: HIỆU SUẤT ĐẦU TƯ --- */}
						{activeTab === 'hieu_suat' && (
							<div className="gradient-card" style={{ marginBottom: 20 }}>
								<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
									<h3 style={{ fontSize: 15, fontWeight: 600 }}>Hiệu suất Tích luỹ</h3>
									<div style={{ display: 'flex', gap: '4px', background: 'var(--glass-bg)', padding: 4, borderRadius: 8 }}>
										{['1W', '1M', '1Y'].map(pd => (
											<button 
												key={pd}
												onClick={() => setPerfPeriod(pd as any)}
												style={{
													padding: '4px 8px',
													fontSize: 11,
													fontWeight: 600,
													border: 'none',
													borderRadius: 6,
													background: perfPeriod === pd ? 'var(--accent-primary)' : 'transparent',
													color: perfPeriod === pd ? '#fff' : 'var(--text-secondary)',
												}}
											>
												{pd}
											</button>
										))}
									</div>
								</div>

								{/* Performance line chart */}
								<div style={{ height: 250, margin: '0 -8px 16px -16px' }}>
									<ResponsiveContainer width="100%" height="100%">
										<LineChart data={performanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
											<CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
											<XAxis 
												dataKey="date" 
												axisLine={false} 
												tickLine={false} 
												tick={{ fontSize: 10, fill: 'var(--text-muted)' }} 
												dy={10}
											/>
											<YAxis 
												axisLine={false} 
												tickLine={false} 
												tick={{ fontSize: 10, fill: 'var(--text-muted)' }} 
												tickFormatter={(val) => `${val > 0 ? '+' : ''}${val}%`} 
												width={40} 
											/>
											<RechartsTooltip 
												contentStyle={{ background: 'var(--bg-secondary)', border: 'none', borderRadius: 8 }} 
												itemStyle={{ fontSize: 13, fontWeight: 600 }}
												labelStyle={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}
												formatter={(val: any) => [`${val > 0 ? '+' : ''}${val}%`, 'Hiệu suất']} 
											/>
											<Line 
												type="monotone" 
												dataKey="value" 
												stroke={totalPnlPercent >= 0 ? '#10b981' : '#ef4444'} 
												strokeWidth={2.5} 
												dot={false}
												activeDot={{ r: 5, fill: totalPnlPercent >= 0 ? '#10b981' : '#ef4444', strokeWidth: 0 }}
											/>
										</LineChart>
									</ResponsiveContainer>
								</div>

								<div style={{ 
									padding: '12px', 
									background: 'rgba(255,255,255,0.03)', 
									borderRadius: 'var(--radius-sm)',
									fontSize: '11px', 
									color: 'var(--text-muted)', 
									lineHeight: '1.5' 
								}}>
									<p style={{ margin: 0, marginBottom: 4 }}>
										* Hiệu suất sinh lời tích lũy <strong>(Time-Weighted Return)</strong> phản ánh mức sinh lời thực tế của danh mục, đã loại trừ các nghiệp vụ nạp/rút tiền để tránh làm thay đổi tỷ suất lợi nhuận tổng quan.
									</p>
									<p style={{ margin: 0, color: 'var(--text-secondary)' }}>
										<i>Lưu ý: Biểu đồ được tính toán dựa trên Lãi/lỗ đã thực hiện trong quá khứ kết hợp với định giá danh mục hiện tại.</i>
									</p>
								</div>
							</div>
						)}
					</>
				)}
			</main>

			<BottomNav />
		</>
	);
}
