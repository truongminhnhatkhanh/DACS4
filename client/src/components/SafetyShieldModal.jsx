import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, X, PhoneCall, LogOut } from 'lucide-react';

export default function SafetyShieldModal({ isOpen, onClose, analysis, onDisconnectPeer }) {
  if (!isOpen || !analysis) return null;

  const isDanger = analysis.risk_level === 'DANGER';
  const isWarning = analysis.risk_level === 'WARNING';
  const isSafe = analysis.risk_level === 'SAFE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-ink/40 backdrop-blur-sm animate-fade-in">
      <div className={`bg-white border rounded-card max-w-lg w-full p-5 sm:p-7 shadow-subtle relative max-h-[90vh] overflow-y-auto ${
        isDanger ? 'border-signal-red/40' : isWarning ? 'border-amber-300' : 'border-hairline'
      }`}>
        {/* Header modal */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
              isDanger
                ? 'bg-red-50 border-signal-red/30 text-signal-red'
                : isWarning
                ? 'bg-amber-50 border-amber-200 text-amber-600'
                : 'bg-mint-mist border-emerald-pulse/30 text-pine'
            }`}>
              {isDanger ? <ShieldAlert className="w-6 h-6" /> : isWarning ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-forest-ink font-display">Kết quả Phân tích An toàn</h3>
                <span className={`px-2.5 py-0.5 rounded-pill text-[11px] font-semibold border ${
                  isDanger
                    ? 'bg-red-50 text-signal-red border-signal-red/30'
                    : isWarning
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-mint-mist text-pine border-emerald-pulse/30'
                }`}>
                  {isDanger ? 'MỨC ĐỘ NGUY HIỂM' : isWarning ? 'CẢNH BÁO RỦI RO' : 'AN TOÀN'}
                </span>
              </div>
              <p className="text-xs text-graphite mt-0.5">Trợ lý AI On-Demand Safety Shield</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-graphite hover:text-forest-ink p-1.5 rounded-pill hover:bg-paper transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cảnh báo khẩn cấp */}
        {analysis.emergency_alert && (
          <div className="mb-4 bg-red-50 border border-signal-red/30 rounded-xl p-3.5 text-xs text-signal-red flex items-start space-x-2.5">
            <ShieldAlert className="w-5 h-5 text-signal-red shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-signal-red uppercase tracking-wide">Cảnh báo khẩn cấp:</p>
              <p className="mt-0.5 leading-relaxed">
                Hội thoại có dấu hiệu đặc trưng của bẫy lừa đảo việc làm xuyên biên giới hoặc buôn người. Hãy bảo vệ bản thân ngay lập tức!
              </p>
            </div>
          </div>
        )}

        {/* Danh sách dấu hiệu nhận diện được */}
        <div className="space-y-3 mb-4">
          <div className="bg-paper border border-hairline rounded-xl p-3.5">
            <h4 className="text-xs font-semibold text-forest-ink mb-2">Các dấu hiệu rủi ro ghi nhận:</h4>
            <ul className="space-y-1.5 text-xs text-graphite">
              {analysis.flagged_issues && analysis.flagged_issues.length > 0 ? (
                analysis.flagged_issues.map((issue, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-emerald-pulse mt-0.5">•</span>
                    <span className="text-forest-ink">{issue}</span>
                  </li>
                ))
              ) : (
                <li className="text-graphite italic">Không phát hiện dấu hiệu bất thường.</li>
              )}
            </ul>
          </div>

          {/* Lời khuyên của chuyên gia */}
          <div className="bg-mint-mist/40 border border-emerald-pulse/20 rounded-xl p-3.5">
            <h4 className="text-xs font-semibold text-pine mb-1.5">Lời khuyên của Trợ lý AI:</h4>
            <p className="text-xs text-forest-ink leading-relaxed whitespace-pre-line">
              {analysis.advice}
            </p>
          </div>
        </div>

        {/* Thông tin đường dây nóng hỗ trợ */}
        <div className="bg-paper border border-hairline rounded-xl p-3.5 mb-5 text-[11px] text-forest-ink">
          <div className="flex items-center space-x-1.5 font-semibold text-forest-ink mb-1.5">
            <PhoneCall className="w-3.5 h-3.5 text-pine" />
            <span>Đường dây nóng khẩn cấp miễn phí:</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-graphite">
            <span>• Tổng đài Phòng chống Mua bán người: <strong className="text-pine font-semibold">111</strong></span>
            <span>• Cảnh sát khẩn cấp: <strong className="text-pine font-semibold">113</strong></span>
            <span>• Hỗ trợ tâm lý khủng hoảng: <strong className="text-pine font-semibold">1900 6233</strong></span>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex space-x-3">
          {isDanger && onDisconnectPeer && (
            <button
              onClick={() => {
                onDisconnectPeer();
                onClose();
              }}
              className="flex-1 py-2.5 rounded-pill bg-signal-red hover:bg-red-700 text-white text-xs font-medium flex items-center justify-center space-x-1.5 shadow-subtle transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Ngắt kết nối ngay</span>
            </button>
          )}
          <button
            onClick={onClose}
            className={`py-2.5 px-5 rounded-pill text-xs font-medium border border-hairline transition-colors ${
              !isDanger 
                ? 'w-full bg-paper text-forest-ink hover:bg-gray-200' 
                : 'text-graphite hover:text-forest-ink hover:bg-paper'
            }`}
          >
            Đã hiểu, đóng cảnh báo
          </button>
        </div>
      </div>
    </div>
  );
}
