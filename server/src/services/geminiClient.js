const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/env');

let genAI = null;
if (config.ai.apiKey) {
  genAI = new GoogleGenerativeAI(config.ai.apiKey);
}

// Lấy mô hình Gemini linh hoạt, không cố định cứng tên model
function getGenerativeModel(customModel = null) {
  if (!genAI) return null;

  const modelName = customModel || config.ai.model;
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: config.ai.temperature,
      maxOutputTokens: config.ai.maxTokens
    }
  });
}

// Thực thi sinh nội dung an toàn kèm cơ chế thử lại bằng fallback model nếu cần
async function generateAiContent(prompt, customModel = null) {
  if (!genAI) return null;

  const primaryModelName = customModel || config.ai.model;
  try {
    const model = getGenerativeModel(primaryModelName);
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.warn(`[AI Client] Lỗi với model ${primaryModelName}: ${error.message}`);

    // Thử lại với fallback model nếu có cấu hình khác
    if (config.ai.fallbackModel && config.ai.fallbackModel !== primaryModelName) {
      try {
        console.log(`[AI Client] Đang thử lại với fallback model: ${config.ai.fallbackModel}...`);
        const fallbackModel = getGenerativeModel(config.ai.fallbackModel);
        const result = await fallbackModel.generateContent(prompt);
        return result.response.text();
      } catch (fallbackError) {
        console.warn(`[AI Client] Fallback model ${config.ai.fallbackModel} cũng thất bại: ${fallbackError.message}`);
      }
    }
    throw error;
  }
}

module.exports = {
  isAiConfigured: Boolean(config.ai.apiKey),
  getGenerativeModel,
  generateAiContent
};
