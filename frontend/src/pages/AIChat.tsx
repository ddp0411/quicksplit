import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

const suggestions = [
  'Why did I overspend this month?',
  'What is my top spending category?',
  'How can I save more money?',
  'Show my recurring expenses',
];

const fakeReplies: Record<string, string> = {
  default: "Based on your recent activity, I can see some patterns in your spending. Housing and dining are your top categories. Would you like specific recommendations for any area?",
  overspend: "Your dining expenses increased by 23% this month compared to last month. Specifically, food delivery orders went up from 8 to 14. Cooking at home 3 more times per week could save you around ₹1,200 monthly.",
  category: "Your top spending categories are: 1) Dining & Food (42%) 2) Transport (24%) 3) Entertainment (18%) 4) Shopping (16%). Food and transport together make up 66% of your tracked spending.",
  save: "Here are 3 quick wins: 1) Cancel unused subscriptions (saving ~₹200/mo) 2) Reduce food delivery to 2x per week (-₹900/mo) 3) Use public transport on weekends (-₹400/mo). Total potential saving: ~₹1,500/month.",
  recurring: "I found 3 recurring expenses: Netflix ₹649/mo (Jan 12), Spotify ₹119/mo (Jan 26), Gym ₹1,200/mo (Jan 1). Total: ₹1,968/month in subscriptions.",
};

function getReply(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('overspend') || lower.includes('over')) return fakeReplies.overspend;
  if (lower.includes('category') || lower.includes('top')) return fakeReplies.category;
  if (lower.includes('save') || lower.includes('saving')) return fakeReplies.save;
  if (lower.includes('recurring') || lower.includes('subscription')) return fakeReplies.recurring;
  return fakeReplies.default;
}

export const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  const send = (text: string) => {
    if (!text.trim() || thinking) return;
    const userMsg: Message = { role: 'user', text: text.trim() };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setMessages(m => [...m, { role: 'ai', text: getReply(text) }]);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
        <Link to="/personal" className="flex h-9 w-9 items-center justify-center rounded-2xl transition hover:bg-slate-100 dark:hover:bg-slate-800">
          <ArrowLeftIcon className="h-5 w-5" style={{ color: 'var(--text)' }} />
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary-600">
            <SparklesIcon className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>AI Finance Assistant</p>
            <p className="text-xs text-positive">Online</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-600">
              <SparklesIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="font-bold text-lg" style={{ color: 'var(--text)' }}>AI Finance Chat</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Ask me anything about your spending habits.</p>
            </div>
            <div className="space-y-2">
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="block w-full max-w-xs mx-auto rounded-2xl border px-4 py-2.5 text-sm font-semibold text-left transition hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'ai' && (
                <div className="flex h-7 w-7 shrink-0 mr-2 mt-1 items-center justify-center rounded-full bg-primary-600">
                  <SparklesIcon className="h-3.5 w-3.5 text-white" />
                </div>
              )}
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white rounded-tr-sm'
                    : 'rounded-tl-sm shadow-card'
                }`}
                style={msg.role === 'ai' ? { background: 'var(--card)', color: 'var(--text)' } : undefined}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {thinking && (
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-600">
              <SparklesIcon className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="rounded-2xl rounded-tl-sm px-4 py-3 shadow-card" style={{ background: 'var(--card)' }}>
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-primary-500"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
        <form
          onSubmit={e => { e.preventDefault(); send(input); }}
          className="flex items-center gap-2 rounded-2xl border px-4 py-2"
          style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
        >
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about your finances..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--text)' }}
          />
          <button
            type="submit"
            disabled={!input.trim() || thinking}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-600 text-white disabled:opacity-40 transition"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
