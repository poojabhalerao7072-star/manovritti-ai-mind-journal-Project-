import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Sparkles, 
  RefreshCw, 
  PenLine, 
  Quote, 
  Calendar, 
  ShieldCheck, 
  Sun, 
  Moon, 
  Sunset, 
  Coffee 
} from 'lucide-react';
import type { User } from 'firebase/auth';
import type { DailyPromptResponse } from '../types';

interface WelcomeBannerProps {
  user: User | null;
  promptData: DailyPromptResponse | null;
  isLoading: boolean;
  onRefresh: () => void;
  onSelectPrompt: (promptText: string) => void;
  totalEntries?: number;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  user,
  promptData,
  isLoading,
  onRefresh,
  onSelectPrompt,
  totalEntries = 0,
}) => {
  const { t, i18n } = useTranslation();
  const isMarathi = i18n.language === 'mr';

  // Get user's first name or friendly name
  const rawName = user?.displayName?.trim() || user?.email?.split('@')[0] || '';
  const firstName = rawName.includes(' ') ? rawName.split(' ')[0] : rawName;
  const displayName = firstName || t('friend');

  // Time of day greeting
  const currentHour = new Date().getHours();
  let TimeIcon = Sun;
  let greetingKey = 'goodMorning';

  if (currentHour >= 4 && currentHour < 12) {
    TimeIcon = Coffee;
    greetingKey = 'goodMorning';
  } else if (currentHour >= 12 && currentHour < 17) {
    TimeIcon = Sun;
    greetingKey = 'goodAfternoon';
  } else if (currentHour >= 17 && currentHour < 21) {
    TimeIcon = Sunset;
    greetingKey = 'goodEvening';
  } else {
    TimeIcon = Moon;
    greetingKey = 'welcomeBackUser';
  }

  // Formatted date string
  const todayFormatted = new Intl.DateTimeFormat(isMarathi ? 'mr-IN' : 'en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const userPhoto = user?.photoURL;
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <section 
      id="user-welcome-banner"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-900/95 to-stone-950 border border-stone-800 p-6 sm:p-7 text-stone-100 shadow-xl shadow-black/40 mb-8 transition-all"
    >
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-60 h-60 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 space-y-6">
        
        {/* Top Header: User Profile Greeting & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800/80 pb-5">
          <div className="flex items-center space-x-3.5">
            {/* User Avatar or Monogram */}
            <div className="relative shrink-0">
              {userPhoto ? (
                <img
                  src={userPhoto}
                  alt={displayName}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-500/40 shadow-md shadow-amber-950/20"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 font-bold text-lg flex items-center justify-center border-2 border-amber-400/40 shadow-md shadow-amber-950/20">
                  {userInitial}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-stone-900 flex items-center justify-center">
                <ShieldCheck className="w-2.5 h-2.5 text-stone-950" />
              </div>
            </div>

            {/* Personalized Name Greeting */}
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <TimeIcon className="w-4 h-4 text-amber-400 shrink-0" />
                <h1 className="text-xl sm:text-2xl font-bold font-serif-display text-stone-100 tracking-tight">
                  {t(greetingKey, { name: displayName })}
                </h1>
              </div>
              <p className="text-xs text-stone-400 font-sans">
                {t('welcomeBannerSubtitle')}
              </p>
            </div>
          </div>

          {/* Date & Encryption Pill */}
          <div className="flex flex-wrap items-center gap-2 sm:self-center">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-stone-950/80 border border-stone-800 text-stone-300 text-xs font-medium">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>{todayFormatted}</span>
            </div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-stone-950/80 border border-stone-800 text-emerald-400 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AES-256</span>
              <span className="sm:hidden">Encrypted</span>
            </div>
          </div>
        </div>

        {/* Cognitive Starter Prompt Section inside the Welcome Banner */}
        <div className="rounded-2xl bg-stone-950/60 border border-amber-500/20 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                {t('dailyCognitivePrompt')}
              </span>
              {promptData?.theme && (
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium bg-stone-800 text-stone-300 border border-stone-700">
                  {promptData.theme}
                </span>
              )}
            </div>

            <button
              id="btn-refresh-prompt"
              onClick={onRefresh}
              disabled={isLoading}
              title={t('refreshPrompt')}
              className="flex items-center space-x-1 text-xs text-stone-400 hover:text-amber-300 transition-colors p-1.5 rounded-lg hover:bg-stone-800/80 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
              <span className="hidden sm:inline">{t('refreshPrompt')}</span>
            </button>
          </div>

          {isLoading ? (
            <div className="py-3 space-y-2 animate-pulse">
              <div className="h-5 bg-stone-800 rounded w-3/4"></div>
              <div className="h-4 bg-stone-800/60 rounded w-1/2"></div>
            </div>
          ) : (
            promptData && (
              <div className="space-y-3 pt-1">
                <p className="text-base sm:text-lg font-medium text-stone-100 leading-relaxed font-serif-display">
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
                    className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md shadow-amber-950/30 transition-all hover:scale-[1.02] active:scale-98 cursor-pointer"
                  >
                    <PenLine className="w-3.5 h-3.5" />
                    <span>{t('writeAboutThis')}</span>
                  </button>
                </div>
              </div>
            )
          )}
        </div>

      </div>
    </section>
  );
};
