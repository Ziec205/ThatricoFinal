import { Request, Response } from 'express';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

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
      const apiKey = process.env.GEMINI_API_KEY;
      const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
      const history = normalizeHistory(req.body?.history);

      if (!apiKey) {
        return res.status(500).json({ error: 'Thiếu GEMINI_API_KEY trong biến môi trường.' });
      }

      if (!message) {
        return res.status(400).json({ error: 'Tin nhắn không được để trống.' });
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: buildSystemPrompt() }],
          },
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
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 400,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data?.error?.message || 'Gemini API không phản hồi đúng.';
        return res.status(response.status).json({ error: errorMessage });
      }

      const reply = data?.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part.text || '')
        .join('')
        .trim();

      if (!reply) {
        return res.status(500).json({ error: 'Gemini không trả về nội dung phù hợp.' });
      }

      return res.json({ reply });
    } catch (error) {
      console.error('Gemini chat failed', error);
      return res.status(500).json({ error: 'Không thể kết nối Gemini lúc này.' });
    }
  }
}

export default AiController;