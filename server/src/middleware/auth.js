const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { getUserById } = require('../models/userModel');

async function authenticate(req, res, next) {
  let token = req.cookies?.session_token;

  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Yêu cầu phiên đăng nhập. Vui lòng tạo phiên ẩn danh hoặc đăng nhập.' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);

    // Kiểm tra trực tiếp trạng thái tài khoản trong CSDL để xử lý ngay nếu Admin khóa
    const liveUser = await getUserById(decoded.userId);
    if (!liveUser || liveUser.status === 'DELETED') {
      res.clearCookie('session_token');
      return res.status(401).json({ error: 'Tài khoản không tồn tại hoặc đã bị xóa.' });
    }

    if (liveUser.status === 'SUSPENDED') {
      res.clearCookie('session_token');
      return res.status(403).json({ error: 'Tài khoản của bạn đã bị tạm khóa do vi phạm quy định cộng đồng.' });
    }

    req.user = {
      userId: liveUser.id,
      username: liveUser.username,
      anonymousName: liveUser.anonymous_name,
      avatarUrl: liveUser.avatar_url,
      bio: liveUser.bio,
      role: liveUser.role,
      status: liveUser.status,
      isGuest: Boolean(liveUser.is_guest)
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' });
  }
}

async function optionalAuth(req, res, next) {
  let token = req.cookies?.session_token;

  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      const liveUser = await getUserById(decoded.userId);
      if (liveUser && liveUser.status === 'ACTIVE') {
        req.user = {
          userId: liveUser.id,
          username: liveUser.username,
          anonymousName: liveUser.anonymous_name,
          avatarUrl: liveUser.avatar_url,
          bio: liveUser.bio,
          role: liveUser.role,
          status: liveUser.status,
          isGuest: Boolean(liveUser.is_guest)
        };
      }
    } catch (e) {
      // bỏ qua lỗi token
    }
  }
  next();
}

module.exports = {
  authenticate,
  optionalAuth
};
