import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Sparkles, Send, User as UserIcon, Bot, Lock } from 'lucide-react';
import type { JournalEntry, ChatMessage } from '../types';

interface ChatWithGeminiModalProps {
  entry: JournalEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatWithGeminiModal: React.FC<ChatWithGeminiModalProps> = ({
  entry,
  isOpen,
  onClose,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language as 'en' | 'mr') || 'en';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (entry) {
      // Seed initial welcome message from Gemini based on entry context
      const initialGreeting =
        currentLang === 'mr'
          ? `नमस्कार! मी तुमच्या या नोंदीबद्दल तुमच्याशी चर्चा करण्यासाठी उपस्थित आहे. तुमच्या भावना, विचार किंवा पुढील दिशेबद्दल तुम्हाला काही विचारायचे आहे का?`
          : `Hello! I have reviewed your reflection. How would you like to explore these thoughts further? Feel free to share what’s on your mind.`;

      setMessages([
        {
          id: 'msg-0',
          role: 'model',
          text: initialGreeting,
          timestamp: Date.now(),
        },
      ]);
    }
  }, [entry, currentLang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen || !entry) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMessageText = inputText.trim();
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: userMessageText,
      timestamp: Date.now(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInputText('');
    setIsLoading(true);

    try {
      const payloadMessages = nextMessages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entryContext: entry.decryptedText || '',
          messages: payloadMessages,
          language: currentLang,
        }),
      });

      if (!res.ok) {
        throw new Error(`Chat request failed with HTTP ${res.status}`);
      }

      const data = await res.json();
      const modelReply = data.reply || (currentLang === 'mr' ? 'मी तुमचे ऐकले आहे.' : 'I hear you.');

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'model',
          text: modelReply,
          timestamp: Date.now(),
        },
      ]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'model',
          text:
            currentLang === 'mr'
              ? 'क्षमस्व, उत्तर मिळवण्यात अडचण आली. कृपया पुन्हा पाठवा.'
              : 'I apologize, an error occurred while connecting. Please try sending again.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="gemini-chat-modal"
        className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl flex flex-col h-[85vh] max-h-[750px] overflow-hidden text-stone-100"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-100 font-serif-display">
                {t('chatModalTitle')}
              </h3>
              <div className="flex items-center space-x-2 text-xs text-stone-400">
                <span className="flex items-center space-x-1 text-emerald-400">
                  <Lock className="w-3 h-3" />
                  <span>Decrypted Context Active</span>
                </span>
                <span>•</span>
                <span>Gemini 3.6 Flash</span>
              </div>
            </div>
          </div>

          <button
            id="btn-close-chat-modal"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Entry Context Ribbon */}
        <div className="px-5 py-2.5 bg-stone-950/70 border-b border-stone-800/80 text-xs text-stone-400 flex items-center justify-between">
          <span className="truncate max-w-[80%] italic">
            "{entry.decryptedText?.substring(0, 100)}..."
          </span>
          <span className="shrink-0 px-2 py-0.5 rounded-full bg-stone-800 text-amber-300 text-[10px] font-medium">
            {entry.moodLabel} ({entry.moodScore}/10)
          </span>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => {
            const isModel = msg.role === 'model';
            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-2.5 ${
                  isModel ? 'justify-start' : 'justify-end flex-row-reverse space-x-reverse'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                    isModel
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-stone-700 text-stone-200'
                  }`}
                >
                  {isModel ? <Bot className="w-4 h-4" /> : <UserIcon className="w-3.5 h-3.5" />}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isModel
                      ? 'bg-stone-800/90 text-stone-100 border border-stone-700/60 shadow-sm'
                      : 'bg-amber-600 text-white font-medium shadow-md shadow-amber-950/20'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center space-x-2 text-xs text-amber-300 bg-stone-950/60 p-3 rounded-2xl w-fit border border-stone-800">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>{t('chatThinking')}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-stone-800 bg-stone-900/90">
          <div className="flex items-center space-x-2">
            <input
              id="chat-modal-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t('chatPlaceholder')}
              disabled={isLoading}
              className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            <button
              id="btn-send-chat"
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
