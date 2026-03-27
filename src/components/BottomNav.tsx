"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
	const pathname = usePathname();

	return (
		<nav className="bottom-nav">
			<Link
				href="/bang-gia"
				className={`nav-item ${pathname === "/bang-gia" ? "active" : ""}`}
			>
				<img
					src={`/icons/bottom-nav/ic_price_list${pathname === "/bang-gia" ? "" : "2"}.svg`}
					className="nav-icon"
					alt="Bảng giá"
				/>
				<span>Bảng giá</span>
			</Link>

			<Link
				href="/danh-muc"
				className={`nav-item ${pathname === "/danh-muc" ? "active" : ""}`}
			>
				<img
					src={`/icons/bottom-nav/ic_category${pathname === "/danh-muc" ? "_selected" : ""}.svg`}
					className="nav-icon"
					alt="Danh mục"
				/>
				<span>Danh mục</span>
			</Link>

			{/* FAB for Order */}
			<Link href="/dat-lenh" className="nav-item2">
				<div className="nav-fab-container">
					<img
						src="/icons/bottom-nav/ic_order.svg"
						style={{ width: "1.6rem", height: "1.6rem" }}
						alt="Đặt lệnh"
					/>
				</div>
			</Link>

			<Link
				href="/so-lenh"
				className={`nav-item ${pathname === "/so-lenh" ? "active" : ""}`}
			>
				<img
					src={`/icons/bottom-nav/ic_order_book${pathname === "/so-lenh" ? "_selected" : ""}.svg`}
					className="nav-icon"
					alt="Sổ lệnh"
				/>
				<span>Sổ lệnh</span>
			</Link>

			<Link
				href="/tien-ich"
				className={`nav-item ${pathname === "/tien-ich" ? "active" : ""}`}
			>
				<img
					src={`/icons/bottom-nav/ic_service${pathname === "/tien-ich" ? "_selected" : ""}.svg`}
					className="nav-icon"
					alt="Tiện ích"
				/>
				<span>Tiện ích</span>
			</Link>
		</nav>
	);
}
