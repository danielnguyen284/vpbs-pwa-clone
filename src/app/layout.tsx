import type { Metadata, Viewport } from 'next';
import './globals.css';


export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#121620',
};

export const metadata: Metadata = {
  title: 'VPBS Demo',
  description: 'Mô phỏng Giao dịch Chứng khoán Cơ sở PWA',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'VPBS Demo',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <div className="app-container">
          {children}
        </div>
      </body>
    </html>
  );
}
