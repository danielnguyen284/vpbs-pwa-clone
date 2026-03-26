'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/danh-muc';
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h2>Đăng ký Tài khoản</h2>
        <p className="text-secondary" style={{ marginTop: 8 }}>Khởi tạo danh mục giao dịch</p>
      </div>

      <form onSubmit={handleRegister}>
        <div className="form-group">
          <input
            type="text"
            className="form-input"
            placeholder="Tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            className="form-input"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-danger" style={{ marginBottom: 16 }}>{error}</p>}
        {success && <p className="text-success" style={{ marginBottom: 16 }}>Đăng ký thành công! Đang chuyển hướng...</p>}

        <button type="submit" className="btn-primary">ĐĂNG KÝ</button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <p className="text-secondary">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-success">
            Đăng nhập lại
          </Link>
        </p>
      </div>
    </div>
  );
}
