const { isAiConfigured, generateAiContent } = require('./geminiClient');

// Danh sách từ khóa độc hại dự phòng khi không có Gemini API key
const FALLBACK_TOXIC_KEYWORDS = [
  'địt', 'đm', 'dcm', 'vcl', 'clgt', 'lồn', 'cặc', 'buồi', 'chó đẻ',
  'chết đi', 'giết', 'tự tử', 'nhảy cầu', 'thắt cổ', 'bắn', 'đâm chết'
];

const FALLBACK_COMFORT_MESSAGES = [
  'Mình hiểu bạn đang cảm thấy rất mệt mỏi và cô đơn. Hãy hít một hơi thật sâu, mọi chuyện rồi sẽ ổn thôi. Luôn có người lắng nghe bạn ở đây.',
  'Những cảm xúc này thật không dễ dàng chút nào. Đừng quá khắt khe với bản thân hôm nay nhé, bạn đã cố gắng rất nhiều rồi.',
  'Cảm ơn bạn đã dũng cảm chia sẻ nỗi lòng. Hãy cho phép bản thân nghỉ ngơi một chút, mình luôn ở đây đồng hành cùng bạn.',
  'Dù hiện tại có u tối đến đâu, ngày mai mặt trời vẫn sẽ lên. Bạn không hề đơn độc trên hành trình này.'
];

async function inspectAndComfort(postContent) {
  // Nếu có cấu hình AI, sử dụng mô hình AI của Google Gemini
  if (isAiConfigured) {
    try {
      const prompt = `
        Bạn là hệ thống kiểm duyệt nội dung và hỗ trợ sức khỏe tinh thần trực tuyến cho nền tảng tâm sự ẩn danh "Heli".
        Nội dung người dùng viết:
        """${postContent}"""

        Nhiệm vụ:
        1. Xác định nội dung có chứa từ ngữ thù ghét, tục tĩu công kích cá nhân, kích động bạo lực hoặc đe dọa không (is_toxic).
        2. Nếu is_toxic = true, từ chối duyệt (approved = false) và đưa ra lý do ngắn gọn (reason).
        3. Nếu is_toxic = false, chấp nhận duyệt (approved = true). Nếu bài viết thể hiện nỗi buồn, áp lực, bế tắc, hãy tạo 1 câu an ủi thật dịu dàng, ấm áp, ngắn gọn và đồng cảm (comfort_message) dưới tư cách người bạn "Heli AI Buddy".
        
        BẮT BUỘC chỉ trả về định dạng JSON thuần hợp lệ, không có markdown hoặc giải thích thêm:
        {
          "approved": true/false,
          "is_toxic": true/false,
          "reason": "lý do nếu bị từ chối, hoặc null",
          "comfort_message": "câu an ủi ngắn gọn ấm áp nếu được duyệt"
        }
      `;

      const text = await generateAiContent(prompt);
      if (text) {
        const cleanJson = text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        return {
          approved: Boolean(parsed.approved),
          is_toxic: Boolean(parsed.is_toxic),
          reason: parsed.reason || null,
          comfort_message: parsed.comfort_message || 'Mình luôn ở đây lắng nghe bạn, bạn đã vất vả rồi!'
        };
      }
    } catch (error) {
      console.warn('[AI Moderation] Lỗi gọi Gemini API, chuyển sang chế độ Heuristic Fallback:', error.message);
    }
  }

  // Chế độ Fallback thông minh (khi chưa cấu hình API key hoặc mất mạng)
  const lowerContent = (postContent || '').toLowerCase();
  const hasToxic = FALLBACK_TOXIC_KEYWORDS.some(word => lowerContent.includes(word));

  if (hasToxic) {
    return {
      approved: false,
      is_toxic: true,
      reason: 'Nội dung chứa từ ngữ tiêu cực, thô tục hoặc vi phạm tiêu chuẩn cộng đồng an toàn.',
      comfort_message: ''
    };
  }

  const randomComfort = FALLBACK_COMFORT_MESSAGES[Math.floor(Math.random() * FALLBACK_COMFORT_MESSAGES.length)];
  return {
    approved: true,
    is_toxic: false,
    reason: null,
    comfort_message: randomComfort
  };
}

module.exports = { inspectAndComfort };
