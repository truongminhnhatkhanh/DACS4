import React, { useState } from 'react';
import { Key, X, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function RecoverAccountModal({ isOpen, onClose }) {
  const { recoverAccount } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    setCode('');
    setError('');
    setSuccessMsg('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Vui lòng nhập mã khôi phục.');
      return;
    }

    setError('');
    setLoading(true);
    const res = await recoverAccount(code.trim());
    setLoading(false);

    if (res.success) {
      setSuccessMsg(`Khôi phục thành công! Chào mừng trở lại, ${res.user.anonymousName}.`);
      setTimeout(() => {
        handleClose();
      }, 1500);
    } else {
      setError(res.error || 'Mã khôi phục không hợp lệ hoặc đã bị khóa.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-ink/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-hairline rounded-card max-w-md w-full p-6 sm:p-7 shadow-subtle relative">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-graphite hover:text-forest-ink p-1.5 rounded-pill hover:bg-paper transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-mint-mist border border-emerald-pulse/30 flex items-center justify-center mx-auto mb-3">
            <Key className="w-6 h-6 text-pine" />
          </div>
          <h2 className="text-lg font-bold text-forest-ink font-display">
            Khôi Phục Tài Khoản Ẩn Danh
          </h2>
          <p className="text-xs text-graphite mt-1">
            Nhập mã khôi phục 16 ký tự mà bạn đã lưu trước đây để lấy lại toàn bộ bài viết tâm sự.
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-signal-red/20 rounded-xl p-3 text-xs text-signal-red flex items-center space-x-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-signal-red" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 bg-mint-mist border border-emerald-pulse/30 rounded-xl p-3 text-xs text-pine flex items-center space-x-2 animate-fade-in">
            <ShieldCheck className="w-4 h-4 shrink-0 text-pine" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-forest-ink mb-1.5">
              Mã khôi phục (Recovery Code)
            </label>
            <input
              type="text"
              placeholder="VD: ZAWL-KAZW-LDZT-MWMW"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full bg-paper border border-hairline rounded-pill px-4 py-2.5 text-xs font-mono font-semibold text-forest-ink placeholder:text-graphite focus:outline-none focus:border-jade-wash focus:bg-white tracking-widest text-center transition-all uppercase"
            />
            <span className="text-[10px] text-graphite mt-1 block text-center">
              * Mã gồm 16 ký tự phân cách bởi dấu gạch ngang
            </span>
          </div>

          <button
            type="submit"
            disabled={loading || !!successMsg}
            className="w-full py-2.5 rounded-pill bg-emerald-pulse hover:bg-pine text-white text-xs font-medium transition-all shadow-subtle disabled:opacity-50 flex items-center justify-center space-x-1.5 mt-2 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang tra cứu hệ thống...</span>
              </>
            ) : (
              <>
                <span>Xác nhận khôi phục</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
