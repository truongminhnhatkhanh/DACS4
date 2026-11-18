import React, { useState } from 'react';
import { Feather, X, Sparkles, AlertCircle, CheckCircle2, Lock, Globe, Image as ImageIcon, Trash2 } from 'lucide-react';
import axiosClient from '../api/axiosClient';

const MOOD_TAGS = ['Buồn bã', 'Cô đơn', 'Áp lực', 'Tuyệt vọng', 'Lạc lối', 'Hy vọng', 'Biết ơn'];

const PRESET_ILLUSTRATIONS = [
  { name: 'Bàn học đêm', url: '/images/posts/study_desk.svg' },
  { name: 'Mưa đêm', url: '/images/posts/rain_night.svg' },
  { name: 'Hoàng hôn', url: '/images/posts/sunset_bridge.svg' },
  { name: 'Hướng dương', url: '/images/posts/sunflower.svg' },
  { name: 'Tách cà phê', url: '/images/posts/coffee_quiet.svg' },
  { name: 'Góc phòng ấm', url: '/images/posts/cozy_room.svg' },
  { name: 'Bầu trời sao', url: '/images/posts/starry_sky.svg' },
];

export default function CreatePostModal({ isOpen, onClose, onPostCreated }) {
  const [content, setContent] = useState('');
  const [moodTag, setMoodTag] = useState('Buồn bã');
  const [imageUrl, setImageUrl] = useState('');
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [comfortFeedback, setComfortFeedback] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Vui lòng nhập nội dung tâm sự.');
      return;
    }

    setError('');
    setLoading(true);
    setComfortFeedback(null);

    try {
      const res = await axiosClient.post('/posts', {
        content: content.trim(),
        moodTag,
        imageUrl: imageUrl.trim() || null,
        isPrivate
      });

      if (res.comfortMessage) {
        setComfortFeedback(res.comfortMessage);
      }

      setTimeout(() => {
        setContent('');
        setMoodTag('Buồn bã');
        setImageUrl('');
        setShowImagePicker(false);
        setIsPrivate(false);
        setComfortFeedback(null);
        onClose();
        if (onPostCreated) onPostCreated();
      }, 1600);
    } catch (err) {
      setError(err.message || 'Không thể đăng bài viết.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-ink/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-hairline rounded-card max-w-xl w-full p-5 sm:p-7 shadow-subtle relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-mint-mist border border-emerald-pulse/30 flex items-center justify-center">
              <Feather className="w-5 h-5 text-pine" />
            </div>
            <div>
              <h3 className="text-base font-bold text-forest-ink font-display">Chia sẻ Tâm sự Ẩn danh</h3>
              <p className="text-xs text-graphite">Được bảo vệ riêng tư & AI đồng cảm</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-graphite hover:text-forest-ink p-1.5 rounded-pill hover:bg-paper transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-signal-red/20 rounded-xl p-3.5 text-xs text-signal-red flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-signal-red mt-0.5" />
            <div>
              <p className="font-semibold text-signal-red">Bài viết bị từ chối phê duyệt:</p>
              <p className="mt-0.5 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {comfortFeedback && (
          <div className="mb-4 bg-mint-mist/70 border border-emerald-pulse/30 rounded-xl p-3.5 text-xs text-pine flex items-start space-x-2.5 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-pine mt-0.5" />
            <div>
              <p className="font-bold text-pine flex items-center space-x-1">
                <span>Heli AI Buddy:</span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-pulse" />
              </p>
              <p className="mt-1 italic leading-relaxed text-forest-ink">{comfortFeedback}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Chọn nhãn cảm xúc */}
          <div>
            <label className="block text-xs font-medium text-forest-ink mb-2">
              Bạn đang cảm thấy thế nào?
            </label>
            <div className="flex flex-wrap gap-2">
              {MOOD_TAGS.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => setMoodTag(tag)}
                  className={`px-3.5 py-1.5 rounded-pill text-xs font-medium transition-all ${
                    moodTag === tag
                      ? 'bg-emerald-pulse text-white shadow-subtle border border-emerald-pulse'
                      : 'bg-paper text-graphite hover:text-forest-ink border border-hairline hover:bg-white'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Ô nhập nội dung */}
          <div>
            <label className="block text-xs font-medium text-forest-ink mb-1.5">
              Nội dung tâm sự
            </label>
            <textarea
              rows={5}
              placeholder="Chia sẻ những điều đang đè nặng trong lòng bạn... Không ai biết bạn là ai, hãy thoải mái giãi bày."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-paper border border-hairline rounded-xl p-3.5 text-sm text-forest-ink placeholder:text-graphite focus:outline-none focus:border-jade-wash focus:bg-white transition-all resize-none"
            />
            <div className="flex justify-between items-center text-[11px] text-graphite mt-1.5">
              <span>* Bài viết được kiểm duyệt tự động bởi AI để giữ an toàn cho cộng đồng.</span>
              <span>{content.length} ký tự</span>
            </div>
          </div>

          {/* Đính kèm hình ảnh minh họa */}
          <div className="bg-paper p-3 rounded-xl border border-hairline space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-medium text-forest-ink">
                <ImageIcon className="w-4 h-4 text-emerald-pulse" />
                <span>Hình ảnh minh họa cảm xúc (tùy chọn)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowImagePicker(!showImagePicker)}
                className="text-[11px] text-emerald-pulse hover:text-pine font-medium cursor-pointer"
              >
                {showImagePicker ? 'Đóng gợi ý' : (imageUrl ? 'Đổi ảnh' : '+ Chọn ảnh gợi ý')}
              </button>
            </div>

            {/* Thumbnail xem trước nếu đã chọn ảnh */}
            {imageUrl && (
              <div className="relative rounded-lg overflow-hidden border border-hairline h-28 bg-white flex items-center justify-center">
                <img src={imageUrl} alt="Minh họa" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 p-1 rounded-full bg-forest-ink/70 text-white hover:bg-signal-red transition-colors cursor-pointer"
                  title="Gỡ ảnh"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Bảng chọn hình ảnh gợi ý */}
            {showImagePicker && (
              <div className="pt-2 border-t border-hairline/60">
                <p className="text-[11px] text-graphite mb-2">Chọn tranh minh họa phù hợp với tâm trạng:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_ILLUSTRATIONS.map((item) => (
                    <button
                      type="button"
                      key={item.url}
                      onClick={() => {
                        setImageUrl(item.url);
                        setShowImagePicker(false);
                      }}
                      className={`group relative rounded-lg overflow-hidden border text-left transition-all p-1 cursor-pointer ${
                        imageUrl === item.url
                          ? 'border-emerald-pulse ring-2 ring-emerald-pulse/30 bg-mint-mist'
                          : 'border-hairline hover:border-graphite bg-white'
                      }`}
                    >
                      <div className="h-12 w-full rounded overflow-hidden bg-gray-100">
                        <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <p className="text-[10px] font-medium text-forest-ink truncate mt-1 text-center">{item.name}</p>
                    </button>
                  ))}
                </div>
                <div className="mt-2.5">
                  <input
                    type="url"
                    placeholder="Hoặc dán URL hình ảnh từ internet (https://...)"
                    value={imageUrl.startsWith('http') ? imageUrl : ''}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-white border border-hairline rounded-lg px-2.5 py-1.5 text-xs text-forest-ink placeholder:text-graphite focus:outline-none focus:border-jade-wash"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Chế độ hiển thị: Công khai vs Chỉ mình tôi */}
          <div className="p-3 bg-paper rounded-xl border border-hairline flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              {isPrivate ? (
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-lg bg-mint-mist text-pine flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-forest-ink">
                  {isPrivate ? 'Chỉ mình tôi (Nhật ký riêng tư)' : 'Công khai trên bảng tin cộng đồng'}
                </p>
                <p className="text-[11px] text-graphite">
                  {isPrivate ? 'Bài viết chỉ lưu trong tài khoản của bạn, không ai khác nhìn thấy' : 'Mọi người trong cộng đồng có thể đọc và đồng cảm'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsPrivate(!isPrivate)}
              className={`px-3 py-1 rounded-pill text-xs font-medium border transition-colors cursor-pointer ${
                isPrivate
                  ? 'bg-amber-500 text-white border-amber-600'
                  : 'bg-white text-forest-ink border-hairline hover:bg-paper'
              }`}
            >
              {isPrivate ? 'Riêng tư' : 'Công khai'}
            </button>
          </div>

          {/* Nút hành động */}
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-pill border border-hairline text-graphite hover:text-forest-ink hover:bg-paper text-xs font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || !!comfortFeedback}
              className="flex-1 py-2.5 rounded-pill bg-emerald-pulse hover:bg-pine text-white text-xs font-medium transition-all shadow-subtle disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>AI đang kiểm duyệt...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isPrivate ? 'Lưu nhật ký riêng tư' : 'Chia sẻ tâm sự'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
