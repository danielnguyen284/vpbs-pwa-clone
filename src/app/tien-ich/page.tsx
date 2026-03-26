'use client';

import { useState, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';
import { useRouter } from 'next/navigation';

export default function UtilitiesPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setBalance(data.user.cash_balance);
      });
  }, []);

  const handleAddFunds = async (amount: number) => {
    try {
      const res = await fetch('/api/utils/add-funds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      alert(data.message);
      setBalance(data.balance);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const handleReset = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá toàn bộ sổ lệnh, sao kê và danh mục không? Hành động này không thể hoàn tác.')) {
      return;
    }
    try {
      const res = await fetch('/api/utils/reset', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      alert(data.message);
      setBalance(data.balance);
      window.location.reload(); // Force hard reload to clear NextJS router cache & state
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <>
      <header className="header">
        <div>Tiện ích & Cài đặt</div>
      </header>
      
      <main className="screen-container" style={{ padding: 16 }}>
        <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 12, padding: 16, marginBottom: 24 }}>
          <div className="text-secondary" style={{ marginBottom: 8 }}>Số dư hiện tại</div>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>
            {balance !== null ? balance.toLocaleString('vi-VN') : '---'} VND
          </div>
        </div>

        <h3 style={{ marginBottom: 16 }}>Công cụ Developer (Nạp tiền demo)</h3>
        
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <input 
            type="number" 
            className="form-input" 
            placeholder="Nhập số tiền VND..." 
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            style={{ flex: 1 }}
          />
          <button 
            className="btn-primary" 
            style={{ width: 'auto', padding: '0 24px', marginTop: 0 }}
            onClick={() => {
              if (customAmount && Number(customAmount) > 0) {
                handleAddFunds(Number(customAmount));
                setCustomAmount('');
              }
            }}
          >
            NẠP
          </button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
          <button className="btn-primary" style={{ backgroundColor: 'var(--bg-tertiary)' }} onClick={() => handleAddFunds(10000000)}>+ 10 Triệu</button>
          <button className="btn-primary" style={{ backgroundColor: 'var(--bg-tertiary)' }} onClick={() => handleAddFunds(50000000)}>+ 50 Triệu</button>
          <button className="btn-primary" style={{ backgroundColor: 'var(--bg-tertiary)' }} onClick={() => handleAddFunds(100000000)}>+ 100 Triệu</button>
          <button className="btn-primary" style={{ backgroundColor: 'var(--bg-tertiary)' }} onClick={() => handleAddFunds(500000000)}>+ 500 Triệu</button>
        </div>

        <button 
          className="btn-primary" 
          style={{ backgroundColor: 'var(--text-danger)', marginBottom: 12 }} 
          onClick={handleReset}
        >
          Reset Dữ Liệu
        </button>

        <button 
          className="btn-primary" 
          style={{ backgroundColor: 'transparent', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)' }} 
          onClick={handleLogout}
        >
          Đăng xuất
        </button>
      </main>

      <BottomNav />
    </>
  );
}
