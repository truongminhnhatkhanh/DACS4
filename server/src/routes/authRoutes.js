const express = require('express');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/env');
const {
  createUser,
  findUserByRecoveryCode,
  findUserByUsername,
  findUserByRecoveryEmail,
  generateSecureRecoveryCode,
  hashRecoveryCode,
  recordLastLogin,
  getUserById
} = require('../models/userModel');
const { authLimiter } = require('../middleware/rateLimiter');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

function generateAnonymousName() {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `Anonymous_${randomNum}`;
}

// 1. Đăng ký tài khoản người dùng chính thức (Hỗ trợ Email khôi phục tùy chọn)
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { username, password, anonymousName, bio, recoveryEmail } = req.body;

    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Vui lòng cung cấp tên đăng nhập.' });
    }
    const cleanUsername = username.trim();
    if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(cleanUsername)) {
      return res.status(400).json({
        error: 'Tên đăng nhập phải từ 3 đến 30 ký tự, chỉ gồm chữ cái, chữ số, dấu gạch dưới hoặc gạch ngang.'
      });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu phải có độ dài tối thiểu 6 ký tự.' });
    }

    // Kiểm tra định dạng email khôi phục (nếu người dùng tự nguyện liên kết)
    let cleanEmail = null;
    if (recoveryEmail && typeof recoveryEmail === 'string' && recoveryEmail.trim()) {
      cleanEmail = recoveryEmail.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        return res.status(400).json({ error: 'Định dạng email khôi phục không hợp lệ.' });
      }
    }

    if (cleanUsername.toLowerCase() === config.admin.username.toLowerCase()) {
      return res.status(400).json({ error: 'Tên đăng nhập này thuộc hệ thống quản trị, vui lòng chọn tên khác.' });
    }

    const existingUser = await findUserByUsername(cleanUsername);
    if (existingUser) {
      return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.' });
    }

    const finalAnonymousName = (anonymousName && typeof anonymousName === 'string' && anonymousName.trim())
      ? anonymousName.trim().slice(0, 50)
      : generateAnonymousName();

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    // Sinh luôn 1 mã khôi phục dự phòng cho tài khoản đăng ký
    const recoveryCode = generateSecureRecoveryCode();
    const recoveryTokenHash = hashRecoveryCode(recoveryCode);

    const user = await createUser({
      id: userId,
      username: cleanUsername,
      anonymousName: finalAnonymousName,
      bio: bio ? bio.slice(0, 300) : null,
      recoveryEmail: cleanEmail,
      recoveryTokenHash,
      passwordHash,
      role: 'user',
      status: 'ACTIVE',
      isGuest: false
    });

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        anonymousName: user.anonymousName,
        role: 'user',
        isGuest: false
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.cookie('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: config.cookieMaxAge
    });

    return res.status(201).json({
      message: 'Đăng ký tài khoản thành công',
      userId: user.id,
      username: user.username,
      anonymousName: user.anonymousName,
      recoveryEmail: cleanEmail,
      recoveryCode, // Cấp mã khôi phục một lần khi đăng ký để người dùng lưu dự phòng
      role: 'user',
      isGuest: false,
      token
    });
  } catch (error) {
    console.error('Lỗi đăng ký tài khoản:', error);
    return res.status(500).json({ error: 'Đã xảy ra lỗi khi đăng ký tài khoản.' });
  }
});

// 2. Đăng nhập tài khoản (Người dùng & Quản trị viên)
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.' });
    }

    const cleanUsername = username.trim();

    // 2.1 Kiểm tra Admin
    if (cleanUsername.toLowerCase() === config.admin.username.toLowerCase()) {
      const isAdminMatch = await bcrypt.compare(password, config.admin.passwordHash);
      if (isAdminMatch) {
        const adminToken = jwt.sign(
          {
            userId: 'admin-master-id',
            username: config.admin.username,
            anonymousName: 'Quản trị viên (Admin)',
            role: 'admin',
            isGuest: false
          },
          config.jwtSecret,
          { expiresIn: '7d' }
        );

        res.cookie('session_token', adminToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({
          message: 'Đăng nhập thành công với quyền Quản trị viên',
          userId: 'admin-master-id',
          username: config.admin.username,
          anonymousName: 'Quản trị viên (Admin)',
          role: 'admin',
          isGuest: false,
          token: adminToken
        });
      }
    }

    // 2.2 Kiểm tra người dùng thường
    const user = await findUserByUsername(cleanUsername);
    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ error: 'Tài khoản của bạn đã bị tạm khóa do vi phạm tiêu chuẩn cộng đồng.' });
    }
    if (user.status === 'DELETED') {
      return res.status(401).json({ error: 'Tài khoản không tồn tại hoặc đã bị xóa.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
    }

    await recordLastLogin(user.id);

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        anonymousName: user.anonymous_name,
        role: user.role || 'user',
        isGuest: false
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.cookie('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: config.cookieMaxAge
    });

    return res.json({
      message: 'Đăng nhập thành công',
      userId: user.id,
      username: user.username,
      anonymousName: user.anonymous_name,
      avatarUrl: user.avatar_url,
      bio: user.bio,
      recoveryEmail: user.recovery_email,
      role: user.role || 'user',
      isGuest: false,
      token
    });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    return res.status(500).json({ error: 'Đã xảy ra lỗi khi đăng nhập.' });
  }
});

