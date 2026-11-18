-- =========================================================================
-- MIGRATION: 002_phase2_community.sql
-- Mục đích: Hỗ trợ Phân hệ 2 - Cộng đồng Tâm sự Ẩn danh
-- (Bài viết riêng tư, Thích bài, Lưu bài, Bình luận đa cấp, Báo cáo vi phạm)
-- =========================================================================

-- 1. Cột is_private cho bảng posts (0: Công khai, 1: Chỉ mình tôi)
ALTER TABLE `posts` 
  ADD COLUMN IF NOT EXISTS `is_private` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '0: Cong khai, 1: Chi minh toi';

-- 2. Cột parent_id cho bảng comments (Phản hồi đa cấp)
ALTER TABLE `comments` 
  ADD COLUMN IF NOT EXISTS `parent_id` VARCHAR(36) DEFAULT NULL COMMENT 'ID binh luan cha';

-- 3. Bảng post_likes (Lượt thích bài viết)
CREATE TABLE IF NOT EXISTS `post_likes` (
  `id` VARCHAR(36) NOT NULL,
  `post_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_post_user_like` (`post_id`, `user_id`),
  CONSTRAINT `fk_phase2_likes_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_phase2_likes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Bảng saved_posts (Bài viết đã lưu / Bookmarks)
CREATE TABLE IF NOT EXISTS `saved_posts` (
  `id` VARCHAR(36) NOT NULL,
  `post_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_phase2_saved_post_user` (`post_id`, `user_id`),
  CONSTRAINT `fk_phase2_saved_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_phase2_saved_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Bảng post_reports (Báo cáo vi phạm bài viết)
CREATE TABLE IF NOT EXISTS `post_reports` (
  `id` VARCHAR(36) NOT NULL,
  `post_id` VARCHAR(36) NOT NULL,
  `reporter_id` VARCHAR(36) NOT NULL,
  `reason` VARCHAR(255) NOT NULL,
  `details` TEXT DEFAULT NULL,
  `status` ENUM('PENDING', 'REVIEWING', 'RESOLVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  `resolved_by` VARCHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_post_reports_status` (`status`),
  CONSTRAINT `fk_phase2_reports_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_phase2_reports_reporter` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
