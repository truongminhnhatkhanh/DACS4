const { v4: uuidv4 } = require('uuid');
const { getDbMode, getPool, getLocalStore, saveLocalStore } = require('../config/db');

async function createPost({ id, userId, moodTag, content, imageUrl = null, isPrivate = false, status = 'PENDING', rejectionReason = null }) {
  const dbMode = getDbMode();
  const createdAt = new Date();
  const isPrivateVal = isPrivate ? 1 : 0;

  if (dbMode === 'mysql') {
    const pool = getPool();
    await pool.query(
      `INSERT INTO posts (id, user_id, mood_tag, content, image_url, is_private, status, rejection_reason, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, moodTag, content, imageUrl, isPrivateVal, status, rejectionReason, createdAt, createdAt]
    );
    return {
      id,
      userId,
      moodTag,
      content,
      imageUrl,
      isPrivate: Boolean(isPrivate),
      status,
      rejectionReason,
      createdAt
    };
  } else {
    const store = getLocalStore();
    const newPost = {
      id,
      user_id: userId,
      mood_tag: moodTag,
      content,
      image_url: imageUrl,
      is_private: Boolean(isPrivate),
      status,
      rejection_reason: rejectionReason,
      created_at: createdAt.toISOString(),
      updated_at: createdAt.toISOString()
    };
    store.posts.unshift(newPost);
    saveLocalStore(store);
    return newPost;
  }
}

async function updatePostStatus(id, status, rejectionReason = null) {
  const dbMode = getDbMode();
  if (dbMode === 'mysql') {
    const pool = getPool();
    await pool.query(
      'UPDATE posts SET status = ?, rejection_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, rejectionReason, id]
    );
  } else {
    const store = getLocalStore();
    const post = store.posts.find(p => p.id === id);
    if (post) {
      post.status = status;
      post.rejection_reason = rejectionReason;
      post.updated_at = new Date().toISOString();
      saveLocalStore(store);
    }
  }
}

async function updatePost(id, userId, { content, moodTag, imageUrl, isPrivate }, isAdmin = false) {
  const dbMode = getDbMode();
  if (dbMode === 'mysql') {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [id]);
    const post = rows[0];
    if (!post) throw new Error('Không tìm thấy bài viết.');

    if (!isAdmin && post.user_id !== userId) {
      throw new Error('Bạn không có quyền chỉnh sửa bài viết này.');
    }

    const updatedContent = content !== undefined ? content : post.content;
    const updatedMood = moodTag !== undefined ? moodTag : post.mood_tag;
    const updatedImage = imageUrl !== undefined ? imageUrl : post.image_url;
    const updatedPrivate = isPrivate !== undefined ? (isPrivate ? 1 : 0) : post.is_private;

    await pool.query(
      'UPDATE posts SET content = ?, mood_tag = ?, image_url = ?, is_private = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [updatedContent, updatedMood, updatedImage, updatedPrivate, id]
    );

    return getPostById(id, userId);
  } else {
    const store = getLocalStore();
    const post = store.posts.find(p => p.id === id);
    if (!post) throw new Error('Không tìm thấy bài viết.');

    if (!isAdmin && post.user_id !== userId) {
      throw new Error('Bạn không có quyền chỉnh sửa bài viết này.');
    }

    if (content !== undefined) post.content = content;
    if (moodTag !== undefined) post.mood_tag = moodTag;
    if (imageUrl !== undefined) post.image_url = imageUrl;
    if (isPrivate !== undefined) post.is_private = Boolean(isPrivate);
    post.updated_at = new Date().toISOString();
    saveLocalStore(store);

    return getPostById(id, userId);
  }
}

async function deletePost(id, userId = null, isAdmin = false) {
  const dbMode = getDbMode();
  if (dbMode === 'mysql') {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [id]);
    const post = rows[0];
    if (!post) throw new Error('Không tìm thấy bài viết.');

    if (userId && !isAdmin && post.user_id !== userId) {
      throw new Error('Bạn không có quyền xóa bài viết này.');
    }

    await pool.query('DELETE FROM posts WHERE id = ?', [id]);
    return true;
  } else {
    const store = getLocalStore();
    const postIndex = store.posts.findIndex(p => p.id === id);
    if (postIndex === -1) throw new Error('Không tìm thấy bài viết.');

    const post = store.posts[postIndex];
    if (userId && !isAdmin && post.user_id !== userId) {
      throw new Error('Bạn không có quyền xóa bài viết này.');
    }

    store.posts = store.posts.filter(p => p.id !== id);
    store.comments = store.comments.filter(c => c.post_id !== id);
    store.post_likes = (store.post_likes || []).filter(l => l.post_id !== id);
    store.saved_posts = (store.saved_posts || []).filter(s => s.post_id !== id);
    store.post_reports = (store.post_reports || []).filter(r => r.post_id !== id);
    saveLocalStore(store);
    return true;
  }
}

async function getPostById(id, currentUserId = null) {
  const dbMode = getDbMode();
  if (dbMode === 'mysql') {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT p.*, u.anonymous_name, u.avatar_url,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comment_count,
        (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) as like_count,
        EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ?) as user_has_liked,
        EXISTS(SELECT 1 FROM saved_posts sp WHERE sp.post_id = p.id AND sp.user_id = ?) as user_has_saved
       FROM posts p 
       LEFT JOIN users u ON p.user_id = u.id 
       WHERE p.id = ?`,
      [currentUserId || '', currentUserId || '', id]
    );
    if (!rows[0]) return null;
    return {
      ...rows[0],
      is_private: Boolean(rows[0].is_private),
      user_has_liked: Boolean(rows[0].user_has_liked),
      user_has_saved: Boolean(rows[0].user_has_saved)
    };
  } else {
    const store = getLocalStore();
    const post = store.posts.find(p => p.id === id);
    if (!post) return null;
    const user = store.users.find(u => u.id === post.user_id);
    const comments = store.comments.filter(c => c.post_id === id);
    const likes = (store.post_likes || []).filter(l => l.post_id === id);
    const hasLiked = currentUserId ? likes.some(l => l.user_id === currentUserId) : false;
    const hasSaved = currentUserId ? (store.saved_posts || []).some(s => s.post_id === id && s.user_id === currentUserId) : false;

    return {
      ...post,
      anonymous_name: user ? user.anonymous_name : 'Người dùng ẩn danh',
      avatar_url: user ? user.avatar_url : null,
      comment_count: comments.length,
      like_count: likes.length,
      user_has_liked: hasLiked,
      user_has_saved: hasSaved,
      is_private: Boolean(post.is_private)
    };
  }
}

