"use client";

import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
	market_value: number;
	cost_value: number;
	unrealized_pnl: number;
	unrealized_pnl_percent: number;
}

const SortIcon = ({
	activeDirection,
}: {
	activeDirection?: "asc" | "desc";
}) => (
	<div
		style={{
			display: "flex",
			flexDirection: "column",
			gap: "2px",
			marginLeft: "4px",
		}}
	>
		<svg
			width="7"
			height="4"
			viewBox="0 0 7 4"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M3.5 0L7 4H0L3.5 0Z"
				fill={activeDirection === "asc" ? "#FFFFFF" : "#6E6E6E"}
			/>
		</svg>
		<svg
			width="7"
			height="4"
			viewBox="0 0 7 4"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M3.5 4L0 0H7L3.5 4Z"
				fill={activeDirection === "desc" ? "#FFFFFF" : "#6E6E6E"}
			/>
		</svg>
	</div>
);

export default function PortfolioPage() {
	const router = useRouter();
	const [items, setItems] = useState<PortfolioItem[]>([]);
	const [balance, setBalance] = useState(0);
	const [loading, setLoading] = useState(true);
	const [activeItem, setActiveItem] = useState<PortfolioItem | null>(null);
	const [sortConfig, setSortConfig] = useState<{
		key: string;
		direction: "asc" | "desc";
	} | null>(null);

	const handleSort = (key: string) => {
		setSortConfig((prev) => {
			if (prev?.key === key) {
				return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
			}
			return { key, direction: "asc" };
		});
	};

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

	const totalAssets = balance + totalMarket;

	const formatMoney = (val: number | null | undefined) =>
		(val || 0).toLocaleString("vi-VN");

	return (
		<>
			<header
				className="header"
				style={{
					height: "95px",
					padding: "0 8px 10px 8px",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "flex-end",
					borderBottom: "none",
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "flex-end",
						gap: "1rem",
						marginLeft: "0.4rem",
					}}
				>
					<img
						src="/icons/arrows/ic_arrow_left.svg"
						style={{
							width: "1.5rem",
							height: "1.5rem",
							filter: "brightness(0) invert(1)",
							marginBottom: "0px",
						}}
						alt="Back"
					/>
					<div
						style={{ fontSize: "clamp(18px, 4.5vw, 22px)", fontWeight: "600" }}
					>
						Danh mục nắm giữ
					</div>
				</div>
				<img
					src="/icons/header/ic_search2.svg"
					style={{
						width: "1.25rem",
						height: "1.25rem",
						filter: "brightness(0) invert(1)",
						marginBottom: "0.2rem",
						marginRight: "-0.2rem",
					}}
					alt="Search"
				/>
			</header>

			<main className="screen-container" style={{ padding: 14 }}>
				{loading ? (
					<div style={{ textAlign: "center", marginTop: 40 }}>Đang tải...</div>
				) : (
					<>
						{/* Summary Card */}
						<div
							style={{
								backgroundColor: "transparent",
								borderRadius: 12,
								marginBottom: 16,
							}}
						>
							{/* Account selection row */}
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									marginTop: "0.2rem",
									marginBottom: "0.5rem",
									paddingRight: "0.2rem",
								}}
							>
								<span
									style={{
										color: "var(--text-secondary)",
										fontSize: "0.9rem",
										letterSpacing: "0.02em",
									}}
								>
									Tiểu khoản
								</span>
								<div
									style={{ display: "flex", alignItems: "center", gap: "8px" }}
								>
									<span
										style={{
											color: "var(--text-secondary)",
											fontSize: "0.9rem",
											letterSpacing: "0.02em",
										}}
									>
										Tất cả
									</span>
									<img
										src="/icons/arrows/ic_arrow_next.svg"
										style={{
											width: "0.8rem",
											height: "0.8rem",
											filter: "brightness(0.7)",
										}}
										alt="Next"
									/>
								</div>
							</div>

							{/* Market Value and Action Button */}
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									marginBottom: 24,
								}}
							>
								<div>
									<div
										style={{
											color: "var(--text-secondary)",
											fontSize: "0.8rem",
											marginTop: "1rem",
											marginBottom: "0.2rem",
										}}
									>
										Giá trị thị trường
									</div>
									<div
										style={{
											fontSize: "1.2rem",
											fontWeight: "500",
											color: "#ffffff",
											letterSpacing: "0.08rem",
											marginTop: "0.5rem",
										}}
									>
										415,156,070{" "}
										<span style={{ fontSize: "16px", fontWeight: "500" }}>
											đ
										</span>
									</div>
								</div>
								<button
									style={{
										backgroundColor: "transparent",
										border: "1px solid #f04b4b",
										color: "#f04b4b",
										width: "10rem",
										height: "2.5rem",
										display: "flex",
										justifyContent: "center",
										alignItems: "center",
										borderRadius: "0.7rem",
										fontSize: "0.9rem",
										fontWeight: "500",
										marginTop: "1.5rem",
										letterSpacing: "0.02rem",
									}}
								>
									Bán danh mục
								</button>
							</div>

							{/* Capital and Daily PL */}
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									marginBottom: 12,
									// marginTop: "-4px",
								}}
							>
								<div>
									<div
										style={{
											color: "var(--text-secondary)",
											fontSize: "0.8rem",
											marginBottom: "0.2rem",
										}}
									>
										Giá trị vốn
									</div>
									<div
										style={{
											fontSize: "0.9rem",
											color: "#ffffff",
											fontWeight: "350",
											letterSpacing: "0.05rem",
										}}
									>
										433,936,383 đ
									</div>
								</div>
								<div style={{ textAlign: "right" }}>
									<div
										style={{
											color: "var(--text-secondary)",
											fontSize: "0.8rem",
											marginBottom: "0.2rem",
										}}
									>
										Lãi/lỗ trong ngày
									</div>
									<div
										style={{
											fontSize: "0.9rem",
											color: "var(--text-success)",
											fontWeight: "350",
											letterSpacing: "0.04rem",
										}}
									>
										+18,126,980 đ
									</div>
								</div>
							</div>

							{/* Unrealized PL */}
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									paddingBottom: 16,
									borderBottom: "1px solid rgba(255,255,255,0.1)",
									// marginTop: "-8px",
								}}
							>
								<span
									style={{ color: "var(--text-secondary)", fontSize: "12.5px" }}
								>
									Lãi/lỗ dự kiến
								</span>
								<div
									style={{
										display: "flex",
										alignItems: "center",
										gap: "0.4rem",
									}}
								>
									<span
										className="text-danger"
										style={{
											fontSize: "0.9rem",
											color: "var(--text-danger)",
											fontWeight: "350",
											letterSpacing: "0.05rem",
										}}
									>
										-18,780,313 đ
									</span>
									<div
										style={{
											display: "flex",
											alignItems: "center",
											gap: "0.4rem",
										}}
									>
										<img
											src="/icons/arrows/ic_arrow_decrease.svg"
											style={{ width: "0.8rem", height: "0.8rem" }}
											alt="Decrease"
										/>
										<span
											className="text-danger"
											style={{
												fontSize: "0.9rem",
												color: "var(--text-danger)",
												fontWeight: "350",
												letterSpacing: "0.04rem",
											}}
										>
											-4.33%
										</span>
									</div>
								</div>
							</div>
						</div>

						<div style={{ marginTop: "0px" }}>
							{/* Table Header */}
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									padding: "0px 0px 12px 0px",
									// borderBottom: "1px solid rgba(255,255,255,0.05)",
									color: "var(--text-secondary)",
									fontSize: "0.8rem",
									fontWeight: "350",
									// marginTop: "-1px",
								}}
							>
								<div
									onClick={() => handleSort("symbol")}
									style={{
										flex: 1.3,
										display: "flex",
										alignItems: "center",
										cursor: "pointer",
									}}
								>
									<span>Mã CK</span>
									<SortIcon
										activeDirection={
											sortConfig?.key === "symbol"
												? sortConfig.direction
												: undefined
										}
									/>
								</div>
								<div
									onClick={() => handleSort("cost_price")}
									style={{
										flex: 1.2,
										textAlign: "right",
										display: "flex",
										alignItems: "center",
										justifyContent: "flex-end",
										paddingRight: "72px",
										cursor: "pointer",
									}}
								>
									<span>Giá vốn</span>
									<SortIcon
										activeDirection={
											sortConfig?.key === "cost_price"
												? sortConfig.direction
												: undefined
										}
									/>
								</div>
								<div
									onClick={() => handleSort("qty")}
									style={{
										flex: 0.8,
										textAlign: "right",
										display: "flex",
										alignItems: "center",
										justifyContent: "flex-end",
										position: "relative",
										right: "33px",
										cursor: "pointer",
									}}
								>
									<span>KL</span>
									<SortIcon
										activeDirection={
											sortConfig?.key === "qty"
												? sortConfig.direction
												: undefined
										}
									/>
								</div>
								<div
									onClick={() => handleSort("pnl")}
									style={{
										flex: 1.7,
										textAlign: "right",
										display: "flex",
										alignItems: "center",
										justifyContent: "flex-end",
										position: "relative",
										// right: "17px",
										cursor: "pointer",
									}}
								>
									<span>Lãi/lỗ dự kiến</span>
									<SortIcon
										activeDirection={
											sortConfig?.key === "pnl"
												? sortConfig.direction
												: undefined
										}
									/>
								</div>
							</div>

							{/* Stock Rows */}
							{[
								{
									sym: "CII",
									cur: "17.80",
									chg: "+6.91%",
									cost: "17.70",
									kl: "9,601",
									pnl: "+924,672 đ",
									pnlP: "0.54%",
									color: "#e44af2",
									pnlColor: "text-success",
								},
							].map((stock, idx) => (
								<div
									key={idx}
									onClick={() =>
										setActiveItem({
											_id: "1",
											symbol: "CII",
											avg_price: 17.7,
											total_qty: 9601,
											available_qty: 7601,
											t0_qty: 0,
											t1_qty: 2000,
											t2_qty: 0,
											current_price: 17.8,
											market_value: 170897800,
											cost_value: 169973128,
											unrealized_pnl: 924672,
											unrealized_pnl_percent: 0.54,
										})
									}
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										padding: "0.8rem 0",
										letterSpacing: "0.02rem",
										borderBottom: "1px solid rgba(255,255,255,0.05)",
										cursor: "pointer",
									}}
								>
									{/* Symbol and current price */}
									<div style={{ flex: 1.8 }}>
										<div
											style={{
												fontSize: "0.9rem",
												fontWeight: "350",
												color: "#ffffff",
												marginBottom: "4px",
												marginTop: "-3px",
											}}
										>
											{stock.sym}
										</div>
										<div
											style={{
												fontSize: "12px",
												color: stock.color,
												fontWeight: "400",
												marginTop: "8px",
											}}
										>
											{stock.cur} ({stock.chg})
										</div>
									</div>

									{/* Avg Cost */}
									<div
										style={{
											flex: 1,
											textAlign: "right",
											paddingRight: "65px",
										}}
									>
										<div
											style={{
												fontSize: "12.5px",
												fontWeight: "400",
												color: "#ffffff",
											}}
										>
											{stock.cost}
										</div>
									</div>

									{/* Quantity */}
									<div
										style={{
											flex: 0.8,
											textAlign: "right",
											position: "relative",
											right: "35px",
										}}
									>
										<div
											style={{
												fontSize: "12.5px",
												fontWeight: "400",
												color: "#ffffff",
											}}
										>
											{stock.kl}
										</div>
									</div>

									{/* PNL */}
									<div
										style={{
											flex: 1.4,
											textAlign: "right",
											position: "relative",
											right: "-2px",
											top: "-3px",
										}}
									>
										<div
											className={
												stock.pnlColor.startsWith("#") ? "" : stock.pnlColor
											}
											style={{
												position: "relative",
												top: "2px",
												fontSize: "12.5px",
												fontWeight: "600",
												marginBottom: "2px",
												color: stock.pnlColor.startsWith("#")
													? stock.pnlColor
													: undefined,
											}}
										>
											{stock.pnl}
										</div>
										<div
											style={{
												display: "flex",
												justifyContent: "flex-end",
												alignItems: "center",
												gap: "4px",
												marginTop: "8px",
												position: "relative",
												right: "4px",
											}}
										>
											{stock.pnlP !== "0.00%" && stock.pnlP !== "--%" && (
												<img
													src={
														stock.pnlColor === "text-success"
															? "/icons/arrows/ic_arrow_increase.svg"
															: "/icons/arrows/ic_arrow_decrease.svg"
													}
													style={{ width: "0.6rem", height: "0.6rem" }}
													alt="Arrow"
												/>
											)}
											{stock.pnlP === "--%" && (
												<img
													src="/icons/arrows/ic_arrow_increase.svg"
													style={{ width: "0.6rem", height: "0.6rem" }}
													alt="Arrow"
												/>
											)}
											<span
												className={
													stock.pnlColor.startsWith("#") ? "" : stock.pnlColor
												}
												style={{
													position: "relative",
													left: "3px",
													fontSize: "11.5px",
													fontWeight: "450",
													color: stock.pnlColor.startsWith("#")
														? stock.pnlColor
														: undefined,
												}}
											>
												{stock.pnlP}
											</span>
										</div>
									</div>
								</div>
							))}
						</div>

						{/* Bottom Sheet for Chi Tiết Danh Mục */}
						{activeItem && (
							<>
								<div
									className="backdrop"
									style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
									onClick={() => setActiveItem(null)}
								></div>
								<div
									className="bottom-sheet"
									style={{
										backgroundColor: "#1a1a1a",
										borderTopLeftRadius: "24px",
										borderTopRightRadius: "24px",
										padding: "12px 14px 40px 14px",
										height: "63vh",
									}}
								>
									<div
										className="bottom-sheet-handle"
										style={{
											width: "36px",
											height: "5px",
											backgroundColor: "#373b45",
											marginBottom: "24px",
										}}
									></div>

									<div
										style={{
											display: "flex",
											flexDirection: "column",
											gap: "12px",
											fontSize: "11.5px",
											color: "#8a8d9b",
										}}
									>
										<div
											style={{
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
											}}
										>
											<span style={{ color: "#ffffff", fontWeight: "300" }}>
												Mã chứng khoán
											</span>
											<span style={{ color: "#ffffff", fontWeight: "300" }}>
												{activeItem.symbol}
											</span>
										</div>
										<div
											style={{
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
											}}
										>
											<span>Tổng khối lượng CK</span>
											<span style={{ color: "#ffffff", fontWeight: "300" }}>
												{formatMoney(activeItem.total_qty)}
											</span>
										</div>
										<div
											style={{
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
											}}
										>
											<span>Giá vốn trung bình</span>
											<span style={{ color: "#ffffff", fontWeight: "300" }}>
												{activeItem.avg_price.toFixed(2)}
											</span>
										</div>
										<div
											style={{
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
											}}
										>
											<span>Gốc đầu tư</span>
											<span style={{ color: "#ffffff", fontWeight: "300" }}>
												{formatMoney(activeItem.cost_value)} đ
											</span>
										</div>
										<div
											style={{
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
											}}
										>
											<span>Giá trị thị trường</span>
											<span style={{ color: "#ffffff", fontWeight: "300" }}>
												{formatMoney(activeItem.market_value)} đ
											</span>
										</div>
										<div
											style={{
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
											}}
										>
											<span style={{ color: "#ffffff", fontWeight: "300" }}>
												Lãi/lỗ dự kiến
											</span>
											<span
												className={
													activeItem.unrealized_pnl >= 0
														? "text-success"
														: "text-danger"
												}
												style={{ fontWeight: "400" }}
											>
												{activeItem.unrealized_pnl >= 0 ? "+" : ""}{" "}
												{formatMoney(activeItem.unrealized_pnl)} đ (
												{activeItem.unrealized_pnl_percent.toFixed(2)}%)
											</span>
										</div>

										<div
											style={{
												borderTop: "0.5px solid rgba(255,255,255,0.1)",
												margin: "20px 0 8px 0",
											}}
										></div>

										<div
											style={{
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
												position: "relative",
												top: "6px",
											}}
										>
											<span style={{ color: "#ffffff", fontWeight: "300" }}>
												Khối lượng CK khả dụng
											</span>
											<span style={{ color: "#ffffff", fontWeight: "300" }}>
												{formatMoney(activeItem.available_qty)}
											</span>
										</div>
										<div
											style={{
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
												position: "relative",
												top: "6px",
											}}
										>
											<span>CK chờ về</span>
											<span style={{ color: "#ffffff", fontWeight: "300" }}>
												T0: {activeItem.t0_qty} T1:{" "}
												{formatMoney(activeItem.t1_qty)} T2: {activeItem.t2_qty}
											</span>
										</div>
										<div
											style={{
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
												position: "relative",
												top: "6px",
											}}
										>
											<span>Quyền chờ về</span>
											<span style={{ color: "#ffffff", fontWeight: "300" }}>
												0
											</span>
										</div>
										<div
											style={{
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
												position: "relative",
												top: "6px",
											}}
										>
											<span>CK bị hạn chế</span>
											<span style={{ color: "#ffffff", fontWeight: "300" }}>
												0
											</span>
										</div>
										<div
											style={{
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
												position: "relative",
												top: "6px",
											}}
										>
											<span>Tỉ trọng trong danh mục</span>
											<span style={{ color: "#ffffff", fontWeight: "300" }}>
												41.16%
											</span>
										</div>
									</div>

									<div
										className="action-buttons"
										style={{ display: "flex", gap: "8px", marginTop: "58px" }}
									>
										<button
											style={{
												flex: 1,
												height: "44px",
												borderRadius: "12px",
												background: "#0ea369",
												color: "#ffffff",
												border: "none",
												fontWeight: "600",
												fontSize: "15px",
											}}
											onClick={() =>
												router.push(
													`/dat-lenh?symbol=${activeItem.symbol}&side=M`,
												)
											}
										>
											Mua
										</button>
										<button
											style={{
												flex: 1,
												height: "44px",
												borderRadius: "12px",
												background: "#f04b4b",
												color: "#ffffff",
												border: "none",
												fontWeight: "600",
												fontSize: "15px",
											}}
											onClick={() =>
												router.push(
													`/dat-lenh?symbol=${activeItem.symbol}&side=B`,
												)
											}
										>
											Bán
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
