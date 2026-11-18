const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const config = require('./config/env');
const { initDb } = require('./config/db');

// Middlewares & Sockets
const { socketAuthMiddleware } = require('./middleware/socketAuth');
const { setupSignaling } = require('./sockets/signalingHandler');

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const aiRoutes = require('./routes/aiRoutes');
const configRoutes = require('./routes/configRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);

// Cấu hình Socket.io với CORS và xác thực
const io = new Server(server, {
  cors: {
    origin: config.clientUrl,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Lưu io vào app để các routes (Admin khóa user, thông báo) có thể truy cập
app.set('io', io);

// Middleware cho Express
app.use(cors({
  origin: config.clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Đăng ký API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/config', configRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const { getDbMode } = require('./config/db');
  res.json({
    status: 'ok',
    service: 'Hệ thống Tâm sự Ẩn danh Hybrid P2P & Trợ lý AI An toàn',
    dbMode: getDbMode(),
    timestamp: new Date().toISOString()
  });
});

// Đăng ký middleware xác thực cho Socket.io
io.use(socketAuthMiddleware);

// Đăng ký logic Signaling WebRTC
setupSignaling(io);

// Khởi chạy server và kết nối Database
async function startServer() {
  try {
    await initDb();

    server.listen(config.port, () => {
      console.log('====================================================');
      console.log(`🚀 Server đang chạy tại: http://localhost:${config.port}`);
      console.log(`🌐 Cho phép kết nối từ Client: ${config.clientUrl}`);
      console.log(`🤖 Chế độ Gemini AI: ${config.geminiApiKey ? 'Kích hoạt' : 'Heuristic Fallback (sẵn sàng)'}`);
      console.log('====================================================');
    });
  } catch (err) {
    console.error('Lỗi nghiêm trọng khi khởi động server:', err);
    process.exit(1);
  }
}

startServer();
