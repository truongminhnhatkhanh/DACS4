import React, { useState } from 'react';
import { X, Lock, User, Sparkles, AlertCircle, Shield, ArrowRight, Key } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthModal() {
  const {
    showAuthModal,
    setShowAuthModal,
    authModalMode,
    setAuthModalMode,
    login,
    register,
    openRecoverAccountModal
  } = useAuth();

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [anonymousName, setAnonymousName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!showAuthModal) return null;

  const handleClose = () => {
    setShowAuthModal(false);
    setError('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setAnonymousName('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    setError('');
    setLoading(true);
    const res = await login(username.trim(), password);
    setLoading(false);

    if (res.success) {
      handleClose();
    } else {
      setError(res.error || 'Đăng nhập không thành công.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có độ dài tối thiểu 6 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }

    setError('');
    setLoading(true);
    const res = await register(username.trim(), password, anonymousName.trim());
    setLoading(false);

    if (res.success) {
      handleClose();
    } else {
      setError(res.error || 'Đăng ký không thành công.');
    }
  };

  const handleFillDemoAdmin = () => {
    setUsername('admin');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-ink/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-hairline rounded-card max-w-md w-full p-5 sm:p-7 shadow-subtle relative max-h-[90vh] overflow-y-auto">
        {/* Nút đóng */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-graphite hover:text-forest-ink p-1.5 rounded-pill hover:bg-paper transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Logo */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-mint-mist border border-emerald-pulse/30 flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-pine" />
          </div>
          <h2 className="text-xl font-bold text-forest-ink font-display tracking-tight">
            {authModalMode === 'login' ? 'Đăng Nhập Tài Khoản' : 'Đăng Ký Tài Khoản Mới'}
          </h2>
          <p className="text-xs text-graphite mt-1">
            {authModalMode === 'login'
              ? 'Đăng nhập để xem lại bài viết và trò chuyện an toàn'
              : 'Tạo tài khoản cá nhân, lưu giữ bài viết trên mọi thiết bị'}
          </p>
        </div>

        {/* Tab chuyển đổi Đăng nhập / Đăng ký */}
        <div className="flex bg-paper p-1 rounded-pill mb-5 border border-hairline">
          <button
            type="button"
            onClick={() => { setAuthModalMode('login'); setError(''); }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-pill transition-all ${
              authModalMode === 'login'
                ? 'bg-white text-forest-ink shadow-subtle'
                : 'text-graphite hover:text-forest-ink'
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => { setAuthModalMode('register'); setError(''); }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-pill transition-all ${
              authModalMode === 'register'
                ? 'bg-white text-forest-ink shadow-subtle'
                : 'text-graphite hover:text-forest-ink'
            }`}
          >
            Đăng ký
          </button>
        </div>

        {/* Thông báo lỗi */}
        {error && (
          <div className="mb-4 bg-red-50 border border-signal-red/20 rounded-xl p-3 text-xs text-signal-red flex items-center space-x-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-signal-red" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Đăng nhập */}
        {authModalMode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-forest-ink mb-1.5">
                Tên đăng nhập
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nhập tên đăng nhập"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-pill bg-emerald-pulse hover:bg-pine text-white text-xs font-medium transition-all shadow-subtle disabled:opacity-50 flex items-center justify-center space-x-1.5 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <span>Đăng nhập</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            {/* Tiện ích đăng nhập nhanh Admin */}
            <div className="pt-2 flex flex-col space-y-2">
              <button
                type="button"
                onClick={handleFillDemoAdmin}
                className="w-full py-2 rounded-pill bg-paper hover:bg-gray-100 text-graphite hover:text-forest-ink border border-hairline text-[11px] font-medium transition-colors"
              >
                Tài khoản Demo Admin (admin / admin123)
              </button>
            </div>
          </form>
        ) : (
          /* Form Đăng ký */
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-forest-ink mb-1">
                Tên đăng nhập <span className="text-signal-red">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="VD: minh_duc, hoangyen99"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-paper border border-hairline rounded-pill pl-9 pr-4 py-2 text-xs text-forest-ink placeholder:text-graphite focus:outline-none focus:border-jade-wash focus:bg-white transition-all"
                />
                <User className="w-4 h-4 text-graphite absolute left-3 top-2.5" />
              </div>
              <span className="text-[10px] text-graphite mt-0.5 block">
                3-30 ký tự, dùng để đăng nhập vào tài khoản.
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-forest-ink mb-1">
                Bút danh hiển thị ẩn danh (Tùy chọn)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="VD: Ánh Trăng, Người Qua Đường..."
                  value={anonymousName}
                  onChange={(e) => setAnonymousName(e.target.value)}
                  className="w-full bg-paper border border-hairline rounded-pill pl-9 pr-4 py-2 text-xs text-forest-ink placeholder:text-graphite focus:outline-none focus:border-jade-wash focus:bg-white transition-all"
                />
                <Sparkles className="w-4 h-4 text-emerald-pulse absolute left-3 top-2.5" />
              </div>
              <span className="text-[10px] text-graphite mt-0.5 block">
                Tên hiển thị công khai trên Bảng tin & Chat P2P (để trống AI sẽ tự đặt).
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-forest-ink mb-1">
                Mật khẩu <span className="text-signal-red">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Tối thiểu 6 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-paper border border-hairline rounded-pill pl-9 pr-4 py-2 text-xs text-forest-ink placeholder:text-graphite focus:outline-none focus:border-jade-wash focus:bg-white transition-all"
                />
                <Lock className="w-4 h-4 text-graphite absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-forest-ink mb-1">
                Xác nhận mật khẩu <span className="text-signal-red">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-paper border border-hairline rounded-pill pl-9 pr-4 py-2 text-xs text-forest-ink placeholder:text-graphite focus:outline-none focus:border-jade-wash focus:bg-white transition-all"
                />
                <Lock className="w-4 h-4 text-graphite absolute left-3 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-pill bg-emerald-pulse hover:bg-pine text-white text-xs font-medium transition-all shadow-subtle disabled:opacity-50 flex items-center justify-center space-x-1.5 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang khởi tạo tài khoản...</span>
                </>
              ) : (
                <>
                  <span>Hoàn tất Đăng ký</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Nút khôi phục tài khoản bằng mã & Trải nghiệm khách */}
        <div className="mt-4 pt-3 border-t border-hairline flex flex-col space-y-2 text-center">
          <button
            type="button"
            onClick={() => {
              handleClose();
              openRecoverAccountModal();
            }}
            className="text-[11px] text-graphite hover:text-pine transition-colors flex items-center justify-center space-x-1"
          >
            <Key className="w-3 h-3 text-pine" />
            <span>Bạn có mã khôi phục? <strong>Khôi phục tài khoản</strong></span>
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="text-[11px] text-graphite hover:text-forest-ink transition-colors"
          >
            Hoặc tiếp tục trải nghiệm với tư cách <strong className="text-pine font-medium">Khách ẩn danh</strong>
          </button>
        </div>
      </div>
    </div>
  );
}
