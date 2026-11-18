// seedData.js - Comprehensive Mock Data Generator for HELI Platform
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const STORE_PATH = path.join(__dirname, 'data/store.json');
const DATABASE_SQL_PATH = path.join(__dirname, 'database.sql');

function getHash(text) {
  return bcrypt.hashSync(text, 10);
}

function getHmac(code) {
  const cleaned = code.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return crypto.createHmac('sha256', process.env.RECOVERY_CODE_SECRET || 'heli-recovery-salt-key')
               .update(cleaned)
               .digest('hex');
}

console.log('Seeding rich mock data for HELI Platform...');

const now = new Date();
const hoursAgo = (h) => new Date(now.getTime() - h * 3600 * 1000).toISOString();
const daysAgo = (d) => new Date(now.getTime() - d * 24 * 3600 * 1000).toISOString();

// 1. USERS
const users = [
  {
    id: 'admin-master-id',
    username: 'admin',
    anonymous_name: 'Quản trị viên (Heli Admin)',
    avatar_url: '🛡️',
    bio: 'Quản trị viên và người điều hành hệ sinh thái HELI Platform.',
    recovery_email: 'admin@heli.vku.udn.vn',
    recovery_token_hash: getHmac('HELI-ADMN-2026-SAFE'),
    recovery_code_hash: null,
    password_hash: getHash('admin123'),
    role: 'admin',
    status: 'ACTIVE',
    is_guest: false,
    last_login_at: hoursAgo(1),
    created_at: daysAgo(30)
  },
  {
    id: 'demo-user-id-01',
    username: 'demouser',
    anonymous_name: 'Ánh Trăng',
    avatar_url: '/images/avatars/avatar_moon.svg',
    bio: 'Thích ngắm trăng khuya và nghe nhạc lofi khi viết code.',
    recovery_email: 'user@heli.vku.udn.vn',
    recovery_token_hash: getHmac('MOON-LIGHT-2026-CALM'),
    recovery_code_hash: null,
    password_hash: getHash('123456'),
    role: 'user',
    status: 'ACTIVE',
    is_guest: false,
    last_login_at: hoursAgo(2),
    created_at: daysAgo(20)
  },
  {
    id: 'user-hoami',
    username: 'hoami_trang',
    anonymous_name: 'Họa Mi Trắng',
    avatar_url: '/images/avatars/avatar_bird.svg',
    bio: 'Học tập để trưởng thành, sống để yêu thương và thấu hiểu.',
    recovery_email: null,
    recovery_token_hash: getHmac('BIRD-PEACE-2026-SING'),
    recovery_code_hash: null,
    password_hash: getHash('123456'),
    role: 'user',
    status: 'ACTIVE',
    is_guest: false,
    last_login_at: hoursAgo(3),
    created_at: daysAgo(18)
  },
  {
    id: 'user-maymuathu',
    username: 'may_muathu',
    anonymous_name: 'Mây Mùa Thu',
    avatar_url: '🌸',
    bio: 'Đôi khi chỉ muốn một góc nhỏ bình yên giữa thành phố nhộn nhịp.',
    recovery_email: null,
    recovery_token_hash: getHmac('FALL-CLOUD-2026-WIND'),
    recovery_code_hash: null,
    password_hash: getHash('123456'),
    role: 'user',
    status: 'ACTIVE',
    is_guest: false,
    last_login_at: hoursAgo(5),
    created_at: daysAgo(15)
  },
  {
    id: 'user-giodem',
    username: 'gio_dem',
    anonymous_name: 'Gió Đêm',
    avatar_url: '/images/avatars/avatar_fox.svg',
    bio: 'Lắng nghe thanh âm dịu dàng của màn đêm.',
    recovery_email: null,
    recovery_token_hash: getHmac('NIGHT-WIND-2026-CALM'),
    recovery_code_hash: null,
    password_hash: getHash('123456'),
    role: 'user',
    status: 'ACTIVE',
    is_guest: false,
    last_login_at: hoursAgo(7),
    created_at: daysAgo(14)
  },
  {
    id: 'user-caphemuoi',
    username: 'caphe_muoi',
    anonymous_name: 'Cà Phê Muối',
    avatar_url: '/images/avatars/avatar_coffee.svg',
    bio: 'Một chút đắng, một chút mặn, trọn vẹn hương vị cuộc đời.',
    recovery_email: null,
    recovery_token_hash: getHmac('SALT-CAFE-2026-WARM'),
    recovery_code_hash: null,
    password_hash: getHash('123456'),
    role: 'user',
    status: 'ACTIVE',
    is_guest: false,
    last_login_at: hoursAgo(10),
    created_at: daysAgo(12)
  },
  {
    id: 'user-caovoi52',
    username: 'caovoi_52hz',
    anonymous_name: 'Cá Voi 52Hz',
    avatar_url: '/images/avatars/avatar_whale.svg',
    bio: 'Tìm kiếm tần số đồng điệu giữa đại dương bao la.',
    recovery_email: null,
    recovery_token_hash: getHmac('WHALE-52HZ-2026-DEEP'),
    recovery_code_hash: null,
    password_hash: getHash('123456'),
    role: 'user',
    status: 'ACTIVE',
    is_guest: false,
    last_login_at: hoursAgo(12),
    created_at: daysAgo(10)
  },
  {
    id: 'user-nangam',
    username: 'nang_am',
    anonymous_name: 'Nắng Ấm',
    avatar_url: '/images/avatars/avatar_plant.svg',
    bio: 'Sau cơn mưa trời lại sáng. Luôn giữ niềm tin vào ngày mai.',
    recovery_email: null,
    recovery_token_hash: getHmac('WARM-SUNS-2026-HOPE'),
    recovery_code_hash: null,
    password_hash: getHash('123456'),
    role: 'user',
    status: 'ACTIVE',
    is_guest: false,
    last_login_at: hoursAgo(14),
    created_at: daysAgo(8)
  },
  {
    id: 'user-saobang',
    username: 'saobang_nho',
    anonymous_name: 'Sao Băng Nhỏ',
    avatar_url: '/images/avatars/avatar_star.svg',
    bio: 'Ước mong những điều tốt đẹp nhất sẽ đến với tất cả các bạn.',
    recovery_email: null,
    recovery_token_hash: getHmac('STAR-WISH-2026-GLOW'),
    recovery_code_hash: null,
    password_hash: getHash('123456'),
    role: 'user',
    status: 'ACTIVE',
    is_guest: false,
    last_login_at: hoursAgo(16),
    created_at: daysAgo(7)
  },
  {
    id: 'user-meocam',
    username: 'meo_cam',
    anonymous_name: 'Mèo Cam Ngủ Ngày',
    avatar_url: '/images/avatars/avatar_cat.svg',
    bio: 'Cuộc sống bận rộn quá, cho mình chợp mắt 5 phút nhé.',
    recovery_email: null,
    recovery_token_hash: getHmac('CAT-SLEEP-2026-PAWS'),
    recovery_code_hash: null,
    password_hash: getHash('123456'),
    role: 'user',
    status: 'ACTIVE',
    is_guest: false,
    last_login_at: hoursAgo(18),
    created_at: daysAgo(5)
  },
  {
    id: 'user-sinhvienit',
    username: 'sinhvien_it2026',
    anonymous_name: 'Sinh Viên Năm Cuối',
    avatar_url: '💻',
    bio: 'Đang chiến đấu cùng Đồ án tốt nghiệp DACS4... Cố lên tôi ơi!',
    recovery_email: null,
    recovery_token_hash: getHmac('GRAD-STUD-2026-VKU4'),
    recovery_code_hash: null,
    password_hash: getHash('123456'),
    role: 'user',
    status: 'ACTIVE',
    is_guest: false,
    last_login_at: hoursAgo(1),
    created_at: daysAgo(4)
  },
  {
    id: 'user-bad-actor',
    username: 'spammer_99',
    anonymous_name: 'Tài Khoản Đã Khóa',
    avatar_url: '⚠️',
    bio: 'Tài khoản vi phạm quy chuẩn cộng đồng.',
    recovery_email: null,
    recovery_token_hash: null,
    recovery_code_hash: null,
    password_hash: getHash('123456'),
    role: 'user',
    status: 'SUSPENDED',
    is_guest: false,
    last_login_at: daysAgo(3),
    created_at: daysAgo(6)
  }
];

