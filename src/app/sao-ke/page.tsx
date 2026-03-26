'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface PnLItem {
  _id: string;
  symbol: string;
  sell_date: string;
  quantity: number;
  buy_price: number;
  sell_price: number;
  pnl_value: number;
  pnl_percent: number;
}

export default function RealizedPnLPage() {
  const [history, setHistory] = useState<PnLItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pnl')
      .then(res => res.json())
      .then(data => {
        if (data.history) setHistory(data.history);
        setLoading(false);
      });
  }, []);

  const formatMoney = (val: number) => val.toLocaleString('vi-VN');

  const totalPnL = history.reduce((sum, item) => sum + item.pnl_value, 0);

  return (
    <>
      <header className="header" style={{ position: 'relative' }}>
        <Link href="/danh-muc" style={{ display: 'flex', alignItems: 'center', zIndex: 10 }}>
          <span style={{ fontSize: 24, paddingBottom: 2, marginRight: 4 }}>&lsaquo;</span> Quay lại
        </Link>
        <div style={{ position: 'absolute', left: 0, right: 0, textAlign: 'center', fontWeight: 'bold' }}>Lãi / Lỗ đã thực hiện</div>
      </header>
      
      <main className="screen-container" style={{ padding: 16 }}>
        <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 12, padding: 16, marginBottom: 16, textAlign: 'center' }}>
          <div className="text-secondary" style={{ marginBottom: 4 }}>Tổng Lãi/Lỗ đã chốt</div>
          <div className={totalPnL >= 0 ? 'text-success' : 'text-danger'} style={{ fontSize: 24, fontWeight: 'bold' }}>
            {totalPnL > 0 ? '+' : ''}{formatMoney(totalPnL)}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', marginTop: 40 }}>Đang tải...</div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-secondary)' }}>
            Chưa có giao dịch chốt lời/lỗ nào.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {history.map((item) => (
              <div key={item._id} style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ fontSize: 18, fontWeight: 'bold' }}>{item.symbol}</div>
                  <div style={{ textAlign: 'right' }}>
                    <div className={item.pnl_value >= 0 ? 'text-success' : 'text-danger'} style={{ fontWeight: 'bold' }}>
                      {item.pnl_value > 0 ? '+' : ''}{formatMoney(item.pnl_value)}
                    </div>
                    <div className={item.pnl_percent >= 0 ? 'text-success' : 'text-danger'} style={{ fontSize: 12 }}>
                      {item.pnl_percent > 0 ? '+' : ''}{item.pnl_percent.toFixed(2)}%
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Khối lượng</span>
                    <span style={{ color: 'var(--text-primary)' }}>{item.quantity.toLocaleString('vi-VN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Giá mua bình quân</span>
                    <span style={{ color: 'var(--text-primary)' }}>{item.buy_price.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Giá bán bình quân</span>
                    <span style={{ color: 'var(--text-primary)' }}>{item.sell_price.toLocaleString('vi-VN')}</span>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border-color)', margin: '4px 0' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Ngày bán</span>
                    <span style={{ color: 'var(--text-primary)' }}>{new Date(item.sell_date).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
