const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { getUserById } = require('../models/userModel');

function parseCookieString(cookieString) {
  const list = {};
  if (!cookieString) return list;

  cookieString.split(';').forEach(cookie => {
    let [name, ...rest] = cookie.split('=');
    name = name?.trim();
    if (!name) return;
    const value = rest.join('=').trim();
    list[name] = decodeURIComponent(value);
  });
  return list;
}

async function socketAuthMiddleware(socket, next) {
  try {
    let token = socket.handshake.auth?.token;

    if (!token && socket.handshake.headers.cookie) {
      const cookies = parseCookieString(socket.handshake.headers.cookie);
      token = cookies.session_token;
    }

    if (!token) {
      return next(new Error('Yêu cầu xác thực token phiên để kết nối'));
    }

    const decoded = jwt.verify(token, config.jwtSecret);

    // Kiểm tra trạng thái tài khoản thời gian thực
    const liveUser = await getUserById(decoded.userId);
    if (!liveUser || liveUser.status === 'DELETED') {
      return next(new Error('Tài khoản không tồn tại hoặc đã bị xóa'));
    }
    if (liveUser.status === 'SUSPENDED') {
      return next(new Error('Tài khoản đã bị tạm khóa do vi phạm tiêu chuẩn an toàn'));
    }

    socket.user = {
      userId: liveUser.id,
      username: liveUser.username,
      anonymousName: liveUser.anonymous_name,
      role: liveUser.role,
      status: liveUser.status
    };
    next();
  } catch (err) {
    return next(new Error('Token phiên không hợp lệ hoặc đã hết hạn'));
  }
}

module.exports = {
  socketAuthMiddleware
};
