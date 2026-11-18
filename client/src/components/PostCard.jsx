import React, { useState } from 'react';
import { 
  MessageSquare, Sparkles, Send, Clock, AlertTriangle, 
  Heart, Bookmark, MoreVertical, Edit3, Trash2, ShieldAlert,
  CornerDownRight, X, Lock, Globe
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../contexts/AuthContext';
import EditPostModal from './EditPostModal';
import ReportPostModal from './ReportPostModal';

const MOOD_PILLS = {
  'Buồn bã': 'bg-paper text-forest-ink border-hairline',
  'Cô đơn': 'bg-paper text-forest-ink border-hairline',
  'Áp lực': 'bg-paper text-forest-ink border-hairline',
  'Tuyệt vọng': 'bg-red-50 text-signal-red border-red-200',
  'Lạc lối': 'bg-paper text-forest-ink border-hairline',
  'Hy vọng': 'bg-mint-mist text-pine border-hairline',
  'Biết ơn': 'bg-mint-mist text-pine border-hairline',
};

export default function PostCard({ post: initialPost, isMyPost = false, onPostDeleted, onPostUpdated }) {
  const { user, openLoginModal } = useAuth();
  const [post, setPost] = useState(initialPost);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null); // { commentId, authorName }
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState('');
  
  // Like & Save states
  const [liked, setLiked] = useState(Boolean(initialPost.user_has_liked));
  const [likeCount, setLikeCount] = useState(initialPost.like_count || 0);
  const [saved, setSaved] = useState(Boolean(initialPost.user_has_saved));
  const [commentCount, setCommentCount] = useState(initialPost.comment_count || 0);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Keep internal state in sync if prop changes
  React.useEffect(() => {
    setPost(initialPost);
    setLiked(Boolean(initialPost.user_has_liked));
    setLikeCount(initialPost.like_count || 0);
    setSaved(Boolean(initialPost.user_has_saved));
    setCommentCount(initialPost.comment_count || 0);
  }, [initialPost]);

  const isOwner = user && (user.userId === post.user_id);
  const isAdmin = user && user.role === 'admin';

  const loadComments = async () => {
    try {
      setLoadingComments(true);
      const res = await axiosClient.get(`/posts/${post.id}`);
      setComments(res.comments || []);
      setCommentCount((res.comments || []).length);
    } catch (err) {
      console.error('Lỗi tải bình luận:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleToggleComments = () => {
    if (!showComments) {
      loadComments();
    }
    setShowComments(!showComments);
  };

  const handleToggleLike = async () => {
    if (!user) {
      openLoginModal();
      return;
    }
    try {
      // Optimistic update
      const nextLiked = !liked;
      setLiked(nextLiked);
      setLikeCount(prev => nextLiked ? prev + 1 : Math.max(0, prev - 1));

      const res = await axiosClient.post(`/posts/${post.id}/like`);
      setLiked(res.liked);
      setLikeCount(res.likeCount);
    } catch (err) {
      // Revert on error
      setLiked(liked);
      setLikeCount(likeCount);
      console.error('Lỗi thích bài viết:', err);
    }
  };

  const handleToggleSave = async () => {
    if (!user) {
      openLoginModal();
      return;
    }
    try {
      const nextSaved = !saved;
      setSaved(nextSaved);

      const res = await axiosClient.post(`/posts/${post.id}/save`);
      setSaved(res.saved);
    } catch (err) {
      setSaved(saved);
      console.error('Lỗi lưu bài viết:', err);
    }
  };

  const handleDeletePost = async () => {
    setShowMenu(false);
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết tâm sự này không?')) return;

    try {
      await axiosClient.delete(`/posts/${post.id}`);
      if (onPostDeleted) onPostDeleted(post.id);
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa bài viết.');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!user) {
      openLoginModal();
      return;
    }

    setCommentError('');
    setSubmittingComment(true);

    try {
      const res = await axiosClient.post(`/posts/${post.id}/comments`, {
        content: commentText.trim(),
        parentId: replyingTo ? replyingTo.commentId : null
      });

      setComments((prev) => [...prev, res.comment]);
      setCommentCount((prev) => prev + 1);
      setCommentText('');
      setReplyingTo(null);
    } catch (err) {
      setCommentError(err.message || 'Lỗi gửi bình luận.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;
    try {
      await axiosClient.delete(`/posts/${post.id}/comments/${commentId}`);
      setComments(prev => prev.filter(c => c.id !== commentId && c.parent_id !== commentId));
      setCommentCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      alert(err.message || 'Không thể xóa bình luận.');
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  const moodBadge = MOOD_PILLS[post.mood_tag] || 'bg-paper text-forest-ink border-hairline';

  // Group comments: top-level and nested replies
  const topLevelComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId) => comments.filter(c => c.parent_id === parentId);

  return (
    <article className="bg-white border border-hairline rounded-card p-4 sm:p-6 shadow-subtle hover:border-gray-300 transition-colors relative">
      {/* Header bài viết */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-paper border border-hairline flex items-center justify-center font-mono text-xs font-semibold text-forest-ink overflow-hidden shrink-0 shadow-sm">
            {post.avatar_url ? (
              post.avatar_url.startsWith('http') || post.avatar_url.startsWith('/') ? (
                <img src={post.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-base select-none leading-none">{post.avatar_url}</span>
              )
            ) : post.anonymous_name ? (
              <span>{post.anonymous_name.slice(-2).toUpperCase()}</span>
            ) : (
              'AN'
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-forest-ink font-sans">
                {post.anonymous_name || 'Người dùng ẩn danh'}
              </span>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-pill border font-medium ${moodBadge}`}>
                {post.mood_tag}
              </span>

              {/* Huy hiệu riêng tư nếu là bài viết của chính mình */}
              {post.is_private && (
                <span className="inline-flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded-pill bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Chỉ mình tôi</span>
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1 text-[11px] text-graphite mt-0.5 font-mono">
              <Clock className="w-3 h-3 text-graphite" />
              <span>{formatDate(post.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Nút tác vụ Menu & Trạng thái */}
        <div className="flex items-center space-x-2">
          {/* Trạng thái duyệt của bài cá nhân */}
          {(isMyPost || isOwner) && (
            <div>
              {post.status === 'APPROVED' && (
                <span className="px-2.5 py-0.5 rounded-pill bg-mint-mist text-pine border border-hairline text-xs font-medium">
                  Đã duyệt
                </span>
              )}
              {post.status === 'PENDING' && (
                <span className="px-2.5 py-0.5 rounded-pill bg-amber-50 text-amber-700 border border-amber-200 text-xs font-medium">
                  Đang chờ AI duyệt
                </span>
              )}
              {post.status === 'REJECTED' && (
                <span className="px-2.5 py-0.5 rounded-pill bg-red-50 text-signal-red border border-red-200 text-xs font-medium">
                  Bị từ chối
                </span>
              )}
            </div>
          )}

          {/* Menu ba chấm tác vụ */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-full text-graphite hover:text-forest-ink hover:bg-paper transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div 
                className="absolute right-0 top-7 w-44 bg-white border border-hairline rounded-xl shadow-card py-1 z-30 animate-fade-in"
                onMouseLeave={() => setShowMenu(false)}
              >
                {isOwner && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setIsEditModalOpen(true);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs text-forest-ink hover:bg-paper flex items-center space-x-2 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-graphite" />
                    <span>Chỉnh sửa bài viết</span>
                  </button>
                )}

                {(isOwner || isAdmin) && (
                  <button
                    onClick={handleDeletePost}
                    className="w-full px-3.5 py-2 text-left text-xs text-signal-red hover:bg-red-50 flex items-center space-x-2 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-signal-red" />
                    <span>Xóa bài viết</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowMenu(false);
                    if (!user) {
                      openLoginModal();
                    } else {
                      setIsReportModalOpen(true);
                    }
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs text-graphite hover:text-signal-red hover:bg-paper flex items-center space-x-2 transition-colors cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-graphite" />
                  <span>Báo cáo vi phạm</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nội dung tâm sự */}
      <p className="text-sm text-forest-ink leading-relaxed whitespace-pre-line mb-3 font-normal">
        {post.content}
      </p>

      {/* Hình ảnh đính kèm minh họa tâm trạng */}
      {post.image_url && (
        <div className="mb-4 rounded-xl overflow-hidden border border-hairline bg-paper max-h-80 shadow-subtle group">
          <img 
            src={post.image_url} 
            alt={post.mood_tag || 'Hình ảnh tâm sự'} 
            className="w-full h-auto max-h-80 object-cover group-hover:scale-[1.01] transition-transform duration-300"
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
      )}

      {/* Cảnh báo lý do từ chối nếu có */}
      {post.status === 'REJECTED' && post.rejection_reason && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3.5 text-xs text-signal-red flex items-start space-x-2.5">
          <AlertTriangle className="w-4 h-4 text-signal-red shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-signal-red">Lý do từ chối:</p>
            <p className="mt-0.5 text-red-800">{post.rejection_reason}</p>
          </div>
        </div>
      )}

      {/* Footer tương tác: Đồng cảm (Like), Bình luận, Lưu bài (Bookmark) */}
      <div className="pt-3 border-t border-hairline flex items-center justify-between text-xs text-graphite">
        <div className="flex items-center space-x-2">
          {/* Nút Like / Đồng cảm */}
          <button
            onClick={handleToggleLike}
            className={`flex items-center space-x-1.5 py-1.5 px-3 rounded-pill border transition-all cursor-pointer font-medium ${
              liked
                ? 'bg-red-50 text-signal-red border-red-200'
                : 'bg-paper hover:bg-gray-200 text-forest-ink border-hairline'
            }`}
            title="Bày tỏ sự đồng cảm"
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-signal-red text-signal-red' : 'text-graphite'}`} />
            <span>{likeCount}</span>
          </button>

          {/* Nút Bình luận */}
          <button
            onClick={handleToggleComments}
            className="flex items-center space-x-1.5 py-1.5 px-3 rounded-pill bg-paper hover:bg-gray-200 text-forest-ink border border-hairline transition-colors font-medium cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-pulse" />
            <span>{commentCount} bình luận</span>
          </button>

          {/* Nút Lưu bài (Bookmark) */}
          <button
            onClick={handleToggleSave}
            className={`flex items-center space-x-1.5 py-1.5 px-3 rounded-pill border transition-all cursor-pointer font-medium ${
              saved
                ? 'bg-mint-mist text-pine border-emerald-pulse/40 font-semibold'
                : 'bg-paper hover:bg-gray-200 text-forest-ink border-hairline'
            }`}
            title="Lưu bài viết vào danh sách cá nhân"
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-pine text-pine' : 'text-graphite'}`} />
            <span>{saved ? 'Đã lưu' : 'Lưu bài'}</span>
          </button>
        </div>

        <span className="text-[11px] text-graphite font-mono hidden sm:inline">
          P2P Secure · Upstash Light
        </span>
      </div>

      {/* Phần danh sách bình luận đa cấp */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-hairline space-y-3">
          {loadingComments ? (
            <div className="text-center py-4 text-xs text-graphite font-mono">Đang tải bình luận...</div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {topLevelComments.length === 0 ? (
                <p className="text-center py-4 text-xs text-graphite italic">
                  Chưa có bình luận nào. Hãy gửi lời động viên đầu tiên!
                </p>
              ) : (
                topLevelComments.map((c) => {
                  const replies = getReplies(c.id);
                  const canDeleteComment = user && (user.userId === c.user_id || user.role === 'admin');

                  return (
                    <div key={c.id} className="space-y-2">
                      {/* Bình luận gốc */}
                      <div
                        className={`p-3.5 rounded-card text-xs leading-relaxed ${
                          c.is_ai_bot
                            ? 'bg-mint-mist/40 border border-jade-wash/30 text-forest-ink'
                            : 'bg-paper border border-hairline text-forest-ink'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center space-x-2 font-medium">
                            {c.is_ai_bot ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-emerald-pulse inline-block"></span>
                                <span className="text-pine font-semibold font-display">Heli AI Buddy</span>
                                <span className="text-[10px] px-2 py-0.2 rounded-pill bg-white text-pine font-mono border border-hairline">
                                  Empathetic AI
                                </span>
                              </>
                            ) : (
                              <span className="text-forest-ink font-semibold">{c.author_name}</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] text-graphite font-mono">{formatDate(c.created_at)}</span>
                            {canDeleteComment && (
                              <button
                                onClick={() => handleDeleteComment(c.id)}
                                className="text-graphite hover:text-signal-red p-0.5 rounded cursor-pointer"
                                title="Xóa bình luận"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="whitespace-pre-line text-forest-ink">{c.content}</p>

                        {/* Nút Trả lời cho bình luận người dùng */}
                        {!c.is_ai_bot && post.status === 'APPROVED' && (
                          <div className="mt-2 pt-1 border-t border-hairline/60 flex items-center justify-end">
                            <button
                              onClick={() => {
                                setReplyingTo({ commentId: c.id, authorName: c.author_name });
                              }}
                              className="text-[11px] font-medium text-emerald-pulse hover:text-pine flex items-center space-x-1 cursor-pointer"
                            >
                              <CornerDownRight className="w-3 h-3" />
                              <span>Trả lời</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Danh sách phản hồi con (Replies) */}
                      {replies.length > 0 && (
                        <div className="pl-6 space-y-2 border-l-2 border-emerald-pulse/30 ml-3">
                          {replies.map((reply) => {
                            const canDeleteReply = user && (user.userId === reply.user_id || user.role === 'admin');
                            return (
                              <div
                                key={reply.id}
                                className="p-3 rounded-card text-xs bg-paper/80 border border-hairline text-forest-ink"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-forest-ink font-semibold">{reply.author_name}</span>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-[10px] text-graphite font-mono">{formatDate(reply.created_at)}</span>
                                    {canDeleteReply && (
                                      <button
                                        onClick={() => handleDeleteComment(reply.id)}
                                        className="text-graphite hover:text-signal-red p-0.5 rounded cursor-pointer"
                                        title="Xóa phản hồi"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <p className="whitespace-pre-line text-forest-ink">{reply.content}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Form gửi bình luận / trả lời */}
          {post.status === 'APPROVED' && (
            <form onSubmit={handleAddComment} className="pt-2">
              {/* Banner khi đang trả lời ai đó */}
              {replyingTo && (
                <div className="flex items-center justify-between px-3 py-1.5 mb-2 bg-mint-mist/60 border border-emerald-pulse/30 rounded-lg text-xs text-pine">
                  <span className="flex items-center space-x-1">
                    <CornerDownRight className="w-3 h-3" />
                    <span>Đang trả lời <strong>@{replyingTo.authorName}</strong></span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="text-graphite hover:text-pine p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {commentError && (
                <p className="text-xs text-signal-red mb-1.5">{commentError}</p>
              )}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder={replyingTo ? `Trả lời @${replyingTo.authorName}...` : "Gửi lời an ủi, động viên ẩn danh..."}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 bg-paper border border-hairline rounded-pill px-4 py-2 text-xs text-forest-ink placeholder:text-graphite focus:outline-none focus:border-jade-wash focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  disabled={submittingComment || !commentText.trim()}
                  className="p-2 rounded-full bg-emerald-pulse hover:bg-pine text-white disabled:opacity-40 transition-colors shrink-0 shadow-subtle cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Modal Chỉnh sửa bài viết */}
      <EditPostModal
        isOpen={isEditModalOpen}
        post={post}
        onClose={() => setIsEditModalOpen(false)}
        onPostUpdated={(updated) => {
          setPost(updated);
          if (onPostUpdated) onPostUpdated(updated);
        }}
      />

      {/* Modal Báo cáo vi phạm */}
      <ReportPostModal
        isOpen={isReportModalOpen}
        postId={post.id}
        onClose={() => setIsReportModalOpen(false)}
      />
    </article>
  );
}