// 2. POSTS
const posts = [
  {
    id: 'post-study-01',
    user_id: 'user-sinhvienit',
    mood_tag: 'Áp lực',
    image_url: '/images/posts/study_desk.svg',
    content: `Chỉ còn 3 tuần nữa là đến ngày bảo vệ đồ án tốt nghiệp DACS4 rồi. Mấy hôm nay thức trắng đêm fix bug, vẽ lại các sơ đồ UML và viết tài liệu báo cáo mà người mệt lử. Nhiều lúc muốn buông xuôi ghê, nhưng nghĩ lại công sức 4 năm đại học của bản thân và sự kỳ vọng của bố mẹ lại tự nhủ phải cố gắng thêm một chút nữa.\n\nỞ đây có bạn nào cũng đang làm đồ án tốt nghiệp như mình không, chia sẻ cho mình chút động lực với...`,
    is_private: false,
    status: 'APPROVED',
    rejection_reason: null,
    created_at: hoursAgo(2),
    updated_at: hoursAgo(2)
  },
  {
    id: 'post-rain-02',
    user_id: 'user-caovoi52',
    mood_tag: 'Cô đơn',
    image_url: '/images/posts/rain_night.svg',
    content: `Đà Nẵng hôm nay mưa rả rích từ chiều đến tối muộn. Ngồi trong căn phòng trọ 15m2 ăn vội bát mì tôm tự nhiên thấy nhớ nhà đến quặn lòng. Nhớ nồi canh chua cá lóc mẹ nấu, nhớ tiếng ba gọi thức dậy mỗi sớm mai.\n\nRời quê lên thành phố học tập và tự lập mới thấy làm người lớn cô đơn hơn mình tưởng rất nhiều...`,
    is_private: false,
    status: 'APPROVED',
    rejection_reason: null,
    created_at: hoursAgo(5),
    updated_at: hoursAgo(5)
  },
  {
    id: 'post-sunset-03',
    user_id: 'user-giodem',
    mood_tag: 'Lạc lối',
    image_url: '/images/posts/sunset_bridge.svg',
    content: `22 tuổi, bạn bè xung quanh người thì có việc làm lương ngàn đô, người thì chuẩn bị đi du học. Nhìn lại bản thân vẫn chênh vênh chưa biết mình thực sự thích gì và muốn trở thành ai. Cảm giác bị tụt lại phía sau (FOMO) thật sự rất ngột ngạt.\n\nChiều nay đứng trên cầu ngắm hoàng hôn sông Hàn, tự hỏi con đường phía trước của mình sẽ đi về đâu...`,
    is_private: false,
    status: 'APPROVED',
    rejection_reason: null,
    created_at: hoursAgo(8),
    updated_at: hoursAgo(8)
  },
  {
    id: 'post-sunflower-04',
    user_id: 'user-nangam',
    mood_tag: 'Hy vọng',
    image_url: '/images/posts/sunflower.svg',
    content: `Sau hơn 6 tháng vật lộn với chứng rối loạn lo âu và những cơn hoảng loạn (panic attacks), hôm nay là ngày đầu tiên mình có thể tự tin bước ra ngoài công viên, ngắm những đóa hoa hướng dương và hít thở thật sâu mà không thấy lồng ngực bị thắt nghẹn.\n\nMình nhận ra rằng vết thương nào rồi cũng sẽ lành, chỉ cần chúng ta học cách kiên nhẫn và bao dung hơn với chính mình. Gửi năng lượng tích cực đến tất cả những ai đang cố gắng vượt qua giai đoạn khó khăn! 🌻`,
    is_private: false,
    status: 'APPROVED',
    rejection_reason: null,
    created_at: hoursAgo(12),
    updated_at: hoursAgo(12)
  },
  {
    id: 'post-coffee-05',
    user_id: 'user-hoami',
    mood_tag: 'Biết ơn',
    image_url: '/images/posts/coffee_quiet.svg',
    content: `Sáng nay đi xe buýt bị rơi ví tiền có toàn bộ thẻ sinh viên và căn cước công dân. Tưởng chừng mất hết hy vọng thì chiều nay nhận được cuộc gọi từ bác tài xế hẹn ra trạm nhận lại nguyên vẹn.\n\nBác còn từ chối nhận tiền cảm ơn và nói: 'Sinh viên đi học xa nhà khó khăn, giữ lấy mà ăn uống con ạ'. Cuộc đời này vẫn còn nhiều điều tử tế và ấm áp đến lạ kỳ! Cảm ơn bác tài rất nhiều.`,
    is_private: false,
    status: 'APPROVED',
    rejection_reason: null,
    created_at: daysAgo(1),
    updated_at: daysAgo(1)
  },
  {
    id: 'post-room-06',
    user_id: 'user-maymuathu',
    mood_tag: 'Buồn bã',
    image_url: '/images/posts/cozy_room.svg',
    content: `Tụi mình đã bên nhau 4 năm, từ những ngày sinh viên nghèo đạp xe cọc cạch đi ăn ốc vỉa hè đến lúc cả hai đều có công việc ổn định. Vậy mà cuối cùng lại dừng lại chỉ vì 'không còn cùng chung mục tiêu tương lai'.\n\nHóa ra trưởng thành cũng đồng nghĩa với việc học cách buông tay những người mình từng xem là cả bầu trời... Đêm nay góc phòng nhỏ bỗng trở nên trống trải lạ thường.`,
    is_private: false,
    status: 'APPROVED',
    rejection_reason: null,
    created_at: daysAgo(1.5),
    updated_at: daysAgo(1.5)
  },
  {
    id: 'post-private-07',
    user_id: 'demo-user-id-01',
    mood_tag: 'Cô đơn',
    image_url: '/images/posts/starry_sky.svg',
    content: `[Nhật ký riêng tư - Chỉ mình tôi]\nĐêm nay ngắm bầu trời sao qua khung cửa sổ, tự hứa với bản thân sẽ không bao giờ để những lời phán xét hay nhận xét ác ý của người khác làm lung lay giá trị của mình nữa. Mình là phiên bản độc nhất vô nhị. Cố gắng hết sức hoàn thành kỳ thực tập và đạt mục tiêu học bổng thạc sĩ!`,
    is_private: true,
    status: 'APPROVED',
    rejection_reason: null,
    created_at: daysAgo(2),
    updated_at: daysAgo(2)
  },
  {
    id: 'post-rejected-hate',
    user_id: 'user-bad-actor',
    mood_tag: 'Tuyệt vọng',
    image_url: null,
    content: `Bọn mày chết hết đi, tao ghét tất cả chúng mày! Cuộc đời này quá bất công, tao muốn trả thù và hủy hoại tất cả!`,
    is_private: false,
    status: 'REJECTED',
    rejection_reason: 'Nội dung chứa ngôn từ bạo lực, thù ghét hoặc kích động tiêu cực vi phạm tiêu chuẩn cộng đồng an toàn.',
    created_at: daysAgo(3),
    updated_at: daysAgo(3)
  },
  {
    id: 'post-rejected-scam',
    user_id: 'user-bad-actor',
    mood_tag: 'Lạc lối',
    image_url: null,
    content: `Tuyển gấp 5 bạn nam/nữ làm việc online nhẹ nhàng tại khu kinh tế Mộc Bài, thu nhập 35-50 triệu/tháng không cần bằng cấp hay kinh nghiệm, bao ăn ở trọn gói qua biên giới, liên hệ Zalo 0987xxx để đi ngay trong đêm!`,
    is_private: false,
    status: 'REJECTED',
    rejection_reason: 'AI Safety Shield phát hiện dấu hiệu lừa đảo bẫy việc làm xuyên biên giới hoặc buôn bán người. Đã kích hoạt cảnh báo an toàn.',
    created_at: daysAgo(3.5),
    updated_at: daysAgo(3.5)
  }
];

