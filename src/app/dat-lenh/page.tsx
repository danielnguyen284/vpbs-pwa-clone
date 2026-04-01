"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

function OrderPlacementContent() {
	const searchParams = useSearchParams();
	const initialSymbol = searchParams.get("symbol") || "";
	const initialSide = searchParams.get("side") === "B" ? "B" : "M";

	const [symbol, setSymbol] = useState(initialSymbol);
	const [side, setSide] = useState<"M" | "B">(initialSide as "M" | "B");
	const [price, setPrice] = useState("");
	const [quantity, setQuantity] = useState("");
	const [orderDate, setOrderDate] = useState(
		new Date().toISOString().split("T")[0]
	);
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleOrder = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!symbol || !price || !quantity || !orderDate) {
			alert("Vui lòng nhập đầy đủ thông tin");
			return;
		}

		setLoading(true);
		try {
			const res = await fetch("/api/orders", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					symbol: symbol.toUpperCase(),
					side,
					price: parseFloat(price),
					quantity: parseInt(quantity, 10),
					order_date: orderDate,
				}),
			});

			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.error || "Đặt lệnh thất bại");
			}

			alert(`Đặt lệnh thành công: ${data.order.status}`);
			router.push("/so-lenh");
		} catch (err: any) {
			alert(err.message);
		} finally {
			setLoading(false);
		}
	};

	const totalValue =
		price && quantity
			? (parseFloat(price) * parseInt(quantity, 10) * 1000).toLocaleString("vi-VN")
			: "0";

	return (
		<>
			<header className="header" style={{ justifyContent: "center" }}>
				<Link
					href="/danh-muc"
					style={{
						position: "absolute",
						left: 16,
						display: "flex",
						alignItems: "center",
						color: "var(--text-secondary)",
					}}
				>
					<X size={20} />
				</Link>
				<div style={{ fontWeight: 700 }}>Đặt lệnh</div>
			</header>

			<main className="screen-container" style={{ padding: 16 }}>
				{/* Buy/Sell Toggle */}
				<div className="segmented-control" style={{ marginBottom: 24 }}>
					<button
						type="button"
						className={`segmented-control__item segmented-control__item--buy ${side === "M" ? "active" : ""}`}
						onClick={() => setSide("M")}
					>
						MUA
					</button>
					<button
						type="button"
						className={`segmented-control__item segmented-control__item--sell ${side === "B" ? "active" : ""}`}
						onClick={() => setSide("B")}
					>
						BÁN
					</button>
				</div>

				<form onSubmit={handleOrder}>
					<div className="form-group">
						<label
							className="text-secondary"
							style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 500 }}
						>
							Mã chứng khoán
						</label>
						<input
							type="text"
							className="form-input"
							style={{ textTransform: "uppercase", fontSize: 17, fontWeight: 700, letterSpacing: "0.05em" }}
							placeholder="VD: HPG"
							value={symbol}
							onChange={(e) => setSymbol(e.target.value.toUpperCase())}
							id="order-symbol"
						/>
					</div>

					<div style={{ display: "flex", gap: 12 }}>
						<div className="form-group" style={{ flex: 1 }}>
							<label
								className="text-secondary"
								style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 500 }}
							>
								Giá đặt
							</label>
							<input
								type="number"
								step="0.01"
								className="form-input"
								placeholder="Giá"
								value={price}
								onChange={(e) => setPrice(e.target.value)}
								id="order-price"
							/>
						</div>
						<div className="form-group" style={{ flex: 1 }}>
							<label
								className="text-secondary"
								style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 500 }}
							>
								Khối lượng
							</label>
							<input
								type="number"
								className="form-input"
								placeholder="100"
								value={quantity}
								onChange={(e) => setQuantity(e.target.value)}
								id="order-quantity"
							/>
						</div>
					</div>

					<div className="form-group">
						<label
							className="text-secondary"
							style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 500 }}
						>
							Ngày giao dịch
						</label>
						<input
							type="date"
							className="form-input"
							value={orderDate}
							onChange={(e) => setOrderDate(e.target.value)}
							max={new Date().toISOString().split("T")[0]}
							id="order-date"
						/>
					</div>

					{/* Order Summary */}
					<div
						className="glass-card"
						style={{ padding: 16, marginTop: 20, marginBottom: 24 }}
					>
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								fontSize: 14,
							}}
						>
							<span className="text-secondary">Tổng giá trị (VND)</span>
							<span style={{ fontWeight: 700, fontSize: 16 }}>{totalValue}</span>
						</div>
					</div>

					<button
						type="submit"
						className="btn-primary"
						style={{
							background:
								side === "M" ? "var(--text-success)" : "var(--text-danger)",
							padding: 16,
							fontSize: 16,
							fontWeight: 700,
						}}
						disabled={loading}
						id="order-submit"
					>
						{loading
							? "Đang xử lý..."
							: side === "M"
								? "ĐẶT LỆNH MUA"
								: "ĐẶT LỆNH BÁN"}
					</button>
				</form>
			</main>
		</>
	);
}

export default function OrderPlacementPage() {
	return (
		<Suspense fallback={<div style={{ padding: 40, textAlign: "center" }}>Đang tải...</div>}>
			<OrderPlacementContent />
		</Suspense>
	);
}
