const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { analyzeChatRisk } = require('../services/safetyShieldService');
const { logSafetyShield } = require('../models/safetyModel');
const { authenticate } = require('../middleware/auth');
const { safetyLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Phân tích rủi ro đoạn chat 1-1 theo yêu cầu (AI Safety Shield)
router.post('/safety-shield', authenticate, safetyLimiter, async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Không có tin nhắn nào để phân tích.' });
    }

    // Phân tích nguy cơ qua AI Service
    const analysis = await analyzeChatRisk(messages);

    // Lưu nhật ký phân tích để thống kê quản trị
    await logSafetyShield({
      id: uuidv4(),
      userId: req.user.userId,
      riskLevel: analysis.risk_level,
      emergencyAlert: analysis.emergency_alert,
      flaggedIssues: analysis.flagged_issues
    });

    return res.json({
      success: true,
      result: analysis
    });
  } catch (error) {
    console.error('Lỗi khi kích hoạt AI Safety Shield:', error);
    return res.status(500).json({ error: 'Không thể phân tích đoạn chat lúc này.' });
  }
});

module.exports = router;
