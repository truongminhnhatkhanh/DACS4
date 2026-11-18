const express = require('express');
const { v4: uuidv4 } = require('uuid');
const {
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
  reportPost
} = require('../models/postModel');
const { createComment, getCommentsByPostId, deleteComment } = require('../models/commentModel');
const { inspectAndComfort } = require('../services/aiModerationService');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { postLimiter, commentLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// 1. Lấy danh sách bài viết đã duyệt trên bảng tin (Công khai, hỗ trợ lọc tâm trạng, từ khóa, phân trang)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { moodTag, keyword, page = 1, limit = 10 } = req.query;
    const currentUserId = req.user ? req.user.userId : null;

    const result = await getApprovedPosts({
      moodTag,
      keyword,
      page: Number(page),
      limit: Number(limit),
      currentUserId
    });

    return res.json(result);
  } catch (error) {
    console.error('Lỗi lấy bài viết:', error);
    return res.status(500).json({ error: 'Không thể tải danh sách bài viết.' });
  }
});

// 2. Lấy các bài viết của chính người dùng hiện tại (kể cả bài viết Chỉ mình tôi)
router.get('/me', authenticate, async (req, res) => {
  try {
    const myPosts = await getPostsByUserId(req.user.userId, req.user.userId);
    return res.json({ posts: myPosts });
  } catch (error) {
    console.error('Lỗi lấy bài viết của tôi:', error);
    return res.status(500).json({ error: 'Không thể tải bài viết của bạn.' });
  }
});

// 3. Lấy danh sách bài viết đã lưu (Bookmarks) của người dùng hiện tại
router.get('/saved', authenticate, async (req, res) => {
  try {
    const savedPosts = await getSavedPosts(req.user.userId);
    return res.json({ posts: savedPosts });
  } catch (error) {
    console.error('Lỗi lấy bài viết đã lưu:', error);
    return res.status(500).json({ error: 'Không thể tải danh sách bài viết đã lưu.' });
  }
});

// 4. Đăng bài viết tâm sự mới (Hỗ trợ chế độ Công khai vs Riêng tư 'Chỉ mình tôi')
router.post('/', authenticate, postLimiter, async (req, res) => {
  try {
    const { content, moodTag = 'Buồn bã', isPrivate = false, imageUrl = null } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Nội dung tâm sự không được để trống.' });
    }

    const postId = uuidv4();

    // Bước 1: Lưu bài viết với trạng thái PENDING
    const newPost = await createPost({
      id: postId,
      userId: req.user.userId,
      moodTag: moodTag.trim(),
      content: content.trim(),
      imageUrl: imageUrl ? imageUrl.trim() : null,
      isPrivate: Boolean(isPrivate),
      status: 'PENDING'
    });

    // Bước 2: AI kiểm duyệt nội dung độc hại & sinh câu an ủi
    const aiResult = await inspectAndComfort(newPost.content);

    if (aiResult.is_toxic || !aiResult.approved) {
      // Từ chối phê duyệt nếu nội dung độc hại
      await updatePostStatus(postId, 'REJECTED', aiResult.reason);
      return res.status(400).json({
        error: 'Bài viết không được phê duyệt do chứa nội dung không phù hợp với tiêu chuẩn an toàn cộng đồng.',
        reason: aiResult.reason,
        status: 'REJECTED'
      });
    }

    // Phê duyệt bài viết
    await updatePostStatus(postId, 'APPROVED', null);
    newPost.status = 'APPROVED';

    // Tự động tạo câu an ủi ấm áp từ Heli AI Buddy
    let comfortComment = null;
    if (aiResult.comfort_message) {
      comfortComment = await createComment({
        id: uuidv4(),
        postId: postId,
        userId: null,
        authorName: 'Heli AI Buddy',
        content: aiResult.comfort_message,
        isAiBot: true
      });
    }

    return res.status(201).json({
      message: isPrivate
        ? 'Tâm sự riêng tư của bạn đã được lưu an toàn (Chỉ mình bạn xem được).'
        : 'Bài viết tâm sự đã được chia sẻ thành công lên cộng đồng.',
      post: newPost,
      comfortMessage: aiResult.comfort_message,
      comfortComment
    });
  } catch (error) {
    console.error('Lỗi đăng bài viết:', error);
    return res.status(500).json({ error: 'Lỗi máy chủ khi đăng bài viết.' });
  }
});

// 5. Lấy chi tiết bài viết và danh sách bình luận (có cấu trúc cha-con)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const currentUserId = req.user ? req.user.userId : null;
    const post = await getPostById(req.params.id, currentUserId);
    if (!post) {
      return res.status(404).json({ error: 'Không tìm thấy bài viết.' });
    }

    // Nếu bài viết là riêng tư (is_private = 1), chỉ cho phép tác giả hoặc admin xem
    if (post.is_private && (!req.user || (req.user.userId !== post.user_id && req.user.role !== 'admin'))) {
      return res.status(403).json({ error: 'Bài viết này ở chế độ riêng tư (Chỉ mình tôi).' });
    }

    const comments = await getCommentsByPostId(req.params.id);
    return res.json({ post, comments });
  } catch (error) {
    console.error('Lỗi lấy chi tiết bài viết:', error);
    return res.status(500).json({ error: 'Không thể lấy thông tin bài viết.' });
  }
});

