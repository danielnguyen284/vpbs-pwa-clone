import type { Metadata, Viewport } from "next";
import "./globals.css";
import InstallPrompt from "@/components/InstallPrompt";

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	themeColor: "#F8FAFC",
	viewportFit: "cover",
};

export const metadata: Metadata = {
	title: "VTS Invest",
	description: "Nền tảng Giao dịch Chứng khoán mô phỏng",
	manifest: "/manifest.json",
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "VTS Invest",
	},
	icons: {
		icon: "/icon-192x192.png",
		apple: "/apple-touch-icon-180x180.png",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="vi" suppressHydrationWarning>
			<head>
				<meta name="mobile-web-app-capable" content="yes" />
				<meta name="apple-touch-fullscreen" content="yes" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta
					name="apple-mobile-web-app-status-bar-style"
					content="default"
				/>
				<link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png" />

				{/* iOS Splash Screens */}
				{/* iPhone 16 Pro Max */}
				<link rel="apple-touch-startup-image"
					href="/splash/apple-splash-1320-2868.png"
					media="(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3)" />
				{/* iPhone 16 Pro */}
				<link rel="apple-touch-startup-image"
					href="/splash/apple-splash-1206-2622.png"
					media="(device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3)" />
				{/* iPhone 16 Plus / 15 Plus / 14 Plus */}
				<link rel="apple-touch-startup-image"
					href="/splash/apple-splash-1290-2796.png"
					media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" />
				{/* iPhone 16 / 15 / 15 Pro / 14 Pro */}
				<link rel="apple-touch-startup-image"
					href="/splash/apple-splash-1179-2556.png"
					media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)" />
				{/* iPhone 14 / 13 / 13 Pro / 12 / 12 Pro */}
				<link rel="apple-touch-startup-image"
					href="/splash/apple-splash-1170-2532.png"
					media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" />
				{/* iPhone 13 mini / 12 mini */}
				<link rel="apple-touch-startup-image"
					href="/splash/apple-splash-1080-2340.png"
					media="(device-width: 360px) and (device-height: 780px) and (-webkit-device-pixel-ratio: 3)" />
				{/* iPhone 11 Pro Max / XS Max */}
				<link rel="apple-touch-startup-image"
					href="/splash/apple-splash-1242-2688.png"
					media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" />
				{/* iPhone 11 / XR */}
				<link rel="apple-touch-startup-image"
					href="/splash/apple-splash-828-1792.png"
					media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" />
				{/* iPhone 11 Pro / XS / X */}
				<link rel="apple-touch-startup-image"
					href="/splash/apple-splash-1125-2436.png"
					media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" />
				{/* iPhone 8 Plus */}
				<link rel="apple-touch-startup-image"
					href="/splash/apple-splash-1242-2208.png"
					media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)" />
				{/* iPhone SE / 8 */}
				<link rel="apple-touch-startup-image"
					href="/splash/apple-splash-750-1334.png"
					media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" />
					
				<script
					dangerouslySetInnerHTML={{
						__html: `
							(function() {
								try {
									var theme = localStorage.getItem('theme');
									var isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
									if (isDark) {
										document.documentElement.classList.add('dark');
									} else {
										document.documentElement.classList.remove('dark');
									}
								} catch (e) {}
							})();
						`,
					}}
				/>
			</head>
			<body>
				<div className="app-container">{children}</div>
				<InstallPrompt />
			</body>
		</html>
	);
}