async function getApprovedPosts({ moodTag = null, keyword = null, page = 1, limit = 10, currentUserId = null } = {}) {
  const dbMode = getDbMode();
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 10));
  const offset = (safePage - 1) * safeLimit;

  if (dbMode === 'mysql') {
    const pool = getPool();
    let whereClause = "WHERE p.status = 'APPROVED' AND (p.is_private = 0 OR p.is_private IS NULL)";
    const params = [];

    if (moodTag && moodTag !== 'Tất cả') {
      whereClause += ' AND p.mood_tag = ?';
      params.push(moodTag);
    }

    if (keyword && keyword.trim()) {
      whereClause += ' AND p.content LIKE ?';
      params.push(`%${keyword.trim()}%`);
    }

    // Đếm tổng số bài viết phù hợp
    const countQuery = `SELECT COUNT(*) as total FROM posts p ${whereClause}`;
    const [countRows] = await pool.query(countQuery, params);
    const total = countRows[0].total;

    // Lấy danh sách phân trang
    const selectQuery = `
      SELECT p.*, u.anonymous_name, u.avatar_url,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comment_count,
        (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) as like_count,
        EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ?) as user_has_liked,
        EXISTS(SELECT 1 FROM saved_posts sp WHERE sp.post_id = p.id AND sp.user_id = ?) as user_has_saved
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const queryParams = [currentUserId || '', currentUserId || '', ...params, safeLimit, offset];
    const [rows] = await pool.query(selectQuery, queryParams);

    const posts = rows.map(r => ({
      ...r,
      is_private: Boolean(r.is_private),
      user_has_liked: Boolean(r.user_has_liked),
      user_has_saved: Boolean(r.user_has_saved)
    }));

    return {
      posts,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit) || 1
    };
  } else {
    const store = getLocalStore();
    let list = store.posts.filter(p => p.status === 'APPROVED' && !p.is_private);

    if (moodTag && moodTag !== 'Tất cả') {
      list = list.filter(p => p.mood_tag === moodTag);
    }

    if (keyword && keyword.trim()) {
      const q = keyword.trim().toLowerCase();
      list = list.filter(p => (p.content || '').toLowerCase().includes(q));
    }

    const total = list.length;
    const paginated = list.slice(offset, offset + safeLimit).map(p => {
      const user = store.users.find(u => u.id === p.user_id);
      const comments = store.comments.filter(c => c.post_id === p.id);
      const likes = (store.post_likes || []).filter(l => l.post_id === p.id);
      const hasLiked = currentUserId ? likes.some(l => l.user_id === currentUserId) : false;
      const hasSaved = currentUserId ? (store.saved_posts || []).some(s => s.post_id === p.id && s.user_id === currentUserId) : false;

      return {
        ...p,
        anonymous_name: user ? user.anonymous_name : 'Người dùng ẩn danh',
        avatar_url: user ? user.avatar_url : null,
        comment_count: comments.length,
        like_count: likes.length,
        user_has_liked: hasLiked,
        user_has_saved: hasSaved,
        is_private: Boolean(p.is_private)
      };
    });

    return {
      posts: paginated,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit) || 1
    };
  }
}

async function getPostsByUserId(userId, currentUserId = null) {
  const dbMode = getDbMode();
  if (dbMode === 'mysql') {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT p.*, u.anonymous_name, u.avatar_url,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comment_count,
        (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) as like_count,
        EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ?) as user_has_liked,
        EXISTS(SELECT 1 FROM saved_posts sp WHERE sp.post_id = p.id AND sp.user_id = ?) as user_has_saved
       FROM posts p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC`,
      [currentUserId || userId, currentUserId || userId, userId]
    );
    return rows.map(r => ({
      ...r,
      is_private: Boolean(r.is_private),
      user_has_liked: Boolean(r.user_has_liked),
      user_has_saved: Boolean(r.user_has_saved)
    }));
  } else {
    const store = getLocalStore();
    const list = store.posts.filter(p => p.user_id === userId);
    return list.map(p => {
      const user = store.users.find(u => u.id === p.user_id);
      const comments = store.comments.filter(c => c.post_id === p.id);
      const likes = (store.post_likes || []).filter(l => l.post_id === p.id);
      const hasLiked = (currentUserId || userId) ? likes.some(l => l.user_id === (currentUserId || userId)) : false;
      const hasSaved = (currentUserId || userId) ? (store.saved_posts || []).some(s => s.post_id === p.id && s.user_id === (currentUserId || userId)) : false;

      return {
        ...p,
        anonymous_name: user ? user.anonymous_name : 'Người dùng ẩn danh',
        avatar_url: user ? user.avatar_url : null,
        comment_count: comments.length,
        like_count: likes.length,
        user_has_liked: hasLiked,
        user_has_saved: hasSaved,
        is_private: Boolean(p.is_private)
      };
    });
  }
}

