import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Smile, 
  Tag, 
  Sparkles, 
  MessageSquareQuote, 
  Trash2, 
  Lock, 
  ChevronDown, 
  ChevronUp,
  MessageCircle,
  Calendar
} from 'lucide-react';
import type { JournalEntry } from '../types';

interface EntryCardProps {
  entry: JournalEntry;
  onDelete: (id: string) => void;
  onStartChat: (entry: JournalEntry) => void;
  onTagClick?: (tag: string) => void;
}

export const EntryCard: React.FC<EntryCardProps> = ({
  entry,
  onDelete,
  onStartChat,
  onTagClick,
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const formattedDate = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(entry.createdAt));

  const getMoodBadge = (score: number) => {
    if (score >= 8) {
      return {
        bg: 'bg-emerald-950/80 border-emerald-700/60 text-emerald-300',
        scoreBg: 'bg-emerald-500 text-stone-950',
      };
    }
    if (score >= 6) {
      return {
        bg: 'bg-teal-950/80 border-teal-700/60 text-teal-300',
        scoreBg: 'bg-teal-500 text-stone-950',
      };
    }
    if (score >= 4) {
      return {
        bg: 'bg-amber-950/80 border-amber-700/60 text-amber-300',
        scoreBg: 'bg-amber-500 text-stone-950',
      };
    }
    return {
      bg: 'bg-rose-950/80 border-rose-700/60 text-rose-300',
      scoreBg: 'bg-rose-500 text-stone-950',
    };
  };

  const moodStyle = getMoodBadge(entry.moodScore);

  return (
    <article
      id={`entry-card-${entry.id}`}
      className="bg-stone-900/80 rounded-2xl border border-stone-800/80 p-5 sm:p-6 shadow-md hover:border-stone-700 transition-all text-stone-100"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800/60">
        <div className="flex items-center space-x-2 text-xs text-stone-400">
          <Calendar className="w-3.5 h-3.5 text-stone-400" />
          <span>{formattedDate}</span>
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] bg-stone-800 text-stone-300 border border-stone-700">
            <Lock className="w-2.5 h-2.5 text-emerald-400" />
            <span>AES-GCM</span>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Mood Badge */}
          <div className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center space-x-1.5 ${moodStyle.bg}`}>
            <Smile className="w-3.5 h-3.5" />
            <span>{entry.moodLabel}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${moodStyle.scoreBg}`}>
              {entry.moodScore}/10
            </span>
          </div>

          {/* Delete Action */}
          <button
            id={`btn-delete-${entry.id}`}
            onClick={() => onDelete(entry.id)}
            title="Delete Entry"
            className="p-1.5 rounded-lg text-stone-500 hover:text-rose-400 hover:bg-stone-800/60 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Decrypted Text Body */}
      <div className="mt-4">
        <p className="text-stone-200 text-base leading-relaxed whitespace-pre-wrap font-sans">
          {entry.decryptedText || (
            <span className="italic text-stone-500">
              [Encrypted Payload: {entry.encryptedText.substring(0, 32)}...]
            </span>
          )}
        </p>
      </div>

      {/* Smart Tags */}
      {entry.tags && entry.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mt-4">
          <Tag className="w-3 h-3 text-stone-500 mr-0.5" />
          {entry.tags.map((tag, idx) => (
            <button
              key={idx}
              onClick={() => onTagClick && onTagClick(tag)}
              className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-stone-800/90 hover:bg-stone-700 text-amber-300 border border-stone-700/60 transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Gemini AI Reflection Section (Collapsible / Preview) */}
      {entry.reflection && (
        <div className="mt-4 pt-3 border-t border-stone-800/60">
          <div className="rounded-xl bg-stone-950/60 border border-amber-500/20 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('aiReflectionTitle')}</span>
              </div>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-stone-400 hover:text-stone-200 flex items-center space-x-1"
              >
                {isExpanded ? (
                  <>
                    <span>Hide</span>
                    <ChevronUp className="w-3 h-3" />
                  </>
                ) : (
                  <>
                    <span>Expand</span>
                    <ChevronDown className="w-3 h-3" />
                  </>
                )}
              </button>
            </div>

            <p className={`text-stone-300 text-xs sm:text-sm leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
              {entry.reflection}
            </p>

            {isExpanded && entry.nextPrompt && (
              <div className="pt-2 border-t border-stone-800/60 flex items-start space-x-2 text-xs text-stone-400">
                <MessageSquareQuote className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-stone-300">{t('nextSuggestedPromptTitle')}: </span>
                  <span className="italic">"{entry.nextPrompt}"</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div className="mt-4 pt-3 border-t border-stone-800/40 flex items-center justify-end">
        <button
          id={`btn-chat-entry-${entry.id}`}
          onClick={() => onStartChat(entry)}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 text-xs font-semibold transition-all hover:scale-[1.02]"
        >
          <MessageCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>{t('chatAboutEntry')}</span>
        </button>
      </div>
    </article>
  );
};
