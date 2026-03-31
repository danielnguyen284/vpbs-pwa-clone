"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
	prompt(): Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
	const [deferredPrompt, setDeferredPrompt] =
		useState<BeforeInstallPromptEvent | null>(null);
	const [showIOSPrompt, setShowIOSPrompt] = useState(false);
	const [dismissed, setDismissed] = useState(false);

	useEffect(() => {
		if (sessionStorage.getItem("pwa-install-dismissed")) return;

		const isStandalone =
			window.matchMedia("(display-mode: standalone)").matches ||
			(navigator as any).standalone === true;
		if (isStandalone) return;

		const handler = (e: Event) => {
			e.preventDefault();
			setDeferredPrompt(e as BeforeInstallPromptEvent);
		};
		window.addEventListener("beforeinstallprompt", handler);

		const isIOS =
			/iPad|iPhone|iPod/.test(navigator.userAgent) &&
			!(window as any).MSStream;
		const isSafari =
			/Safari/.test(navigator.userAgent) &&
			!/CriOS|FxiOS|OPiOS|EdgiOS/.test(navigator.userAgent);
		if (isIOS && isSafari) {
			setTimeout(() => setShowIOSPrompt(true), 2000);
		}

		return () => window.removeEventListener("beforeinstallprompt", handler);
	}, []);

	const handleInstall = async () => {
		if (!deferredPrompt) return;
		deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;
		if (outcome === "accepted") {
			setDeferredPrompt(null);
		}
		dismiss();
	};

	const dismiss = () => {
		setDismissed(true);
		setShowIOSPrompt(false);
		setDeferredPrompt(null);
		sessionStorage.setItem("pwa-install-dismissed", "1");
	};

	if (dismissed) return null;
	if (!deferredPrompt && !showIOSPrompt) return null;

	return (
		<div
			id="install-prompt-banner"
			style={{
				position: "fixed",
				bottom: "7rem",
				left: "50%",
				transform: "translateX(-50%)",
				width: "calc(100% - 32px)",
				maxWidth: "468px",
				background: "var(--bg-secondary)",
				border: "1px solid var(--border-accent)",
				borderRadius: "var(--radius-lg)",
				padding: "14px 16px",
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				zIndex: 9999,
				boxShadow: "var(--shadow-lg)",
				animation: "slideUpInstall 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
				backdropFilter: "blur(20px)",
			}}
		>
			<div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
				<div
					style={{
						width: 40,
						height: 40,
						borderRadius: 10,
						background: "var(--accent-gradient)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						flexShrink: 0,
					}}
				>
					<Download size={18} color="white" />
				</div>
				<div style={{ flex: 1, minWidth: 0 }}>
					<div style={{ color: "var(--text-primary)", fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
						Cài đặt VTS Invest
					</div>
					{deferredPrompt ? (
						<div style={{ color: "var(--text-secondary)", fontSize: 12 }}>
							Thêm vào màn hình chính
						</div>
					) : (
						<div style={{ color: "var(--text-secondary)", fontSize: 12 }}>
							Nhấn ⎋ rồi chọn <strong>&quot;Thêm vào MH chính&quot;</strong>
						</div>
					)}
				</div>
			</div>
			<div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: 8 }}>
				{deferredPrompt && (
					<button
						onClick={handleInstall}
						id="install-btn"
						style={{
							background: "var(--accent-gradient)",
							color: "white",
							border: "none",
							borderRadius: 10,
							padding: "8px 16px",
							fontSize: 13,
							fontWeight: 600,
							cursor: "pointer",
							fontFamily: "var(--font-family)",
						}}
					>
						Cài đặt
					</button>
				)}
				<button
					onClick={dismiss}
					id="dismiss-install-btn"
					style={{
						background: "transparent",
						color: "var(--text-muted)",
						border: "none",
						cursor: "pointer",
						padding: 4,
						display: "flex",
					}}
				>
					<X size={18} />
				</button>
			</div>
		</div>
	);
}
