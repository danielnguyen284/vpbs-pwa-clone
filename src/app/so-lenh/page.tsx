"use client";

import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { X } from "lucide-react";

interface OrderItem {
	_id: string;
	symbol: string;
	side: "M" | "B";
	price: number;
	quantity: number;
	order_date: string;
	status: "Khớp hết" | "Từ chối" | "Chờ khớp";
	filled_price?: number;
}

export default function OrderBookPage() {
	const [orders, setOrders] = useState<OrderItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

	const [typeFilter, setTypeFilter] = useState("ALL");
	const [fromDate, setFromDate] = useState("");
	const [toDate, setToDate] = useState("");

	useEffect(() => {
		fetch("/api/orders")
			.then((res) => res.json())
			.then((data) => {
				if (data.orders) setOrders(data.orders);
				setLoading(false);
			});
	}, []);

	const formatMoney = (val: number) => val.toLocaleString("vi-VN");

	const filteredOrders = orders.filter((order) => {
		if (typeFilter !== "ALL" && order.side !== typeFilter) return false;
		
		try {
			const orderDateStr = new Date(order.order_date).toISOString().split('T')[0];
			if (fromDate && orderDateStr < fromDate) return false;
			if (toDate && orderDateStr > toDate) return false;
		} catch (e) {
			// ignore invalid dates
		}

		return true;
	}).sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());

	const getStatusBadge = (status: string) => {
		if (status === "Khớp hết") return "badge badge--success";
		if (status === "Từ chối") return "badge badge--danger";
		return "badge badge--warning";
	};

	return (
		<>
			{/* Header */}
			<header className="header" style={{ borderBottom: "none", background: "var(--bg-primary)" }}>
				<div style={{ fontSize: 18, fontWeight: 700 }}>Sổ lệnh</div>
			</header>

			{/* Filters */}
			<div style={{ padding: "8px 16px 16px", background: "var(--bg-primary)", display: "flex", flexDirection: "column", gap: 12 }}>
				<div style={{ position: "relative" }}>
					<select 
						value={typeFilter} 
						onChange={e => setTypeFilter(e.target.value)}
						style={{
							width: "100%",
							padding: "10px 12px",
							borderRadius: 8,
							background: "var(--glass-bg)",
							border: "1px solid var(--border-color)",
							color: "var(--text-primary)",
							fontSize: 14,
							outline: "none",
							appearance: "none",
							position: "relative",
							zIndex: 1
						}}
					>
						<option value="ALL" style={{ background: "var(--bg-primary)" }}>Tất cả loại lệnh</option>
						<option value="M" style={{ background: "var(--bg-primary)" }}>Lệnh Mua</option>
						<option value="B" style={{ background: "var(--bg-primary)" }}>Lệnh Bán</option>
					</select>
					<div style={{
						position: "absolute",
						right: 12,
						top: "50%",
						transform: "translateY(-50%)",
						pointerEvents: "none",
						zIndex: 2,
						color: "var(--text-muted)",
						fontSize: 12
					}}>
						▼
					</div>
				</div>
				
				<div style={{ display: "flex", gap: 12, alignItems: "center" }}>
					<div style={{ flex: 1 }}>
						<div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4, paddingLeft: 4 }}>Từ ngày</div>
						<input 
							type="date" 
							value={fromDate}
							onChange={e => setFromDate(e.target.value)}
							style={{
								width: "100%",
								padding: "10px 12px",
								borderRadius: 8,
								background: "var(--glass-bg)",
								border: "1px solid var(--border-color)",
								color: "var(--text-primary)",
								fontSize: 14,
								colorScheme: "dark",
								outline: "none",
								minWidth: 0
							}}
						/>
					</div>
					<div style={{ paddingTop: 18, color: "var(--text-muted)" }}>-</div>
					<div style={{ flex: 1 }}>
						<div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4, paddingLeft: 4 }}>Đến ngày</div>
						<input 
							type="date" 
							value={toDate}
							onChange={e => setToDate(e.target.value)}
							style={{
								width: "100%",
								padding: "10px 12px",
								borderRadius: 8,
								background: "var(--glass-bg)",
								border: "1px solid var(--border-color)",
								color: "var(--text-primary)",
								fontSize: 14,
								colorScheme: "dark",
								outline: "none",
								minWidth: 0
							}}
						/>
					</div>
				</div>
			</div>

			<main className="screen-container" style={{ padding: 16 }}>
				{loading ? (
					<div>
						{[1, 2, 3].map((i) => (
							<div key={i} className="loading-shimmer" style={{ height: 72, marginBottom: 8 }} />
						))}
					</div>
				) : filteredOrders.length === 0 ? (
					<div style={{
						textAlign: "center",
						padding: "40px 0",
						color: "var(--text-muted)",
						fontSize: 14,
					}}>
						Chưa có lệnh nào
					</div>
				) : (
					<div style={{ display: "flex", flexDirection: "column" }}>
						{/* Order List Header */}
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
							<span style={{ flex: 1, textAlign: "right" }}>Giá khớp</span>
							<span style={{ flex: 1, textAlign: "right" }}>KL khớp</span>
							<span style={{ flex: 1.4, textAlign: "right" }}>Trạng thái</span>
						</div>

						{filteredOrders.map((order) => {
							const isBuy = order.side === "M";
							const sideColor = isBuy ? "var(--text-success)" : "var(--text-danger)";

							return (
								<div
									key={order._id}
									onClick={() => setSelectedOrder(order)}
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
									{/* Symbol & Side & Date */}
									<div style={{ flex: 1.2 }}>
										<div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
											<div style={{ fontSize: 14, fontWeight: 700 }}>
												{order.symbol}
											</div>
											<div style={{
												fontSize: 10,
												fontWeight: 700,
												padding: "2px 4px",
												borderRadius: 4,
												background: isBuy ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
												color: sideColor,
											}}>
												{order.side}
											</div>
										</div>
										<div style={{ fontSize: 11, color: "var(--text-muted)" }}>
											{new Date(order.order_date).toLocaleDateString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit" })}
										</div>
									</div>

									{/* Price */}
									<div style={{ flex: 1, textAlign: "right", fontSize: 13, fontWeight: 500 }}>
										{(order.filled_price || order.price).toFixed(2)}
									</div>

									{/* Quantity */}
									<div style={{ flex: 1, textAlign: "right", fontSize: 13, fontWeight: 500 }}>
										{formatMoney(order.quantity)}
									</div>

									{/* Status */}
									<div style={{ flex: 1.4, display: "flex", justifyContent: "flex-end" }}>
										<span className={getStatusBadge(order.status)} style={{
											fontSize: 11,
											padding: "4px 8px",
											whiteSpace: "nowrap"
										}}>
											{order.status}
										</span>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</main>

			{/* Detail Bottom Sheet */}
			{selectedOrder && (
				<>
					<div className="backdrop" onClick={() => setSelectedOrder(null)} />
					<div className="bottom-sheet" style={{ padding: "16px 20px 32px" }}>
						<div className="bottom-sheet-handle" />

						<div style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							marginBottom: 20,
						}}>
							<h3 style={{ fontSize: 18, fontWeight: 700 }}>
								Chi tiết lệnh
							</h3>
							<button
								onClick={() => setSelectedOrder(null)}
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
							{[
								{ label: "Mã CK", value: selectedOrder.symbol },
								{ label: "Lệnh", value: selectedOrder.side === "M" ? "Mua" : "Bán" },
								{ label: "Giá đặt", value: selectedOrder.price.toFixed(2) },
								{ label: "Khối lượng", value: formatMoney(selectedOrder.quantity) },
								{
									label: "Giá trị lệnh",
									value: `${formatMoney(selectedOrder.price * selectedOrder.quantity)} đ`,
								},
								{
									label: "Ngày đặt",
									value: new Date(selectedOrder.order_date).toLocaleDateString("vi-VN"),
								},
							].map((row, i) => (
								<div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
									<span style={{ color: "var(--text-secondary)" }}>{row.label}</span>
									<span style={{ fontWeight: 500 }}>{row.value}</span>
								</div>
							))}

							<div style={{ height: 1, background: "var(--border-color)" }} />

							<div style={{ display: "flex", justifyContent: "space-between" }}>
								<span style={{ color: "var(--text-secondary)" }}>Trạng thái</span>
								<span className={getStatusBadge(selectedOrder.status)}>
									{selectedOrder.status}
								</span>
							</div>
						</div>
					</div>
				</>
			)}

			<BottomNav />
		</>
	);
}
