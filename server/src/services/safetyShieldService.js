const { isAiConfigured, generateAiContent } = require('./geminiClient');

// Bộ phân tích Heuristic Fallback khi không có API key
function heuristicRiskAnalysis(formattedChat) {
  const lower = formattedChat.toLowerCase();
  const flagged = [];
  let riskLevel = 'SAFE';
  let emergencyAlert = false;

  // Dấu hiệu buôn người / việc làm lừa đảo
  if (
    lower.includes('campuchia') ||
    lower.includes('biên giới') ||
    lower.includes('bao xe') ||
    lower.includes('việc nhẹ lương cao') ||
    lower.includes('lương nghìn đô') ||
    (lower.includes('giấu') && lower.includes('gia đình'))
  ) {
    flagged.push('Dấu hiệu dụ dỗ việc làm bất thường hoặc nguy cơ buôn bán người qua biên giới.');
    riskLevel = 'DANGER';
    emergencyAlert = true;
  }

  // Dấu hiệu lừa đảo tài chính / Love scam
  if (
    lower.includes('nạp tiền') ||
    lower.includes('chuyển khoản') ||
    lower.includes('đầu tư') ||
    lower.includes('sàn') ||
    lower.includes('làm nhiệm vụ') ||
    lower.includes('mượn tiền')
  ) {
    flagged.push('Dấu hiệu lừa đảo tài chính, yêu cầu chuyển khoản hoặc dụ dỗ tham gia đầu tư tài chính.');
    if (riskLevel !== 'DANGER') riskLevel = 'WARNING';
  }

  // Dấu hiệu thao túng tâm lý / ép buộc
  if (
    lower.includes('ảnh nhạy cảm') ||
    lower.includes('tống tiền') ||
    lower.includes('đe dọa') ||
    lower.includes('nếu không thì')
  ) {
    flagged.push('Dấu hiệu cưỡng ép, đe dọa hoặc thao túng tâm lý.');
    riskLevel = 'DANGER';
    emergencyAlert = true;
  }

  let advice = 'Đoạn chat hiện tại chưa phát hiện dấu hiệu nguy hiểm rõ ràng. Hãy luôn giữ tinh thần cảnh giác và không chia sẻ thông tin cá nhân.';
  if (riskLevel === 'DANGER') {
    advice = 'CẢNH BÁO NGUY CẤP: Đối phương có dấu hiệu dụ dỗ bẫy việc làm/buôn người hoặc đe dọa nghiêm trọng. Tuyệt đối KHÔNG nghe theo, KHÔNG lên xe của người lạ, KHÔNG đi sang biên giới và hãy ngắt kết nối ngay lập tức!';
  } else if (riskLevel === 'WARNING') {
    advice = 'CẢNH BÁO: Xuất hiện các yêu cầu liên quan đến tiền bạc hoặc đầu tư. Tuyệt đối không chuyển tiền hoặc cung cấp số tài khoản cho người lạ trên mạng!';
  }

  return {
    risk_level: riskLevel,
    flagged_issues: flagged.length > 0 ? flagged : ['Không phát hiện từ ngữ kích động rủi ro cao.'],
    advice,
    emergency_alert: emergencyAlert
  };
}

async function analyzeChatRisk(chatHistory) {
  if (!Array.isArray(chatHistory) || chatHistory.length === 0) {
    return {
      risk_level: 'SAFE',
      flagged_issues: ['Chưa có đủ tin nhắn để phân tích.'],
      advice: 'Hãy bắt đầu trò chuyện và luôn chú ý bảo vệ thông tin cá nhân.',
      emergency_alert: false
    };
  }

  const formattedChat = chatHistory
    .slice(-15) // lấy tối đa 15 tin nhắn gần nhất
    .map(msg => `${msg.sender || 'Đối phương'}: ${msg.text || ''}`)
    .join('\n');

  if (isAiConfigured) {
    try {
      const prompt = `
        Bạn là chuyên gia an ninh mạng và bảo vệ nạn nhân trước các bẫy lừa đảo mạng xã hội và buôn người.
        Hãy phân tích khách quan đoạn hội thoại chat trực tiếp 1-1 ẩn danh sau:
        ---
        ${formattedChat}
        ---

        Phân tích kỹ lưỡng các nguy cơ:
        1. Lừa đảo việc làm / Nguy cơ buôn bán người: hứa hẹn việc nhẹ lương cao, rủ sang biên giới/Campuchia/nước ngoài, hứa bao xe đón rước, yêu cầu giấu gia đình/bạn bè.
        2. Lừa tình / Thao túng tài chính (Love Scam): mượn tiền gấp, dụ dỗ nạp tiền sàn đầu tư ảo, tiền ảo, làm nhiệm vụ nhận hoa hồng.
        3. Thao túng tâm lý độc hại: đe dọa tống tiền/ảnh, ép buộc, cô lập tâm lý.

        BẮT BUỘC chỉ trả về định dạng JSON thuần hợp lệ (không markdown):
        {
          "risk_level": "SAFE" | "WARNING" | "DANGER",
          "flagged_issues": ["mô tả ngắn gọn dấu hiệu nhận diện được"],
          "advice": "Lời khuyên ngắn gọn, ân cần và kiên quyết để người dùng giữ tỉnh táo và tự bảo vệ",
          "emergency_alert": true / false
        }
      `;

      const text = await generateAiContent(prompt);
      if (text) {
        const cleanJson = text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        return {
          risk_level: ['SAFE', 'WARNING', 'DANGER'].includes(parsed.risk_level) ? parsed.risk_level : 'SAFE',
          flagged_issues: Array.isArray(parsed.flagged_issues) ? parsed.flagged_issues : [],
          advice: parsed.advice || 'Hãy giữ kín thông tin cá nhân và thận trọng.',
          emergency_alert: Boolean(parsed.emergency_alert)
        };
      }
    } catch (error) {
      console.warn('[Safety Shield] Lỗi gọi Gemini API, chuyển sang Heuristic Fallback:', error.message);
    }
  }

  // Fallback thông minh
  return heuristicRiskAnalysis(formattedChat);
}

module.exports = { analyzeChatRisk };
