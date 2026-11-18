function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Truy cập bị từ chối. Yêu cầu quyền Quản trị viên (Admin).' });
  }
  next();
}

module.exports = { requireAdmin };
