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
      <header className="header">
        <div>Sổ lệnh trong ngày</div>
      </header>
      
      <main className="screen-container" style={{ padding: 16 }}>
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: 40 }}>Đang tải...</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-secondary)' }}>
            Chưa có lệnh nào.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map((order) => (
              <div key={order._id} style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16, fontWeight: 'bold' }}>{order.symbol}</span>
                    <span style={{ 
                      color: order.side === 'M' ? 'var(--text-success)' : 'var(--text-danger)',
                      fontSize: 10,
                      fontWeight: 'bold',
                      border: `1px solid ${order.side === 'M' ? 'var(--text-success)' : 'var(--text-danger)'}`,
                      borderRadius: 4,
                      padding: '2px 6px'
                    }}>
                      {order.side === 'M' ? 'MUA' : 'BÁN'}
                    </span>
                  </div>
                  <div style={{
                    backgroundColor: getStatusBadge(order.status).bg,
                    color: getStatusBadge(order.status).text,
                    padding: '4px 10px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: '600'
                  }}>
                    {order.status}
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  <div>KL đặt</div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{order.quantity.toLocaleString('vi-VN')}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  <div>Giá đặt</div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{order.price.toLocaleString('vi-VN')}</div>
                </div>
                
                <div style={{ borderTop: '1px dashed var(--border-color)', margin: '12px 0' }}></div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
                  <div>KL/Giá khớp</div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                    {order.status === 'Khớp hết' ? `${order.quantity.toLocaleString('vi-VN')} / ${order.filled_price?.toLocaleString('vi-VN')}` : '- / -'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </>
  );
}