// 3. COMMENTS
const comments = [
  // For post-study-01
  {
    id: 'c-study-ai',
    post_id: 'post-study-01',
    user_id: null,
    parent_id: null,
    author_name: 'Heli AI Buddy',
    content: 'Gửi bạn một cái ôm thật ấm áp! 4 năm đại học là một hành trình dài đầy kiên cường. Việc bạn cảm thấy mệt mỏi và kiệt sức là tín hiệu hoàn toàn tự nhiên khi não bộ phải xử lý khối lượng tư duy liên tục. Hãy nhớ quy tắc 20-20-20: sau mỗi 20 phút nhìn màn hình, hãy nhìn ra xa 20 feet trong 20 giây và uống một ngụm nước ấm nhé. Bạn đã đi được 90% chặng đường rồi, đích đến ngay trước mắt thôi!',
    is_ai_bot: true,
    created_at: hoursAgo(1.9)
  },
  {
    id: 'c-study-01',
    post_id: 'post-study-01',
    user_id: 'user-hoami',
    parent_id: null,
    author_name: 'Họa Mi Trắng',
    content: 'Cố lên bạn ơi! Năm ngoái mình bảo vệ đồ án tốt nghiệp DACS cũng căng thẳng đến phát khóc. Nhưng ngày cầm tấm bằng tốt nghiệp trên tay thì thấy mọi vất vả đều xứng đáng. Bạn hãy chia nhỏ đồ án thành các checklist nhỏ làm từng bước một nhé!',
    is_ai_bot: false,
    created_at: hoursAgo(1.7)
  },
  {
    id: 'c-study-01-reply',
    post_id: 'post-study-01',
    user_id: 'user-sinhvienit',
    parent_id: 'c-study-01',
    author_name: 'Sinh Viên Năm Cuối',
    content: 'Cảm ơn bạn nhiều nha, đọc được bình luận của bạn mình thấy nhẹ nhõm và có thêm động lực hẳn.',
    is_ai_bot: false,
    created_at: hoursAgo(1.5)
  },
  {
    id: 'c-study-02',
    post_id: 'post-study-01',
    user_id: 'user-caphemuoi',
    parent_id: null,
    author_name: 'Cà Phê Muối',
    content: 'Gửi bạn một ly cà phê tinh thần ☕. Nhớ ngủ đủ ít nhất 6 tiếng nhé, thức trắng đêm sẽ làm giảm khả năng tư duy logic và dễ sinh bug hơn đấy!',
    is_ai_bot: false,
    created_at: hoursAgo(1.2)
  },

  // For post-rain-02
  {
    id: 'c-rain-ai',
    post_id: 'post-rain-02',
    user_id: null,
    parent_id: null,
    author_name: 'Heli AI Buddy',
    content: 'Nỗi nhớ nhà trong những chiều mưa là một thứ cảm xúc rất dịu dàng và chân thật. Bạn không hề cô độc đâu, hàng ngàn bạn trẻ ngoài kia cũng đang có cùng nỗi niềm ấy. Nếu có thể, hãy nhấc máy gọi điện về hỏi thăm mẹ một vài câu nhé, nghe giọng người thân sẽ giúp trái tim bạn ấm áp hơn rất nhiều.',
    is_ai_bot: true,
    created_at: hoursAgo(4.8)
  },
  {
    id: 'c-rain-01',
    post_id: 'post-rain-02',
    user_id: 'user-maymuathu',
    parent_id: null,
    author_name: 'Mây Mùa Thu',
    content: 'Đồng cảm với bạn sâu sắc. Lúc mới từ quê lên Đà Nẵng học, mỗi lần trời mưa là mình lại trốn trong chăn khóc vì nhớ nhà. Cố lên nhé bạn, gia đình luôn là hậu phương yêu thương chúng ta nhất.',
    is_ai_bot: false,
    created_at: hoursAgo(4.5)
  },
  {
    id: 'c-rain-02',
    post_id: 'post-rain-02',
    user_id: 'user-nangam',
    parent_id: null,
    author_name: 'Nắng Ấm',
    content: 'Trời lạnh nhớ mặc ấm nha bạn. Bát mì tôm thêm quả trứng và ít hành nữa cho ấm bụng nhé. Tự lập vất vả nhưng sẽ tôi luyện cho bạn bản lĩnh vững vàng lắm đấy!',
    is_ai_bot: false,
    created_at: hoursAgo(4.0)
  },

  // For post-sunset-03
  {
    id: 'c-sunset-ai',
    post_id: 'post-sunset-03',
    user_id: null,
    parent_id: null,
    author_name: 'Heli AI Buddy',
    content: 'Bạn không hề thất bại! Mỗi bông hoa đều có mùa nở rộ của riêng nó. So sánh timeline của mình với người khác chỉ khiến bạn bỏ quên những bước tiến nhỏ nhưng quý giá của chính mình. Hãy cho phép bản thân được bối rối, vì bối rối chính là khởi đầu của sự tìm kiếm và thấu hiểu bản thân sâu sắc hơn.',
    is_ai_bot: true,
    created_at: hoursAgo(7.8)
  },
  {
    id: 'c-sunset-01',
    post_id: 'post-sunset-03',
    user_id: 'user-saobang',
    parent_id: null,
    author_name: 'Sao Băng Nhỏ',
    content: 'Đừng tự tạo áp lực so sánh bạn ơi. Ai trên mạng xã hội cũng chỉ khoe mặt hào nhoáng nhất thôi, không ai chụp lại những lúc họ thất bại hay rơi nước mắt đâu. Đi chậm một chút cũng được, miễn là mình không dừng lại.',
    is_ai_bot: false,
    created_at: hoursAgo(7.2)
  },
  {
    id: 'c-sunset-01-reply',
    post_id: 'post-sunset-03',
    user_id: 'user-giodem',
    parent_id: 'c-sunset-01',
    author_name: 'Gió Đêm',
    content: 'Cảm ơn bạn, lời khuyên của bạn đến rất đúng lúc mình cần nhất.',
    is_ai_bot: false,
    created_at: hoursAgo(6.8)
  },

  // For post-sunflower-04
  {
    id: 'c-sunflower-ai',
    post_id: 'post-sunflower-04',
    user_id: null,
    parent_id: null,
    author_name: 'Heli AI Buddy',
    content: 'Thật xúc động và tự hào khi đọc những dòng này của bạn! Bạn đã rất dũng cảm trên hành trình tự chữa lành. Hãy tiếp tục trân trọng từng khoảnh khắc bình yên nhỏ bé này nhé! 🌻',
    is_ai_bot: true,
    created_at: hoursAgo(11.8)
  },
  {
    id: 'c-sunflower-01',
    post_id: 'post-sunflower-04',
    user_id: 'demo-user-id-01',
    parent_id: null,
    author_name: 'Ánh Trăng',
    content: 'Chúc mừng bạn! Năng lượng tích cực từ bài viết của bạn đã truyền cảm hứng cho mình rất nhiều trong ngày hôm nay.',
    is_ai_bot: false,
    created_at: hoursAgo(11.2)
  },
  {
    id: 'c-sunflower-02',
    post_id: 'post-sunflower-04',
    user_id: 'user-meocam',
    parent_id: null,
    author_name: 'Mèo Cam Ngủ Ngày',
    content: 'Tự hào về bạn quá! Tiếp tục lan tỏa năng lượng tuyệt vời này đến cộng đồng Heli nhé!',
    is_ai_bot: false,
    created_at: hoursAgo(10.5)
  },

  // For post-coffee-05
  {
    id: 'c-coffee-ai',
    post_id: 'post-coffee-05',
    user_id: null,
    parent_id: null,
    author_name: 'Heli AI Buddy',
    content: 'Những câu chuyện tử tế đời thường như vậy luôn sưởi ấm tâm hồn chúng ta. Cảm ơn bạn đã chia sẻ để cộng đồng Heli cùng cảm nhận được sự ấm áp và niềm tin vào cuộc sống!',
    is_ai_bot: true,
    created_at: daysAgo(0.9)
  },
  {
    id: 'c-coffee-01',
    post_id: 'post-coffee-05',
    user_id: 'user-caphemuoi',
    parent_id: null,
    author_name: 'Cà Phê Muối',
    content: 'Đọc xong thấy ấm lòng ghê. Chúc bác tài xế luôn mạnh khỏe và vạn dặm bình an trên những nẻo đường.',
    is_ai_bot: false,
    created_at: daysAgo(0.8)
  },

  // For post-room-06
  {
    id: 'c-room-ai',
    post_id: 'post-room-06',
    user_id: null,
    parent_id: null,
    author_name: 'Heli AI Buddy',
    content: 'Chia tay một người đã gắn bó 4 năm thanh xuân là một nỗi đau không dễ gì nguôi ngoai. Bạn hãy cho phép bản thân được buồn, được khóc nếu muốn. Đừng vội kìm nén. Kết thúc một chặng đường không phủ nhận những kỷ niệm đẹp hai bạn đã từng có cùng nhau.',
    is_ai_bot: true,
    created_at: daysAgo(1.4)
  },
  {
    id: 'c-room-01',
    post_id: 'post-room-06',
    user_id: 'user-caovoi52',
    parent_id: null,
    author_name: 'Cá Voi 52Hz',
    content: 'Thương bạn. Thời gian sẽ là liều thuốc xoa dịu tốt nhất. Hãy dành thời gian này để chăm sóc và yêu thương bản thân nhiều hơn nhé.',
    is_ai_bot: false,
    created_at: daysAgo(1.3)
  }
];

