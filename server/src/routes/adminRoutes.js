const express = require('express');
const { 
  getAllPostsAdmin, 
  deletePost, 
  countPosts, 
  getPostReports, 
  resolvePostReport 
} = require('../models/postModel');
const { countUsers, getAllUsersAdmin, updateUserStatus, getUserById } = require('../models/userModel');
const { countSafetyLogs, getRecentSafetyLogs } = require('../models/safetyModel');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const { disconnectUserSockets } = require('../sockets/signalingHandler');

const router = express.Router();

// Tất cả endpoints admin đều yêu cầu authenticate + requireAdmin
router.use(authenticate, requireAdmin);

// 1. Lấy danh sách toàn bộ người dùng
router.get('/users', async (req, res) => {
  try {
    const users = await getAllUsersAdmin();
    return res.json({ users });
  } catch (error) {
    console.error('Lỗi admin lấy người dùng:', error);
    return res.status(500).json({ error: 'Không thể tải danh sách người dùng.' });
  }
});

// 2. Khóa hoặc Mở khóa tài khoản (SUSPENDED / ACTIVE / DELETED)
router.put('/users/:id/status', async (req, res) => {
  try {
    const { status, reason } = req.body;
    const targetUserId = req.params.id;

    if (!['ACTIVE', 'SUSPENDED', 'DELETED'].includes(status)) {
      return res.status(400).json({ error: 'Trạng thái không hợp lệ (chỉ chấp nhận ACTIVE, SUSPENDED, DELETED).' });
    }

    const targetUser = await getUserById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng này.' });
    }

    if (targetUser.role === 'admin') {
      return res.status(403).json({ error: 'Không thể thay đổi trạng thái của tài khoản Quản trị viên.' });
    }

    await updateUserStatus(targetUserId, status);

    // Nếu khóa hoặc xóa: CHỦ ĐỘNG ngắt toàn bộ Socket đang mở của người dùng đó ngay lập tức!
    if (status === 'SUSPENDED' || status === 'DELETED') {
      const io = req.app.get('io');
      if (io) {
        const kickReason = reason || (status === 'SUSPENDED' ? 'Tài khoản của bạn đã bị tạm khóa do vi phạm quy định.' : 'Tài khoản đã bị xóa.');
        disconnectUserSockets(io, targetUserId, kickReason);
      }
    }

    return res.json({
      message: `Đã cập nhật trạng thái người dùng thành: ${status}`,
      userId: targetUserId,
      status
    });
  } catch (error) {
    console.error('Lỗi cập nhật trạng thái người dùng:', error);
    return res.status(500).json({ error: 'Không thể cập nhật trạng thái người dùng.' });
  }
});

// 3. Lấy toàn bộ bài viết (kể cả PENDING, APPROVED, REJECTED)
router.get('/posts', async (req, res) => {
  try {
    const posts = await getAllPostsAdmin();
    return res.json({ posts });
  } catch (error) {
    console.error('Lỗi admin lấy bài viết:', error);
    return res.status(500).json({ error: 'Không thể tải danh sách bài viết quản trị.' });
  }
});

// 4. Xóa bài viết vi phạm
router.delete('/posts/:id', async (req, res) => {
  try {
    await deletePost(req.params.id, null, true);
    return res.json({ message: 'Đã xóa bài viết thành công.' });
  } catch (error) {
    console.error('Lỗi admin xóa bài viết:', error);
    return res.status(500).json({ error: 'Không thể xóa bài viết.' });
  }
});

// 5. Quản lý Báo cáo vi phạm (Phân hệ 2 & Phân hệ 6)
router.get('/reports', async (req, res) => {
  try {
    const { status } = req.query;
    const reports = await getPostReports({ status });
    return res.json({ reports });
  } catch (error) {
    console.error('Lỗi admin lấy báo cáo:', error);
    return res.status(500).json({ error: 'Không thể tải danh sách báo cáo vi phạm.' });
  }
});

// 6. Xử lý báo cáo (RESOLVED, REJECTED, REVIEWING)
router.put('/reports/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['PENDING', 'REVIEWING', 'RESOLVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Trạng thái xử lý báo cáo không hợp lệ.' });
    }

    await resolvePostReport(req.params.id, status, req.user.userId);
    return res.json({ message: `Đã cập nhật trạng thái báo cáo thành ${status}` });
  } catch (error) {
    console.error('Lỗi xử lý báo cáo:', error);
    return res.status(500).json({ error: 'Không thể xử lý báo cáo.' });
  }
});

// 7. Lấy số liệu thống kê thời gian thực
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalPosts, totalSafetyCalls, recentLogs, reports] = await Promise.all([
      countUsers(),
      countPosts(),
      countSafetyLogs(),
      getRecentSafetyLogs(10),
      getPostReports({ status: 'PENDING' })
    ]);

    return res.json({
      stats: {
        totalUsers,
        totalPosts,
        totalSafetyCalls,
        pendingReports: reports.length
      },
      recentSafetyLogs: recentLogs
    });
  } catch (error) {
    console.error('Lỗi admin lấy thống kê:', error);
    return res.status(500).json({ error: 'Không thể tải số liệu thống kê.' });
  }
});

module.exports = router;
