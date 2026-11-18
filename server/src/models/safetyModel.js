const { getDbMode, getPool, getLocalStore, saveLocalStore } = require('../config/db');

async function logSafetyShield({ id, userId, riskLevel, emergencyAlert = false, flaggedIssues = [] }) {
  const dbMode = getDbMode();
  const createdAt = new Date();
  const issuesJson = JSON.stringify(flaggedIssues);

  if (dbMode === 'mysql') {
    const pool = getPool();
    await pool.query(
      'INSERT INTO safety_shield_logs (id, user_id, risk_level, emergency_alert, flagged_issues, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, userId, riskLevel, emergencyAlert, issuesJson, createdAt]
    );
    return { id, userId, riskLevel, emergencyAlert, flaggedIssues, createdAt };
  } else {
    const store = getLocalStore();
    const newLog = {
      id,
      user_id: userId,
      risk_level: riskLevel,
      emergency_alert: emergencyAlert,
      flagged_issues: issuesJson,
      created_at: createdAt.toISOString()
    };
    store.safety_shield_logs.unshift(newLog);
    saveLocalStore(store);
    return newLog;
  }
}

async function countSafetyLogs() {
  const dbMode = getDbMode();
  if (dbMode === 'mysql') {
    const pool = getPool();
    const [rows] = await pool.query('SELECT COUNT(*) as total FROM safety_shield_logs');
    return rows[0].total;
  } else {
    const store = getLocalStore();
    return store.safety_shield_logs.length;
  }
}

async function getRecentSafetyLogs(limit = 10) {
  const dbMode = getDbMode();
  if (dbMode === 'mysql') {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT s.*, u.anonymous_name 
       FROM safety_shield_logs s
       LEFT JOIN users u ON s.user_id = u.id
       ORDER BY s.created_at DESC LIMIT ?`,
      [Number(limit)]
    );
    return rows.map(r => ({
      ...r,
      flagged_issues: typeof r.flagged_issues === 'string' ? JSON.parse(r.flagged_issues || '[]') : r.flagged_issues
    }));
  } else {
    const store = getLocalStore();
    return store.safety_shield_logs.slice(0, limit).map(log => {
      const user = store.users.find(u => u.id === log.user_id);
      return {
        ...log,
        anonymous_name: user ? user.anonymous_name : 'Người dùng ẩn danh',
        flagged_issues: typeof log.flagged_issues === 'string' ? JSON.parse(log.flagged_issues || '[]') : log.flagged_issues
      };
    });
  }
}

module.exports = {
  logSafetyShield,
  countSafetyLogs,
  getRecentSafetyLogs
};
