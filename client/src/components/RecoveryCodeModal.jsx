import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, X, AlertTriangle, Key } from 'lucide-react';

export default function RecoveryCodeModal({ isOpen, onClose, recoveryCode }) {
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen || !recoveryCode) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(recoveryCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-ink/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-amber-300 rounded-card max-w-md w-full p-6 sm:p-7 shadow-subtle relative overflow-hidden">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-graphite hover:text-forest-ink p-1.5 rounded-pill hover:bg-paper transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <Key className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-forest-ink font-display">
            Lưu Mã Khôi Phục Tài Khoản
          </h2>
          <p className="text-xs text-graphite mt-1 leading-relaxed">
            Bạn đang trải nghiệm dưới tư cách <strong className="text-forest-ink font-medium">Khách ẩn danh</strong>. 
            Mã này là chìa khóa duy nhất để bạn khôi phục lại bài viết khi đổi trình duyệt hoặc xóa cookie.
          </p>
        </div>

        {/* Khung hiển thị mã */}
        <div className="bg-paper border border-amber-200/80 rounded-xl p-4 mb-4 text-center">
          <span className="text-[11px] uppercase tracking-wider text-graphite font-semibold block mb-1.5">
            Mã khôi phục 16 ký tự của bạn
          </span>
          <div className="font-mono text-lg font-bold text-forest-ink tracking-wider select-all py-1.5 px-3 bg-white rounded-lg border border-hairline inline-block shadow-inner">
            {recoveryCode}
          </div>

          <div className="mt-3 flex justify-center">
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-pill bg-white hover:bg-paper text-forest-ink text-xs font-medium border border-hairline shadow-subtle flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-pulse" />
                  <span className="text-emerald-pulse font-semibold">Đã sao chép mã!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-graphite" />
                  <span>Sao chép vào bộ nhớ tạm</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Cảnh báo bảo mật */}
        <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3 text-[11px] text-amber-900 flex items-start space-x-2 mb-5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Hệ thống không lưu trữ mã này dưới dạng xem được (đã băm bảo mật SHA-256). Hãy lưu mã vào ghi chú cá nhân!
          </span>
        </div>

        {/* Checkbox xác nhận */}
        <label className="flex items-center space-x-2.5 text-xs text-forest-ink cursor-pointer mb-5 select-none">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-pulse focus:ring-emerald-pulse border-gray-300"
          />
          <span>Tôi đã sao chép và lưu giữ mã khôi phục an toàn.</span>
        </label>

        {/* Nút hoàn tất */}
        <button
          onClick={onClose}
          disabled={!confirmed}
          className="w-full py-2.5 rounded-pill bg-emerald-pulse hover:bg-pine text-white text-xs font-medium transition-all shadow-subtle disabled:opacity-40 flex items-center justify-center space-x-1.5"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Bắt đầu trải nghiệm ngay</span>
        </button>
      </div>
    </div>
  );
}
