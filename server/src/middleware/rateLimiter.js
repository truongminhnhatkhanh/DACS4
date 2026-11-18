const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Bạn đã thực hiện quá nhiều yêu cầu tạo hoặc khôi phục phiên. Vui lòng thử lại sau 1 phút.' }
});

const postLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Bạn đang đăng bài quá nhanh. Vui lòng đợi 1 phút trước khi đăng tiếp.' }
});

const commentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Bạn đang bình luận quá nhanh. Vui lòng chờ giây lát.' }
});

const safetyLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Vui lòng chờ ít giây trước khi thực hiện lần kiểm tra an toàn (AI Safety Shield) tiếp theo.' }
});

module.exports = {
  authLimiter,
  postLimiter,
  commentLimiter,
  safetyLimiter
};
