const { getDbMode, getPool, getLocalStore, saveLocalStore } = require('../config/db');

async function createComment({ id, postId, parentId = null, userId = null, authorName, content, isAiBot = false }) {
  const dbMode = getDbMode();
  const createdAt = new Date();

  if (dbMode === 'mysql') {
    const pool = getPool();
    await pool.query(
      'INSERT INTO comments (id, post_id, parent_id, user_id, author_name, content, is_ai_bot, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, postId, parentId || null, userId, authorName, content, isAiBot, createdAt]
    );
    return { id, postId, parentId: parentId || null, userId, authorName, content, isAiBot, createdAt };
  } else {
    const store = getLocalStore();
    const newComment = {
      id,
      post_id: postId,
      parent_id: parentId || null,
      user_id: userId,
      author_name: authorName,
      content,
      is_ai_bot: isAiBot,
      created_at: createdAt.toISOString()
    };
    store.comments.push(newComment);
    saveLocalStore(store);
    return newComment;
  }
}

async function getCommentById(id) {
  const dbMode = getDbMode();
  if (dbMode === 'mysql') {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM comments WHERE id = ?', [id]);
    return rows[0] || null;
  } else {
    const store = getLocalStore();
    return store.comments.find(c => c.id === id) || null;
  }
}

async function getCommentsByPostId(postId) {
  const dbMode = getDbMode();
  if (dbMode === 'mysql') {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT c.*, u.avatar_url 
       FROM comments c 
       LEFT JOIN users u ON c.user_id = u.id 
       WHERE c.post_id = ? 
       ORDER BY c.created_at ASC`,
      [postId]
    );
    return rows;
  } else {
    const store = getLocalStore();
    const comments = store.comments
      .filter(c => c.post_id === postId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    return comments.map(c => {
      const user = store.users.find(u => u.id === c.user_id);
      return {
        ...c,
        avatar_url: user ? user.avatar_url : null
      };
    });
  }
}

async function deleteComment(id, userId = null, isAdmin = false) {
  const dbMode = getDbMode();
  if (dbMode === 'mysql') {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM comments WHERE id = ?', [id]);
    const comment = rows[0];
    if (!comment) throw new Error('Không tìm thấy bình luận.');

    if (!isAdmin && comment.user_id !== userId) {
      throw new Error('Bạn không có quyền xóa bình luận này.');
    }

    // Xóa cascade các phản hồi con nếu có
    await pool.query('DELETE FROM comments WHERE id = ? OR parent_id = ?', [id, id]);
    return true;
  } else {
    const store = getLocalStore();
    const commentIndex = store.comments.findIndex(c => c.id === id);
    if (commentIndex === -1) throw new Error('Không tìm thấy bình luận.');

    const comment = store.comments[commentIndex];
    if (!isAdmin && comment.user_id !== userId) {
      throw new Error('Bạn không có quyền xóa bình luận này.');
    }

    // Xóa bình luận và các phản hồi con
    store.comments = store.comments.filter(c => c.id !== id && c.parent_id !== id);
    saveLocalStore(store);
    return true;
  }
}

module.exports = {
  createComment,
  getCommentById,
  getCommentsByPostId,
  deleteComment
};