// 6. Chỉnh sửa bài viết cá nhân
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { content, moodTag, isPrivate, imageUrl } = req.body;
    const post = await getPostById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Bài viết không tồn tại.' });
    }

    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && post.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Bạn chỉ có quyền chỉnh sửa bài viết của chính mình.' });
    }

    // Nếu sửa nội dung, kiểm duyệt lại bằng AI
    if (content && content.trim() !== post.content) {
      const aiResult = await inspectAndComfort(content.trim());
      if (aiResult.is_toxic || !aiResult.approved) {
        return res.status(400).json({
          error: 'Nội dung chỉnh sửa chứa ngôn từ không phù hợp với tiêu chuẩn an toàn cộng đồng.',
          reason: aiResult.reason
        });
      }
    }

    const updatedPost = await updatePost(
      req.params.id,
      req.user.userId,
      {
        content: content ? content.trim() : undefined,
        moodTag,
        imageUrl,
        isPrivate
      },
      isAdmin
    );

    return res.json({
      message: 'Cập nhật bài viết thành công.',
      post: updatedPost
    });
  } catch (error) {
    console.error('Lỗi chỉnh sửa bài viết:', error);
    return res.status(500).json({ error: error.message || 'Không thể chỉnh sửa bài viết.' });
  }
});

// 7. Xóa bài viết cá nhân (Người viết hoặc Admin)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    await deletePost(req.params.id, req.user.userId, isAdmin);
    return res.json({ message: 'Đã xóa bài viết thành công.' });
  } catch (error) {
    console.error('Lỗi xóa bài viết:', error);
    if (error.message.includes('quyền')) {
      return res.status(403).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message || 'Không thể xóa bài viết.' });
  }
});

// 8. Tương tác Thích (Like / Bày tỏ đồng cảm)
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const post = await getPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Bài viết không tồn tại.' });
    }

    const result = await toggleLikePost(req.params.id, req.user.userId);
    return res.json({
      message: result.liked ? 'Đã thích bài viết' : 'Đã bỏ thích',
      liked: result.liked,
      likeCount: result.likeCount
    });
  } catch (error) {
    console.error('Lỗi thích bài viết:', error);
    return res.status(500).json({ error: 'Không thể thực hiện thao tác thích bài viết.' });
  }
});

// 9. Tương tác Lưu bài viết (Bookmark / Save)
router.post('/:id/save', authenticate, async (req, res) => {
  try {
    const post = await getPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Bài viết không tồn tại.' });
    }

    const result = await toggleSavePost(req.params.id, req.user.userId);
    return res.json({
      message: result.saved ? 'Đã lưu bài viết vào danh sách cá nhân' : 'Đã bỏ lưu bài viết',
      saved: result.saved
    });
  } catch (error) {
    console.error('Lỗi lưu bài viết:', error);
    return res.status(500).json({ error: 'Không thể thực hiện thao tác lưu bài viết.' });
  }
});

// 10. Báo cáo vi phạm bài viết
router.post('/:id/report', authenticate, async (req, res) => {
  try {
    const { reason, details } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Vui lòng cung cấp lý do báo cáo vi phạm.' });
    }

    const post = await getPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Bài viết không tồn tại.' });
    }

    const report = await reportPost({
      id: uuidv4(),
      postId: req.params.id,
      reporterId: req.user.userId,
      reason: reason.trim(),
      details: details ? details.trim() : null
    });

    return res.status(201).json({
      message: 'Báo cáo vi phạm đã được gửi đến Ban quản trị kiểm duyệt.',
      reportId: report.id
    });
  } catch (error) {
    console.error('Lỗi báo cáo bài viết:', error);
    return res.status(500).json({ error: 'Không thể gửi báo cáo vi phạm.' });
  }
});

// 11. Gửi bình luận hoặc câu trả lời đa cấp (Có AI kiểm duyệt độc hại)
router.post('/:id/comments', authenticate, commentLimiter, async (req, res) => {
  try {
    const { content, parentId } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Nội dung bình luận không được để trống.' });
    }

    const post = await getPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Bài viết không tồn tại.' });
    }

    // Kiểm duyệt bình luận bằng AI
    const aiResult = await inspectAndComfort(content.trim());
    if (aiResult.is_toxic) {
      return res.status(400).json({
        error: 'Bình luận chứa từ ngữ tiêu cực hoặc công kích, không thể đăng tải.',
        reason: aiResult.reason
      });
    }

    const comment = await createComment({
      id: uuidv4(),
      postId: req.params.id,
      parentId: parentId || null,
      userId: req.user.userId,
      authorName: req.user.anonymousName,
      content: content.trim(),
      isAiBot: false
    });

    return res.status(201).json({
      message: 'Bình luận thành công',
      comment
    });
  } catch (error) {
    console.error('Lỗi tạo bình luận:', error);
    return res.status(500).json({ error: 'Lỗi khi gửi bình luận.' });
  }
});

// 12. Xóa bình luận (Chính tác giả bình luận hoặc Admin)
router.delete('/:id/comments/:commentId', authenticate, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    await deleteComment(req.params.commentId, req.user.userId, isAdmin);
    return res.json({ message: 'Đã xóa bình luận thành công.' });
  } catch (error) {
    console.error('Lỗi xóa bình luận:', error);
    if (error.message.includes('quyền')) {
      return res.status(403).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message || 'Không thể xóa bình luận.' });
  }
});

module.exports = router;
