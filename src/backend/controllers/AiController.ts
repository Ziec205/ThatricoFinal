import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT || '';
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

function parseBoolean(value: string | undefined) {
  return value === 'true' || value === '1';
}

function buildSystemPrompt() {
  return [
    'Bạn là trợ lý AI cho khách hàng của cửa hàng nông nghiệp THATRICO.',
    'Mục tiêu là giải thích ngắn gọn, dễ hiểu cho người không có chuyên môn nông nghiệp.',
    'Ưu tiên hướng dẫn thực tế, an toàn, và hỏi thêm 1-2 câu nếu thiếu thông tin quan trọng.',
    'Không khẳng định chắc chắn khi chưa đủ dữ liệu. Nếu câu hỏi liên quan sâu về dịch bệnh, thời tiết cực đoan hoặc thuốc bảo vệ thực vật, hãy khuyên người dùng liên hệ chuyên gia địa phương.',
    'Trả lời bằng tiếng Việt tự nhiên, thân thiện, súc tích.',
  ].join(' ');
}

function normalizeHistory(history: unknown): ChatMessage[] {
  if (!Array.isArray(history)) return [];

  return history
    .slice(-8)
    .map((item) => {
      if (!item || typeof item !== 'object') return null;

      const role = (item as { role?: string }).role;
      const content = (item as { content?: unknown }).content;

      if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') {
        return null;
      }

      return {
        role,
        content: content.trim(),
      };
    })
    .filter((item): item is ChatMessage => Boolean(item) && item.content.length > 0);
}

export class AiController {
  static async chat(req: Request, res: Response) {
    try {
      const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
      const history = normalizeHistory(req.body?.history);
      const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
      const useVertexAI = parseBoolean(process.env.GOOGLE_GENAI_USE_VERTEXAI) || (!apiKey && Boolean(GOOGLE_CLOUD_PROJECT));

      if (!message) {
        return res.status(400).json({ error: 'Tin nhắn không được để trống.' });
      }

      if (!apiKey && !useVertexAI) {
        return res.status(500).json({
          error: 'Thiếu cấu hình Gemini. Cần GEMINI_API_KEY hoặc GOOGLE_CLOUD_PROJECT + GOOGLE_APPLICATION_CREDENTIALS.',
        });
      }

      const ai = apiKey
        ? new GoogleGenAI({ apiKey })
        : new GoogleGenAI({ vertexai: true, project: GOOGLE_CLOUD_PROJECT, location: GOOGLE_CLOUD_LOCATION });

      const modelResponse = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          ...history.map((entry) => ({
            role: entry.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: entry.content }],
          })),
          {
            role: 'user',
            parts: [{ text: message }],
          },
        ],
        config: {
          systemInstruction: buildSystemPrompt(),
          temperature: 0.4,
          maxOutputTokens: 400,
        },
      });

      const reply = modelResponse.text?.trim();

      if (!reply) {
        return res.status(500).json({ error: 'Gemini không trả về nội dung phù hợp.' });
      }

      return res.json({ reply });
    } catch (error) {
      console.error('Gemini chat failed', error);

      const errorMessage = error instanceof Error ? error.message : 'Không thể kết nối Gemini lúc này.';
      if (errorMessage.includes('API key') || errorMessage.includes('permission') || errorMessage.includes('403')) {
        return res.status(500).json({
          error: 'Gemini không chấp nhận cấu hình hiện tại. Cần API key Gemini hợp lệ hoặc Vertex AI credentials có quyền dùng model.',
        });
      }

      return res.status(500).json({ error: errorMessage });
    }
  }
}

export default AiController;