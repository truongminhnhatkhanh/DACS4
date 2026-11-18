import React, { useState, useEffect } from 'react';
import { 
  Users, FileText, ShieldAlert, Trash2, RefreshCw, 
  AlertTriangle, CheckCircle, Clock, Shield, Lock, Unlock, UserCheck, Flag, Check, X
} from 'lucide-react';
import axiosClient from '../api/axiosClient';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ totalUsers: 0, totalPosts: 0, totalSafetyCalls: 0, pendingReports: 0 });
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [recentSafetyLogs, setRecentSafetyLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'posts' | 'reports' | 'safety-logs'
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, postsRes, usersRes, reportsRes] = await Promise.all([
        axiosClient.get('/admin/stats'),
        axiosClient.get('/admin/posts'),
        axiosClient.get('/admin/users'),
        axiosClient.get('/admin/reports')
      ]);

      setStats(statsRes.stats);
      setRecentSafetyLogs(statsRes.recentSafetyLogs || []);
      setPosts(postsRes.posts || []);
      setUsers(usersRes.users || []);
      setReports(reportsRes.reports || []);
    } catch (err) {
      console.error('Lỗi tải dữ liệu admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeletePost = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) return;
    try {
      await axiosClient.delete(`/admin/posts/${id}`);
      setPosts(prev => prev.filter(p => p.id !== id));
      setStats(prev => ({ ...prev, totalPosts: Math.max(0, prev.totalPosts - 1) }));
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa bài viết.');
    }
  };

  const handleResolveReport = async (reportId, status, shouldDeletePost = false, postId = null) => {
    try {
      await axiosClient.put(`/admin/reports/${reportId}`, { status });
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));

      if (shouldDeletePost && postId) {
        await axiosClient.delete(`/admin/posts/${postId}`);
        setPosts(prev => prev.filter(p => p.id !== postId));
        alert('Đã xử lý vi phạm và xóa bài viết thành công.');
      } else {
        alert(`Đã cập nhật trạng thái báo cáo thành: ${status}`);
      }
    } catch (err) {
      alert(err.message || 'Lỗi khi xử lý báo cáo.');
    }
  };

  const handleToggleUserStatus = async (user) => {
    const isLocking = user.status === 'ACTIVE';
    const newStatus = isLocking ? 'SUSPENDED' : 'ACTIVE';
    const actionText = isLocking ? 'KHÓA tài khoản và ngắt toàn bộ phiên kết nối Socket' : 'MỞ KHÓA tài khoản';

    if (!window.confirm(`Bạn có chắc chắn muốn ${actionText} của "${user.anonymous_name || user.username}" không?`)) {
      return;
    }

    try {
      await axiosClient.put(`/admin/users/${user.id}/status`, {
        status: newStatus,
        reason: isLocking ? 'Tài khoản bị tạm khóa bởi Quản trị viên do vi phạm quy tắc.' : undefined
      });

      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
    } catch (err) {
      alert(err.message || 'Lỗi khi thay đổi trạng thái tài khoản.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Tiêu đề & Nút làm mới */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-forest-ink font-display flex items-center space-x-2">
            <span>Bảng Điều Khiển Quản Trị</span>
            <span className="px-2.5 py-0.5 rounded-pill bg-mint-mist text-pine border border-emerald-pulse/30 text-xs font-semibold">
              Admin
            </span>
          </h1>
          <p className="text-xs text-graphite mt-1">
            Quản trị tài khoản, kiểm soát nội dung độc hại, xử lý báo cáo và giám sát an toàn người dùng
          </p>
        </div>

        <button
          onClick={fetchData}
          className="px-4 py-2 rounded-pill bg-white hover:bg-paper text-forest-ink text-xs font-medium border border-hairline flex items-center space-x-1.5 transition-colors shadow-subtle cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Thẻ thống kê 4 cột */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <div className="bg-white border border-hairline rounded-card p-5 shadow-subtle flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-graphite font-medium">Tổng người dùng</span>
            <p className="text-2xl font-bold text-forest-ink font-display">{stats.totalUsers || 0}</p>
          </div>
        </div>

        <div className="bg-white border border-hairline rounded-card p-5 shadow-subtle flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-mint-mist border border-emerald-pulse/30 text-pine flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-graphite font-medium">Tổng bài tâm sự</span>
            <p className="text-2xl font-bold text-forest-ink font-display">{stats.totalPosts || 0}</p>
          </div>
        </div>

        <div className="bg-white border border-hairline rounded-card p-5 shadow-subtle flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
            <Flag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-graphite font-medium">Báo cáo chờ xử lý</span>
            <p className="text-2xl font-bold text-forest-ink font-display">{stats.pendingReports || 0}</p>
          </div>
        </div>

        <div className="bg-white border border-hairline rounded-card p-5 shadow-subtle flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 text-signal-red flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-graphite font-medium">Lượt AI Safety</span>
            <p className="text-2xl font-bold text-forest-ink font-display">{stats.totalSafetyCalls || 0}</p>
          </div>
        </div>
      </div>

      {/* Điều hướng Tab quản trị */}
      <div className="flex border-b border-hairline mb-6 space-x-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 text-xs font-medium transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'users'
              ? 'border-emerald-pulse text-forest-ink font-semibold'
              : 'border-transparent text-graphite hover:text-forest-ink'
          }`}
        >
          Quản lý Người Dùng ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('posts')}
          className={`pb-3 px-4 text-xs font-medium transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'posts'
              ? 'border-emerald-pulse text-forest-ink font-semibold'
              : 'border-transparent text-graphite hover:text-forest-ink'
          }`}
        >
          Quản lý Bài viết ({posts.length})
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 px-4 text-xs font-medium transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'reports'
              ? 'border-emerald-pulse text-forest-ink font-semibold'
              : 'border-transparent text-graphite hover:text-forest-ink'
          }`}
        >
          Báo cáo Vi phạm ({reports.length})
        </button>

        <button
          onClick={() => setActiveTab('safety-logs')}
          className={`pb-3 px-4 text-xs font-medium transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'safety-logs'
              ? 'border-emerald-pulse text-forest-ink font-semibold'
              : 'border-transparent text-graphite hover:text-forest-ink'
          }`}
        >
          Nhật ký Safety Shield ({recentSafetyLogs.length})
        </button>
      </div>

      {/* Nội dung Tab */}
      {loading ? (
        <div className="text-center py-12 text-xs text-graphite font-mono">Đang tải dữ liệu quản trị...</div>
      ) : activeTab === 'users' ? (
        /* Tab Quản lý Người dùng */
        <div className="space-y-3">
          {users.length === 0 ? (
            <p className="text-center py-12 text-xs text-graphite">Chưa có người dùng nào.</p>
          ) : (
            users.map((u) => {
              const isSuspended = u.status === 'SUSPENDED';
              const isAdmin = u.role === 'admin';

              return (
                <div
                  key={u.id}
                  className={`bg-white border rounded-card p-4 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors ${
                    isSuspended ? 'border-red-200 bg-red-50/20' : 'border-hairline'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-paper border border-hairline flex items-center justify-center font-mono text-sm font-semibold text-forest-ink">
                      {u.avatar_url || (u.anonymous_name ? u.anonymous_name.slice(-2) : 'US')}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-forest-ink">{u.anonymous_name}</span>
                        {u.username && (
                          <span className="text-xs font-mono text-graphite">(@{u.username})</span>
                        )}
                        <span className={`text-[10px] px-2 py-0.5 rounded-pill font-mono font-medium border ${
                          isAdmin 
                            ? 'bg-purple-50 text-purple-700 border-purple-200' 
                            : u.is_guest 
                            ? 'bg-paper text-graphite border-hairline' 
                            : 'bg-mint-mist text-pine border-emerald-pulse/30'
                        }`}>
                          {isAdmin ? 'ADMIN' : u.is_guest ? 'GUEST' : 'REGISTERED'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-[11px] text-graphite mt-1">
                        <span>Trạng thái: <strong className={isSuspended ? 'text-signal-red font-semibold' : 'text-pine font-semibold'}>{u.status}</strong></span>
                        {u.recovery_email && <span>Email: {u.recovery_email}</span>}
                        <span>Tạo lúc: {new Date(u.created_at).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>

                  {!isAdmin && (
                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      <button
                        onClick={() => handleToggleUserStatus(u)}
                        className={`px-3 py-1.5 rounded-pill text-xs font-medium border flex items-center space-x-1.5 transition-colors cursor-pointer ${
                          isSuspended
                            ? 'bg-mint-mist hover:bg-emerald-100 text-pine border-emerald-pulse/40'
                            : 'bg-red-50 hover:bg-red-100 text-signal-red border-red-200'
                        }`}
                      >
                        {isSuspended ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        <span>{isSuspended ? 'Mở khóa' : 'Khóa tài khoản'}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : activeTab === 'posts' ? (
        /* Tab Quản lý Bài viết */
        <div className="space-y-3">
          {posts.length === 0 ? (
            <p className="text-center py-12 text-xs text-graphite">Chưa có bài viết nào.</p>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-white border border-hairline rounded-card p-4 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1.5 flex-1 pr-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-forest-ink font-mono">
                      {post.anonymous_name || 'Người dùng'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-pill bg-paper text-graphite border border-hairline">
                      {post.mood_tag}
                    </span>
                    {post.is_private && (
                      <span className="text-[10px] px-2 py-0.5 rounded-pill bg-amber-50 text-amber-700 border border-amber-200">
                        Chỉ mình tôi
                      </span>
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded-pill font-medium border ${
                      post.status === 'APPROVED'
                        ? 'bg-mint-mist text-pine border-emerald-pulse/30'
                        : post.status === 'REJECTED'
                        ? 'bg-red-50 text-signal-red border-red-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {post.status}
                    </span>
                  </div>

                  <p className="text-xs text-forest-ink line-clamp-2 leading-relaxed">
                    {post.content}
                  </p>

                  <div className="flex items-center space-x-3 text-[10px] text-graphite font-mono">
                    <span>{post.like_count || 0} thích</span>
                    <span>{post.comment_count || 0} bình luận</span>
                    <span>{post.report_count || 0} báo cáo</span>
                    <span>{new Date(post.created_at).toLocaleString('vi-VN')}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-center">
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="p-2 rounded-pill bg-paper hover:bg-red-50 hover:text-signal-red text-graphite border border-hairline transition-colors cursor-pointer"
                    title="Xóa bài viết"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : activeTab === 'reports' ? (
        /* Tab Quản lý Báo cáo Vi phạm */
        <div className="space-y-3">
          {reports.length === 0 ? (
            <p className="text-center py-12 text-xs text-graphite">Không có báo cáo vi phạm nào.</p>
          ) : (
            reports.map((report) => {
              const isPending = report.status === 'PENDING';
              return (
                <div
                  key={report.id}
                  className={`bg-white border rounded-card p-4 shadow-subtle ${
                    isPending ? 'border-amber-300 bg-amber-50/10' : 'border-hairline'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-signal-red flex items-center space-x-1">
                        <Flag className="w-3.5 h-3.5" />
                        <span>{report.reason}</span>
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-pill font-mono border ${
                        report.status === 'RESOLVED'
                          ? 'bg-mint-mist text-pine border-emerald-pulse/30'
                          : report.status === 'REJECTED'
                          ? 'bg-paper text-graphite border-hairline'
                          : 'bg-amber-100 text-amber-800 border-amber-300 font-bold'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-graphite font-mono">
                      {new Date(report.created_at).toLocaleString('vi-VN')}
                    </span>
                  </div>

                  <div className="bg-paper p-3 rounded-xl border border-hairline text-xs mb-3 space-y-1">
                    <div className="flex items-center justify-between text-graphite text-[11px]">
                      <span>Tác giả bài viết: <strong>{report.author_name || 'Người dùng'}</strong> ({report.post_mood || 'Cảm xúc'})</span>
                      <span>Người báo cáo: <strong>{report.reporter_name}</strong></span>
                    </div>
                    <p className="text-forest-ink italic">"{report.post_content}"</p>
                    {report.details && (
                      <p className="text-[11px] text-graphite pt-1 border-t border-hairline/60">
                        Chi tiết từ người báo cáo: {report.details}
                      </p>
                    )}
                  </div>

                  {isPending && (
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleResolveReport(report.id, 'REJECTED')}
                        className="px-3 py-1.5 rounded-pill bg-paper hover:bg-gray-200 text-graphite text-xs font-medium border border-hairline transition-colors cursor-pointer"
                      >
                        Bác bỏ (Không vi phạm)
                      </button>
                      <button
                        onClick={() => handleResolveReport(report.id, 'RESOLVED', true, report.post_id)}
                        className="px-3 py-1.5 rounded-pill bg-signal-red hover:bg-red-700 text-white text-xs font-medium shadow-subtle transition-colors cursor-pointer"
                      >
                        Xác nhận vi phạm & Xóa bài viết
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Tab Nhật ký An toàn */
        <div className="space-y-3">
          {recentSafetyLogs.length === 0 ? (
            <p className="text-center py-12 text-xs text-graphite">Chưa có lượt quét an toàn nào.</p>
          ) : (
            recentSafetyLogs.map((log) => {
              const isDanger = log.risk_level === 'DANGER';
              const isWarning = log.risk_level === 'WARNING';
              return (
                <div
                  key={log.id}
                  className={`bg-white border rounded-xl p-4 shadow-subtle ${
                    isDanger ? 'border-signal-red/40 bg-red-50/20' : isWarning ? 'border-amber-200 bg-amber-50/20' : 'border-hairline'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-forest-ink font-mono">
                        {log.anonymous_name || 'Người dùng'}
                      </span>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-pill font-medium border ${
                        isDanger
                          ? 'bg-red-50 text-signal-red border-signal-red/30'
                          : isWarning
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-mint-mist text-pine border-emerald-pulse/30'
                      }`}>
                        {log.risk_level}
                      </span>
                      {log.emergency_alert && (
                        <span className="text-[10px] px-2.5 py-0.5 rounded-pill bg-signal-red text-white font-bold animate-pulse">
                          CẢNH BÁO KHẨN CẤP
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-graphite">
                      {new Date(log.created_at).toLocaleString('vi-VN')}
                    </span>
                  </div>

                  <ul className="text-xs text-forest-ink space-y-1">
                    {log.flagged_issues && log.flagged_issues.map((issue, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-signal-red mt-0.5">•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
