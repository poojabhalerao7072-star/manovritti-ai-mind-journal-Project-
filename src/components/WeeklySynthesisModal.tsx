import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Sparkles, 
  Calendar, 
  Smile, 
  Lightbulb, 
  Tag, 
  Lock, 
  AlertCircle, 
  CheckCircle2,
  FileText
} from 'lucide-react';
import { encryptText } from '../lib/crypto';
import { db, doc, setDoc } from '../lib/firebase';
import type { JournalEntry, WeeklySynthesisReport } from '../types';

interface WeeklySynthesisViewProps {
  userId: string;
  cryptoKey: CryptoKey | null;
  entries: JournalEntry[];
  savedSyntheses: WeeklySynthesisReport[];
  onSynthesisCreated: (report: WeeklySynthesisReport) => void;
}

export const WeeklySynthesisView: React.FC<WeeklySynthesisViewProps> = ({
  userId,
  cryptoKey,
  entries,
  savedSyntheses,
  onSynthesisCreated,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language as 'en' | 'mr') || 'en';

  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentReport, setCurrentReport] = useState<WeeklySynthesisReport | null>(null);

  // Filter entries from the past 7 days
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentWeekEntries = entries.filter((e) => e.createdAt >= sevenDaysAgo);

  const handleGenerateWeeklyReport = async () => {
    if (recentWeekEntries.length === 0) {
      setErrorMessage(t('noEntriesForWeekly'));
      return;
    }

    if (!cryptoKey) {
      setErrorMessage(
        currentLang === 'mr'
          ? 'स्थानिक सुरक्षा की उपलब्ध नाही.'
          : 'Local encryption key unavailable.'
      );
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // 1. Client-Side Decryption verification
      const decryptedPayload = recentWeekEntries.map((e) => ({
        date: new Date(e.createdAt).toLocaleDateString(),
        text: e.decryptedText || '',
        moodScore: e.moodScore,
        moodLabel: e.moodLabel,
        tags: e.tags,
      }));

      // 2. Call backend Gemini weekly synthesis route
      const res = await fetch('/api/gemini/weekly-synthesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries: decryptedPayload,
          language: currentLang,
        }),
      });

      if (!res.ok) {
        throw new Error(`Weekly synthesis failed with HTTP ${res.status}`);
      }

      const synthesisData = await res.json();

      // 3. Encrypt the generated synthesis text locally before saving to Firestore under users/{userId}/syntheses/{synthesisId}
      const { cipherText, iv } = await encryptText(
        synthesisData.weeklySummary,
        cryptoKey
      );

      const synthesisId = `synthesis_${Date.now()}`;
      const now = Date.now();

      const newReport: WeeklySynthesisReport = {
        id: synthesisId,
        userId: userId,
        createdAt: now,
        encryptedSummary: cipherText,
        iv: iv,
        weeklySummary: synthesisData.weeklySummary,
        topThemes: Array.isArray(synthesisData.topThemes) ? synthesisData.topThemes : [],
        averageMoodScore: Number(synthesisData.averageMoodScore) || 7,
        actionableInsight: synthesisData.actionableInsight || '',
        language: currentLang,
        entryCount: recentWeekEntries.length,
        dateRange: {
          start: new Date(sevenDaysAgo).toLocaleDateString(),
          end: new Date(now).toLocaleDateString(),
        },
      };

      const firestorePayload = {
        id: newReport.id,
        userId: newReport.userId,
        createdAt: newReport.createdAt,
        encryptedSummary: newReport.encryptedSummary,
        iv: newReport.iv,
        topThemes: newReport.topThemes,
        averageMoodScore: newReport.averageMoodScore,
        actionableInsight: newReport.actionableInsight,
        language: newReport.language,
        entryCount: newReport.entryCount,
        dateRange: newReport.dateRange,
      };

      await setDoc(doc(db, 'users', userId, 'syntheses', synthesisId), firestorePayload);

      setCurrentReport(newReport);
      onSynthesisCreated(newReport);
      setSuccessMessage(t('saveSynthesisSuccess'));
    } catch (err: any) {
      console.error('Synthesis error:', err);
      setErrorMessage(
        err?.message ||
          (currentLang === 'mr'
            ? 'साप्ताहिक सारांश तयार करताना त्रुटी आली.'
            : 'Error creating weekly synthesis.')
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner & Generation Trigger */}
      <div className="bg-stone-900/90 rounded-3xl border border-stone-800 p-6 sm:p-8 shadow-xl text-stone-100 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>{t('weeklyReportTitle')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif-display text-stone-100">
              {currentLang === 'mr'
                ? 'तुमच्या ७ दिवसांच्या भावनिक प्रवासाचा AI निष्कर्ष'
                : '7-Day Cognitive Pattern & Mood Synthesis'}
            </h2>
            <p className="text-stone-400 text-sm leading-relaxed">
              {t('weeklyReportSubtitle')} ({recentWeekEntries.length}{' '}
              {currentLang === 'mr' ? 'नोंदी सापडल्या' : 'entries available in past 7 days'}).
            </p>
          </div>

          <div className="shrink-0">
            <button
              id="btn-generate-weekly-synthesis"
              onClick={handleGenerateWeeklyReport}
              disabled={isGenerating || recentWeekEntries.length === 0}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-950/40 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:pointer-events-none"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-stone-950" />
                  <span>{t('generatingWeekly')}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-stone-950" />
                  <span>{t('generateWeeklyReport')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-4 flex items-center space-x-2 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/50 text-rose-300 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 flex items-center space-x-2 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-xs sm:text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      {/* Active Synthesis Display */}
      {currentReport && (
        <div 
          id="active-weekly-synthesis-card"
          className="bg-stone-900/90 rounded-3xl border border-amber-500/40 p-6 sm:p-8 shadow-2xl text-stone-100 space-y-6"
        >
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-800">
            <div className="flex items-center space-x-2 text-xs text-stone-400">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>
                {currentReport.dateRange.start} — {currentReport.dateRange.end}
              </span>
              <span>•</span>
              <span className="text-amber-300 font-semibold">
                {currentReport.entryCount} {currentLang === 'mr' ? 'नोंदी' : 'entries'}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                <Smile className="w-3.5 h-3.5" />
                <span>{t('averageMoodScore')}:</span>
                <span className="font-mono text-white text-sm">
                  {currentReport.averageMoodScore.toFixed(1)}/10
                </span>
              </span>
            </div>
          </div>

          {/* Top Themes */}
          {currentReport.topThemes && currentReport.topThemes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                {t('topThemes')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {currentReport.topThemes.map((theme, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-stone-800/90 text-amber-200 border border-stone-700/80 text-xs font-medium shadow-sm"
                  >
                    #{theme}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Holistic Summary */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              {currentLang === 'mr' ? 'साप्ताहिक सारांश' : 'Holistic Synthesis'}
            </h4>
            <p className="text-stone-200 text-base leading-relaxed whitespace-pre-wrap font-sans">
              {currentReport.weeklySummary}
            </p>
          </div>

          {/* Actionable Insight */}
          {currentReport.actionableInsight && (
            <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-2">
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Lightbulb className="w-4 h-4" />
                <span>{t('actionableInsight')}</span>
              </div>
              <p className="text-amber-100 text-sm leading-relaxed font-medium">
                {currentReport.actionableInsight}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Historic Saved Syntheses */}
      {savedSyntheses && savedSyntheses.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-stone-200 font-serif-display flex items-center space-x-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <span>{currentLang === 'mr' ? 'मागील साप्ताहिक अहवाल' : 'Archived Weekly Syntheses'}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedSyntheses.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-stone-900/70 border border-stone-800 text-stone-200 space-y-3 hover:border-stone-700 transition-all"
              >
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span>
                    {item.dateRange?.start} — {item.dateRange?.end}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-stone-800 text-amber-300 font-mono text-[11px]">
                    Avg: {item.averageMoodScore}/10
                  </span>
                </div>

                <p className="text-xs text-stone-300 line-clamp-3 leading-relaxed">
                  {item.weeklySummary}
                </p>

                {item.topThemes && (
                  <div className="flex flex-wrap gap-1">
                    {item.topThemes.slice(0, 3).map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] bg-stone-800 text-stone-300"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
