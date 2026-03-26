'use client';

import { useEffect, useState } from 'react';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PortfolioItem {
  _id: string;
  symbol: string;
  avg_price: number;
  total_qty: number;
  available_qty: number;
  t0_qty: number;
  t1_qty: number;
  t2_qty: number;
  current_price: number;
  market_value: number;
  cost_value: number;
  unrealized_pnl: number;
  unrealized_pnl_percent: number;
}

export default function PortfolioPage() {
  const router = useRouter();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState<PortfolioItem | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(res => res.json()),
      fetch('/api/portfolio').then(res => res.json())
    ]).then(([userData, portfolioData]) => {
      if (userData.user) setBalance(userData.user.cash_balance);
      if (portfolioData.portfolios) setItems(portfolioData.portfolios);
      setLoading(false);
    });
  }, []);

  const totalCost = items.reduce((acc, curr) => acc + curr.cost_value, 0);
  const totalMarket = items.reduce((acc, curr) => acc + curr.market_value, 0);
  const totalPnl = totalMarket - totalCost;
  const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;
  
  const totalAssets = balance + totalMarket;

  const formatMoney = (val: number | null | undefined) => (val || 0).toLocaleString('vi-VN');

  return (
    <>
      <header className="header">
        <div>Danh mục</div>
        <Link href="/sao-ke" style={{ color: 'var(--text-success)', fontSize: 14 }}>
          Sao kê
        </Link>
      </header>
      
      <main className="screen-container" style={{ padding: 16 }}>
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: 40 }}>Đang tải...</div>
        ) : (
          <>
            {/* Summary Card */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ marginBottom: 12 }}>
                <div className="text-secondary" style={{ fontSize: 12 }}>Tổng tài sản (VND)</div>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>{formatMoney(totalAssets)}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="text-secondary">Sức mua / Tiền mặt</span>
                <span style={{ fontWeight: '500' }}>{formatMoney(balance)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="text-secondary">Giá trị vốn</span>
                <span style={{ fontWeight: '500' }}>{formatMoney(totalCost)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="text-secondary">Giá trị hiện tại</span>
                <span style={{ fontWeight: '500' }}>{formatMoney(totalMarket)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--border-color)' }}>
                <span className="text-secondary">Lãi/Lỗ tạm tính</span>
                <span className={totalPnl >= 0 ? 'text-success' : 'text-danger'} style={{ fontWeight: 'bold' }}>
                  {totalPnl > 0 ? '+' : ''}{formatMoney(totalPnl)} ({totalPnlPercent.toFixed(2)}%)
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 'bold' }}>Cổ phiếu sở hữu</h3>
            </div>

            {/* List of Holdings */}
            {items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-secondary)' }}>
                Chưa có cổ phiếu nào.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {items.map((item) => (
                  <div key={item._id} style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 12, padding: 16, cursor: 'pointer' }} onClick={() => setActiveItem(item)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ fontSize: 16, fontWeight: 'bold' }}>{item.symbol}</div>
                      <div className={item.unrealized_pnl >= 0 ? 'text-success' : 'text-danger'} style={{ fontWeight: 'bold' }}>
                        {item.unrealized_pnl > 0 ? '+' : ''}{formatMoney(item.unrealized_pnl)} đ
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
                      <div>{(item.total_qty || 0).toLocaleString('vi-VN')} CP</div>
                      <div className={item.unrealized_pnl >= 0 ? 'text-success' : 'text-danger'}>
                        {item.unrealized_pnl_percent > 0 ? '+' : ''}{item.unrealized_pnl_percent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Bottom Sheet for Chi Tiết Danh Mục */}
            {activeItem && (
              <>
                <div className="backdrop" onClick={() => setActiveItem(null)}></div>
                <div className="bottom-sheet">
                  <div className="bottom-sheet-handle"></div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 14, color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Mã chứng khoán</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{activeItem.symbol}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Tổng khối lượng CK</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{(activeItem.total_qty || 0).toLocaleString('vi-VN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Giá vốn trung bình</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{(activeItem.avg_price || 0).toLocaleString('vi-VN', { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Gốc đầu tư</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{formatMoney(activeItem.cost_value || 0)} đ</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Giá trị thị trường</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{formatMoney(activeItem.market_value || 0)} đ</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Lãi/lỗ dự kiến</span>
                      <span className={activeItem.unrealized_pnl >= 0 ? 'text-success' : 'text-danger'} style={{ fontWeight: 'bold' }}>
                        {activeItem.unrealized_pnl > 0 ? '+' : ''} {formatMoney(activeItem.unrealized_pnl)} đ ({activeItem.unrealized_pnl_percent.toFixed(2)}%)
                      </span>
                    </div>
                    
                    <div style={{ borderTop: '1px solid var(--border-color)', margin: '4px 0' }}></div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Khối lượng CK khả dụng</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{(activeItem.available_qty || 0).toLocaleString('vi-VN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>CK chờ về</span>
                      <span style={{ color: 'var(--text-primary)' }}>
                        T0: {(activeItem.t0_qty || 0).toLocaleString('vi-VN')} T1: {(activeItem.t1_qty || 0).toLocaleString('vi-VN')} T2: {(activeItem.t2_qty || 0).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>

                  <div className="action-buttons">
                    <button className="btn-buy" onClick={() => router.push(`/dat-lenh?symbol=${activeItem.symbol}&side=M`)}>Mua</button>
                    <button className="btn-sell" onClick={() => router.push(`/dat-lenh?symbol=${activeItem.symbol}&side=B`)}>Bán</button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </>
  );
}
