import React from 'react';
import { 
  Shield, MessageCircle, MessageSquareText, User, LogOut, LogIn, 
  UserPlus, Key, Settings, Home, SlidersHorizontal 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar({ activeTab, setActiveTab }) {
  const {
    user,
    openLoginModal,
    openRegisterModal,
    openRecoverAccountModal,
    openProfileModal,
    openRecoveryCodeModal,
    logout
  } = useAuth();

  const isGuest = !user || user.isGuest;

  return (
    <>
      {/* ========================================================================= */}
      {/* TOP DESKTOP & MOBILE HEADER */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-hairline">
        <div className="max-w-[1200px] mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
          
          {/* Logo & Wordmark (Upstash Style) */}
          <div 
            onClick={() => setActiveTab('feed')}
            className="flex items-center space-x-2 cursor-pointer group shrink-0"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-pulse flex items-center justify-center shadow-subtle group-hover:scale-105 transition-transform">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xl font-bold font-display tracking-tight text-forest-ink">heli</span>
              <span className="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 rounded-pill bg-mint-mist text-pine font-medium border border-hairline font-mono">
                p2p · ai
              </span>
            </div>
          </div>

          {/* Menu Điều hướng Desktop (Upstash Pill Navigation - Ẩn trên Mobile) */}
          <nav className="hidden md:flex items-center space-x-1 sm:space-x-1.5">
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-pill text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'feed'
                  ? 'bg-paper text-forest-ink font-semibold'
                  : 'text-graphite hover:text-forest-ink hover:bg-paper/60'
              }`}
            >
              <MessageSquareText className="w-3.5 h-3.5" />
              <span>Bảng tin</span>
            </button>

            <button
              onClick={() => setActiveTab('my-posts')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-pill text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'my-posts'
                  ? 'bg-paper text-forest-ink font-semibold'
                  : 'text-graphite hover:text-forest-ink hover:bg-paper/60'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Bài viết của tôi</span>
            </button>

            <button
              onClick={() => setActiveTab('p2p-chat')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-pill text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'p2p-chat'
                  ? 'bg-mint-mist text-pine font-semibold border border-jade-wash/30'
                  : 'text-graphite hover:text-forest-ink hover:bg-paper/60'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-pulse" />
              <span>Chat P2P</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-pill text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-paper text-forest-ink font-semibold'
                  : 'text-graphite hover:text-forest-ink hover:bg-paper/60'
              }`}
            >
              <span>Quản trị</span>
            </button>
          </nav>

          {/* Thông tin User & Nút Đăng nhập / Đăng ký (Co giãn responsive) */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {user && (
              <button
                onClick={openProfileModal}
                title="Nhấn để xem và chỉnh sửa hồ sơ cá nhân"
                className="flex items-center space-x-1.5 bg-paper hover:bg-gray-100 border border-hairline px-2 sm:px-3 py-1.5 rounded-pill text-xs transition-colors cursor-pointer max-w-[130px] sm:max-w-[180px] md:max-w-[220px]"
              >
                <span className="w-5 h-5 flex items-center justify-center overflow-hidden rounded-full shrink-0">
                  {user.avatarUrl && (user.avatarUrl.startsWith('/') || user.avatarUrl.startsWith('http')) ? (
                    <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm">{user.avatarUrl || '🍃'}</span>
                  )}
                </span>
                
                <div className="min-w-0 flex items-center space-x-1 truncate">
                  <span className="font-semibold text-forest-ink truncate text-xs">
                    {user.username || user.anonymousName}
                  </span>
                  {user.role === 'admin' && (
                    <span className="shrink-0 bg-lilac-whisper text-forest-ink px-1.5 py-0.2 rounded-pill text-[9px] font-semibold border border-hairline">
                      Admin
                    </span>
                  )}
                </div>
              </button>
            )}

            {/* Nếu là khách: Hiển thị Lưu mã, Đăng nhập & Đăng ký */}
            {isGuest ? (
              <div className="flex items-center space-x-1 sm:space-x-1.5">
                <button
                  onClick={openRecoveryCodeModal}
                  className="p-1.5 text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-pill border border-amber-200 transition-colors shadow-subtle cursor-pointer"
                  title="Xem mã khôi phục tài khoản của bạn"
                >
                  <Key className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={openRecoverAccountModal}
                  className="hidden lg:flex items-center space-x-1 px-3 py-1.5 text-[11px] text-graphite hover:text-forest-ink bg-paper rounded-pill border border-hairline transition-colors"
                  title="Khôi phục tài khoản đã có"
                >
                  <span>Khôi phục</span>
                </button>

                <button
                  onClick={openLoginModal}
                  className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-forest-ink bg-white hover:bg-paper rounded-pill border border-hairline transition-colors shadow-subtle cursor-pointer"
                  title="Đăng nhập tài khoản"
                >
                  <LogIn className="w-3.5 h-3.5 text-graphite" />
                  <span>Đăng nhập</span>
                </button>

                <button
                  onClick={openRegisterModal}
                  className="flex items-center space-x-1 px-3 sm:px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-pulse hover:bg-pine rounded-pill transition-colors shadow-subtle cursor-pointer"
                  title="Đăng ký tài khoản mới"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Đăng ký</span>
                </button>
              </div>
            ) : (
              /* Nếu đã đăng nhập: Nút Hồ sơ & Đăng xuất */
              <div className="flex items-center space-x-1 sm:space-x-1.5">
                <button
                  onClick={openProfileModal}
                  title="Cài đặt hồ sơ & Đổi mật khẩu"
                  className="p-2 text-graphite hover:text-forest-ink bg-paper hover:bg-gray-100 rounded-pill border border-hairline transition-colors cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={logout}
                  title="Đăng xuất tài khoản"
                  className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-graphite hover:text-signal-red bg-paper hover:bg-red-50 rounded-pill border border-hairline transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MOBILE BOTTOM NAVIGATION BAR (HIỂN THỊ TRÊN MÀN HÌNH NHỎ < 768PX) */}
      {/* ========================================================================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-hairline py-1.5 px-3 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-medium transition-colors cursor-pointer ${
            activeTab === 'feed'
              ? 'text-emerald-pulse font-bold'
              : 'text-graphite hover:text-forest-ink'
          }`}
        >
          <MessageSquareText className="w-5 h-5 mb-0.5" />
          <span>Bảng tin</span>
        </button>

        <button
          onClick={() => setActiveTab('my-posts')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-medium transition-colors cursor-pointer ${
            activeTab === 'my-posts'
              ? 'text-emerald-pulse font-bold'
              : 'text-graphite hover:text-forest-ink'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span>Của tôi</span>
        </button>

        <button
          onClick={() => setActiveTab('p2p-chat')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-[10px] font-bold transition-all cursor-pointer relative ${
            activeTab === 'p2p-chat'
              ? 'text-pine bg-mint-mist border border-emerald-pulse/30'
              : 'text-emerald-pulse hover:text-pine'
          }`}
        >
          <div className="relative">
            <MessageCircle className="w-5 h-5 mb-0.5" />
            <span className="w-2 h-2 rounded-full bg-emerald-pulse absolute -top-0.5 -right-0.5 animate-pulse" />
          </div>
          <span>Chat P2P</span>
        </button>

        <button
          onClick={() => setActiveTab('admin')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-medium transition-colors cursor-pointer ${
            activeTab === 'admin'
              ? 'text-emerald-pulse font-bold'
              : 'text-graphite hover:text-forest-ink'
          }`}
        >
          <SlidersHorizontal className="w-5 h-5 mb-0.5" />
          <span>Quản trị</span>
        </button>
      </nav>
    </>
  );
}
