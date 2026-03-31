"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TrendingUp, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Đăng nhập thất bại");
			}

			window.location.href = "/danh-muc";
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="auth-container">
			{/* Background orbs */}
			<div className="auth-bg-orb auth-bg-orb--blue" />
			<div className="auth-bg-orb auth-bg-orb--purple" />

			<div style={{ textAlign: "center", marginBottom: 40, position: "relative", zIndex: 1 }}>
				{/* Logo */}
				<div
					style={{
						width: 72,
						height: 72,
						background: "var(--accent-gradient)",
						borderRadius: 18,
						margin: "0 auto 20px",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						boxShadow: "0 8px 32px var(--accent-glow)",
					}}
				>
					<TrendingUp size={32} color="white" strokeWidth={2.5} />
				</div>
				<h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>
					VTS Invest
				</h1>
				<p className="text-secondary" style={{ fontSize: 14 }}>
					Nền tảng Giao dịch Chứng khoán mô phỏng
				</p>
			</div>

			<form onSubmit={handleLogin} style={{ position: "relative", zIndex: 1 }}>
				<div className="form-group">
					<input
						type="text"
						className="form-input"
						placeholder="Tên đăng nhập"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						required
						id="login-username"
					/>
				</div>
				<div className="form-group" style={{ position: "relative" }}>
					<input
						type={showPassword ? "text" : "password"}
						className="form-input"
						placeholder="Mật khẩu"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						id="login-password"
						style={{ paddingRight: 48 }}
					/>
					<button
						type="button"
						onClick={() => setShowPassword(!showPassword)}
						style={{
							position: "absolute",
							right: 14,
							top: "50%",
							transform: "translateY(-50%)",
							background: "none",
							border: "none",
							color: "var(--text-muted)",
							cursor: "pointer",
							padding: 4,
						}}
					>
						{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
					</button>
				</div>

				{error && (
					<p className="text-danger" style={{ marginBottom: 12, fontSize: 13 }}>
						{error}
					</p>
				)}

				<button type="submit" className="btn-primary" disabled={loading} id="login-submit">
					{loading ? "Đang xử lý..." : "ĐĂNG NHẬP"}
				</button>
			</form>

			<div style={{ textAlign: "center", marginTop: 24, position: "relative", zIndex: 1 }}>
				<p className="text-secondary" style={{ fontSize: 14 }}>
					Chưa có tài khoản?{" "}
					<Link href="/register" className="text-accent" style={{ fontWeight: 600 }}>
						Đăng ký ngay
					</Link>
				</p>
			</div>
		</div>
	);
}
