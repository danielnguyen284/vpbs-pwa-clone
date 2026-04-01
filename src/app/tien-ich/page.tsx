"use client";

import { useState, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import { useRouter } from "next/navigation";
import { Wallet, LogOut, RotateCcw, Plus, Moon, Sun } from "lucide-react";

export default function UtilitiesPage() {
	const [balance, setBalance] = useState<number | null>(null);
	const [customAmount, setCustomAmount] = useState("");
	const [isDark, setIsDark] = useState(false);
	const [mounted, setMounted] = useState(false);
	const router = useRouter();

	useEffect(() => {
		setMounted(true);
		fetch("/api/auth/me")
			.then((res) => res.json())
			.then((data) => {
				if (data.user) setBalance(data.user.cash_balance);
			});
			
		// Initialize theme state
		const isDarkMode = 
			document.documentElement.classList.contains("dark") || 
			localStorage.getItem("theme") === "dark";
		setIsDark(isDarkMode);
	}, []);

	const handleAddFunds = async (amount: number) => {
		try {
			const res = await fetch("/api/utils/add-funds", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ amount }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error);

			alert(data.message);
			setBalance(data.balance);
		} catch (err: any) {
			alert(err.message);
		}
	};

	const handleLogout = async () => {
		await fetch("/api/auth/logout", { method: "POST" });
		window.location.href = "/login";
	};

	const handleReset = async () => {
		if (
			!window.confirm(
				"Bạn có chắc chắn muốn xoá toàn bộ dữ liệu giao dịch? Hành động này không thể hoàn tác."
			)
		) {
			return;
		}
		try {
			const res = await fetch("/api/utils/reset", { method: "POST" });
			const data = await res.json();
			if (!res.ok) throw new Error(data.error);

			alert(data.message);
			setBalance(data.balance);
			window.location.reload();
		} catch (err: any) {
			alert(err.message);
		}
	};

	const toggleTheme = () => {
		const newTheme = !isDark;
		setIsDark(newTheme);
		if (newTheme) {
			document.documentElement.classList.add("dark");
			localStorage.setItem("theme", "dark");
		} else {
			document.documentElement.classList.remove("dark");
			localStorage.setItem("theme", "light");
		}
	};

	return (
		<>
			<header className="header" style={{ borderBottom: "none", background: "var(--bg-primary)" }}>
				<div style={{ fontSize: 18, fontWeight: 700 }}>Cài đặt</div>
			</header>

			<main className="screen-container" style={{ padding: 16 }}>
				{/* Balance Card */}
				<div className="gradient-card" style={{ marginBottom: 24 }}>
					<div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
						<div style={{
							width: 36,
							height: 36,
							borderRadius: 10,
							background: "var(--accent-gradient)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}>
							<Wallet size={18} color="white" />
						</div>
						<div style={{ color: "var(--text-secondary)", fontSize: 13 }}>
							Số dư tài khoản
						</div>
					</div>
					<div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em" }}>
						{balance !== null ? balance.toLocaleString("vi-VN") : "---"}
						<span style={{ fontSize: 14, fontWeight: 500, marginLeft: 4 }}>VND</span>
					</div>
				</div>

				{/* Add Funds Section */}
				<div style={{ marginBottom: 24 }}>
					<h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: "var(--text-secondary)" }}>
						Nạp tiền
					</h3>

					<div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
						<input
							type="number"
							className="form-input"
							placeholder="Nhập số tiền VND..."
							value={customAmount}
							onChange={(e) => setCustomAmount(e.target.value)}
							style={{ flex: 1 }}
							id="add-funds-input"
						/>
						<button
							className="btn-primary"
							style={{
								width: "auto",
								padding: "0 20px",
								marginTop: 0,
								display: "flex",
								alignItems: "center",
								gap: 6,
							}}
							onClick={() => {
								if (customAmount && Number(customAmount) > 0) {
									handleAddFunds(Number(customAmount));
									setCustomAmount("");
								}
							}}
							id="add-funds-submit"
						>
							<Plus size={16} />
							Nạp
						</button>
					</div>

					<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
						{[10_000_000, 50_000_000, 100_000_000, 500_000_000].map((amount) => (
							<button
								key={amount}
								className="glass-card"
								style={{
									padding: "10px 12px",
									border: "1px solid var(--glass-border)",
									color: "var(--text-primary)",
									fontSize: 13,
									fontWeight: 500,
									fontFamily: "var(--font-family)",
									cursor: "pointer",
									textAlign: "center",
									transition: "background 0.15s",
								}}
								onClick={() => handleAddFunds(amount)}
							>
								+ {(amount / 1_000_000).toFixed(0)} Triệu
							</button>
						))}
					</div>
				</div>

				{/* Actions */}
				<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
					<button className="btn-ghost" onClick={toggleTheme} id="toggle-theme">
						<div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
							{mounted ? (
								<>
									{isDark ? <Sun size={16} /> : <Moon size={16} />}
									{isDark ? "Chế độ Sáng" : "Chế độ Tối"}
								</>
							) : (
								<>
									<Moon size={16} style={{ visibility: "hidden" }} />
									<span style={{ visibility: "hidden" }}>Chế độ Tối</span>
								</>
							)}
						</div>
					</button>

					<button className="btn-danger" onClick={handleReset} id="reset-data">
						<div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
							<RotateCcw size={16} />
							Reset dữ liệu
						</div>
					</button>

					<button className="btn-ghost" onClick={handleLogout} id="logout-btn">
						<div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
							<LogOut size={16} />
							Đăng xuất
						</div>
					</button>
				</div>
			</main>

			<BottomNav />
		</>
	);
}
