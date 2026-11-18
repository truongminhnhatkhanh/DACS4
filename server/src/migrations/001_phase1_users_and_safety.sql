-- =========================================================================
-- MIGRATION: 001_phase1_users_and_safety.sql
-- Mục đích: Nâng cấp bảng `users` an toàn, bảo tồn 100% dữ liệu cũ
-- Áp dụng: Phân hệ 1 (Tài khoản, Hồ sơ, Khóa tài khoản, Recovery Code HMAC-SHA256)
-- =========================================================================

USE `dacs4`;

-- 1. Thêm cột trạng thái tài khoản (ACTIVE, SUSPENDED, DELETED)
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'status');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `users` ADD COLUMN `status` ENUM("ACTIVE", "SUSPENDED", "DELETED") NOT NULL DEFAULT "ACTIVE" AFTER `role`;', 'SELECT "Column status already exists";');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2. Thêm cột ảnh đại diện tối giản (avatar_url)
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'avatar_url');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `users` ADD COLUMN `avatar_url` VARCHAR(255) NULL AFTER `anonymous_name`;', 'SELECT "Column avatar_url already exists";');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3. Thêm cột giới thiệu cá nhân (bio)
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'bio');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `users` ADD COLUMN `bio` TEXT NULL AFTER `avatar_url`;', 'SELECT "Column bio already exists";');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3.1 Thêm cột email khôi phục tùy chọn (recovery_email)
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'recovery_email');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `users` ADD COLUMN `recovery_email` VARCHAR(100) NULL AFTER `bio`;', 'SELECT "Column recovery_email already exists";');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3.2 Thêm index trên recovery_email
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND INDEX_NAME = 'idx_users_recovery_email');
SET @sql = IF(@idx_exists = 0, 'ALTER TABLE `users` ADD INDEX `idx_users_recovery_email` (`recovery_email`);', 'SELECT "Index idx_users_recovery_email already exists";');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 4. Thêm cột băm mã khôi phục HMAC-SHA256 (recovery_token_hash)
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'recovery_token_hash');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `users` ADD COLUMN `recovery_token_hash` VARCHAR(64) NULL AFTER `bio`;', 'SELECT "Column recovery_token_hash already exists";');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 5. Thêm chỉ mục UNIQUE trên recovery_token_hash để tìm kiếm O(1) và chống trùng lặp
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND INDEX_NAME = 'uniq_users_recovery_token');
SET @sql = IF(@idx_exists = 0, 'ALTER TABLE `users` ADD UNIQUE INDEX `uniq_users_recovery_token` (`recovery_token_hash`);', 'SELECT "Index uniq_users_recovery_token already exists";');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 6. Thêm cờ phân biệt khách vãng lai và tài khoản chính thức (is_guest)
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'is_guest');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `users` ADD COLUMN `is_guest` TINYINT(1) NOT NULL DEFAULT 0 AFTER `status`;', 'SELECT "Column is_guest already exists";');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 7. Thêm thời điểm đăng nhập gần nhất (last_login_at)
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'last_login_at');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `users` ADD COLUMN `last_login_at` TIMESTAMP NULL AFTER `is_guest`;', 'SELECT "Column last_login_at already exists";');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 8. Thêm thời điểm cập nhật (updated_at)
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'updated_at');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE `users` ADD COLUMN `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`;', 'SELECT "Column updated_at already exists";');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 9. Đồng bộ cờ is_guest cho dữ liệu hiện có (user nào có username = NULL hoặc recovery_code_hash != NULL thì là khách)
UPDATE `users` SET `is_guest` = 1 WHERE `username` IS NULL AND `role` != 'admin';
