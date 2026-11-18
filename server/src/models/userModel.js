const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { getDbMode, getPool, getLocalStore, saveLocalStore } = require('../config/db');
const config = require('../config/env');

// Sinh mã khôi phục an toàn 16 ký tự bằng crypto.randomBytes
function generateSecureRecoveryCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Bỏ các ký tự dễ nhầm lẫn (0, O, 1, I)
  const bytes = crypto.randomBytes(16);
  let code = '';
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars[bytes[i] % chars.length];
  }
  return code; // Định dạng chuẩn: XXXX-XXXX-XXXX-XXXX
}

// Băm HMAC-SHA256 với secret phía server (O(1) indexed lookup)
function hashRecoveryCode(plainCode) {
  const normalized = (plainCode || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  return crypto.createHmac('sha256', config.recoverySecret).update(normalized).digest('hex');
}

async function createUser({
  id,
  username = null,
  anonymousName,
  avatarUrl = null,
  bio = null,
  recoveryEmail = null,
  recoveryTokenHash = null,
  recoveryCodeHash = null,
  passwordHash = null,
  role = 'user',
  status = 'ACTIVE',
  isGuest = false
}) {
  const dbMode = getDbMode();
  const now = new Date();
  const cleanEmail = recoveryEmail ? recoveryEmail.trim().toLowerCase() : null;

  if (dbMode === 'mysql') {
    const pool = getPool();
    await pool.query(
      `INSERT INTO users 
       (id, username, anonymous_name, avatar_url, bio, recovery_email, recovery_token_hash, recovery_code_hash, password_hash, role, status, is_guest, last_login_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, username, anonymousName, avatarUrl, bio, cleanEmail, recoveryTokenHash, recoveryCodeHash, passwordHash, role, status, isGuest ? 1 : 0, now, now]
    );
    return { id, username, anonymousName, avatarUrl, bio, recoveryEmail: cleanEmail, role, status, isGuest, createdAt: now };
  } else {
    const store = getLocalStore();
    const newUser = {
      id,
      username,
      anonymous_name: anonymousName,
      avatar_url: avatarUrl,
      bio,
      recovery_email: cleanEmail,
      recovery_token_hash: recoveryTokenHash,
      recovery_code_hash: recoveryCodeHash,
      password_hash: passwordHash,
      role,
      status,
      is_guest: Boolean(isGuest),
      last_login_at: now.toISOString(),
      created_at: now.toISOString()
    };
    store.users.push(newUser);
    saveLocalStore(store);
    return { id, username, anonymousName, avatarUrl, bio, recoveryEmail: cleanEmail, role, status, isGuest, createdAt: newUser.created_at };
  }
}

async function getUserById(id) {
  const dbMode = getDbMode();
  if (dbMode === 'mysql') {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  } else {
    const store = getLocalStore();
    return store.users.find(u => u.id === id) || null;
  }
}

async function findUserByUsername(username) {
  if (!username) return null;
  const dbMode = getDbMode();
  const clean = username.trim().toLowerCase();

  if (dbMode === 'mysql') {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM users WHERE LOWER(username) = ?', [clean]);
    return rows[0] || null;
  } else {
    const store = getLocalStore();
    return store.users.find(u => u.username && u.username.toLowerCase() === clean) || null;
  }
}

// Tra cứu người dùng bằng Email khôi phục tùy chọn
async function findUserByRecoveryEmail(email) {
  if (!email) return null;
  const dbMode = getDbMode();
  const clean = email.trim().toLowerCase();

  if (dbMode === 'mysql') {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM users WHERE LOWER(recovery_email) = ? AND status != "DELETED"', [clean]);
    return rows[0] || null;
  } else {
    const store = getLocalStore();
    return store.users.find(u => u.recovery_email && u.recovery_email.toLowerCase() === clean && u.status !== 'DELETED') || null;
  }
}

// Tra cứu mã khôi phục O(1) bằng HMAC-SHA256 (có migration chuyển đổi tự động cho dữ liệu bcrypt cũ)
async function findUserByRecoveryCode(plainCode) {
  if (!plainCode) return null;
  const clean = plainCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const tokenHash = hashRecoveryCode(clean);
  const dbMode = getDbMode();

  if (dbMode === 'mysql') {
    const pool = getPool();
    // 1. Tìm kiếm nhanh O(1) qua index HMAC-SHA256
    const [indexedRows] = await pool.query(
      'SELECT * FROM users WHERE recovery_token_hash = ? AND status != "DELETED"',
      [tokenHash]
    );
    if (indexedRows.length > 0) return indexedRows[0];

    // 2. Migration chuyển đổi: Tìm trong danh sách cũ có bcrypt
    const [legacyRows] = await pool.query(
      'SELECT * FROM users WHERE recovery_token_hash IS NULL AND recovery_code_hash IS NOT NULL AND status != "DELETED" LIMIT 20'
    );
    const rawCodeUpper = plainCode.trim().toUpperCase();
    for (const u of legacyRows) {
      const match = (await bcrypt.compare(clean, u.recovery_code_hash)) ||
                    (await bcrypt.compare(rawCodeUpper, u.recovery_code_hash));
      if (match) {
        // Tự động chuyển đổi: Lưu HMAC-SHA256 và xóa bcrypt hash để không chạy song song 2 cơ chế
        await pool.query(
          'UPDATE users SET recovery_token_hash = ?, recovery_code_hash = NULL WHERE id = ?',
          [tokenHash, u.id]
        );
        u.recovery_token_hash = tokenHash;
        u.recovery_code_hash = null;
        return u;
      }
    }
    return null;
  } else {
    const store = getLocalStore();
    // 1. Tra cứu O(1)
    const match = store.users.find(u => u.recovery_token_hash === tokenHash && u.status !== 'DELETED');
    if (match) return match;

    // 2. Legacy fallback & migration
    const rawCodeUpper = plainCode.trim().toUpperCase();
    for (const u of store.users) {
      if (!u.recovery_token_hash && u.recovery_code_hash && u.status !== 'DELETED') {
        const isMatch = (await bcrypt.compare(clean, u.recovery_code_hash)) ||
                        (await bcrypt.compare(rawCodeUpper, u.recovery_code_hash));
        if (isMatch) {
          u.recovery_token_hash = tokenHash;
          u.recovery_code_hash = null; // Xóa hash cũ
          saveLocalStore(store);
          return u;
        }
      }
    }
    return null;
  }
}

// Cấp lại mã khôi phục mới (Vô hiệu hóa mã cũ ngay lập tức)
async function regenerateRecoveryCode(userId) {
  const newPlainCode = generateSecureRecoveryCode();
  const newHash = hashRecoveryCode(newPlainCode);
  const dbMode = getDbMode();

  if (dbMode === 'mysql') {
    const pool = getPool();
    await pool.query(
      'UPDATE users SET recovery_token_hash = ?, recovery_code_hash = NULL WHERE id = ?',
      [newHash, userId]
    );
  } else {
    const store = getLocalStore();
    const u = store.users.find(user => user.id === userId);
    if (u) {
      u.recovery_token_hash = newHash;
      u.recovery_code_hash = null;
      saveLocalStore(store);
    }
  }

  return { newRecoveryCode: newPlainCode };
}

async function updateUserProfile(id, { anonymousName, avatarUrl, bio, recoveryEmail }) {
  const dbMode = getDbMode();
  const cleanEmail = recoveryEmail !== undefined
    ? (recoveryEmail ? recoveryEmail.trim().toLowerCase() : null)
    : undefined;

  if (dbMode === 'mysql') {
    const pool = getPool();
    const updates = [];
    const params = [];

    if (anonymousName !== undefined) { updates.push('anonymous_name = ?'); params.push(anonymousName); }
    if (avatarUrl !== undefined) { updates.push('avatar_url = ?'); params.push(avatarUrl); }
    if (bio !== undefined) { updates.push('bio = ?'); params.push(bio); }
    if (cleanEmail !== undefined) { updates.push('recovery_email = ?'); params.push(cleanEmail); }

    if (updates.length > 0) {
      params.push(id);
      await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    }
    return getUserById(id);
  } else {
    const store = getLocalStore();
    const user = store.users.find(u => u.id === id);
    if (user) {
      if (anonymousName !== undefined) user.anonymous_name = anonymousName;
      if (avatarUrl !== undefined) user.avatar_url = avatarUrl;
      if (bio !== undefined) user.bio = bio;
      if (cleanEmail !== undefined) user.recovery_email = cleanEmail;
      saveLocalStore(store);
    }
    return user || null;
  }
}

async function changePassword(id, newPasswordHash) {
  const dbMode = getDbMode();
  if (dbMode === 'mysql') {
    const pool = getPool();
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newPasswordHash, id]);
    return true;
  } else {
    const store = getLocalStore();
    const user = store.users.find(u => u.id === id);
    if (user) {
      user.password_hash = newPasswordHash;
      saveLocalStore(store);
      return true;
    }
    return false;
  }
}

async function updateUserStatus(id, newStatus) {
  const dbMode = getDbMode();
  if (dbMode === 'mysql') {
    const pool = getPool();
    await pool.query('UPDATE users SET status = ? WHERE id = ?', [newStatus, id]);
    return true;
  } else {
    const store = getLocalStore();
    const user = store.users.find(u => u.id === id);
    if (user) {
      user.status = newStatus;
      saveLocalStore(store);
      return true;
    }
    return false;
  }
}

async function recordLastLogin(id) {
  const dbMode = getDbMode();
  const now = new Date();
  if (dbMode === 'mysql') {
    const pool = getPool();
    await pool.query('UPDATE users SET last_login_at = ? WHERE id = ?', [now, id]);
  } else {
    const store = getLocalStore();
    const user = store.users.find(u => u.id === id);
    if (user) {
      user.last_login_at = now.toISOString();
      saveLocalStore(store);
    }
  }
}

async function countUsers() {
  const dbMode = getDbMode();
  if (dbMode === 'mysql') {
    const pool = getPool();
    const [rows] = await pool.query('SELECT COUNT(*) as total FROM users WHERE role = "user" AND status = "ACTIVE"');
    return rows[0].total;
  } else {
    const store = getLocalStore();
    return store.users.filter(u => u.role === 'user' && u.status === 'ACTIVE').length;
  }
}

async function getAllUsersAdmin() {
  const dbMode = getDbMode();
  if (dbMode === 'mysql') {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, username, anonymous_name, avatar_url, bio, recovery_email, role, status, is_guest, last_login_at, created_at FROM users ORDER BY created_at DESC'
    );
    return rows;
  } else {
    const store = getLocalStore();
    return store.users.map(({ password_hash, recovery_code_hash, recovery_token_hash, ...rest }) => rest);
  }
}

module.exports = {
  generateSecureRecoveryCode,
  hashRecoveryCode,
  createUser,
  getUserById,
  findUserByUsername,
  findUserByRecoveryEmail,
  findUserByRecoveryCode,
  regenerateRecoveryCode,
  updateUserProfile,
  changePassword,
  updateUserStatus,
  recordLastLogin,
  countUsers,
  getAllUsersAdmin
};
