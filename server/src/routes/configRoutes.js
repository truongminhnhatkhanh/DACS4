const express = require('express');
const { getIceServers } = require('../config/iceServers');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Lấy danh sách ICE (STUN & TURN) servers cho WebRTC Client
router.get('/ice-servers', authenticate, (req, res) => {
  try {
    const iceServers = getIceServers();
    return res.json({ iceServers });
  } catch (error) {
    console.error('Lỗi lấy ice servers:', error);
    return res.status(500).json({ error: 'Không thể tải cấu hình mạng WebRTC.' });
  }
});

module.exports = router;