// 4. POST LIKES (Empathy reactions)
const post_likes = [
  { id: 'like-1', post_id: 'post-study-01', user_id: 'demo-user-id-01', created_at: hoursAgo(1.8) },
  { id: 'like-2', post_id: 'post-study-01', user_id: 'user-hoami', created_at: hoursAgo(1.6) },
  { id: 'like-3', post_id: 'post-study-01', user_id: 'user-caphemuoi', created_at: hoursAgo(1.4) },
  { id: 'like-4', post_id: 'post-study-01', user_id: 'user-nangam', created_at: hoursAgo(1.1) },
  { id: 'like-5', post_id: 'post-rain-02', user_id: 'demo-user-id-01', created_at: hoursAgo(4.6) },
  { id: 'like-6', post_id: 'post-rain-02', user_id: 'user-maymuathu', created_at: hoursAgo(4.4) },
  { id: 'like-7', post_id: 'post-rain-02', user_id: 'user-saobang', created_at: hoursAgo(3.9) },
  { id: 'like-8', post_id: 'post-sunset-03', user_id: 'user-hoami', created_at: hoursAgo(7.5) },
  { id: 'like-9', post_id: 'post-sunset-03', user_id: 'user-saobang', created_at: hoursAgo(7.1) },
  { id: 'like-10', post_id: 'post-sunflower-04', user_id: 'demo-user-id-01', created_at: hoursAgo(11.5) },
  { id: 'like-11', post_id: 'post-sunflower-04', user_id: 'user-meocam', created_at: hoursAgo(10.8) },
  { id: 'like-12', post_id: 'post-sunflower-04', user_id: 'user-giodem', created_at: hoursAgo(9.5) },
  { id: 'like-13', post_id: 'post-coffee-05', user_id: 'user-caphemuoi', created_at: daysAgo(0.85) },
  { id: 'like-14', post_id: 'post-coffee-05', user_id: 'demo-user-id-01', created_at: daysAgo(0.7) },
  { id: 'like-15', post_id: 'post-room-06', user_id: 'user-caovoi52', created_at: daysAgo(1.35) }
];

