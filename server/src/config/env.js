const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'heli_safe_p2p_super_secret_jwt_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
  cookieMaxAge: 30 * 24 * 60 * 60 * 1000, // 30 days

  // Secret riêng cho HMAC-SHA256 băm mã khôi phục (Recovery Code)
  recoverySecret: process.env.RECOVERY_SECRET || process.env.JWT_SECRET || 'heli_recovery_hmac_secret_key_2026',

  // Cấu hình AI tách biệt (Decoupled AI Configuration)
  ai: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    fallbackModel: process.env.GEMINI_FALLBACK_MODEL || 'gemini-1.5-flash-8b',
    temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.7'),
    maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '1024', 10)
  },

  // Backward compatibility cho các module cũ
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-1.5-flash',

  // Database
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dacs4',
    useFallback: process.env.DB_USE_FALLBACK !== 'false'
  },

  // Admin credentials (Mật khẩu được hash bằng bcrypt)
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    passwordHash: process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10)
  },

  // WebRTC ICE / TURN servers
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    ...(process.env.TURN_SERVER_URL ? [{
      urls: process.env.TURN_SERVER_URL,
      username: process.env.TURN_USERNAME,
      credential: process.env.TURN_CREDENTIAL
    }] : [])
  ]
};

module.exports = config;
