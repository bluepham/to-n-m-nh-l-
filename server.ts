import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function hasConfiguredGeminiKey(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && key.trim() !== '' && key !== 'MY_GEMINI_API_KEY');
}

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '1mb' }));

  app.get('/api/gemini/status', (_req, res) => {
    res.json({
      available: hasConfiguredGeminiKey(),
      model: 'gemini-4-hydrogen',
    });
  });

  app.post('/api/gemini/ask', async (req, res) => {
    if (!hasConfiguredGeminiKey()) {
      res.status(503).json({
        error:
          'Máy chủ chưa cấu hình khóa GEMINI_API_KEY. Vui lòng sử dụng bộ giải thích Toán học chuẩn có sẵn hoặc cấu hình khóa trong Settings > Secrets.',
      });
      return;
    }

    const question = typeof req.body?.question === 'string' ? req.body.question.trim() : '';
    const tankContext = typeof req.body?.tankContext === 'string' ? req.body.tankContext.trim() : '';

    if (!question) {
      res.status(400).json({ error: 'Vui lòng nhập câu hỏi Toán học cần giải thích.' });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = [
        'Bạn là Trợ lý Toán học STEM của dự án SMART WATER TANK 3D tại Trường THPT Nguyễn Huệ (môn Toán 12, sách Kết nối tri thức với cuộc sống, Bài 13: Ứng dụng hình học của tích phân).',
        'Hãy giải thích ngắn gọn (khoảng 120–220 từ), chính xác về mặt toán học, rõ ràng cho học sinh lớp 12.',
        'Sử dụng quy ước trục Oz thẳng đứng từ đáy z = 0 đến đỉnh z = H, bán kính mặt cắt ngang r(z), diện tích thiết diện A(z) = π[r(z)]², thể tích V = π∫[r(z)]²dz.',
        'Luôn nêu rõ đơn vị (m, m², m³, lít) và khuyến khích học sinh kiểm chứng lại bằng công thức tích phân.',
      ].join(' ');

      const prompt = tankContext
        ? `Thông số bồn hiện tại: ${tankContext}\n\nCâu hỏi của học sinh: ${question}`
        : question;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      res.json({
        answer: response.text ?? 'Không nhận được phản hồi văn bản từ mô hình.',
        model: 'gemini-4-hydrogen',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi kết nối dịch vụ Gemini API.';
      res.status(500).json({
        error: `Không thể gọi Gemini API lúc này: ${message}`,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`SMART WATER TANK 3D server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
