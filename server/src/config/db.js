const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const config = require('./env');

let pool = null;
let dbMode = 'mysql'; // 'mysql' | 'local'

const LOCAL_STORE_FILE = path.join(__dirname, '../../data/store.json');

const INITIAL_LOCAL_STORE = {
  users: [],
  posts: [],
  comments: [],
  post_likes: [],
  saved_posts: [],
  post_reports: [],
  user_reports: [],
  user_blocks: [],
  ai_chat_sessions: [],
  ai_chat_messages: [],
  mood_logs: [],
  safety_shield_logs: [],
  admin_logs: [],
  chat_sessions: []
};

// Khởi tạo file local store nếu chưa có hoặc bổ sung các key thiếu
function getLocalStore() {
  if (!fs.existsSync(LOCAL_STORE_FILE)) {
    fs.mkdirSync(path.dirname(LOCAL_STORE_FILE), { recursive: true });
    fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(INITIAL_LOCAL_STORE, null, 2), 'utf8');
    return INITIAL_LOCAL_STORE;
  }
  try {
    const raw = fs.readFileSync(LOCAL_STORE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    let mutated = false;
    for (const key of Object.keys(INITIAL_LOCAL_STORE)) {
      if (!Array.isArray(parsed[key])) {
        parsed[key] = [];
        mutated = true;
      }
    }
    if (mutated) {
      saveLocalStore(parsed);
    }
    return parsed;
  } catch (e) {
    console.error('Lỗi đọc local store, khởi tạo lại:', e.message);
    return { ...INITIAL_LOCAL_STORE };
  }
}

