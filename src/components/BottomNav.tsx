"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Briefcase, ClipboardList, Settings, ArrowUpDown } from "lucide-react";

export default function BottomNav() {
	const pathname = usePathname();

	return (
		<nav className="bottom-nav">
			<Link
				href="/danh-muc"
				className={`nav-item ${pathname === "/danh-muc" ? "active" : ""}`}
			>
				<Briefcase size={20} strokeWidth={pathname === "/danh-muc" ? 2.2 : 1.5} />
				<span>Danh mục</span>
			</Link>

			<Link
				href="/so-lenh"
				className={`nav-item ${pathname === "/so-lenh" ? "active" : ""}`}
			>
				<ClipboardList size={20} strokeWidth={pathname === "/so-lenh" ? 2.2 : 1.5} />
				<span>Sổ lệnh</span>
			</Link>

			{/* FAB for Order */}
			<Link href="/dat-lenh" className="nav-item2">
				<div className="nav-fab-container">
					<ArrowUpDown size={20} strokeWidth={2} />
				</div>
			</Link>

			<Link
				href="/sao-ke"
				className={`nav-item ${pathname === "/sao-ke" ? "active" : ""}`}
			>
				<BarChart3 size={20} strokeWidth={pathname === "/sao-ke" ? 2.2 : 1.5} />
				<span>Sao kê</span>
			</Link>

			<Link
				href="/tien-ich"
				className={`nav-item ${pathname === "/tien-ich" ? "active" : ""}`}
			>
				<Settings size={20} strokeWidth={pathname === "/tien-ich" ? 2.2 : 1.5} />
				<span>Cài đặt</span>
			</Link>
		</nav>
	);
}
