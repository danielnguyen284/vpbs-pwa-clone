"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const router = useRouter();

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		try {
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Login failed");
			}

			// Force a hard refresh to let middleware allow passing
			window.location.href = "/danh-muc";
		} catch (err: any) {
			setError(err.message);
		}
	};

	return (
		<div className="auth-container">
			<div style={{ textAlign: "center", marginBottom: 40 }}>
				{/* Placeholder for Logo, will use provided icon if available */}
				<div
					style={{
						width: 80,
						height: 80,
						backgroundColor: "var(--text-success)",
						borderRadius: 16,
						margin: "0 auto 16px",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<span style={{ fontSize: 24, fontWeight: "bold" }}>VPBS</span>
				</div>
				<h2>Đăng nhập Hệ thống</h2>
				<p className="text-secondary" style={{ marginTop: 8 }}>
					Mô phỏng Giao dịch Chứng khoán Cơ sở
				</p>
			</div>

			<form onSubmit={handleLogin}>
				<div className="form-group">
					<input
						type="text"
						className="form-input"
						placeholder="Tên đăng nhập"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						required
					/>
				</div>
				<div className="form-group">
					<input
						type="password"
						className="form-input"
						placeholder="Mật khẩu"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
				</div>

				{error && (
					<p className="text-danger" style={{ marginBottom: 16 }}>
						{error}
					</p>
				)}

				<button type="submit" className="btn-primary">
					ĐĂNG NHẬP
				</button>
			</form>

			<div style={{ textAlign: "center", marginTop: 24 }}>
				<p className="text-secondary">
					Bạn chưa có tài khoản?{" "}
					<Link href="/register" className="text-success">
						Đăng ký ngay
					</Link>
				</p>
			</div>
		</div>
	);
}
