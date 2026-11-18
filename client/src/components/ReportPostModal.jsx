import React, { useState } from 'react';
import { ShieldAlert, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import axiosClient from '../api/axiosClient';

const REPORT_REASONS = [
  'Ngôn từ xúc phạm, thù ghét hoặc bắt nạt',
  'Lừa đảo, bẫy việc làm hoặc yêu cầu tiền bạc',
  'Dấu hiệu tự hại, tự tử hoặc bạo lực nguy hiểm',
  'Nội dung quấy rối tình dục hoặc đồi trụy',
  'Tiết lộ thông tin định danh cá nhân nhạy cảm',
  'Spam hoặc nội dung quảng cáo phiền toái',
  'Lý do khác'
];

export default function ReportPostModal({ isOpen, postId, onClose }) {
  if (!isOpen || !postId) return null;

  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axiosClient.post(`/posts/${postId}/report`, {
        reason: selectedReason,
        details: details.trim() || undefined
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setDetails('');
        setSelectedReason(REPORT_REASONS[0]);
        onClose();
      }, 1800);
    } catch (err) {
      setError(err.message || 'Không thể gửi báo cáo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-ink/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-hairline rounded-card max-w-lg w-full p-6 sm:p-7 shadow-subtle relative">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-signal-red" />
            </div>
            <div>
              <h3 className="text-base font-bold text-forest-ink font-display">Báo cáo Vi phạm Bài viết</h3>
              <p className="text-xs text-graphite">Giúp duy trì cộng đồng an toàn và văn minh</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-graphite hover:text-forest-ink p-1.5 rounded-pill hover:bg-paper transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-signal-red/20 rounded-xl p-3 text-xs text-signal-red flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="py-8 text-center animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-mint-mist border border-emerald-pulse/30 flex items-center justify-center mx-auto mb-3 text-pine">
              <CheckCircle2 className="w-6 h-6 text-emerald-pulse" />
            </div>
            <h4 className="text-sm font-bold text-forest-ink">Cảm ơn bạn đã báo cáo!</h4>
            <p className="text-xs text-graphite mt-1 max-w-xs mx-auto">
              Ban quản trị sẽ xem xét bài viết này và xử lý theo quy chuẩn an toàn cộng đồng.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-forest-ink mb-2">
                Lý do báo cáo vi phạm
              </label>
              <div className="space-y-1.5">
                {REPORT_REASONS.map((r) => (
                  <label
                    key={r}
                    className={`flex items-center space-x-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                      selectedReason === r
                        ? 'bg-red-50/50 border-red-300 text-forest-ink font-medium'
                        : 'bg-paper border-hairline text-graphite hover:bg-white hover:text-forest-ink'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={r}
                      checked={selectedReason === r}
                      onChange={() => setSelectedReason(r)}
                      className="text-signal-red focus:ring-signal-red h-3.5 w-3.5"
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-forest-ink mb-1.5">
                Mô tả chi tiết (Tùy chọn)
              </label>
              <textarea
                rows={3}
                placeholder="Cung cấp thêm thông tin về hành vi vi phạm..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full bg-paper border border-hairline rounded-xl p-3 text-xs text-forest-ink placeholder:text-graphite focus:outline-none focus:border-signal-red focus:bg-white transition-all resize-none"
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-pill border border-hairline text-graphite hover:text-forest-ink hover:bg-paper text-xs font-medium transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-pill bg-signal-red hover:bg-red-700 text-white text-xs font-medium transition-all shadow-subtle disabled:opacity-50 flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                {loading ? 'Đang gửi...' : 'Gửi báo cáo'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
