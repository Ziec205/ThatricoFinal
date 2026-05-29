import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bot, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import toast from 'react-hot-toast';

type ChatRole = 'user' | 'assistant';

type ChatMessage = {
  role: ChatRole;
  content: string;
};

const STARTER_MESSAGES: ChatMessage[] = [
  {
    role: 'assistant',
    content: 'Mình là trợ lý nông nghiệp. Hãy hỏi ngắn gọn về cây trồng, phân bón, sâu bệnh hoặc cách chăm sóc, mình sẽ giải thích dễ hiểu nhất có thể.',
  },
];

const QUICK_PROMPTS = [
  'Lúa bị vàng lá thì xử lý sao?',
  'Nên bón phân gì cho rau ăn lá?',
  'Cách nhận biết cây thiếu đạm?',
];

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(STARTER_MESSAGES);
  const [isSending, setIsSending] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const canSend = useMemo(() => input.trim().length > 0 && !isSending, [input, isSending]);

  const sendMessage = async (messageText: string) => {
    const trimmed = messageText.trim();
    if (!trimmed || isSending) return;

    const userMessage: ChatMessage = { role: 'user', content: trimmed };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput('');
    setIsSending(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: nextMessages.slice(-8),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Không thể nhận phản hồi từ AI.');
      }

      setMessages((current) => [...current, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error('AI chat failed', error);
      toast.error('Không gửi được câu hỏi cho AI. Vui lòng thử lại.');
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: 'Hiện tại mình chưa kết nối được AI. Bạn có thể thử lại sau vài giây.',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendMessage(input);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="fixed bottom-5 right-5 z-[60] flex items-center gap-3 rounded-full bg-text-main px-4 py-3 text-sm font-bold text-white shadow-2xl shadow-emerald-950/20 transition-transform hover:scale-[1.02]"
      >
        <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
          <MessageCircle size={20} />
          <span className="absolute inset-0 rounded-full border border-white/30 animate-ping" />
        </span>
        <span className="hidden sm:block text-left">
          <span className="block text-[10px] uppercase tracking-[0.35em] text-white/60">Hỗ trợ AI</span>
          <span className="block text-sm font-semibold">Hỏi nhanh về nông nghiệp</span>
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.section
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-5 z-[60] flex h-[70vh] w-[min(92vw,380px)] flex-col overflow-hidden rounded-[28px] border border-outline bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)]"
          >
            <div className="flex items-start justify-between gap-4 bg-gradient-to-br from-text-main via-emerald-900 to-primary px-5 py-4 text-white">
              <div>
                <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.35em] text-white/70">
                  <Sparkles size={12} /> Trợ lý nông nghiệp
                </div>
                <h3 className="text-lg font-black">THATRICO AI</h3>
                <p className="mt-1 text-xs text-white/75">Giải thích dễ hiểu cho người không chuyên.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                aria-label="Đóng chatbox"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto bg-surface px-4 py-4">
              <div className="rounded-2xl border border-primary/15 bg-primary-container px-4 py-3 text-xs leading-relaxed text-on-primary-container">
                Gợi ý: Hỏi về loại cây, triệu chứng, thời tiết hoặc cách bón phân. Mình sẽ trả lời ngắn gọn, dễ làm theo.
              </div>

              <div className="flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    disabled={isSending}
                    className="rounded-full border border-outline bg-white px-3 py-2 text-left text-[11px] font-semibold text-text-main transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}-${message.content.slice(0, 12)}`}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      message.role === 'user'
                        ? 'bg-text-main text-white'
                        : 'bg-white text-text-main shadow-sm border border-outline'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {isSending && (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-outline bg-white px-4 py-3 text-sm text-text-muted shadow-sm">
                    <Bot size={16} className="text-primary" />
                    Đang suy nghĩ...
                  </div>
                </div>
              )}

              <div ref={endRef} />
            </div>

            <form onSubmit={handleSubmit} className="border-t border-outline bg-white p-3">
              <div className="flex items-end gap-2 rounded-2xl border border-outline bg-surface-container p-2">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Nhập câu hỏi của bạn..."
                  rows={2}
                  className="max-h-28 flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-text-muted"
                />
                <button
                  type="submit"
                  disabled={!canSend}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-stone-300"
                  aria-label="Gửi câu hỏi"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}