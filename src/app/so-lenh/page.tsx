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
  const [showDetail, setShowDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

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

  const handleOrderClick = (order: OrderItem) => {
    setSelectedOrder(order);
    setShowDetail(true);
  };

  return (
    <>
      <header style={{ backgroundColor: 'var(--bg-primary)', paddingTop: '3.9rem' }}>
        {/* Top Navbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg style={{ position: 'relative', right: '0.25rem' }} width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            <span style={{ fontSize: '1.19375rem', fontWeight: 500, marginLeft: '0.45rem' }}>Sổ lệnh</span>
          </div>
          <svg style={{ position: 'relative', right: '0.125rem' }} width="1.375rem" height="1.375rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#8a8d9b', fontSize: '0.8125rem', marginTop: '0.38rem', position: 'relative', right: '0.25rem' }}>
          <div style={{ flex: 1, textAlign: 'center', padding: '0.75rem 0' }}>Lệnh thường</div>
          <div style={{ flex: 1, textAlign: 'center', padding: '0.75rem 0' }}>Lệnh điều kiện</div>
          <div style={{ flex: 1, textAlign: 'center', padding: '0.75rem 0', color: 'var(--text-success)', borderBottom: '0.125rem solid var(--text-success)', fontWeight: '500' }}>Lịch sử GD</div>
        </div>
      </header>
      
      <main className="screen-container" style={{ padding: '1rem 0.75rem' }}>
        {/* Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '0.375rem', marginTop: '-0.375rem' }}>
          <div style={{ flex: 0.91, backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '0.375rem', padding: '0.4375rem 0.625rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#cccccc', fontSize: '0.8125rem', position: 'relative', top: '0.25rem' }}>
            <span style={{ position: 'relative', right: '0.1875rem' }}>Tiểu khoản ký quỹ</span>
            <svg style={{ position: 'relative', right: '0.125rem' }} width="0.875rem" height="0.875rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
          <div style={{ flex: 0.91, backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '0.375rem', padding: '0.4375rem 0.625rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#cccccc', fontSize: '0.8125rem', position: 'relative', top: '0.25rem', marginRight: '0.4375rem' }}>
            <span style={{ position: 'relative', right: '0.125rem' }}>Trạng thái: Tất cả</span>
            <svg style={{ position: 'relative', right: '0.125rem' }} width="0.875rem" height="0.875rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
          <img src="/icons/header/ic_filter2.svg" style={{ width: '1.125rem', height: '1.125rem', position: 'relative', right: '0.5rem', top: '0.25rem' }} alt="filter" />
        </div>

        {/* Table Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8a8d9b', fontSize: '0.6875rem', marginBottom: '0.75rem', alignItems: 'center', marginTop: '-0.3rem' }}>
          <div style={{ flex: 1.2, textAlign: 'center', paddingRight: '0.75rem', position: 'relative', left: '1.25rem' }}>Mã</div>
          <div style={{ flex: 1, textAlign: 'center', lineHeight: '1.5', position: 'relative', right: '0.3rem' }}>
            <span style={{ position: 'relative', top: '0.125rem' }}>Giá đạt/</span><br/>Giá khớp
          </div>
          <div style={{ flex: 1, textAlign: 'center', lineHeight: '1.5', position: 'relative', right: '1.125rem' }}>
            <span style={{ position: 'relative', top: '0.125rem' }}>KL đặt/</span><br/>KL khớp
          </div>
          <div style={{ flex: 1, textAlign: 'right', paddingRight: '0.25rem', position: 'relative', right: '1.4375rem' }}>Trạng thái</div>
        </div>

        {/* Orders List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Hardcoded DIG order for UI matching */}
          <div 
            onClick={() => handleOrderClick({ _id: '1', symbol: 'DIG', side: 'B', price: 13.85, quantity: 500, order_date: '25/03/2026', status: 'Khớp hết' })}
            style={{ backgroundColor: '#1e1f25', borderRadius: '1rem', padding: '1.15rem 0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem', marginLeft: '0.375rem', marginRight: '0.375rem', cursor: 'pointer' }}
          >
            {/* Symbol & Date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flex: 1.2 }}>
              <div style={{ width: '1.375rem', height: '1.375rem', borderRadius: '0.25rem', backgroundColor: 'rgba(240, 75, 75, 0.15)', color: 'var(--text-danger)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.75rem', fontWeight: '600' }}>B</div>
              <div style={{ marginLeft: '0.3rem' }}>
                <div style={{ fontSize: '0.78125rem', fontWeight: 350, color: '#ffffff', marginBottom: '0.125rem', position: 'relative', left: '0.125rem' }}>DIG</div>
                <div style={{ fontSize: '0.625rem', color: '#8a8d9b', position: 'relative', top: '0.125rem' }}>25/03/2026</div>
              </div>
            </div>

            {/* Price */}
            <div style={{ flex: 1, textAlign: 'center', position: 'relative', right: '0.25rem' }}>
              <div style={{ fontSize: '0.775rem', color: '#8a8d9b', marginBottom: '0.125rem' }}>13.85</div>
              <div style={{ fontSize: '0.775rem', color: '#ffffff', fontWeight: '350' }}>13.85</div>
            </div>

            {/* Quantity */}
            <div style={{ flex: 1, textAlign: 'center', position: 'relative', right: '0.875rem' }}>
              <div style={{ fontSize: '0.8125rem', color: '#8a8d9b', marginBottom: '0.125rem' }}>500</div>
              <div style={{ fontSize: '0.8125rem', color: '#ffffff', fontWeight: '350' }}>500</div>
            </div>

            {/* Status */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ backgroundColor: 'rgba(24, 201, 98, 0.15)', color: 'var(--text-success)', padding: '0.355rem 0.8125rem', borderRadius: '0.25rem', fontSize: '0.625rem', fontWeight: '500', position: 'relative', top: '0.125rem', right: '0.25rem' }}>
                Khớp hết
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Detail Bottom Sheet Overlay */}
      {showDetail && (
        <div 
          onClick={() => setShowDetail(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: '#17171c', width: '100%', borderTopLeftRadius: '1.25rem', borderTopRightRadius: '1.25rem', padding: '1.5rem', marginBottom: '1.3rem' }}
          >
            {/* Handle Bar */}
            <div style={{ width: '2.5rem', height: '0.3125rem', backgroundColor: '#333338', borderRadius: '1rem', margin: '0 auto 1.5rem auto' }}></div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '-0.75rem' }}>
              {/* First section rows */}
              {[
                { label: 'Tiểu khoản', value: 'Ký quỹ' },
                { label: 'Mã cổ phiếu', value: selectedOrder?.symbol || 'DIG' },
                { label: 'Lệnh', value: selectedOrder?.side === 'B' ? 'Bán' : 'Mua' },
                { label: 'Loại lệnh', value: 'LO' },
                { label: 'Giá đặt lệnh', value: (selectedOrder?.price || 13.85).toFixed(2) },
                { label: 'Thời gian đặt lệnh', value: selectedOrder?.order_date || '25/03/2026' }
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', position: 'relative', top: idx < 3 ? '0.9625rem' : '0.4375rem' }}>
                  <span style={{ color: '#8a8d9b' }}>{item.label}</span>
                  <span style={{ color: '#ffffff' }}>{item.value}</span>
                </div>
              ))}
              
              <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.05)', margin: '0.5rem 0' }}></div>
              
              {/* Second section rows */}
              {[
                { label: 'Khối lượng khớp', value: `${selectedOrder?.quantity || 500}/${selectedOrder?.quantity || 500}` },
                { label: 'Giá khớp', value: (selectedOrder?.price || 13.85).toFixed(2) },
                { label: 'Giá trị lệnh', value: `${formatMoney((selectedOrder?.price || 13.85) * (selectedOrder?.quantity || 500))} đ` },
                { label: 'Trạng thái', value: selectedOrder?.status || 'Khớp hết', color: 'var(--text-success)' }
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', position: 'relative', top: idx >= 2 ? '0.125rem' : '0.4375rem' }}>
                  <span style={{ color: '#8a8d9b' }}>{item.label}</span>
                  <span style={{ color: item.color || '#ffffff' }}>{item.value}</span>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => setShowDetail(false)}
              style={{ width: '100%', marginTop: '2rem', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #333338', backgroundColor: 'transparent', color: '#ffffff', fontWeight: '500', fontSize: '0.9375rem', position: 'relative', top: '-0.7rem' }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </>
  );
}
