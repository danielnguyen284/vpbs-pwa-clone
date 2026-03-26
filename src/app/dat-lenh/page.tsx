'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function OrderPlacementPage() {
  const [symbol, setSymbol] = useState('');
  const [side, setSide] = useState<'M' | 'B'>('M');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !price || !quantity || !orderDate) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: symbol.toUpperCase(),
          side,
          price: parseFloat(price),
          quantity: parseInt(quantity, 10),
          order_date: orderDate
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Đặt lệnh thất bại');
      }

      alert(`Đặt lệnh thành công: ${data.order.status}`);
      router.push('/so-lenh');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="header" style={{ justifyContent: 'center' }}>
        <Link href="/danh-muc" style={{ position: 'absolute', left: 16 }}>Đóng</Link>
        <div>Đặt lệnh cơ sở</div>
      </header>
      
      <main className="screen-container" style={{ padding: 16 }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          <button 
            type="button"
            className="btn-primary" 
            style={{ 
              flex: 1, 
              backgroundColor: side === 'M' ? 'var(--text-success)' : 'var(--bg-secondary)',
              color: side === 'M' ? 'white' : 'var(--text-secondary)'
            }}
            onClick={() => setSide('M')}
          >
            MUA
          </button>
          <button 
            type="button"
            className="btn-primary" 
            style={{ 
              flex: 1, 
              backgroundColor: side === 'B' ? 'var(--text-danger)' : 'var(--bg-secondary)',
              color: side === 'B' ? 'white' : 'var(--text-secondary)'
            }}
            onClick={() => setSide('B')}
          >
            BÁN
          </button>
        </div>

        <form onSubmit={handleOrder}>
          <div className="form-group">
            <label className="text-secondary" style={{ display: 'block', marginBottom: 8 }}>Mã chứng khoán</label>
            <input
              type="text"
              className="form-input"
              style={{ textTransform: 'uppercase', fontSize: 18, fontWeight: 'bold' }}
              placeholder="VD: HPG"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            />
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="text-secondary" style={{ display: 'block', marginBottom: 8 }}>Giá đặt</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                placeholder="Giá"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="text-secondary" style={{ display: 'block', marginBottom: 8 }}>Khối lượng</label>
              <input
                type="number"
                className="form-input"
                placeholder="100"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="text-secondary" style={{ display: 'block', marginBottom: 8 }}>Ngày đặt lệnh (Time-travel)</label>
            <input
              type="date"
              className="form-input"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]} // Cannot place future orders
            />
          </div>

          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: 16, borderRadius: 12, marginTop: 24, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="text-secondary">Tổng tỷ trọng VND</span>
              <span style={{ fontWeight: 'bold' }}>
                {price && quantity ? (parseFloat(price) * parseInt(quantity, 10) * 1000).toLocaleString('vi-VN') : 0}
              </span>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ 
              backgroundColor: side === 'M' ? 'var(--text-success)' : 'var(--text-danger)',
              width: '100%',
              padding: 16,
              fontSize: 18
            }}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : side === 'M' ? 'ĐẶT LỆNH MUA' : 'ĐẶT LỆNH BÁN'}
          </button>
        </form>
      </main>
    </>
  );
}
