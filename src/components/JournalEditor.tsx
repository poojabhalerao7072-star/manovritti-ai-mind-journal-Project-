import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Sparkles, 
  ShieldCheck, 
  Send, 
  Lock, 
  Tag, 
  MessageSquareQuote, 
  Smile, 
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VoiceRecorder } from './VoiceRecorder';
import { encryptText } from '../lib/crypto';
import { db, doc, setDoc } from '../lib/firebase';
import type { EntryAnalysisResponse, JournalEntry } from '../types';

interface JournalEditorProps {
  userId: string;
  cryptoKey: CryptoKey | null;
  initialPrompt?: string;
  onEntrySaved: (entry: JournalEntry) => void;
  onStartChat: (entry: JournalEntry) => void;
}

export const JournalEditor: React.FC<JournalEditorProps> = ({
  userId,
  cryptoKey,
  initialPrompt = '',
  onEntrySaved,
  onStartChat,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language as 'en' | 'mr') || 'en';

  const [text, setText] = useState<string>(initialPrompt);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<{
    entry: JournalEntry;
    analysis: EntryAnalysisResponse;
  } | null>(null);

  // If initialPrompt changes, update text if empty
  React.useEffect(() => {
    if (initialPrompt && !text) {
      setText(initialPrompt);
    }
  }, [initialPrompt]);

  const handleVoiceTranscript = (transcript: string) => {
    setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
  };

  const handleClear = () => {
    setText('');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setErrorMessage(
        currentLang === 'mr'
          ? 'कृपया रोजनिशीमध्ये काहीतरी लिहा किंवा बोला.'
          : 'Please write or speak something in your journal.'
      );
      return;
    }

    if (!cryptoKey) {
      setErrorMessage(
        currentLang === 'mr'
          ? 'स्थानिक एनक्रिप्शन की लोड होत आहे. कृपया काही क्षण थांबा.'
          : 'Local encryption key is still initializing. Please wait a moment.'
      );
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // 1. Client-Side AES-GCM Encryption
      const plainText = text.trim();
      const { cipherText, iv } = await encryptText(plainText, cryptoKey);

      // 2. Call backend Gemini API with decrypted text to perform empathetic cognitive evaluation
      const res = await fetch('/api/gemini/analyze-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: plainText,
          language: currentLang,
        }),
      });

      if (!res.ok) {
        throw new Error(`Gemini analysis failed with HTTP ${res.status}`);
      }

      const analysis: EntryAnalysisResponse = await res.json();

      // 3. Save zero-knowledge encrypted document directly into Firestore under users/{userId}/entries/{entryId}
      const entryId = `entry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const timestamp = Date.now();

      const newEntry: JournalEntry = {
        id: entryId,
        userId: userId,
        encryptedText: cipherText,
        iv: iv,
        decryptedText: plainText, // in-memory for active session
        moodScore: analysis.moodScore || 5,
        moodLabel: analysis.moodLabel || 'Calm',
        tags: Array.isArray(analysis.tags) ? analysis.tags : ['Reflection'],
        nextPrompt: analysis.nextSuggestedPrompt || '',
        reflection: analysis.reflection || '',
        language: currentLang,
        createdAt: timestamp,
      };

      // Strip any accidental undefined fields for clean Firestore payloads
      const firestorePayload = {
        id: newEntry.id,
        userId: newEntry.userId,
        encryptedText: newEntry.encryptedText,
        iv: newEntry.iv,
        moodScore: newEntry.moodScore,
        moodLabel: newEntry.moodLabel,
        tags: newEntry.tags,
        nextPrompt: newEntry.nextPrompt,
        reflection: newEntry.reflection,
        language: newEntry.language,
        createdAt: newEntry.createdAt,
      };

      await setDoc(doc(db, 'users', userId, 'entries', entryId), firestorePayload);

      // Trigger Confetti & Success state
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#f59e0b', '#10b981', '#6366f1'],
        });
      } catch {
        // ignore
      }

      setLastAnalysis({ entry: newEntry, analysis });
      onEntrySaved(newEntry);
      setText(''); // clear input buffer on confirmed save
    } catch (err: any) {
      console.error('Error saving entry:', err);
      setErrorMessage(
        err?.message ||
          (currentLang === 'mr'
            ? 'नोंद सेव्ह करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.'
            : 'Error encrypting and saving entry. Please try again.')
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const getMoodColor = (score: number) => {
    if (score >= 8) return 'text-emerald-400 bg-emerald-950/70 border-emerald-700/50';
    if (score >= 6) return 'text-teal-300 bg-teal-950/70 border-teal-700/50';
    if (score >= 4) return 'text-amber-300 bg-amber-950/70 border-amber-700/50';
    return 'text-rose-300 bg-rose-950/70 border-rose-700/50';
  };

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;

  return (
    <div className="space-y-6">
      <div className="bg-stone-900/90 rounded-3xl border border-stone-800 p-5 sm:p-7 shadow-xl shadow-stone-950/30 text-stone-100">
        
        {/* Editor Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-800">
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/40">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>{t('secureSession')}</span>
            </span>
            <span className="text-xs text-stone-400">
              {words} {t('wordCount')} · {chars} {t('charCount')}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Voice-to-Text Input (SpeechRecognition) */}
            <VoiceRecorder
              onTranscriptUpdate={handleVoiceTranscript}
              language={currentLang}
            />

            {text && (
              <button
                type="button"
                onClick={handleClear}
                title="Clear"
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Text Input Area */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="relative">
            <textarea
              id="journal-input-textarea"
              rows={7}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('editorPlaceholder')}
              disabled={isProcessing}
              className="w-full bg-stone-950/70 border border-stone-800 rounded-2xl p-4 text-stone-100 placeholder-stone-500 text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all resize-y leading-relaxed font-sans"
            />
          </div>

          {errorMessage && (
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-rose-950/60 border border-rose-800/50 text-rose-300 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <p className="text-xs text-stone-400 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {currentLang === 'mr'
                  ? 'मजकूर तुमच्या ब्राऊझरमध्ये AES-GCM ने एनक्रिप्ट केला जातो.'
                  : 'Encrypted locally with AES-GCM before database write.'}
              </span>
            </p>

            <button
              id="btn-save-analyze"
              type="submit"
              disabled={isProcessing || !text.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-950/40 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-stone-950" />
                  <span>{t('analyzing')}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-stone-950" />
                  <span>{t('saveAndAnalyze')}</span>
                  <Send className="w-3.5 h-3.5 ml-1 text-stone-950" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Latest Analysis & Empathetic Reflection Card */}
      {lastAnalysis && (
        <div 
          id="latest-reflection-card"
          className="rounded-3xl bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 border border-amber-500/40 p-6 shadow-xl text-stone-100 animate-in fade-in slide-in-from-bottom-3 duration-300"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-800/80">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="text-base sm:text-lg font-bold text-amber-300 font-serif-display">
                {t('aiReflectionTitle')}
              </h3>
            </div>

            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center space-x-1.5 ${getMoodColor(lastAnalysis.analysis.moodScore)}`}>
                <Smile className="w-3.5 h-3.5" />
                <span>{lastAnalysis.analysis.moodLabel}</span>
                <span className="font-mono ml-1 font-bold">
                  ({lastAnalysis.analysis.moodScore}/10)
                </span>
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {/* Empathetic Reflection */}
            <p className="text-stone-200 text-base leading-relaxed font-sans">
              {lastAnalysis.analysis.reflection}
            </p>

            {/* Smart Tags */}
            {lastAnalysis.analysis.tags && lastAnalysis.analysis.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <Tag className="w-3.5 h-3.5 text-stone-400 mr-1" />
                {lastAnalysis.analysis.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-stone-800/80 text-amber-200 border border-stone-700/60"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Suggested Next Reflection */}
            {lastAnalysis.analysis.nextSuggestedPrompt && (
              <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800/80 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-amber-400 text-xs font-semibold">
                  <MessageSquareQuote className="w-3.5 h-3.5" />
                  <span>{t('nextSuggestedPromptTitle')}</span>
                </div>
                <p className="text-stone-300 text-sm italic">
                  "{lastAnalysis.analysis.nextSuggestedPrompt}"
                </p>
              </div>
            )}

            {/* Explore Further with Gemini Action */}
            <div className="pt-2 flex justify-end">
              <button
                id="btn-dive-deeper-chat"
                onClick={() => onStartChat(lastAnalysis.entry)}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all hover:scale-[1.02]"
              >
                <span>{t('chatAboutEntry')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