async function toggleLikePost(postId, userId) {
  const dbMode = getDbMode();
  if (dbMode === 'mysql') {
    const pool = getPool();
    // Kiểm tra xem đã like chưa
    const [existing] = await pool.query(
      'SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?',
      [postId, userId]
    );

    let liked = false;
    if (existing.length > 0) {
      await pool.query('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?', [postId, userId]);
      liked = false;
    } else {
      await pool.query(
        'INSERT INTO post_likes (id, post_id, user_id, created_at) VALUES (?, ?, ?, ?)',
        [uuidv4(), postId, userId, new Date()]
      );
      liked = true;
    }

    const [countRows] = await pool.query('SELECT COUNT(*) as count FROM post_likes WHERE post_id = ?', [postId]);
    return { liked, likeCount: countRows[0].count };
  } else {
    const store = getLocalStore();
    if (!store.post_likes) store.post_likes = [];
    const index = store.post_likes.findIndex(l => l.post_id === postId && l.user_id === userId);

    let liked = false;
    if (index !== -1) {
      store.post_likes.splice(index, 1);
      liked = false;
    } else {
      store.post_likes.push({
        id: uuidv4(),
        post_id: postId,
        user_id: userId,
        created_at: new Date().toISOString()
      });
      liked = true;
    }
    saveLocalStore(store);

    const likeCount = store.post_likes.filter(l => l.post_id === postId).length;
    return { liked, likeCount };
  }
}

