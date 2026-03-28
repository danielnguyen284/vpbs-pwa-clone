'use client';

import { useEffect, useState } from 'react';
import BottomNav from '@/components/BottomNav';

interface OrderItem {
  _id: string;
  symbol: string;
  side: 'M' | 'B';
  price: number;
  quantity: number;
  order_date: string;
  status: 'Khớp hết' | 'Từ chối' | 'Chờ khớp';
  filled_price?: number;
}

export default function OrderBookPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (data.orders) setOrders(data.orders);
        setLoading(false);
      });
  }, []);

  const formatMoney = (val: number) => val.toLocaleString('vi-VN');
  
  const getStatusBadge = (status: string) => {
    if (status === 'Khớp hết') return { bg: 'rgba(24, 201, 98, 0.15)', text: 'var(--text-success)' };
    if (status === 'Từ chối') return { bg: 'rgba(240, 75, 75, 0.15)', text: 'var(--text-danger)' };
    return { bg: 'rgba(255, 214, 0, 0.15)', text: 'var(--text-warning)' };
  };

  return (
    <>
      <header style={{ backgroundColor: 'var(--bg-primary)', paddingTop: '52px' }}>
        {/* Top Navbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg style={{ position: 'relative', right: '4px' }} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            <span style={{ fontSize: '17.5px', fontWeight: 350 }}>Sổ lệnh</span>
          </div>
          <svg style={{ position: 'relative', left: '3px' }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#8a8d9b', fontSize: '13px', marginTop: '1px' }}>
          <div style={{ flex: 1, textAlign: 'center', padding: '12px 0' }}>Lệnh thường</div>
          <div style={{ flex: 1, textAlign: 'center', padding: '12px 0' }}>Lệnh điều kiện</div>
          <div style={{ flex: 1, textAlign: 'center', padding: '12px 0', color: 'var(--text-success)', borderBottom: '2px solid var(--text-success)', fontWeight: '500' }}>Lịch sử GD</div>
        </div>
      </header>
      
      <main className="screen-container" style={{ padding: '16px 12px' }}>
        {/* Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '6px', marginTop: '-6px' }}>
          <div style={{ flex: 1.08, backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '7px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#cccccc', fontSize: '11px' }}>
            <span style={{ position: 'relative', right: '3px' }}>Tiểu khoản ký quỹ</span>
            <svg style={{ position: 'relative', left: '2px' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
          <div style={{ flex: 1.02, backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '7px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#cccccc', fontSize: '11px' }}>
            <span style={{ position: 'relative', right: '6px' }}>Trạng thái: Tất cả</span>
            <svg style={{ position: 'relative', left: '2px' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
          <img src="/icons/header/ic_filter2.svg" style={{ width: '18px', height: '18px', position: 'relative', right: '4px' }} alt="filter" />
        </div>

        {/* Table Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8a8d9b', fontSize: '11px', marginBottom: '12px', alignItems: 'center', marginTop: '-14px' }}>
          <div style={{ flex: 1.2, textAlign: 'center', paddingRight: '12px', position: 'relative', left: '14px' }}>Mã</div>
          <div style={{ flex: 1, textAlign: 'center', lineHeight: '1.5', position: 'relative', right: '3px' }}>
            <span style={{ position: 'relative', top: '2px' }}>Giá đặt/</span><br/>Giá khớp
          </div>
          <div style={{ flex: 1, textAlign: 'center', lineHeight: '1.5', position: 'relative', right: '12px' }}>
            <span style={{ position: 'relative', top: '2px' }}>KL đặt/</span><br/>KL khớp
          </div>
          <div style={{ flex: 1, textAlign: 'right', paddingRight: '4px', position: 'relative', right: '16px' }}>Trạng thái</div>
        </div>

        {/* Orders List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Hardcoded DIG order for UI matching */}
          <div style={{ backgroundColor: '#1e1f25', borderRadius: '16px', padding: '16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Symbol & Date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1.2 }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '4px', backgroundColor: 'rgba(240, 75, 75, 0.15)', color: 'var(--text-danger)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px', fontWeight: '600' }}>B</div>
              <div>
                <div style={{ fontSize: '12.5px', fontWeight: 350, color: '#ffffff', marginBottom: '2px', position: 'relative', left: '2px' }}>DIG</div>
                <div style={{ fontSize: '10px', color: '#8a8d9b' }}>25/03/2026</div>
              </div>
            </div>

            {/* Price */}
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '11.5px', color: '#8a8d9b', marginBottom: '2px' }}>13.85</div>
              <div style={{ fontSize: '11.5px', color: '#ffffff', fontWeight: '350' }}>13.85</div>
            </div>

            {/* Quantity */}
            <div style={{ flex: 1, textAlign: 'center', position: 'relative', right: '10px' }}>
              <div style={{ fontSize: '11.5px', color: '#8a8d9b', marginBottom: '2px' }}>500</div>
              <div style={{ fontSize: '11.5px', color: '#ffffff', fontWeight: '350' }}>500</div>
            </div>

            {/* Status */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ backgroundColor: 'rgba(24, 201, 98, 0.15)', color: 'var(--text-success)', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '500', position: 'relative', top: '2px', right: '8px' }}>
                Khớp hết
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </>
  );
}