function saveLocalStore(data) {
  fs.mkdirSync(path.dirname(LOCAL_STORE_FILE), { recursive: true });
  fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Khởi tạo kết nối CSDL và tự động migrate cấu trúc bảng
async function initDb() {
  const isProduction = process.env.NODE_ENV === 'production';

  try {
    console.log(`[DB] Đang thử kết nối tới MySQL tại ${config.db.host}:${config.db.port}...`);
    // Thử kết nối tạo database nếu chưa có
    const rootConn = await mysql.createConnection({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      connectTimeout: 3000
    });

    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${config.db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await rootConn.end();

    // Tạo pool kết nối chính
    pool = mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // 1. Bảng users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(50) UNIQUE NULL,
        anonymous_name VARCHAR(50) NOT NULL,
        avatar_url VARCHAR(255) NULL,
        bio TEXT NULL,
        recovery_email VARCHAR(100) NULL,
        recovery_token_hash VARCHAR(64) NULL,
        recovery_code_hash VARCHAR(255) NULL,
        password_hash VARCHAR(255) NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        status ENUM('ACTIVE', 'SUSPENDED', 'DELETED') DEFAULT 'ACTIVE',
        is_guest BOOLEAN DEFAULT FALSE,
        last_login_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_users_username (username),
        INDEX idx_users_role (role),
        INDEX idx_users_status (status),
        INDEX idx_users_recovery_token (recovery_token_hash)
      );
    `);

    // Migrate thêm cột nếu bảng đã tồn tại từ phiên bản cũ
    const userColsToAdd = [
      'ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE NULL',
      'ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255) NULL',
      'ALTER TABLE users ADD COLUMN bio TEXT NULL',
      'ALTER TABLE users ADD COLUMN recovery_email VARCHAR(100) NULL',
      'ALTER TABLE users ADD COLUMN recovery_token_hash VARCHAR(64) NULL',
      'ALTER TABLE users ADD COLUMN status ENUM("ACTIVE", "SUSPENDED", "DELETED") DEFAULT "ACTIVE"',
      'ALTER TABLE users ADD COLUMN is_guest BOOLEAN DEFAULT FALSE',
      'ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP NULL',
      'ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
    ];
    for (const sql of userColsToAdd) {
      try { await pool.query(sql); } catch (e) { /* Bỏ qua nếu cột đã tồn tại */ }
    }

    // 2. Bảng posts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        mood_tag VARCHAR(30) DEFAULT 'Buồn bã',
        content TEXT NOT NULL,
        image_url VARCHAR(500) NULL,
        is_private BOOLEAN DEFAULT FALSE,
        status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
        rejection_reason VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    try { await pool.query('ALTER TABLE posts ADD COLUMN is_private BOOLEAN DEFAULT FALSE;'); } catch (e) {}
    try { await pool.query('ALTER TABLE posts ADD COLUMN image_url VARCHAR(500) NULL;'); } catch (e) {}

    // 3. Bảng comments
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id VARCHAR(36) PRIMARY KEY,
        post_id VARCHAR(36) NOT NULL,
        parent_id VARCHAR(36) NULL,
        user_id VARCHAR(36) NULL,
        author_name VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        is_ai_bot BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
      );
    `);
    try { await pool.query('ALTER TABLE comments ADD COLUMN parent_id VARCHAR(36) NULL;'); } catch (e) {}

    // 4. Bảng post_likes & saved_posts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS post_likes (
        id VARCHAR(36) PRIMARY KEY,
        post_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_post_user_like (post_id, user_id),
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS saved_posts (
        id VARCHAR(36) PRIMARY KEY,
        post_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_saved_post_user (post_id, user_id),
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // 5. Bảng post_reports, user_reports & user_blocks
    await pool.query(`
      CREATE TABLE IF NOT EXISTS post_reports (
        id VARCHAR(36) PRIMARY KEY,
        post_id VARCHAR(36) NOT NULL,
        reporter_id VARCHAR(36) NOT NULL,
        reason VARCHAR(255) NOT NULL,
        details TEXT NULL,
        status ENUM('PENDING', 'REVIEWING', 'RESOLVED', 'REJECTED') DEFAULT 'PENDING',
        resolved_by VARCHAR(36) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_reports (
        id VARCHAR(36) PRIMARY KEY,
        target_user_id VARCHAR(36) NOT NULL,
        reporter_id VARCHAR(36) NOT NULL,
        reason VARCHAR(255) NOT NULL,
        details TEXT NULL,
        status ENUM('PENDING', 'REVIEWING', 'RESOLVED', 'REJECTED') DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_blocks (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        blocked_user_id VARCHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_user_block (user_id, blocked_user_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (blocked_user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // 6. Bảng ai_chat_sessions & ai_chat_messages (Heli Buddy)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_chat_sessions (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        title VARCHAR(100) NOT NULL DEFAULT 'Tâm sự với Heli',
        last_mood VARCHAR(50) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_chat_messages (
        id VARCHAR(36) PRIMARY KEY,
        session_id VARCHAR(36) NOT NULL,
        sender ENUM('user', 'heli') NOT NULL,
        content TEXT NOT NULL,
        emotion_detected VARCHAR(50) NULL,
        topic_detected VARCHAR(50) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES ai_chat_sessions(id) ON DELETE CASCADE
      );
    `);

    // 7. Bảng mood_logs
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mood_logs (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        mood VARCHAR(50) NOT NULL,
        intensity TINYINT NOT NULL DEFAULT 3,
        note TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // 8. Bảng safety_shield_logs & admin_logs
    await pool.query(`
      CREATE TABLE IF NOT EXISTS safety_shield_logs (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        risk_level ENUM('SAFE', 'WARNING', 'DANGER') NOT NULL,
        emergency_alert BOOLEAN DEFAULT FALSE,
        flagged_issues TEXT NULL,
        advice TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_logs (
        id VARCHAR(36) PRIMARY KEY,
        admin_id VARCHAR(36) NOT NULL,
        action VARCHAR(100) NOT NULL,
        target_type VARCHAR(50) NOT NULL,
        target_id VARCHAR(36) NULL,
        details TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 9. Bảng chat_sessions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id VARCHAR(36) PRIMARY KEY,
        peer_a_id VARCHAR(36) NOT NULL,
        peer_b_id VARCHAR(36) NULL,
        topic VARCHAR(50) DEFAULT 'Tất cả',
        status ENUM('WAITING', 'CONNECTED', 'CLOSED') DEFAULT 'WAITING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Khởi tạo tài khoản Admin mặc định
    const [adminRows] = await pool.query('SELECT * FROM users WHERE role = ?', ['admin']);
    if (adminRows.length === 0) {
      await pool.query(
        'INSERT INTO users (id, username, anonymous_name, password_hash, role, status, is_guest) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['admin-master-id', 'admin', 'Quản trị viên (Admin)', config.admin.passwordHash, 'admin', 'ACTIVE', false]
      );
      console.log('[DB] Đã khởi tạo tài khoản Admin mặc định vào MySQL (username: admin)');
    }

    dbMode = 'mysql';
    console.log(`[DB Status: MYSQL] Kết nối thành công CSDL: ${config.db.database}`);
  } catch (error) {
    if (isProduction) {
      console.error('[DB FATAL] Môi trường Production bắt buộc kết nối MySQL:', error.message);
      throw error;
    }

    if (config.db.useFallback) {
      dbMode = 'local';
      const errDetail = error.code ? `${error.code} - ${error.message || ''}` : (error.message || error);
      console.warn(`[DB Status: LOCAL_FALLBACK] Không thể kết nối MySQL (${errDetail.trim()}).`);
      console.log('[DB] Đang sử dụng Local Persistent Store (server/data/store.json) cho môi trường phát triển.');

      const store = getLocalStore();
      const existingAdmin = store.users.find(u => u.role === 'admin');
      if (!existingAdmin) {
        store.users.push({
          id: 'admin-master-id',
          username: 'admin',
          anonymous_name: 'Quản trị viên (Admin)',
          password_hash: config.admin.passwordHash,
          role: 'admin',
          status: 'ACTIVE',
          is_guest: false,
          created_at: new Date().toISOString()
        });
        saveLocalStore(store);
        console.log('[DB] Đã khởi tạo tài khoản Admin mặc định trong Local Store (username: admin)');
      }
    } else {
      throw error;
    }
  }
}

function getDbMode() {
  return dbMode;
}

function getPool() {
  return pool;
}

module.exports = {
  initDb,
  getDbMode,
  getPool,
  getLocalStore,
  saveLocalStore
};