async function toggleSavePost(postId, userId) {
  const dbMode = getDbMode();
  if (dbMode === 'mysql') {
    const pool = getPool();
    const [existing] = await pool.query(
      'SELECT id FROM saved_posts WHERE post_id = ? AND user_id = ?',
      [postId, userId]
    );

    let saved = false;
    if (existing.length > 0) {
      await pool.query('DELETE FROM saved_posts WHERE post_id = ? AND user_id = ?', [postId, userId]);
      saved = false;
    } else {
      await pool.query(
        'INSERT INTO saved_posts (id, post_id, user_id, created_at) VALUES (?, ?, ?, ?)',
        [uuidv4(), postId, userId, new Date()]
      );
      saved = true;
    }

    return { saved };
  } else {
    const store = getLocalStore();
    if (!store.saved_posts) store.saved_posts = [];
    const index = store.saved_posts.findIndex(s => s.post_id === postId && s.user_id === userId);

    let saved = false;
    if (index !== -1) {
      store.saved_posts.splice(index, 1);
      saved = false;
    } else {
      store.saved_posts.push({
        id: uuidv4(),
        post_id: postId,
        user_id: userId,
        created_at: new Date().toISOString()
      });
      saved = true;
    }
    saveLocalStore(store);
    return { saved };
  }
}