// 5. SAVED POSTS (Bookmarks)
const saved_posts = [
  { id: 'save-1', post_id: 'post-study-01', user_id: 'demo-user-id-01', created_at: hoursAgo(1.5) },
  { id: 'save-2', post_id: 'post-sunflower-04', user_id: 'demo-user-id-01', created_at: hoursAgo(10) },
  { id: 'save-3', post_id: 'post-coffee-05', user_id: 'user-hoami', created_at: daysAgo(0.8) },
  { id: 'save-4', post_id: 'post-sunset-03', user_id: 'user-giodem', created_at: hoursAgo(6) }
];

// 6. POST REPORTS
const post_reports = [
  {
    id: 'rep-scam-01',
    post_id: 'post-rejected-scam',
    reporter_id: 'demo-user-id-01',
    reason: 'Lừa đảo, bẫy việc làm hoặc yêu cầu tiền bạc',
    details: 'Bài viết tuyển người qua biên giới có dấu hiệu buôn người nguy hiểm.',
    status: 'RESOLVED',
    resolved_by: 'admin-master-id',
    created_at: daysAgo(3.4)
  },
  {
    id: 'rep-hate-02',
    post_id: 'post-rejected-hate',
    reporter_id: 'user-hoami',
    reason: 'Ngôn từ thù ghét, quấy rối hoặc bạo lực',
    details: 'Chửi bới thô tục và đe dọa người khác.',
    status: 'RESOLVED',
    resolved_by: 'admin-master-id',
    created_at: daysAgo(2.9)
  }
];

// 7. SAFETY SHIELD LOGS
const safety_shield_logs = [
  {
    id: 'log-safety-01',
    user_id: 'user-bad-actor',
    risk_level: 'DANGER',
    emergency_alert: true,
    flagged_issues: JSON.stringify(['Dấu hiệu dụ dỗ việc làm bất thường hoặc nguy cơ buôn bán người qua biên giới']),
    created_at: daysAgo(3.5)
  },
  {
    id: 'log-safety-02',
    user_id: 'user-bad-actor',
    risk_level: 'WARNING',
    emergency_alert: false,
    flagged_issues: JSON.stringify(['Ngôn từ kích động tiêu cực, bạo lực ngôn từ']),
    created_at: daysAgo(3.0)
  }
];

// 8. AI CHAT SESSIONS & MESSAGES
const ai_chat_sessions = [
  {
    id: 'session-burnout-01',
    user_id: 'demo-user-id-01',
    title: 'Giải tỏa áp lực thi cử và đồ án tốt nghiệp',
    dominant_mood: 'Áp lực',
    created_at: daysAgo(1),
    updated_at: hoursAgo(2)
  },
  {
    id: 'session-sleep-02',
    user_id: 'demo-user-id-01',
    title: 'Khó ngủ và lo âu ban đêm',
    dominant_mood: 'Lo lắng',
    created_at: daysAgo(3),
    updated_at: daysAgo(3)
  }
];

