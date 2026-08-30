import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, RefreshCw, PenLine, Quote } from 'lucide-react';
import type { DailyPromptResponse } from '../types';

interface DailyPromptBannerProps {
  promptData: DailyPromptResponse | null;
  isLoading: boolean;
  onRefresh: () => void;
  onSelectPrompt: (promptText: string) => void;
}

export const DailyPromptBanner: React.FC<DailyPromptBannerProps> = ({
  promptData,
  isLoading,
  onRefresh,
  onSelectPrompt,
}) => {
  const { t } = useTranslation();

  if (!promptData && !isLoading) {
    return null;
  }

  return (
    <section 
      id="daily-prompt-section"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-900/40 via-stone-900/80 to-stone-950 border border-amber-500/30 p-5 sm:p-6 text-stone-100 shadow-lg shadow-amber-950/20 mb-8"
    >
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              {t('dailyPromptTitle')}
            </span>
            {promptData?.theme && (
              <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-800 text-stone-300 border border-stone-700">
                {promptData.theme}
              </span>
            )}
          </div>

          <button
            id="btn-refresh-prompt"
            onClick={onRefresh}
            disabled={isLoading}
            title={t('refreshPrompt')}
            className="flex items-center space-x-1 text-xs text-stone-400 hover:text-amber-300 transition-colors p-1.5 rounded-lg hover:bg-stone-800/80 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            <span className="hidden sm:inline">{t('refreshPrompt')}</span>
          </button>
        </div>

        {isLoading ? (
          <div className="py-4 space-y-2 animate-pulse">
            <div className="h-5 bg-stone-800 rounded w-3/4"></div>
            <div className="h-4 bg-stone-800/60 rounded w-1/2"></div>
          </div>
        ) : (
          promptData && (
            <div className="space-y-4">
              <p className="text-lg sm:text-xl font-medium text-stone-100 leading-relaxed font-serif-display">
                "{promptData.prompt}"
              </p>

              {promptData.inspirationalQuote && (
                <div className="flex items-start space-x-2 text-stone-400 text-xs italic">
                  <Quote className="w-3.5 h-3.5 mt-0.5 text-amber-500/70 shrink-0" />
                  <span>{promptData.inspirationalQuote}</span>
                </div>
              )}

              <div className="pt-1 flex items-center justify-start">
                <button
                  id="btn-write-about-prompt"
                  onClick={() => onSelectPrompt(promptData.prompt)}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs tracking-wide shadow-md shadow-amber-950/30 transition-all hover:scale-[1.02]"
                >
                  <PenLine className="w-3.5 h-3.5" />
                  <span>{t('writeAboutThis')}</span>
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
};
