import React, { useState, useEffect } from 'react';
import { 
  User, Lock, Sparkles, X, Shield, Key, AlertCircle, 
  CheckCircle2, Trash2, Edit3, Calendar, FileText, RefreshCw 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axiosClient from '../api/axiosClient';

const PRESET_AVATARS = [
  { id: 'cat', type: 'image', val: '/images/avatars/avatar_cat.svg', label: 'Mèo cam' },
  { id: 'fox', type: 'image', val: '/images/avatars/avatar_fox.svg', label: 'Cáo nhỏ' },
  { id: 'bird', type: 'image', val: '/images/avatars/avatar_bird.svg', label: 'Chim bồ câu' },
  { id: 'moon', type: 'image', val: '/images/avatars/avatar_moon.svg', label: 'Trăng đêm' },
  { id: 'plant', type: 'image', val: '/images/avatars/avatar_plant.svg', label: 'Mầm xanh' },
  { id: 'coffee', type: 'image', val: '/images/avatars/avatar_coffee.svg', label: 'Cà phê' },
  { id: 'whale', type: 'image', val: '/images/avatars/avatar_whale.svg', label: 'Cá voi' },
  { id: 'star', type: 'image', val: '/images/avatars/avatar_star.svg', label: 'Ngôi sao' },
  { id: 'e1', type: 'emoji', val: '🍃', label: 'Lá xanh' },
  { id: 'e2', type: 'emoji', val: '🌸', label: 'Hoa anh đào' },
  { id: 'e3', type: 'emoji', val: '🌙', label: 'Trăng khuyết' },
  { id: 'e4', type: 'emoji', val: '☕', label: 'Tách trà' },
];

export default function ProfileModal({ isOpen, onClose }) {
  const { user, updateProfile, changePassword, deleteAccount, openRecoveryCodeModal, regenerateRecoveryCode } = useAuth();

  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'password' | 'security'
  const [anonymousName, setAnonymousName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user && isOpen) {
      setAnonymousName(user.anonymousName || '');
      setAvatarUrl(user.avatarUrl || '🍃');
      setBio(user.bio || '');
      setMessage({ type: '', text: '' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const res = await updateProfile({
      anonymousName: anonymousName.trim(),
      avatarUrl,
      bio: bio.trim()
    });

    setLoading(false);
    if (res.success) {
      setMessage({ type: 'success', text: 'Cập nhật hồ sơ cá nhân thành công!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } else {
      setMessage({ type: 'error', text: res.error || 'Lỗi cập nhật thông tin.' });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu mới phải có tối thiểu 6 ký tự.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu xác nhận không trùng khớp.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    const res = await changePassword(currentPassword, newPassword);
    setLoading(false);

    if (res.success) {
      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } else {
      setMessage({ type: 'error', text: res.error || 'Không thể đổi mật khẩu.' });
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('CẢNH BÁO: Bạn có chắc chắn muốn đóng và ẩn danh hóa tài khoản này? Hành động này không thể hoàn tác!')) {
      const res = await deleteAccount();
      if (res.success) {
        onClose();
      } else {
        alert(res.error || 'Lỗi khi xóa tài khoản.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-ink/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-hairline rounded-card max-w-lg w-full p-5 sm:p-7 shadow-subtle relative max-h-[90vh] overflow-y-auto">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-graphite hover:text-forest-ink p-1.5 rounded-pill hover:bg-paper transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header thông tin người dùng */}
        <div className="flex items-center space-x-3.5 pb-4 border-b border-hairline mb-5">
          <div className="w-14 h-14 rounded-2xl bg-mint-mist border border-emerald-pulse/30 flex items-center justify-center text-2xl shadow-subtle overflow-hidden">
            {avatarUrl && (avatarUrl.startsWith('/') || avatarUrl.startsWith('http')) ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{avatarUrl || '🍃'}</span>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-forest-ink font-display">
                {user.anonymousName}
              </h2>
              {user.isGuest ? (
                <span className="px-2 py-0.5 rounded-pill bg-paper text-graphite text-[10px] border border-hairline font-mono">
                  Khách ẩn danh
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-pill bg-mint-mist text-pine text-[10px] border border-emerald-pulse/30 font-medium font-mono">
                  @{user.username}
                </span>
              )}
            </div>
            <p className="text-xs text-graphite mt-0.5 flex items-center space-x-2">
              <span>Trạng thái: <strong className="text-pine font-medium">{user.status || 'ACTIVE'}</strong></span>
              <span>•</span>
              <span className="font-mono text-[11px]">Heli Mental Wellness</span>
            </p>
          </div>
        </div>

        {/* Thanh chuyển Tabs */}
        <div className="flex bg-paper p-1 rounded-pill mb-5 border border-hairline">
          <button
            type="button"
            onClick={() => { setActiveTab('info'); setMessage({ type: '', text: '' }); }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-pill transition-all ${
              activeTab === 'info' ? 'bg-white text-forest-ink shadow-subtle' : 'text-graphite hover:text-forest-ink'
            }`}
          >
            Hồ sơ cá nhân
          </button>

          {!user.isGuest && (
            <button
              type="button"
              onClick={() => { setActiveTab('password'); setMessage({ type: '', text: '' }); }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-pill transition-all ${
                activeTab === 'password' ? 'bg-white text-forest-ink shadow-subtle' : 'text-graphite hover:text-forest-ink'
              }`}
            >
              Đổi mật khẩu
            </button>
          )}

          <button
            type="button"
            onClick={() => { setActiveTab('security'); setMessage({ type: '', text: '' }); }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-pill transition-all ${
              activeTab === 'security' ? 'bg-white text-forest-ink shadow-subtle' : 'text-graphite hover:text-forest-ink'
            }`}
          >
            Bảo mật & Mã
          </button>
        </div>

        {/* Thông báo Alert */}
        {message.text && (
          <div className={`mb-4 rounded-xl p-3 text-xs flex items-center space-x-2 animate-fade-in ${
            message.type === 'success'
              ? 'bg-mint-mist border border-emerald-pulse/30 text-pine'
              : 'bg-red-50 border border-signal-red/20 text-signal-red'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-pine" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-signal-red" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Tab 1: Chỉnh sửa thông tin hồ sơ */}
        {activeTab === 'info' && (
          <form onSubmit={handleUpdateInfo} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-forest-ink mb-1.5">
                Chọn biểu tượng nhận diện (Avatar)
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_AVATARS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    title={item.label}
                    onClick={() => setAvatarUrl(item.val)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all overflow-hidden p-0.5 cursor-pointer ${
                      avatarUrl === item.val
                        ? 'bg-mint-mist border-2 border-emerald-pulse scale-110 shadow-subtle'
                        : 'bg-paper border border-hairline hover:bg-white'
                    }`}
                  >
                    {item.type === 'image' ? (
                      <img src={item.val} alt={item.label} className="w-full h-full rounded-lg object-cover" />
                    ) : (
                      <span className="text-lg">{item.val}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-forest-ink mb-1.5">
                Bút danh hiển thị ẩn danh
              </label>
              <input
                type="text"
                value={anonymousName}
                onChange={(e) => setAnonymousName(e.target.value)}
                placeholder="VD: Họa Mi Trắng, Người Qua Đường..."
                className="w-full bg-paper border border-hairline rounded-pill px-4 py-2 text-xs text-forest-ink focus:outline-none focus:border-jade-wash focus:bg-white transition-all"
              />
              <span className="text-[10px] text-graphite mt-1 block">
                Tên này được hiển thị công khai trên Bảng tin và Chat P2P để bảo vệ danh tính thật.
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-forest-ink mb-1.5">
                Đôi dòng giới thiệu / Châm ngôn (Bio)
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Chia sẻ một chút về cảm xúc hoặc điều bạn đang tìm kiếm..."
                className="w-full bg-paper border border-hairline rounded-xl p-3 text-xs text-forest-ink focus:outline-none focus:border-jade-wash focus:bg-white resize-none transition-all"
              />
              <span className="text-[10px] text-graphite block text-right">
                {bio.length}/300 ký tự
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-pill bg-emerald-pulse hover:bg-pine text-white text-xs font-medium transition-all shadow-subtle disabled:opacity-50 flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{loading ? 'Đang lưu...' : 'Lưu Thay Đổi Hồ Sơ'}</span>
            </button>
          </form>
        )}

        {/* Tab 2: Đổi mật khẩu (Người dùng đã đăng ký) */}
        {activeTab === 'password' && !user.isGuest && (
          <form onSubmit={handleChangePassword} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-forest-ink mb-1">
                Mật khẩu hiện tại
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-paper border border-hairline rounded-pill px-4 py-2 text-xs text-forest-ink focus:outline-none focus:border-jade-wash focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-forest-ink mb-1">
                Mật khẩu mới
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                className="w-full bg-paper border border-hairline rounded-pill px-4 py-2 text-xs text-forest-ink focus:outline-none focus:border-jade-wash focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-forest-ink mb-1">
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full bg-paper border border-hairline rounded-pill px-4 py-2 text-xs text-forest-ink focus:outline-none focus:border-jade-wash focus:bg-white transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !currentPassword || !newPassword}
              className="w-full py-2.5 rounded-pill bg-emerald-pulse hover:bg-pine text-white text-xs font-medium transition-all shadow-subtle disabled:opacity-50 flex items-center justify-center space-x-1.5 cursor-pointer mt-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{loading ? 'Đang cập nhật...' : 'Cập nhật Mật khẩu'}</span>
            </button>
          </form>
        )}

        {/* Tab 3: Bảo mật & Mã khôi phục */}
        {activeTab === 'security' && (
          <div className="space-y-4">
            <div className="bg-paper border border-hairline rounded-xl p-4">
              <div className="flex items-center space-x-2 text-xs font-semibold text-forest-ink mb-1">
                <Key className="w-4 h-4 text-pine" />
                <span>Mã khôi phục tài khoản</span>
              </div>
              <p className="text-xs text-graphite leading-relaxed mb-3">
                {user.isGuest
                  ? 'Bạn đang ở chế độ khách ẩn danh. Nếu chưa lưu mã khôi phục, hãy mở lại để sao chép.'
                  : 'Tài khoản của bạn đã được liên kết với tên đăng nhập và mật khẩu an toàn.'}
              </p>
              {user.isGuest && (
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => { onClose(); openRecoveryCodeModal(); }}
                    className="px-4 py-2 bg-white hover:bg-paper text-forest-ink border border-hairline rounded-pill text-xs font-medium shadow-subtle flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Key className="w-3.5 h-3.5 text-pine" />
                    <span>Xem lại Mã Khôi Phục</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm('CẢNH BÁO: Tạo mã mới sẽ vô hiệu hóa vĩnh viễn mã cũ. Bạn có chắc chắn muốn cấp lại mã khôi phục mới không?')) {
                        const res = await regenerateRecoveryCode();
                        if (res.success) {
                          onClose();
                        } else {
                          alert(res.error || 'Lỗi cấp lại mã khôi phục.');
                        }
                      }
                    }}
                    className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-pill text-xs font-medium shadow-subtle flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
                    <span>Cấp Lại Mã Mới</span>
                  </button>
                </div>
              )}
            </div>

            <div className="border-t border-hairline pt-4">
              <h4 className="text-xs font-semibold text-signal-red mb-1">
                Khu vực Nguy hiểm
              </h4>
              <p className="text-xs text-graphite mb-3">
                Đóng tài khoản và ẩn danh hóa vĩnh viễn toàn bộ hoạt động của bạn.
              </p>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-signal-red border border-signal-red/30 rounded-pill text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Đóng Tài Khoản Này</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