const ai_chat_messages = [
  // Session 1 messages
  {
    id: 'msg-1',
    session_id: 'session-burnout-01',
    sender: 'user',
    message: 'Heli ơi, mình thấy bế tắc quá, đồ án tốt nghiệp làm mãi không xong mà sắp đến hạn bảo vệ rồi.',
    detected_emotion: 'Bế tắc & Căng thẳng',
    detected_topics: 'Học tập, Đồ án tốt nghiệp',
    created_at: daysAgo(1)
  },
  {
    id: 'msg-2',
    session_id: 'session-burnout-01',
    sender: 'heli',
    message: 'Chào bạn! Mình hiểu cảm giác này rất rõ. Khi khối lượng công việc quá lớn dồn dập, tâm trí chúng ta rất dễ rơi vào trạng thái quá tải và tê liệt. Bây giờ hãy cùng mình thực hiện kỹ thuật thở 4-7-8: hít vào thật sâu bằng mũi trong 4 giây, giữ hơi 7 giây và thở ra nhẹ nhàng bằng miệng trong 8 giây nhé. Bạn có thể chia sẻ cho mình phần nào trong đồ án đang làm bạn đau đầu nhất không?',
    detected_emotion: 'Đồng cảm & Hướng dẫn thở 4-7-8',
    detected_topics: 'Thư giãn, Giảm stress',
    created_at: daysAgo(1)
  },
  {
    id: 'msg-3',
    session_id: 'session-burnout-01',
    sender: 'user',
    message: 'Mình đang bị rối phần mô hình kết nối WebRTC P2P và cách giải thích với hội đồng bảo vệ.',
    detected_emotion: 'Lo lắng kỹ thuật',
    detected_topics: 'Kiến trúc P2P, WebRTC',
    created_at: hoursAgo(2.1)
  },
  {
    id: 'msg-4',
    session_id: 'session-burnout-01',
    sender: 'heli',
    message: 'Về WebRTC P2P, bạn hãy nhớ nguyên tắc cốt lõi: máy chủ trung tâm chỉ làm nhiệm vụ "mai mối" (Signaling) để trao đổi địa chỉ SDP và ICE Candidate giữa 2 máy khách. Sau khi kết nối thành công, tin nhắn đi thẳng ngang hàng qua RTCDataChannel và chỉ lưu trong RAM trình duyệt (Zero Server Storage). Điểm này thể hiện tính bảo mật và riêng tư vượt trội của đề tài bạn đấy!',
    detected_emotion: 'Khích lệ & Tư vấn chuyên môn',
    detected_topics: 'WebRTC, Kiến trúc an toàn',
    created_at: hoursAgo(2)
  },

  // Session 2 messages
  {
    id: 'msg-5',
    session_id: 'session-sleep-02',
    sender: 'user',
    message: 'Đêm nào nằm xuống giường mình cũng trằn trọc đến 3 giờ sáng vì nghĩ về những sai lầm trong quá khứ...',
    detected_emotion: 'Rối loạn giấc ngủ, Tự trách',
    detected_topics: 'Mất ngủ, Sang chấn quá khứ',
    created_at: daysAgo(3)
  },
  {
    id: 'msg-6',
    session_id: 'session-sleep-02',
    sender: 'heli',
    message: 'Màn đêm tĩnh mịch thường là lúc tâm trí dễ phóng đại những nỗi sợ và nuối tiếc nhất. Hãy nhắc nhở bản thân rằng: sai lầm trong quá khứ là bài học giúp bạn trưởng thành, chứ không phải bản án chung thân định nghĩa con người bạn. Thử bài tập Tiếp đất 5-4-3-2-1 nhé: tìm 5 thứ bạn nhìn thấy, 4 thứ bạn có thể chạm vào, 3 âm thanh bạn nghe thấy, 2 mùi hương bạn ngửi được và 1 điều tích cực về bản thân.',
    detected_emotion: 'Vỗ về & Kỹ thuật Tiếp đất 5-4-3-2-1',
    detected_topics: 'Chánh niệm, Giấc ngủ an lành',
    created_at: daysAgo(3)
  }
];

// 9. CHAT SESSIONS (WebRTC Metadata only)
const chat_sessions = [
  {
    id: 'p2p-session-01',
    peer_a_id: 'demo-user-id-01',
    peer_b_id: 'user-hoami',
    status: 'CLOSED',
    created_at: daysAgo(2)
  },
  {
    id: 'p2p-session-02',
    peer_a_id: 'user-giodem',
    peer_b_id: 'user-caovoi52',
    status: 'CLOSED',
    created_at: daysAgo(1)
  }
];

// Write to store.json
const fullStore = {
  users,
  posts,
  comments,
  post_likes,
  saved_posts,
  post_reports,
  user_reports: [],
  user_blocks: [],
  ai_chat_sessions,
  ai_chat_messages,
  mood_logs: [],
  safety_shield_logs,
  admin_logs: [],
  chat_sessions
};

fs.writeFileSync(STORE_PATH, JSON.stringify(fullStore, null, 2), 'utf8');
console.log(`✅ Đã ghi thành công ${users.length} users, ${posts.length} posts, ${comments.length} comments, ${post_likes.length} likes vào store.json!`);

// Update database.sql seed data
console.log('Cập nhật database.sql với dữ liệu mẫu mới...');