// 3. Khởi tạo phiên Khách ẩn danh kèm Mã khôi phục tối ưu O(1)
router.post('/anonymous-session', authLimiter, async (req, res) => {
  try {
    const userId = uuidv4();
    const anonymousName = generateAnonymousName();
    const plainRecoveryCode = generateSecureRecoveryCode(); // crypto.randomBytes
    const recoveryTokenHash = hashRecoveryCode(plainRecoveryCode); // HMAC-SHA256 O(1)

    const user = await createUser({
      id: userId,
      anonymousName,
      recoveryTokenHash,
      role: 'user',
      status: 'ACTIVE',
      isGuest: true
    });

    const token = jwt.sign(
      {
        userId: user.id,
        username: null,
        anonymousName: user.anonymousName,
        role: 'user',
        isGuest: true
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.cookie('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: config.cookieMaxAge
    });

    return res.status(201).json({
      message: 'Khởi tạo phiên khách ẩn danh thành công',
      userId: user.id,
      username: null,
      anonymousName: user.anonymousName,
      isGuest: true,
      recoveryCode: plainRecoveryCode, // Trả về plain text 1 lần duy nhất cho modal lưu trữ
      token
    });
  } catch (error) {
    console.error('Lỗi tạo anonymous session:', error);
    return res.status(500).json({ error: 'Không thể tạo phiên ẩn danh. Vui lòng thử lại.' });
  }
});

// 4. Khôi phục tài khoản: Recovery Code (Chính - Ẩn danh) HOẶC Email liên kết (Tùy chọn)
router.post('/recover', authLimiter, async (req, res) => {
  try {
    const { recoveryCode, email, password } = req.body;

    let user = null;

    // 4.1 Phương thức CHÍNH: Khôi phục bằng Recovery Code (Ẩn danh 100%)
    if (recoveryCode && typeof recoveryCode === 'string') {
      const cleanCode = recoveryCode.trim().toUpperCase();
      user = await findUserByRecoveryCode(cleanCode);
      if (!user) {
        return res.status(400).json({ error: 'Mã khôi phục không chính xác hoặc không tồn tại.' });
      }
    } 
    // 4.2 Phương thức PHỤ (TÙY CHỌN): Khôi phục qua Email đã liên kết
    else if (email && typeof email === 'string') {
      const cleanEmail = email.trim().toLowerCase();
      user = await findUserByRecoveryEmail(cleanEmail);
      if (!user) {
        return res.status(400).json({ error: 'Không tìm thấy tài khoản nào liên kết với email này.' });
      }

      // Nếu tài khoản có mật khẩu, yêu cầu xác thực mật khẩu để tránh chiếm quyền tài khoản
      if (user.password_hash) {
        if (!password) {
          return res.status(400).json({
            error: 'Tài khoản này có mật khẩu bảo vệ. Vui lòng nhập mật khẩu hoặc dùng Mã khôi phục bí mật.'
          });
        }
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
          return res.status(401).json({ error: 'Mật khẩu tài khoản không chính xác.' });
        }
      }
    } else {
      return res.status(400).json({ error: 'Vui lòng cung cấp Mã khôi phục hoặc Email đã liên kết.' });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ error: 'Tài khoản liên kết đã bị tạm khóa do vi phạm quy tắc.' });
    }
    if (user.status === 'DELETED') {
      return res.status(400).json({ error: 'Tài khoản đã bị xóa khỏi hệ thống.' });
    }

    await recordLastLogin(user.id);

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username || null,
        anonymousName: user.anonymous_name,
        role: user.role,
        isGuest: Boolean(user.is_guest)
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.cookie('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: config.cookieMaxAge
    });

    return res.json({
      message: 'Khôi phục tài khoản thành công',
      userId: user.id,
      username: user.username || null,
      anonymousName: user.anonymous_name,
      avatarUrl: user.avatar_url,
      bio: user.bio,
      recoveryEmail: user.recovery_email,
      isGuest: Boolean(user.is_guest),
      token
    });
  } catch (error) {
    console.error('Lỗi khôi phục tài khoản:', error);
    return res.status(500).json({ error: 'Đã xảy ra lỗi khi khôi phục tài khoản.' });
  }
});

// 5. Đăng nhập Admin
router.post('/admin-login', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu quản trị.' });
    }

    if (username !== config.admin.username) {
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
    }

    const isMatch = await bcrypt.compare(password, config.admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
    }

    const token = jwt.sign(
      {
        userId: 'admin-master-id',
        username: config.admin.username,
        anonymousName: 'Quản trị viên (Admin)',
        role: 'admin',
        isGuest: false
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.cookie('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
      message: 'Đăng nhập quyền Quản trị viên thành công',
      role: 'admin',
      token
    });
  } catch (error) {
    console.error('Lỗi đăng nhập admin:', error);
    return res.status(500).json({ error: 'Lỗi đăng nhập quản trị.' });
  }
});

// 6. Lấy thông tin phiên hiện tại
router.get('/me', authenticate, (req, res) => {
  return res.json({ user: req.user });
});

// 7. Đăng xuất
router.post('/logout', (req, res) => {
  res.clearCookie('session_token');
  return res.json({ message: 'Đã đăng xuất thành công.' });
});

module.exports = router;
