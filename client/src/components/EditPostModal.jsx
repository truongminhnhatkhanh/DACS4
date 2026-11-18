import React, { useState } from 'react';
import { Edit3, X, AlertCircle, Lock, Globe, Check } from 'lucide-react';
import axiosClient from '../api/axiosClient';

const MOOD_TAGS = ['Buồn bã', 'Cô đơn', 'Áp lực', 'Tuyệt vọng', 'Lạc lối', 'Hy vọng', 'Biết ơn'];

export default function EditPostModal({ isOpen, post, onClose, onPostUpdated }) {
  if (!isOpen || !post) return null;

  const [content, setContent] = useState(post.content || '');
  const [moodTag, setMoodTag] = useState(post.mood_tag || 'Buồn bã');
  const [isPrivate, setIsPrivate] = useState(Boolean(post.is_private));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Nội dung bài viết không được để trống.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await axiosClient.put(`/posts/${post.id}`, {
        content: content.trim(),
        moodTag,
        isPrivate
      });

      if (onPostUpdated) onPostUpdated(res.post);
      onClose();
    } catch (err) {
      setError(err.message || 'Không thể cập nhật bài viết.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-ink/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-hairline rounded-card max-w-xl w-full p-6 sm:p-7 shadow-subtle relative">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-mint-mist border border-emerald-pulse/30 flex items-center justify-center">
              <Edit3 className="w-5 h-5 text-pine" />
            </div>
            <div>
              <h3 className="text-base font-bold text-forest-ink font-display">Chỉnh sửa Tâm sự</h3>
              <p className="text-xs text-graphite">Cập nhật nội dung hoặc trạng thái riêng tư</p>
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
          <div className="mb-4 bg-red-50 border border-signal-red/20 rounded-xl p-3.5 text-xs text-signal-red flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-signal-red mt-0.5" />
            <div>
              <p className="font-semibold text-signal-red">Không thể lưu thay đổi:</p>
              <p className="mt-0.5 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Chọn nhãn cảm xúc */}
          <div>
            <label className="block text-xs font-medium text-forest-ink mb-2">
              Cảm xúc bài viết
            </label>
            <div className="flex flex-wrap gap-2">
              {MOOD_TAGS.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => setMoodTag(tag)}
                  className={`px-3.5 py-1.5 rounded-pill text-xs font-medium transition-all cursor-pointer ${
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
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-paper border border-hairline rounded-xl p-3.5 text-sm text-forest-ink placeholder:text-graphite focus:outline-none focus:border-jade-wash focus:bg-white transition-all resize-none"
            />
            <div className="flex justify-between items-center text-[11px] text-graphite mt-1.5">
              <span>* Nội dung thay đổi sẽ được AI kiểm tra an toàn trước khi lưu.</span>
              <span>{content.length} ký tự</span>
            </div>
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
                  {isPrivate ? 'Ẩn bài viết khỏi bảng tin của người khác' : 'Hiển thị trên bảng tin công khai'}
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
              className="flex-1 py-2.5 rounded-pill border border-hairline text-graphite hover:text-forest-ink hover:bg-paper text-xs font-medium transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-pill bg-emerald-pulse hover:bg-pine text-white text-xs font-medium transition-all shadow-subtle disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Lưu thay đổi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
