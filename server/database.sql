-- =========================================================================
-- DATABASE: HELI - HỆ THỐNG TÂM SỰ ẨN DANH HYBRID P2P & TRỢ LÝ AI AN TOÀN
-- Bảng mã: UTF8MB4 (Hỗ trợ tiếng Việt đầy đủ và Emoji cảm xúc)
-- =========================================================================

-- 1. Khởi tạo Cơ sở Dữ liệu
CREATE DATABASE IF NOT EXISTS `dacs4`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `dacs4`;

-- Tạm thời tắt kiểm tra khóa ngoại để tránh xung đột khi import lại
SET FOREIGN_KEY_CHECKS = 0;

-- -------------------------------------------------------------------------
-- 2. Bảng: users (Người dùng, Tài khoản Đăng ký & Khách Ẩn danh)
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` VARCHAR(36) NOT NULL COMMENT 'Mã định danh UUID v4',
  `username` VARCHAR(50) UNIQUE DEFAULT NULL COMMENT 'Tên đăng nhập (nếu đã đăng ký)',
  `anonymous_name` VARCHAR(50) NOT NULL COMMENT 'Bút danh hiển thị ẩn danh (Anonymous_XXXX hoặc tự đặt)',
  `recovery_code_hash` VARCHAR(255) DEFAULT NULL COMMENT 'Mã khôi phục hash bcrypt (dành cho khách)',
  `password_hash` VARCHAR(255) DEFAULT NULL COMMENT 'Mật khẩu hash bcrypt (dành cho user đăng ký & admin)',
  `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user' COMMENT 'Phân quyền: user hoặc admin',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm tạo',
  PRIMARY KEY (`id`),
  INDEX `idx_users_username` (`username`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 3. Bảng: posts (Bài viết tâm sự trên Bảng tin)
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS `posts`;
CREATE TABLE `posts` (
  `id` VARCHAR(36) NOT NULL COMMENT 'Mã UUID v4 bài viết',
  `user_id` VARCHAR(36) NOT NULL COMMENT 'ID người đăng',
  `mood_tag` VARCHAR(30) NOT NULL DEFAULT 'Buồn bã' COMMENT 'Cảm xúc: Buồn bã, Cô đơn, Áp lực, Tuyệt vọng, v.v.',
  `content` TEXT NOT NULL COMMENT 'Nội dung bài viết tâm sự',
  `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING' COMMENT 'Chu trình duyệt: Chờ duyệt -> Đã duyệt / Bị từ chối',
  `rejection_reason` VARCHAR(255) DEFAULT NULL COMMENT 'Lý do AI từ chối nếu chứa ngôn từ độc hại',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm đăng',
  PRIMARY KEY (`id`),
  INDEX `idx_posts_user_id` (`user_id`),
  INDEX `idx_posts_status` (`status`),
  INDEX `idx_posts_created_at` (`created_at` DESC),
  CONSTRAINT `fk_posts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 4. Bảng: comments (Bình luận & Lời an ủi tự động từ Heli AI Buddy)
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments` (
  `id` VARCHAR(36) NOT NULL COMMENT 'Mã UUID v4 bình luận',
  `post_id` VARCHAR(36) NOT NULL COMMENT 'Thuộc bài viết nào',
  `user_id` VARCHAR(36) DEFAULT NULL COMMENT 'NULL nếu là bình luận tự động từ AI bot',
  `author_name` VARCHAR(50) NOT NULL COMMENT 'Bút danh người bình luận hoặc Heli AI Buddy',
  `content` TEXT NOT NULL COMMENT 'Nội dung bình luận',
  `is_ai_bot` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1: Câu an ủi từ AI bot, 0: Người dùng bình luận',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm bình luận',
  PRIMARY KEY (`id`),
  INDEX `idx_comments_post_id` (`post_id`),
  CONSTRAINT `fk_comments_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 5. Bảng: chat_sessions (Theo dõi phiên ghép đôi P2P qua WebRTC)
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS `chat_sessions`;
CREATE TABLE `chat_sessions` (
  `id` VARCHAR(36) NOT NULL COMMENT 'Mã UUID v4 phòng chat',
  `peer_a_id` VARCHAR(36) NOT NULL COMMENT 'ID người thứ nhất',
  `peer_b_id` VARCHAR(36) DEFAULT NULL COMMENT 'ID người thứ hai',
  `status` ENUM('WAITING', 'CONNECTED', 'CLOSED') NOT NULL DEFAULT 'WAITING',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 6. Bảng: safety_shield_logs (Nhật ký phân tích an toàn của AI Safety Shield)
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS `safety_shield_logs`;
CREATE TABLE `safety_shield_logs` (
  `id` VARCHAR(36) NOT NULL COMMENT 'Mã UUID v4 sự kiện quét',
  `user_id` VARCHAR(36) NOT NULL COMMENT 'Người nhấn nút kiểm tra an toàn',
  `risk_level` ENUM('SAFE', 'WARNING', 'DANGER') NOT NULL COMMENT 'Mức độ rủi ro',
  `emergency_alert` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 nếu có nguy cơ buôn người/lừa đảo nghiêm trọng',
  `flagged_issues` TEXT DEFAULT NULL COMMENT 'Danh sách dấu hiệu vi phạm (JSON)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_safety_user_id` (`user_id`),
  CONSTRAINT `fk_safety_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mở lại kiểm tra khóa ngoại
SET FOREIGN_KEY_CHECKS = 1;


-- =========================================================================
-- DỮ LIỆU KHỞI TẠO MẪU TOÀN DIỆN (COMPREHENSIVE SEED DATA)
-- =========================================================================

-- 1. Thêm người dùng mẫu
INSERT INTO `users` (`id`, `username`, `anonymous_name`, `avatar_url`, `bio`, `recovery_token_hash`, `password_hash`, `role`, `status`, `created_at`)
VALUES 
('admin-master-id', 'admin', 'Quản trị viên (Heli Admin)', '🛡️', 'Quản trị viên và người điều hành hệ sinh thái HELI Platform.', 'a4bf063a6c97b4dc1dbc705e31d2818b960b59e0ed78e4bbcf2b88e2dab893c4', '$2a$10$u7n26m7P4Btph/P7xCTN1us.FnT3W4AMrFWuZ97Qlb95yD/ptGe/e', 'admin', 'ACTIVE', NOW()),
('demo-user-id-01', 'demouser', 'Ánh Trăng', '/images/avatars/avatar_moon.svg', 'Thích ngắm trăng khuya và nghe nhạc lofi khi viết code.', 'b9e0c6362c80db6e0c227fe9fa6f3337840225b6b98fcd93db110309212848d8', '$2a$10$UU98LAK1LQDxiQ5cnBdE.exDKpKnHTZijUucyzoPAf4iR2ShfHUj.', 'user', 'ACTIVE', NOW()),
('user-hoami', 'hoami_trang', 'Họa Mi Trắng', '/images/avatars/avatar_bird.svg', 'Học tập để trưởng thành, sống để yêu thương và thấu hiểu.', 'e720e30fa76d29b1ae597e091c4cd0775b531b7614bb9497878cf0bcacbb1485', '$2a$10$vklNClN8iqi5G4eXqvDf4eKYbyZ0/ek1qnrnNfliJkpUcmX3Sh17y', 'user', 'ACTIVE', NOW()),
('user-maymuathu', 'may_muathu', 'Mây Mùa Thu', '🌸', 'Đôi khi chỉ muốn một góc nhỏ bình yên giữa thành phố nhộn nhịp.', '932dfe9176c251b1c2d72ec5e1487318b7257c87f0c2b8d677ccdcd778adca69', '$2a$10$lMYyXL2BarQizX8eODIOCehnkoFjZOvsbB1w/y8ISWu8RzvoB2PAi', 'user', 'ACTIVE', NOW()),
('user-giodem', 'gio_dem', 'Gió Đêm', '/images/avatars/avatar_fox.svg', 'Lắng nghe thanh âm dịu dàng của màn đêm.', '4e383fef9a62f14c7ff41474f21775c85aba72c33264206595585f9f03a70551', '$2a$10$SyLSldkMIrBASxrGHY2R.uUyWguOGVelXtGbk3SrMzpfXSie6JR1e', 'user', 'ACTIVE', NOW()),
('user-caphemuoi', 'caphe_muoi', 'Cà Phê Muối', '/images/avatars/avatar_coffee.svg', 'Một chút đắng, một chút mặn, trọn vẹn hương vị cuộc đời.', 'c928e712d9d246d9b79cb49d16819784da638b3d48b851da594bef806f5fc936', '$2a$10$AV2YCWMtLfee.EqSCrM7V.IBKPa0BaI2Gf/V79.SxPxytqojf969y', 'user', 'ACTIVE', NOW()),
('user-caovoi52', 'caovoi_52hz', 'Cá Voi 52Hz', '/images/avatars/avatar_whale.svg', 'Tìm kiếm tần số đồng điệu giữa đại dương bao la.', '75cf308e3893620d84f73f5864202ec45f33173770b8b6e280ff6b978d569e7a', '$2a$10$ozIE.STSqo28RyndBmYrOOWbBkG0Rt.fUmbe/knIbZ5EUkzolUCFi', 'user', 'ACTIVE', NOW()),
('user-nangam', 'nang_am', 'Nắng Ấm', '/images/avatars/avatar_plant.svg', 'Sau cơn mưa trời lại sáng. Luôn giữ niềm tin vào ngày mai.', '6f7b8dd30a4f1f4899f8efcfb4347b3455371455437cdb9e1081df0215f57397', '$2a$10$fv81l5XL3Jpa5QiQt1UWv.lM0DeEhesD08Y6SukCMfYwfku.CnmKq', 'user', 'ACTIVE', NOW()),
('user-saobang', 'saobang_nho', 'Sao Băng Nhỏ', '/images/avatars/avatar_star.svg', 'Ước mong những điều tốt đẹp nhất sẽ đến với tất cả các bạn.', 'd3d81ab837c9a23ffbd4694069febbdc3da70031bf3191a9f7e8c46665b49ea8', '$2a$10$XIZ8q7ETH1tqHBODZTPNkeLKP.pRfgzs5LowzSw7JgTzYBHu5XOve', 'user', 'ACTIVE', NOW()),
('user-meocam', 'meo_cam', 'Mèo Cam Ngủ Ngày', '/images/avatars/avatar_cat.svg', 'Cuộc sống bận rộn quá, cho mình chợp mắt 5 phút nhé.', '6c7b986c77574cca62e7f7d3a52ba6c451fc10d1fcfd2c8594ac49fe4fbe24c3', '$2a$10$K.r2hiGg6CyTYWFcaX19s.G5eb4z0Wb4pPhcgMMuumwgQQuuOLxp6', 'user', 'ACTIVE', NOW()),
('user-sinhvienit', 'sinhvien_it2026', 'Sinh Viên Năm Cuối', '💻', 'Đang chiến đấu cùng Đồ án tốt nghiệp DACS4... Cố lên tôi ơi!', '941aa2e4327389ed175be7f511c7f6145c5838d6ebe50853a030138a5a3ead50', '$2a$10$7LkT06mAKIuoR691zi3XOuhaquvTuy4QKqL1QHvYyMainTdHNtgJy', 'user', 'ACTIVE', NOW()),
('user-bad-actor', 'spammer_99', 'Tài Khoản Đã Khóa', '⚠️', 'Tài khoản vi phạm quy chuẩn cộng đồng.', NULL, '$2a$10$HPRRj1IrwraS/qIfDzIKzesW6nW2jiJNOpRH2RY2u75fyurOXj3tK', 'user', 'SUSPENDED', NOW())
ON DUPLICATE KEY UPDATE `anonymous_name` = VALUES(`anonymous_name`), `avatar_url` = VALUES(`avatar_url`);

-- 2. Thêm bài viết mẫu có hình ảnh
INSERT INTO `posts` (`id`, `user_id`, `mood_tag`, `content`, `image_url`, `is_private`, `status`, `rejection_reason`, `created_at`)
VALUES
('post-study-01', 'user-sinhvienit', 'Áp lực', 'Chỉ còn 3 tuần nữa là đến ngày bảo vệ đồ án tốt nghiệp DACS4 rồi. Mấy hôm nay thức trắng đêm fix bug, vẽ lại các sơ đồ UML và viết tài liệu báo cáo mà người mệt lử. Nhiều lúc muốn buông xuôi ghê, nhưng nghĩ lại công sức 4 năm đại học của bản thân và sự kỳ vọng của bố mẹ lại tự nhủ phải cố gắng thêm một chút nữa. Ở đây có bạn nào cũng đang làm đồ án tốt nghiệp như mình không, chia sẻ cho mình chút động lực với...', '/images/posts/study_desk.svg', 0, 'APPROVED', NULL, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
('post-rain-02', 'user-caovoi52', 'Cô đơn', 'Đà Nẵng hôm nay mưa rả rích từ chiều đến tối muộn. Ngồi trong căn phòng trọ 15m2 ăn vội bát mì tôm tự nhiên thấy nhớ nhà đến quặn lòng. Nhớ nồi canh chua cá lóc mẹ nấu, nhớ tiếng ba gọi thức dậy mỗi sớm mai. Rời quê lên thành phố học tập và tự lập mới thấy làm người lớn cô đơn hơn mình tưởng rất nhiều...', '/images/posts/rain_night.svg', 0, 'APPROVED', NULL, DATE_SUB(NOW(), INTERVAL 5 HOUR)),
('post-sunset-03', 'user-giodem', 'Lạc lối', '22 tuổi, bạn bè xung quanh người thì có việc làm lương ngàn đô, người thì chuẩn bị đi du học. Nhìn lại bản thân vẫn chênh vênh chưa biết mình thực sự thích gì và muốn trở thành ai. Cảm giác bị tụt lại phía sau (FOMO) thật sự rất ngột ngạt. Chiều nay đứng trên cầu ngắm hoàng hôn sông Hàn, tự hỏi con đường phía trước của mình sẽ đi về đâu...', '/images/posts/sunset_bridge.svg', 0, 'APPROVED', NULL, DATE_SUB(NOW(), INTERVAL 8 HOUR)),
('post-sunflower-04', 'user-nangam', 'Hy vọng', 'Sau hơn 6 tháng vật lộn với chứng rối loạn lo âu và những cơn hoảng loạn (panic attacks), hôm nay là ngày đầu tiên mình có thể tự tin bước ra ngoài công viên, ngắm những đóa hoa hướng dương và hít thở thật sâu mà không thấy lồng ngực bị thắt nghẹn. Mình nhận ra rằng vết thương nào rồi cũng sẽ lành, chỉ cần chúng ta học cách kiên nhẫn và bao dung hơn với chính mình. Gửi năng lượng tích cực đến tất cả những ai đang cố gắng vượt qua giai đoạn khó khăn! 🌻', '/images/posts/sunflower.svg', 0, 'APPROVED', NULL, DATE_SUB(NOW(), INTERVAL 12 HOUR)),
('post-coffee-05', 'user-hoami', 'Biết ơn', 'Sáng nay đi xe buýt bị rơi ví tiền có toàn bộ thẻ sinh viên và căn cước công dân. Tưởng chừng mất hết hy vọng thì chiều nay nhận được cuộc gọi từ bác tài xế hẹn ra trạm nhận lại nguyên vẹn. Bác còn từ chối nhận tiền cảm ơn và nói: "Sinh viên đi học xa nhà khó khăn, giữ lấy mà ăn uống con ạ". Cuộc đời này vẫn còn nhiều điều tử tế và ấm áp đến lạ kỳ! Cảm ơn bác tài rất nhiều.', '/images/posts/coffee_quiet.svg', 0, 'APPROVED', NULL, DATE_SUB(NOW(), INTERVAL 1 DAY)),
('post-room-06', 'user-maymuathu', 'Buồn bã', 'Tụi mình đã bên nhau 4 năm, từ những ngày sinh viên nghèo đạp xe cọc cạch đi ăn ốc vỉa hè đến lúc cả hai đều có công việc ổn định. Vậy mà cuối cùng lại dừng lại chỉ vì "không còn cùng chung mục tiêu tương lai". Hóa ra trưởng thành cũng đồng nghĩa với việc học cách buông tay những người mình từng xem là cả bầu trời... Đêm nay góc phòng nhỏ bỗng trở nên trống trải lạ thường.', '/images/posts/cozy_room.svg', 0, 'APPROVED', NULL, DATE_SUB(NOW(), INTERVAL 36 HOUR)),
('post-private-07', 'demo-user-id-01', 'Cô đơn', '[Nhật ký riêng tư - Chỉ mình tôi]\nĐêm nay ngắm bầu trời sao qua khung cửa sổ, tự hứa với bản thân sẽ không bao giờ để những lời phán xét hay nhận xét ác ý của người khác làm lung lay giá trị của mình nữa. Mình là phiên bản độc nhất vô nhị. Cố gắng hết sức hoàn thành kỳ thực tập và đạt mục tiêu học bổng thạc sĩ!', '/images/posts/starry_sky.svg', 1, 'APPROVED', NULL, DATE_SUB(NOW(), INTERVAL 2 DAY)),
('post-rejected-hate', 'user-bad-actor', 'Tuyệt vọng', 'Bọn mày chết hết đi, tao ghét tất cả chúng mày! Cuộc đời này quá bất công, tao muốn trả thù và hủy hoại tất cả!', NULL, 0, 'REJECTED', 'Nội dung chứa ngôn từ bạo lực, thù ghét hoặc kích động tiêu cực vi phạm tiêu chuẩn cộng đồng an toàn.', DATE_SUB(NOW(), INTERVAL 3 DAY)),
('post-rejected-scam', 'user-bad-actor', 'Lạc lối', 'Tuyển gấp 5 bạn nam/nữ làm việc online nhẹ nhàng tại khu kinh tế Mộc Bài, thu nhập 35-50 triệu/tháng không cần bằng cấp hay kinh nghiệm, bao ăn ở trọn gói qua biên giới, liên hệ Zalo 0987xxx để đi ngay trong đêm!', NULL, 0, 'REJECTED', 'AI Safety Shield phát hiện dấu hiệu lừa đảo bẫy việc làm xuyên biên giới hoặc buôn bán người. Đã kích hoạt cảnh báo an toàn.', DATE_SUB(NOW(), INTERVAL 4 DAY))
ON DUPLICATE KEY UPDATE `content` = VALUES(`content`), `image_url` = VALUES(`image_url`);

-- 3. Thêm bình luận tương tác & Lời an ủi từ AI Heli Buddy
INSERT INTO `comments` (`id`, `post_id`, `user_id`, `parent_id`, `author_name`, `content`, `is_ai_bot`, `created_at`)
VALUES
('c-study-ai', 'post-study-01', NULL, NULL, 'Heli AI Buddy', 'Gửi bạn một cái ôm thật ấm áp! 4 năm đại học là một hành trình dài đầy kiên cường. Việc bạn cảm thấy mệt mỏi và kiệt sức là tín hiệu hoàn toàn tự nhiên khi não bộ phải xử lý khối lượng tư duy liên tục. Hãy nhớ quy tắc 20-20-20: sau mỗi 20 phút nhìn màn hình, hãy nhìn ra xa 20 feet trong 20 giây và uống một ngụm nước ấm nhé. Bạn đã đi được 90% chặng đường rồi, đích đến ngay trước mắt thôi!', 1, DATE_SUB(NOW(), INTERVAL 115 MINUTE)),
('c-study-01', 'post-study-01', 'user-hoami', NULL, 'Họa Mi Trắng', 'Cố lên bạn ơi! Năm ngoái mình bảo vệ đồ án tốt nghiệp DACS cũng căng thẳng đến phát khóc. Nhưng ngày cầm tấm bằng tốt nghiệp trên tay thì thấy mọi vất vả đều xứng đáng. Bạn hãy chia nhỏ đồ án thành các checklist nhỏ làm từng bước một nhé!', 0, DATE_SUB(NOW(), INTERVAL 105 MINUTE)),
('c-study-01-reply', 'post-study-01', 'user-sinhvienit', 'c-study-01', 'Sinh Viên Năm Cuối', 'Cảm ơn bạn nhiều nha, đọc được bình luận của bạn mình thấy nhẹ nhõm và có thêm động lực hẳn.', 0, DATE_SUB(NOW(), INTERVAL 95 MINUTE)),
('c-study-02', 'post-study-01', 'user-caphemuoi', NULL, 'Cà Phê Muối', 'Gửi bạn một ly cà phê tinh thần ☕. Nhớ ngủ đủ ít nhất 6 tiếng nhé, thức trắng đêm sẽ làm giảm khả năng tư duy logic và dễ sinh bug hơn đấy!', 0, DATE_SUB(NOW(), INTERVAL 70 MINUTE)),

('c-rain-ai', 'post-rain-02', NULL, NULL, 'Heli AI Buddy', 'Nỗi nhớ nhà trong những chiều mưa là một thứ cảm xúc rất dịu dàng và chân thật. Bạn không hề cô độc đâu, hàng ngàn bạn trẻ ngoài kia cũng đang có cùng nỗi niềm ấy. Nếu có thể, hãy nhấc máy gọi điện về hỏi thăm mẹ một vài câu nhé, nghe giọng người thân sẽ giúp trái tim bạn ấm áp hơn rất nhiều.', 1, DATE_SUB(NOW(), INTERVAL 290 MINUTE)),
('c-rain-01', 'post-rain-02', 'user-maymuathu', NULL, 'Mây Mùa Thu', 'Đồng cảm với bạn sâu sắc. Lúc mới từ quê lên Đà Nẵng học, mỗi lần trời mưa là mình lại trốn trong chăn khóc vì nhớ nhà. Cố lên nhé bạn, gia đình luôn là hậu phương yêu thương chúng ta nhất.', 0, DATE_SUB(NOW(), INTERVAL 270 MINUTE)),
('c-rain-02', 'post-rain-02', 'user-nangam', NULL, 'Nắng Ấm', 'Trời lạnh nhớ mặc ấm nha bạn. Bát mì tôm thêm quả trứng và ít hành nữa cho ấm bụng nhé. Tự lập vất vả nhưng sẽ tôi luyện cho bạn bản lĩnh vững vàng lắm đấy!', 0, DATE_SUB(NOW(), INTERVAL 240 MINUTE)),

('c-sunset-ai', 'post-sunset-03', NULL, NULL, 'Heli AI Buddy', 'Bạn không hề thất bại! Mỗi bông hoa đều có mùa nở rộ của riêng nó. So sánh timeline của mình với người khác chỉ khiến bạn bỏ quên những bước tiến nhỏ nhưng quý giá của chính mình. Hãy cho phép bản thân được bối rối, vì bối rối chính là khởi đầu của sự tìm kiếm và thấu hiểu bản thân sâu sắc hơn.', 1, DATE_SUB(NOW(), INTERVAL 470 MINUTE)),
('c-sunset-01', 'post-sunset-03', 'user-saobang', NULL, 'Sao Băng Nhỏ', 'Đừng tự tạo áp lực so sánh bạn ơi. Ai trên mạng xã hội cũng chỉ khoe mặt hào nhoáng nhất thôi, không ai chụp lại những lúc họ thất bại hay rơi nước mắt đâu. Đi chậm một chút cũng được, miễn là mình không dừng lại.', 0, DATE_SUB(NOW(), INTERVAL 430 MINUTE)),
('c-sunset-01-reply', 'post-sunset-03', 'user-giodem', 'c-sunset-01', 'Gió Đêm', 'Cảm ơn bạn, lời khuyên của bạn đến rất đúng lúc mình cần nhất.', 0, DATE_SUB(NOW(), INTERVAL 400 MINUTE)),

('c-sunflower-ai', 'post-sunflower-04', NULL, NULL, 'Heli AI Buddy', 'Thật xúc động và tự hào khi đọc những dòng này của bạn! Bạn đã rất dũng cảm trên hành trình tự chữa lành. Hãy tiếp tục trân trọng từng khoảnh khắc bình yên nhỏ bé này nhé! 🌻', 1, DATE_SUB(NOW(), INTERVAL 710 MINUTE)),
('c-sunflower-01', 'post-sunflower-04', 'demo-user-id-01', NULL, 'Ánh Trăng', 'Chúc mừng bạn! Năng lượng tích cực từ bài viết của bạn đã truyền cảm hứng cho mình rất nhiều trong ngày hôm nay.', 0, DATE_SUB(NOW(), INTERVAL 670 MINUTE)),
('c-sunflower-02', 'post-sunflower-04', 'user-meocam', NULL, 'Mèo Cam Ngủ Ngày', 'Tự hào về bạn quá! Tiếp tục lan tỏa năng lượng tuyệt vời này đến cộng đồng Heli nhé!', 0, DATE_SUB(NOW(), INTERVAL 630 MINUTE)),

('c-coffee-ai', 'post-coffee-05', NULL, NULL, 'Heli AI Buddy', 'Những câu chuyện tử tế đời thường như vậy luôn sưởi ấm tâm hồn chúng ta. Cảm ơn bạn đã chia sẻ để cộng đồng Heli cùng cảm nhận được sự ấm áp và niềm tin vào cuộc sống!', 1, DATE_SUB(NOW(), INTERVAL 1300 MINUTE)),
('c-coffee-01', 'post-coffee-05', 'user-caphemuoi', NULL, 'Cà Phê Muối', 'Đọc xong thấy ấm lòng ghê. Chúc bác tài xế luôn mạnh khỏe và vạn dặm bình an trên những nẻo đường.', 0, DATE_SUB(NOW(), INTERVAL 1200 MINUTE)),

('c-room-ai', 'post-room-06', NULL, NULL, 'Heli AI Buddy', 'Chia tay một người đã gắn bó 4 năm thanh xuân là một nỗi đau không dễ gì nguôi ngoai. Bạn hãy cho phép bản thân được buồn, được khóc nếu muốn. Đừng vội kìm nén. Kết thúc một chặng đường không phủ nhận những kỷ niệm đẹp hai bạn đã từng có cùng nhau.', 1, DATE_SUB(NOW(), INTERVAL 2000 MINUTE)),
('c-room-01', 'post-room-06', 'user-caovoi52', NULL, 'Cá Voi 52Hz', 'Thương bạn. Thời gian sẽ là liều thuốc xoa dịu tốt nhất. Hãy dành thời gian này để chăm sóc và yêu thương bản thân nhiều hơn nhé.', 0, DATE_SUB(NOW(), INTERVAL 1900 MINUTE))
ON DUPLICATE KEY UPDATE `content` = VALUES(`content`);

-- 4. Thêm lượt thích & bài viết lưu
INSERT IGNORE INTO `post_likes` (`id`, `post_id`, `user_id`, `created_at`)
VALUES
('like-1', 'post-study-01', 'demo-user-id-01', NOW()),
('like-2', 'post-study-01', 'user-hoami', NOW()),
('like-3', 'post-study-01', 'user-caphemuoi', NOW()),
('like-4', 'post-study-01', 'user-nangam', NOW()),
('like-5', 'post-rain-02', 'demo-user-id-01', NOW()),
('like-6', 'post-rain-02', 'user-maymuathu', NOW()),
('like-7', 'post-rain-02', 'user-saobang', NOW()),
('like-8', 'post-sunset-03', 'user-hoami', NOW()),
('like-9', 'post-sunset-03', 'user-saobang', NOW()),
('like-10', 'post-sunflower-04', 'demo-user-id-01', NOW()),
('like-11', 'post-sunflower-04', 'user-meocam', NOW()),
('like-12', 'post-sunflower-04', 'user-giodem', NOW()),
('like-13', 'post-coffee-05', 'user-caphemuoi', NOW()),
('like-14', 'post-coffee-05', 'demo-user-id-01', NOW()),
('like-15', 'post-room-06', 'user-caovoi52', NOW());

INSERT IGNORE INTO `saved_posts` (`id`, `post_id`, `user_id`, `created_at`)
VALUES
('save-1', 'post-study-01', 'demo-user-id-01', NOW()),
('save-2', 'post-sunflower-04', 'demo-user-id-01', NOW()),
('save-3', 'post-coffee-05', 'user-hoami', NOW()),
('save-4', 'post-sunset-03', 'user-giodem', NOW());

-- 5. Thêm báo cáo an toàn mẫu
INSERT INTO `post_reports` (`id`, `post_id`, `reporter_id`, `reason`, `details`, `status`, `resolved_by`, `created_at`)
VALUES
('rep-scam-01', 'post-rejected-scam', 'demo-user-id-01', 'Lừa đảo, bẫy việc làm hoặc yêu cầu tiền bạc', 'Bài viết tuyển người qua biên giới có dấu hiệu buôn người nguy hiểm.', 'RESOLVED', 'admin-master-id', DATE_SUB(NOW(), INTERVAL 3 DAY)),
('rep-hate-02', 'post-rejected-hate', 'user-hoami', 'Ngôn từ thù ghét, quấy rối hoặc bạo lực', 'Chửi bới thô tục và đe dọa người khác.', 'RESOLVED', 'admin-master-id', DATE_SUB(NOW(), INTERVAL 2 DAY))
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- HOÀN TẤT KHỞI TẠO CƠ SỞ DỮ LIỆU
