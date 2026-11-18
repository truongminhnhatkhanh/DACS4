import React, { useState } from 'react';
import { ShieldCheck, Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AdminLoginPage({ onLoginSuccess }) {
  const { adminLogin } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    setError('');
    setLoading(true);
    const res = await adminLogin(username, password);
    setLoading(false);

    if (res.success) {
      if (onLoginSuccess) onLoginSuccess();
    } else {
      setError(res.error || 'Đăng nhập quản trị thất bại.');
    }
  };

  const handleFillDemo = () => {
    setUsername('admin');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white border border-hairline rounded-card p-8 shadow-subtle">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-mint-mist border border-emerald-pulse/30 text-pine mx-auto flex items-center justify-center mb-3">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-forest-ink font-display">Quản trị viên Hệ thống</h2>
          <p className="text-xs text-graphite mt-1">Đăng nhập để quản lý bài viết và theo dõi nhật ký an toàn</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-signal-red/20 rounded-xl p-3 text-xs text-signal-red flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-signal-red" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-forest-ink mb-1.5">
              Tên đăng nhập
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-paper border border-hairline rounded-pill pl-9 pr-4 py-2.5 text-xs text-forest-ink placeholder:text-graphite focus:outline-none focus:border-jade-wash focus:bg-white transition-all"
              />
              <User className="w-4 h-4 text-graphite absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-forest-ink mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-paper border border-hairline rounded-pill pl-9 pr-4 py-2.5 text-xs text-forest-ink placeholder:text-graphite focus:outline-none focus:border-jade-wash focus:bg-white transition-all"
              />
              <Lock className="w-4 h-4 text-graphite absolute left-3 top-3" />
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-pill bg-emerald-pulse hover:bg-pine text-white text-xs font-medium transition-all shadow-subtle disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Đang xác thực...' : 'Đăng nhập Quản trị'}
            </button>

            <button
              type="button"
              onClick={handleFillDemo}
              className="w-full py-2 rounded-pill bg-paper hover:bg-gray-100 text-graphite hover:text-forest-ink text-[11px] font-medium border border-hairline transition-colors cursor-pointer"
            >
              Điền tài khoản mặc định (admin / admin123)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
