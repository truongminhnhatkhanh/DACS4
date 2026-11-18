const express = require('express');
const bcrypt = require('bcryptjs');
const {
  getUserById,
  updateUserProfile,
  changePassword,
  updateUserStatus,
  regenerateRecoveryCode
} = require('../models/userModel');
const { getPostsByUserId } = require('../models/postModel');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Tất cả endpoints đều yêu cầu đăng nhập
router.use(authenticate);

// 1. Lấy thông tin hồ sơ cá nhân
router.get('/profile', async (req, res) => {
  try {
    const user = await getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy thông tin người dùng.' });
    }

    const posts = await getPostsByUserId(req.user.userId);

    return res.json({
      user: {
        id: user.id,
        username: user.username,
        anonymousName: user.anonymous_name,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        role: user.role,
        status: user.status,
        isGuest: Boolean(user.is_guest),
        totalPosts: posts.length,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Lỗi lấy hồ sơ:', error);
    return res.status(500).json({ error: 'Không thể tải hồ sơ người dùng.' });
  }
});

// 2. Chỉnh sửa hồ sơ (Bút danh, Avatar, Giới thiệu)
router.put('/profile', async (req, res) => {
  try {
    const { anonymousName, avatarUrl, bio } = req.body;

    if (anonymousName && typeof anonymousName === 'string') {
      const cleanName = anonymousName.trim();
      if (cleanName.length < 2 || cleanName.length > 50) {
        return res.status(400).json({ error: 'Bút danh ẩn danh phải có độ dài từ 2 đến 50 ký tự.' });
      }
    }

    const updated = await updateUserProfile(req.user.userId, {
      anonymousName: anonymousName ? anonymousName.trim() : undefined,
      avatarUrl: avatarUrl ? avatarUrl.trim() : undefined,
      bio: bio !== undefined ? bio.trim().slice(0, 300) : undefined
    });

    return res.json({
      message: 'Cập nhật hồ sơ thành công',
      user: {
        id: updated.id,
        username: updated.username,
        anonymousName: updated.anonymous_name,
        avatarUrl: updated.avatar_url,
        bio: updated.bio,
        role: updated.role,
        status: updated.status,
        isGuest: Boolean(updated.is_guest)
      }
    });
  } catch (error) {
    console.error('Lỗi cập nhật hồ sơ:', error);
    return res.status(500).json({ error: 'Không thể cập nhật hồ sơ.' });
  }
});

// 3. Đổi mật khẩu (dành cho người dùng đã đăng ký)
router.put('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
    }

    const user = await getUserById(req.user.userId);
    if (!user || !user.password_hash) {
      return res.status(400).json({ error: 'Tài khoản khách chưa đặt mật khẩu. Vui lòng đăng ký tài khoản chính thức.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Mật khẩu hiện tại không chính xác.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await changePassword(req.user.userId, newHash);

    return res.json({ message: 'Đổi mật khẩu thành công.' });
  } catch (error) {
    console.error('Lỗi đổi mật khẩu:', error);
    return res.status(500).json({ error: 'Đã xảy ra lỗi khi đổi mật khẩu.' });
  }
});

// 4. Cấp lại Mã khôi phục mới (Vô hiệu hóa toàn bộ mã cũ)
router.post('/regenerate-recovery-code', async (req, res) => {
  try {
    const { newRecoveryCode } = await regenerateRecoveryCode(req.user.userId);
    return res.json({
      message: 'Đã tạo mã khôi phục mới thành công. Mã cũ đã bị vô hiệu hóa.',
      recoveryCode: newRecoveryCode
    });
  } catch (error) {
    console.error('Lỗi cấp lại mã khôi phục:', error);
    return res.status(500).json({ error: 'Không thể cấp lại mã khôi phục lúc này.' });
  }
});

// 5. Xóa/Vô hiệu hóa tài khoản (Soft delete)
router.delete('/account', async (req, res) => {
  try {
    await updateUserStatus(req.user.userId, 'DELETED');
    res.clearCookie('session_token');
    return res.json({ message: 'Tài khoản của bạn đã được đóng và ẩn danh hóa an toàn.' });
  } catch (error) {
    console.error('Lỗi đóng tài khoản:', error);
    return res.status(500).json({ error: 'Không thể đóng tài khoản lúc này.' });
  }
});

module.exports = router;
