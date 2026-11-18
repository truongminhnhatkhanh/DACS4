import React, { useState, useEffect } from 'react';
import { User, PlusCircle, RefreshCw, Feather, Bookmark, FileText, Lock } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import { useAuth } from '../contexts/AuthContext';

export default function MyPostsPage() {
  const { user, openLoginModal } = useAuth();
  const [activeTab, setActiveTab] = useState('my-posts'); // 'my-posts' | 'saved-posts'
  const [myPosts, setMyPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [myRes, savedRes] = await Promise.all([
        axiosClient.get('/posts/me'),
        axiosClient.get('/posts/saved')
      ]);
      setMyPosts(myRes.posts || []);
      setSavedPosts(savedRes.posts || []);
    } catch (err) {
      console.error('Lỗi lấy bài viết của tôi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handlePostDeleted = (deletedId) => {
    setMyPosts(prev => prev.filter(p => p.id !== deletedId));
    setSavedPosts(prev => prev.filter(p => p.id !== deletedId));
  };

  const handlePostUpdated = (updatedPost) => {
    setMyPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
    setSavedPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  const currentList = activeTab === 'my-posts' ? myPosts : savedPosts;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header trang cá nhân ẩn danh */}
      <div className="bg-white border border-hairline rounded-card p-6 sm:p-7 mb-8 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-mint-mist border border-emerald-pulse/30 flex items-center justify-center font-display text-lg font-bold text-pine">
            {user?.avatarUrl || <User className="w-6 h-6 text-pine" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-forest-ink font-display">{user?.anonymousName}</h1>
              <span className="px-2.5 py-0.5 rounded-pill bg-paper text-graphite text-xs border border-hairline font-mono">
                {user?.isGuest ? 'Khách Ẩn Danh' : 'Tài Khoản Đã Đăng Ký'}
              </span>
            </div>
            <p className="text-xs text-graphite mt-0.5">
              Đã chia sẻ <strong className="text-pine font-medium">{myPosts.length}</strong> bài viết · Đã lưu <strong className="text-pine font-medium">{savedPosts.length}</strong> tâm sự
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 w-full sm:w-auto">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-pill bg-emerald-pulse hover:bg-pine text-white text-xs font-medium flex items-center justify-center space-x-1.5 transition-all shadow-subtle cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Viết tâm sự</span>
          </button>
          <button
            onClick={fetchAll}
            className="p-2.5 rounded-pill bg-paper hover:bg-gray-100 text-graphite hover:text-forest-ink border border-hairline transition-colors cursor-pointer"
            title="Làm mới"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs Chuyển đổi: Bài viết của tôi vs Bài viết đã lưu */}
      <div className="flex items-center space-x-3 border-b border-hairline mb-6 pb-2">
        <button
          onClick={() => setActiveTab('my-posts')}
          className={`px-4 py-2 rounded-pill text-xs font-medium flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'my-posts'
              ? 'bg-forest-ink text-white shadow-subtle'
              : 'bg-white text-graphite hover:text-forest-ink border border-hairline'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Tâm sự của tôi ({myPosts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('saved-posts')}
          className={`px-4 py-2 rounded-pill text-xs font-medium flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'saved-posts'
              ? 'bg-forest-ink text-white shadow-subtle'
              : 'bg-white text-graphite hover:text-forest-ink border border-hairline'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Đã lưu / Bookmarks ({savedPosts.length})</span>
        </button>
      </div>

      {/* Danh sách bài viết */}
      {loading ? (
        <div className="text-center py-12 text-xs text-graphite font-mono">Đang tải bài viết...</div>
      ) : currentList.length === 0 ? (
        <div className="text-center py-16 bg-paper/50 border border-hairline rounded-card">
          {activeTab === 'my-posts' ? (
            <>
              <Feather className="w-10 h-10 text-graphite/60 mx-auto mb-3" />
              <h3 className="text-base font-bold text-forest-ink font-display">Bạn chưa đăng bài viết nào</h3>
              <p className="text-xs text-graphite mt-1 max-w-sm mx-auto">
                {user?.isGuest
                  ? 'Nếu bạn đã có tài khoản, hãy đăng nhập để xem lại các bài viết của mình.'
                  : 'Hãy chia sẻ những dòng tâm sự đầu tiên với cộng đồng hoặc lưu vào nhật ký riêng tư!'}
              </p>
              <div className="mt-5 flex items-center justify-center space-x-3">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-5 py-2.5 bg-emerald-pulse hover:bg-pine text-white rounded-pill text-xs font-medium shadow-subtle transition-all cursor-pointer"
                >
                  Đăng bài viết mới
                </button>
                {user?.isGuest && (
                  <button
                    onClick={openLoginModal}
                    className="px-5 py-2.5 bg-white hover:bg-paper text-forest-ink rounded-pill text-xs font-medium border border-hairline shadow-subtle transition-all cursor-pointer"
                  >
                    Đăng nhập tài khoản
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <Bookmark className="w-10 h-10 text-graphite/60 mx-auto mb-3" />
              <h3 className="text-base font-bold text-forest-ink font-display">Chưa có bài viết nào được lưu</h3>
              <p className="text-xs text-graphite mt-1 max-w-sm mx-auto">
                Khi đọc được những dòng tâm sự truyền cảm hứng hoặc đồng cảm, bấm nút "Lưu bài" để đọc lại tại đây bất kỳ lúc nào.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {currentList.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              isMyPost={activeTab === 'my-posts'}
              onPostDeleted={handlePostDeleted}
              onPostUpdated={handlePostUpdated}
            />
          ))}
        </div>
      )}

      {/* Modal đăng bài */}
      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPostCreated={fetchAll}
      />
    </div>
  );
}
