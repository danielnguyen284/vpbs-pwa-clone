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

	useEffect(() => {
		fetch("/api/orders")
			.then((res) => res.json())
			.then((data) => {
				if (data.orders) setOrders(data.orders);
				setLoading(false);
			});
	}, []);

	const formatMoney = (val: number) => val.toLocaleString("vi-VN");

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

			{/* Tabs */}
			<div className="tab-bar" style={{ padding: "0 16px", background: "var(--bg-primary)" }}>
				<div className="tab-bar__item active">Lịch sử GD</div>
			</div>

			<main className="screen-container" style={{ padding: 16 }}>
				{loading ? (
					<div>
						{[1, 2, 3].map((i) => (
							<div key={i} className="loading-shimmer" style={{ height: 72, marginBottom: 8 }} />
						))}
					</div>
				) : orders.length === 0 ? (
					<div style={{
						textAlign: "center",
						padding: "40px 0",
						color: "var(--text-muted)",
						fontSize: 14,
					}}>
						Chưa có lệnh nào
					</div>
				) : (
					<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
						{orders.map((order) => (
							<div
								key={order._id}
								onClick={() => setSelectedOrder(order)}
								className="glass-card"
								style={{
									padding: "14px 16px",
									cursor: "pointer",
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									transition: "background 0.15s",
								}}
							>
								<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
									{/* Side badge */}
									<div
										style={{
											width: 28,
											height: 28,
											borderRadius: 6,
											background:
												order.side === "M"
													? "rgba(16, 185, 129, 0.12)"
													: "rgba(239, 68, 68, 0.12)",
											color:
												order.side === "M"
													? "var(--text-success)"
													: "var(--text-danger)",
											display: "flex",
											justifyContent: "center",
											alignItems: "center",
											fontSize: 12,
											fontWeight: 700,
										}}
									>
										{order.side}
									</div>
									<div>
										<div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
											{order.symbol}
										</div>
										<div style={{ fontSize: 11, color: "var(--text-muted)" }}>
											{new Date(order.order_date).toLocaleDateString("vi-VN")}
										</div>
									</div>
								</div>

								<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
									<div style={{ textAlign: "right" }}>
										<div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>
											{order.price.toFixed(2)} × {formatMoney(order.quantity)}
										</div>
									</div>
									<span className={getStatusBadge(order.status)}>{order.status}</span>
								</div>
							</div>
						))}
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