async function getSavedPosts(userId) {
  const dbMode = getDbMode();
  if (dbMode === 'mysql') {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT p.*, u.anonymous_name, u.avatar_url,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comment_count,
        (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) as like_count,
        EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ?) as user_has_liked,
        TRUE as user_has_saved,
        sp.created_at as saved_at
       FROM saved_posts sp
       JOIN posts p ON sp.post_id = p.id
       LEFT JOIN users u ON p.user_id = u.id
       WHERE sp.user_id = ?
       ORDER BY sp.created_at DESC`,
      [userId, userId]
    );
    return rows.map(r => ({
      ...r,
      is_private: Boolean(r.is_private),
      user_has_liked: Boolean(r.user_has_liked),
      user_has_saved: true
    }));
  } else {
    const store = getLocalStore();
    const savedEntries = (store.saved_posts || []).filter(s => s.user_id === userId);
    return savedEntries.map(s => {
      const p = store.posts.find(item => item.id === s.post_id);
      if (!p) return null;
      const user = store.users.find(u => u.id === p.user_id);
      const comments = store.comments.filter(c => c.post_id === p.id);
      const likes = (store.post_likes || []).filter(l => l.post_id === p.id);
      const hasLiked = likes.some(l => l.user_id === userId);

      return {
        ...p,
        anonymous_name: user ? user.anonymous_name : 'Người dùng ẩn danh',
        avatar_url: user ? user.avatar_url : null,
        comment_count: comments.length,
        like_count: likes.length,
        user_has_liked: hasLiked,
        user_has_saved: true,
        is_private: Boolean(p.is_private),
        saved_at: s.created_at
      };
    }).filter(Boolean);
  }
}

async function reportPost({ id, postId, reporterId, reason, details = null }) {
  const dbMode = getDbMode();
  const createdAt = new Date();

  if (dbMode === 'mysql') {
    const pool = getPool();
    await pool.query(
      `INSERT INTO post_reports (id, post_id, reporter_id, reason, details, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'PENDING', ?)`,
      [id, postId, reporterId, reason, details, createdAt]
    );
    return { id, postId, reporterId, reason, details, status: 'PENDING', createdAt };
  } else {
    const store = getLocalStore();
    if (!store.post_reports) store.post_reports = [];
    const newReport = {
      id,
      post_id: postId,
      reporter_id: reporterId,
      reason,
      details,
      status: 'PENDING',
      created_at: createdAt.toISOString()
    };
    store.post_reports.push(newReport);
    saveLocalStore(store);
    return newReport;
  }
}

async function getPostReports({ status = null } = {}) {
  const dbMode = getDbMode();
  if (dbMode === 'mysql') {
    const pool = getPool();
    let query = `
      SELECT r.*, p.content as post_content, p.mood_tag as post_mood,
             u.anonymous_name as reporter_name,
             author.anonymous_name as author_name
      FROM post_reports r
      LEFT JOIN posts p ON r.post_id = p.id
      LEFT JOIN users u ON r.reporter_id = u.id
      LEFT JOIN users author ON p.user_id = author.id
    `;
    const params = [];
    if (status) {
      query += ' WHERE r.status = ?';
      params.push(status);
    }
    query += ' ORDER BY r.created_at DESC';

    const [rows] = await pool.query(query, params);
    return rows;
  } else {
    const store = getLocalStore();
    let list = store.post_reports || [];
    if (status) {
      list = list.filter(r => r.status === status);
    }
    return list.map(r => {
      const p = store.posts.find(item => item.id === r.post_id);
      const reporter = store.users.find(u => u.id === r.reporter_id);
      const author = p ? store.users.find(u => u.id === p.user_id) : null;
      return {
        ...r,
        post_content: p ? p.content : '[Bài viết đã bị xóa]',
        post_mood: p ? p.mood_tag : null,
        reporter_name: reporter ? reporter.anonymous_name : 'Người dùng ẩn danh',
        author_name: author ? author.anonymous_name : 'Tác giả'
      };
    });
  }
}

async function resolvePostReport(reportId, status, resolvedBy = null) {
  const dbMode = getDbMode();
  if (dbMode === 'mysql') {
    const pool = getPool();
    await pool.query(
      'UPDATE post_reports SET status = ?, resolved_by = ? WHERE id = ?',
      [status, resolvedBy, reportId]
    );
    return true;
  } else {
    const store = getLocalStore();
    const report = (store.post_reports || []).find(r => r.id === reportId);
    if (report) {
      report.status = status;
      report.resolved_by = resolvedBy;
      saveLocalStore(store);
      return true;
    }
    return false;
  }
}

async function getAllPostsAdmin() {
  const dbMode = getDbMode();
  if (dbMode === 'mysql') {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT p.*, u.anonymous_name,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comment_count,
        (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM post_reports pr WHERE pr.post_id = p.id) as report_count
       FROM posts p
       LEFT JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC`
    );
    return rows.map(r => ({
      ...r,
      is_private: Boolean(r.is_private)
    }));
  } else {
    const store = getLocalStore();
    return store.posts.map(p => {
      const user = store.users.find(u => u.id === p.user_id);
      const comments = store.comments.filter(c => c.post_id === p.id);
      const likes = (store.post_likes || []).filter(l => l.post_id === p.id);
      const reports = (store.post_reports || []).filter(r => r.post_id === p.id);
      return {
        ...p,
        anonymous_name: user ? user.anonymous_name : 'Người dùng ẩn danh',
        comment_count: comments.length,
        like_count: likes.length,
        report_count: reports.length,
        is_private: Boolean(p.is_private)
      };
    });
  }
}

async function countPosts() {
  const dbMode = getDbMode();
  if (dbMode === 'mysql') {
    const pool = getPool();
    const [rows] = await pool.query('SELECT COUNT(*) as total FROM posts');
    return rows[0].total;
  } else {
    const store = getLocalStore();
    return store.posts.length;
  }
}

module.exports = {
  createPost,
  updatePostStatus,
  updatePost,
  deletePost,
  getPostById,
  getApprovedPosts,
  getPostsByUserId,
  toggleLikePost,
  toggleSavePost,
  getSavedPosts,
  reportPost,
  getPostReports,
  resolvePostReport,
  getAllPostsAdmin,
  countPosts
};