const sqlInserts = `
-- =========================================================================
-- DỮ LIỆU KHỞI TẠO MẪU TOÀN DIỆN (COMPREHENSIVE SEED DATA)
-- =========================================================================

-- 1. Thêm người dùng mẫu
INSERT INTO \`users\` (\`id\`, \`username\`, \`anonymous_name\`, \`avatar_url\`, \`bio\`, \`recovery_token_hash\`, \`password_hash\`, \`role\`, \`status\`, \`created_at\`)
VALUES 
('admin-master-id', 'admin', 'Quản trị viên (Heli Admin)', '🛡️', 'Quản trị viên và người điều hành hệ sinh thái HELI Platform.', '${getHmac('HELI-ADMN-2026-SAFE')}', '${getHash('admin123')}', 'admin', 'ACTIVE', NOW()),
('demo-user-id-01', 'demouser', 'Ánh Trăng', '/images/avatars/avatar_moon.svg', 'Thích ngắm trăng khuya và nghe nhạc lofi khi viết code.', '${getHmac('MOON-LIGHT-2026-CALM')}', '${getHash('123456')}', 'user', 'ACTIVE', NOW()),
('user-hoami', 'hoami_trang', 'Họa Mi Trắng', '/images/avatars/avatar_bird.svg', 'Học tập để trưởng thành, sống để yêu thương và thấu hiểu.', '${getHmac('BIRD-PEACE-2026-SING')}', '${getHash('123456')}', 'user', 'ACTIVE', NOW()),
('user-maymuathu', 'may_muathu', 'Mây Mùa Thu', '🌸', 'Đôi khi chỉ muốn một góc nhỏ bình yên giữa thành phố nhộn nhịp.', '${getHmac('FALL-CLOUD-2026-WIND')}', '${getHash('123456')}', 'user', 'ACTIVE', NOW()),
('user-giodem', 'gio_dem', 'Gió Đêm', '/images/avatars/avatar_fox.svg', 'Lắng nghe thanh âm dịu dàng của màn đêm.', '${getHmac('NIGHT-WIND-2026-CALM')}', '${getHash('123456')}', 'user', 'ACTIVE', NOW()),
('user-caphemuoi', 'caphe_muoi', 'Cà Phê Muối', '/images/avatars/avatar_coffee.svg', 'Một chút đắng, một chút mặn, trọn vẹn hương vị cuộc đời.', '${getHmac('SALT-CAFE-2026-WARM')}', '${getHash('123456')}', 'user', 'ACTIVE', NOW()),
('user-caovoi52', 'caovoi_52hz', 'Cá Voi 52Hz', '/images/avatars/avatar_whale.svg', 'Tìm kiếm tần số đồng điệu giữa đại dương bao la.', '${getHmac('WHALE-52HZ-2026-DEEP')}', '${getHash('123456')}', 'user', 'ACTIVE', NOW()),
('user-nangam', 'nang_am', 'Nắng Ấm', '/images/avatars/avatar_plant.svg', 'Sau cơn mưa trời lại sáng. Luôn giữ niềm tin vào ngày mai.', '${getHmac('WARM-SUNS-2026-HOPE')}', '${getHash('123456')}', 'user', 'ACTIVE', NOW()),
('user-saobang', 'saobang_nho', 'Sao Băng Nhỏ', '/images/avatars/avatar_star.svg', 'Ước mong những điều tốt đẹp nhất sẽ đến với tất cả các bạn.', '${getHmac('STAR-WISH-2026-GLOW')}', '${getHash('123456')}', 'user', 'ACTIVE', NOW()),
('user-meocam', 'meo_cam', 'Mèo Cam Ngủ Ngày', '/images/avatars/avatar_cat.svg', 'Cuộc sống bận rộn quá, cho mình chợp mắt 5 phút nhé.', '${getHmac('CAT-SLEEP-2026-PAWS')}', '${getHash('123456')}', 'user', 'ACTIVE', NOW()),
('user-sinhvienit', 'sinhvien_it2026', 'Sinh Viên Năm Cuối', '💻', 'Đang chiến đấu cùng Đồ án tốt nghiệp DACS4... Cố lên tôi ơi!', '${getHmac('GRAD-STUD-2026-VKU4')}', '${getHash('123456')}', 'user', 'ACTIVE', NOW()),
('user-bad-actor', 'spammer_99', 'Tài Khoản Đã Khóa', '⚠️', 'Tài khoản vi phạm quy chuẩn cộng đồng.', NULL, '${getHash('123456')}', 'user', 'SUSPENDED', NOW())
ON DUPLICATE KEY UPDATE \`anonymous_name\` = VALUES(\`anonymous_name\`), \`avatar_url\` = VALUES(\`avatar_url\`);

-- 2. Thêm bài viết mẫu có hình ảnh
INSERT INTO \`posts\` (\`id\`, \`user_id\`, \`mood_tag\`, \`content\`, \`image_url\`, \`is_private\`, \`status\`, \`rejection_reason\`, \`created_at\`)
VALUES
('post-study-01', 'user-sinhvienit', 'Áp lực', 'Chỉ còn 3 tuần nữa là đến ngày bảo vệ đồ án tốt nghiệp DACS4 rồi. Mấy hôm nay thức trắng đêm fix bug, vẽ lại các sơ đồ UML và viết tài liệu báo cáo mà người mệt lử. Nhiều lúc muốn buông xuôi ghê, nhưng nghĩ lại công sức 4 năm đại học của bản thân và sự kỳ vọng của bố mẹ lại tự nhủ phải cố gắng thêm một chút nữa. Ở đây có bạn nào cũng đang làm đồ án tốt nghiệp như mình không, chia sẻ cho mình chút động lực với...', '/images/posts/study_desk.svg', 0, 'APPROVED', NULL, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
('post-rain-02', 'user-caovoi52', 'Cô đơn', 'Đà Nẵng hôm nay mưa rả rích từ chiều đến tối muộn. Ngồi trong căn phòng trọ 15m2 ăn vội bát mì tôm tự nhiên thấy nhớ nhà đến quặn lòng. Nhớ nồi canh chua cá lóc mẹ nấu, nhớ tiếng ba gọi thức dậy mỗi sớm mai. Rời quê lên thành phố học tập và tự lập mới thấy làm người lớn cô đơn hơn mình tưởng rất nhiều...', '/images/posts/rain_night.svg', 0, 'APPROVED', NULL, DATE_SUB(NOW(), INTERVAL 5 HOUR)),
('post-sunset-03', 'user-giodem', 'Lạc lối', '22 tuổi, bạn bè xung quanh người thì có việc làm lương ngàn đô, người thì chuẩn bị đi du học. Nhìn lại bản thân vẫn chênh vênh chưa biết mình thực sự thích gì và muốn trở thành ai. Cảm giác bị tụt lại phía sau (FOMO) thật sự rất ngột ngạt. Chiều nay đứng trên cầu ngắm hoàng hôn sông Hàn, tự hỏi con đường phía trước của mình sẽ đi về đâu...', '/images/posts/sunset_bridge.svg', 0, 'APPROVED', NULL, DATE_SUB(NOW(), INTERVAL 8 HOUR)),
('post-sunflower-04', 'user-nangam', 'Hy vọng', 'Sau hơn 6 tháng vật lộn với chứng rối loạn lo âu và những cơn hoảng loạn (panic attacks), hôm nay là ngày đầu tiên mình có thể tự tin bước ra ngoài công viên, ngắm những đóa hoa hướng dương và hít thở thật sâu mà không thấy lồng ngực bị thắt nghẹn. Mình nhận ra rằng vết thương nào rồi cũng sẽ lành, chỉ cần chúng ta học cách kiên nhẫn và bao dung hơn với chính mình. Gửi năng lượng tích cực đến tất cả những ai đang cố gắng vượt qua giai đoạn khó khăn! 🌻', '/images/posts/sunflower.svg', 0, 'APPROVED', NULL, DATE_SUB(NOW(), INTERVAL 12 HOUR)),
('post-coffee-05', 'user-hoami', 'Biết ơn', 'Sáng nay đi xe buýt bị rơi ví tiền có toàn bộ thẻ sinh viên và căn cước công dân. Tưởng chừng mất hết hy vọng thì chiều nay nhận được cuộc gọi từ bác tài xế hẹn ra trạm nhận lại nguyên vẹn. Bác còn từ chối nhận tiền cảm ơn và nói: "Sinh viên đi học xa nhà khó khăn, giữ lấy mà ăn uống con ạ". Cuộc đời này vẫn còn nhiều điều tử tế và ấm áp đến lạ kỳ! Cảm ơn bác tài rất nhiều.', '/images/posts/coffee_quiet.svg', 0, 'APPROVED', NULL, DATE_SUB(NOW(), INTERVAL 1 DAY)),
('post-room-06', 'user-maymuathu', 'Buồn bã', 'Tụi mình đã bên nhau 4 năm, từ những ngày sinh viên nghèo đạp xe cọc cạch đi ăn ốc vỉa hè đến lúc cả hai đều có công việc ổn định. Vậy mà cuối cùng lại dừng lại chỉ vì "không còn cùng chung mục tiêu tương lai". Hóa ra trưởng thành cũng đồng nghĩa với việc học cách buông tay những người mình từng xem là cả bầu trời... Đêm nay góc phòng nhỏ bỗng trở nên trống trải lạ thường.', '/images/posts/cozy_room.svg', 0, 'APPROVED', NULL, DATE_SUB(NOW(), INTERVAL 36 HOUR)),
('post-private-07', 'demo-user-id-01', 'Cô đơn', '[Nhật ký riêng tư - Chỉ mình tôi]\\nĐêm nay ngắm bầu trời sao qua khung cửa sổ, tự hứa với bản thân sẽ không bao giờ để những lời phán xét hay nhận xét ác ý của người khác làm lung lay giá trị của mình nữa. Mình là phiên bản độc nhất vô nhị. Cố gắng hết sức hoàn thành kỳ thực tập và đạt mục tiêu học bổng thạc sĩ!', '/images/posts/starry_sky.svg', 1, 'APPROVED', NULL, DATE_SUB(NOW(), INTERVAL 2 DAY)),
('post-rejected-hate', 'user-bad-actor', 'Tuyệt vọng', 'Bọn mày chết hết đi, tao ghét tất cả chúng mày! Cuộc đời này quá bất công, tao muốn trả thù và hủy hoại tất cả!', NULL, 0, 'REJECTED', 'Nội dung chứa ngôn từ bạo lực, thù ghét hoặc kích động tiêu cực vi phạm tiêu chuẩn cộng đồng an toàn.', DATE_SUB(NOW(), INTERVAL 3 DAY)),
('post-rejected-scam', 'user-bad-actor', 'Lạc lối', 'Tuyển gấp 5 bạn nam/nữ làm việc online nhẹ nhàng tại khu kinh tế Mộc Bài, thu nhập 35-50 triệu/tháng không cần bằng cấp hay kinh nghiệm, bao ăn ở trọn gói qua biên giới, liên hệ Zalo 0987xxx để đi ngay trong đêm!', NULL, 0, 'REJECTED', 'AI Safety Shield phát hiện dấu hiệu lừa đảo bẫy việc làm xuyên biên giới hoặc buôn bán người. Đã kích hoạt cảnh báo an toàn.', DATE_SUB(NOW(), INTERVAL 4 DAY))
ON DUPLICATE KEY UPDATE \`content\` = VALUES(\`content\`), \`image_url\` = VALUES(\`image_url\`);

-- 3. Thêm bình luận tương tác & Lời an ủi từ AI Heli Buddy
INSERT INTO \`comments\` (\`id\`, \`post_id\`, \`user_id\`, \`parent_id\`, \`author_name\`, \`content\`, \`is_ai_bot\`, \`created_at\`)
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
ON DUPLICATE KEY UPDATE \`content\` = VALUES(\`content\`);

-- 4. Thêm lượt thích & bài viết lưu
INSERT IGNORE INTO \`post_likes\` (\`id\`, \`post_id\`, \`user_id\`, \`created_at\`)
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

INSERT IGNORE INTO \`saved_posts\` (\`id\`, \`post_id\`, \`user_id\`, \`created_at\`)
VALUES
('save-1', 'post-study-01', 'demo-user-id-01', NOW()),
('save-2', 'post-sunflower-04', 'demo-user-id-01', NOW()),
('save-3', 'post-coffee-05', 'user-hoami', NOW()),
('save-4', 'post-sunset-03', 'user-giodem', NOW());

-- 5. Thêm báo cáo an toàn mẫu
INSERT INTO \`post_reports\` (\`id\`, \`post_id\`, \`reporter_id\`, \`reason\`, \`details\`, \`status\`, \`resolved_by\`, \`created_at\`)
VALUES
('rep-scam-01', 'post-rejected-scam', 'demo-user-id-01', 'Lừa đảo, bẫy việc làm hoặc yêu cầu tiền bạc', 'Bài viết tuyển người qua biên giới có dấu hiệu buôn người nguy hiểm.', 'RESOLVED', 'admin-master-id', DATE_SUB(NOW(), INTERVAL 3 DAY)),
('rep-hate-02', 'post-rejected-hate', 'user-hoami', 'Ngôn từ thù ghét, quấy rối hoặc bạo lực', 'Chửi bới thô tục và đe dọa người khác.', 'RESOLVED', 'admin-master-id', DATE_SUB(NOW(), INTERVAL 2 DAY))
ON DUPLICATE KEY UPDATE \`status\` = VALUES(\`status\`);
`;

// Read current database.sql, keep table definitions, replace seed section
const originalSql = fs.readFileSync(DATABASE_SQL_PATH, 'utf8');
const seedMarker = '-- =========================================================================\n-- 7. DỮ LIỆU KHỞI TẠO MẪU';
const splitIndex = originalSql.indexOf(seedMarker);

if (splitIndex !== -1) {
  const schemaPart = originalSql.substring(0, splitIndex);
  fs.writeFileSync(DATABASE_SQL_PATH, schemaPart + sqlInserts + '\n-- HOÀN TẤT KHỞI TẠO CƠ SỞ DỮ LIỆU\n', 'utf8');
} else {
  fs.appendFileSync(DATABASE_SQL_PATH, '\n' + sqlInserts, 'utf8');
}

console.log('✅ Đã cập nhật database.sql hoàn tất!');
console.log('Mọi dữ liệu mẫu phong phú và hình ảnh đã sẵn sàng cho demo đồ án!');
