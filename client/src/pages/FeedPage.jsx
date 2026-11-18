import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, RefreshCw, Sparkles, Check, ArrowRight, MessageCircle, 
  Search, X, ChevronLeft, ChevronRight, SlidersHorizontal 
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';

const MOOD_FILTERS = ['Tất cả', 'Buồn bã', 'Cô đơn', 'Áp lực', 'Tuyệt vọng', 'Lạc lối', 'Hy vọng', 'Biết ơn'];

export default function FeedPage({ onStartChat }) {
  const [posts, setPosts] = useState([]);
  const [selectedMood, setSelectedMood] = useState('Tất cả');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounce tìm kiếm theo từ khóa 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchKeyword);
      setPage(1); // Reset về trang 1 khi tìm kiếm mới
    }, 400);
    return () => clearTimeout(timer);
  }, [searchKeyword]);

  // Reset trang về 1 khi đổi cảm xúc
  const handleSelectMood = (mood) => {
    setSelectedMood(mood);
    setPage(1);
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/posts', {
        params: {
          moodTag: selectedMood !== 'Tất cả' ? selectedMood : undefined,
          keyword: debouncedKeyword.trim() || undefined,
          page,
          limit: 10
        }
      });
      setPosts(res.posts || []);
      setTotalPages(res.totalPages || 1);
      setTotalPosts(res.total || 0);
    } catch (err) {
      console.error('Lỗi lấy bài viết:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedMood, debouncedKeyword, page]);

  const handlePostDeleted = (deletedId) => {
    setPosts(prev => prev.filter(p => p.id !== deletedId));
    setTotalPosts(prev => Math.max(0, prev - 1));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  return (
    <div className="max-w-[1000px] mx-auto px-3 sm:px-6 py-6 sm:py-12">
      {/* Upstash Style Hero Section */}
      <section className="bg-paper border border-hairline rounded-card p-5 sm:p-10 mb-8 sm:mb-10 relative overflow-hidden shadow-subtle">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-pill bg-mint-mist border border-hairline text-pine text-xs font-mono font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-pulse"></span>
            <span>Sunlit Workshop · Safe Anonymous Social</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold font-display tracking-tight text-forest-ink leading-[1.1] mb-4">
            Trút bỏ tâm sự,{' '}
            <span className="bg-gradient-to-r from-pine via-emerald-pulse to-amber-500 bg-clip-text text-transparent">
              lắng nghe an toàn
            </span>{' '}
            cùng trợ lý AI.
          </h1>

          <p className="text-sm sm:text-base text-graphite leading-relaxed mb-6">
            Mạng xã hội tâm sự ẩn danh kết hợp chat 1-1 riêng tư qua WebRTC DataChannel. Mọi bài viết đều được AI kiểm duyệt ngôn từ độc hại và phản hồi bằng lời an ủi đồng cảm tức thì.
          </p>

          {/* Feature Check List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8 text-xs text-forest-ink font-medium">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-mint-mist flex items-center justify-center text-jade-wash">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span>100% riêng tư trong RAM, không lưu chat P2P</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-mint-mist flex items-center justify-center text-jade-wash">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span>AI kiểm duyệt nội dung toxic & empathetic comfort</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-mint-mist flex items-center justify-center text-jade-wash">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span>Tích hợp On-Demand AI Safety Shield quét lừa đảo</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-mint-mist flex items-center justify-center text-jade-wash">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span>Lưu nhật ký riêng tư (Chỉ mình tôi) hoặc chia sẻ cộng đồng</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2.5 rounded-pill bg-emerald-pulse hover:bg-pine text-white font-medium text-xs sm:text-sm shadow-subtle flex items-center space-x-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Chia sẻ tâm sự mới</span>
            </button>

            {onStartChat && (
              <button
                onClick={onStartChat}
                className="px-5 py-2.5 rounded-pill bg-white hover:bg-paper text-forest-ink font-medium text-xs sm:text-sm border border-hairline shadow-subtle flex items-center space-x-2 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-emerald-pulse" />
                <span>Phòng chat 1-1 P2P</span>
                <ArrowRight className="w-3.5 h-3.5 text-graphite" />
              </button>
            )}

            <button
              onClick={fetchPosts}
              className="p-2.5 rounded-pill bg-white hover:bg-paper text-graphite hover:text-forest-ink border border-hairline shadow-subtle transition-colors cursor-pointer"
              title="Làm mới bảng tin"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Ambient Subtle Background Wash */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-br from-mint-mist/50 to-pale-sage/30 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
      </section>

      {/* Thanh Tìm kiếm & Lọc */}
      <div className="space-y-4 mb-8">
        {/* Ô Tìm kiếm Từ khóa */}
        <div className="relative">
          <Search className="w-4 h-4 text-graphite absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm bài viết theo từ khóa (áp lực thi cử, cô đơn, gia đình...)"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-hairline rounded-pill text-xs sm:text-sm text-forest-ink placeholder:text-graphite shadow-subtle focus:outline-none focus:border-jade-wash transition-colors"
          />
          {searchKeyword && (
            <button
              onClick={() => setSearchKeyword('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-graphite hover:text-forest-ink p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Bộ lọc cảm xúc (Mood Filter Tabs) */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
          {MOOD_FILTERS.map((mood) => {
            const isActive = selectedMood === mood;
            return (
              <button
                key={mood}
                onClick={() => handleSelectMood(mood)}
                className={`px-4 py-1.5 rounded-pill text-xs font-medium shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-forest-ink text-white shadow-subtle'
                    : 'bg-white text-graphite hover:text-forest-ink hover:bg-paper border border-hairline'
                }`}
              >
                {mood}
              </button>
            );
          })}
        </div>

        {/* Thông tin số lượng bài viết tìm thấy */}
        <div className="flex items-center justify-between text-xs text-graphite px-1">
          <span>
            Hiển thị <strong>{posts.length}</strong> / <strong>{totalPosts}</strong> bài viết tâm sự
            {debouncedKeyword && ` cho từ khóa "${debouncedKeyword}"`}
            {selectedMood !== 'Tất cả' && ` [${selectedMood}]`}
          </span>
          {totalPages > 1 && (
            <span className="font-mono text-[11px]">
              Trang {page} / {totalPages}
            </span>
          )}
        </div>
      </div>

      {/* Danh sách bài viết */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white border border-hairline rounded-card p-6 shadow-subtle animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-paper" />
                <div className="space-y-1.5">
                  <div className="w-28 h-3.5 bg-paper rounded" />
                  <div className="w-16 h-2.5 bg-paper rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-full h-3 bg-paper rounded" />
                <div className="w-4/5 h-3 bg-paper rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-paper border border-dashed border-hairline rounded-card">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mx-auto mb-3 shadow-subtle text-graphite">
            <Sparkles className="w-5 h-5 text-emerald-pulse" />
          </div>
          <h3 className="text-base font-semibold text-forest-ink">Không tìm thấy bài viết phù hợp</h3>
          <p className="text-xs text-graphite mt-1">
            {debouncedKeyword
              ? 'Thử tìm với từ khóa khác hoặc xóa bộ lọc để xem tất cả bài viết.'
              : 'Hãy là người đầu tiên chia sẻ cảm xúc của mình với cộng đồng!'}
          </p>
          <div className="mt-4 flex items-center justify-center space-x-3">
            {debouncedKeyword && (
              <button
                onClick={() => { setSearchKeyword(''); setSelectedMood('Tất cả'); }}
                className="px-4 py-2 bg-white hover:bg-paper text-forest-ink border border-hairline rounded-pill text-xs font-medium shadow-subtle transition-colors cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2 bg-emerald-pulse hover:bg-pine text-white rounded-pill text-xs font-medium shadow-subtle transition-colors cursor-pointer"
            >
              Đăng bài ngay
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post}
              onPostDeleted={handlePostDeleted}
              onPostUpdated={handlePostUpdated}
            />
          ))}
        </div>
      )}

      {/* Thanh Phân trang (Pagination) */}
      {!loading && totalPages > 1 && (
        <div className="mt-8 pt-4 border-t border-hairline flex items-center justify-between">
          <button
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            disabled={page <= 1}
            className="px-4 py-2 rounded-pill bg-white hover:bg-paper text-forest-ink border border-hairline text-xs font-medium flex items-center space-x-1 disabled:opacity-40 transition-colors shadow-subtle cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Trang trước</span>
          </button>

          <div className="flex items-center space-x-1.5 font-mono text-xs">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              // Hiển thị nếu gần trang hiện tại hoặc đầu/cuối
              if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                      p === page
                        ? 'bg-emerald-pulse text-white font-bold shadow-subtle'
                        : 'bg-white hover:bg-paper text-forest-ink border border-hairline'
                    }`}
                  >
                    {p}
                  </button>
                );
              }
              if (p === 2 && page > 3) return <span key={p} className="text-graphite">...</span>;
              if (p === totalPages - 1 && page < totalPages - 2) return <span key={p} className="text-graphite">...</span>;
              return null;
            })}
          </div>

          <button
            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-pill bg-white hover:bg-paper text-forest-ink border border-hairline text-xs font-medium flex items-center space-x-1 disabled:opacity-40 transition-colors shadow-subtle cursor-pointer"
          >
            <span>Trang sau</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Modal đăng bài */}
      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPostCreated={fetchPosts}
      />
    </div>
  );
}
