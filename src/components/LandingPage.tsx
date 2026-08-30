import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  Languages, 
  TrendingUp, 
  AlertCircle,
  Mail,
  CheckCircle2
} from 'lucide-react';

interface LandingPageProps {
  onSignInGoogle: () => void;
  onSignInGmail: () => void;
  onSignInGithub: () => void;
  onSignInLinkedin: () => void;
  isLoading: boolean;
  loadingProvider?: string | null;
  errorMessage?: string | null;
  onClearError?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSignInGoogle,
  onSignInGmail,
  onSignInGithub,
  onSignInLinkedin,
  isLoading,
  loadingProvider,
  errorMessage,
  onClearError,
}) => {
  const { t, i18n } = useTranslation();
  const isMarathi = i18n.language === 'mr';

  const toggleLanguage = () => {
    i18n.changeLanguage(isMarathi ? 'en' : 'mr');
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between selection:bg-amber-500 selection:text-stone-950 relative">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Top Header Bar with Language Switcher */}
      <header className="relative z-10 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-stone-950 font-bold font-serif-display shadow-md shadow-amber-950/40">
            M
          </div>
          <span className="text-base font-bold font-serif-display tracking-tight text-stone-100">
            {t('appName')}
          </span>
        </div>

        <button
          id="btn-landing-language-toggle"
          onClick={toggleLanguage}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-amber-500/40 text-stone-300 text-xs font-semibold transition-all cursor-pointer hover:text-amber-300"
          title="Switch Language"
        >
          <Languages className="w-3.5 h-3.5 text-amber-400" />
          <span>{isMarathi ? 'English' : 'मराठी'}</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 flex-1 flex flex-col justify-center">
        
        {/* Hero Section */}
        <div className="text-center space-y-5 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-stone-900/90 border border-stone-800 text-amber-300 text-xs font-semibold shadow-inner">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{isMarathi ? 'झिरो-नॉलेज क्लायंट AES-GCM एनक्रिप्शन' : 'Client-Side AES-GCM 256-bit Encrypted'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-serif-display text-stone-100 leading-tight">
            {t('heroTitle')}
          </h1>

          <p className="text-base sm:text-lg text-stone-400 max-w-2xl mx-auto leading-relaxed font-sans">
            {t('heroSubtitle')}
          </p>

          {/* Error Message Notification Banner */}
          {errorMessage && (
            <div className="max-w-md mx-auto p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-start justify-between gap-3 text-left animate-in fade-in">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
              {onClearError && (
                <button
                  onClick={onClearError}
                  className="text-rose-400 hover:text-rose-200 font-bold"
                >
                  ×
                </button>
              )}
            </div>
          )}

          {/* Sign In Options Card */}
          <div className="pt-4 max-w-md mx-auto w-full space-y-3">
            
            {/* Primary Action: Google Account Sign In */}
            <button
              id="btn-signin-google"
              onClick={onSignInGoogle}
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center space-x-3 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm sm:text-base shadow-xl shadow-amber-950/40 transition-all hover:scale-[1.02] active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {isLoading && loadingProvider === 'google' ? (
                <Sparkles className="w-5 h-5 animate-spin text-stone-950" />
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>{t('signInWithGoogle')}</span>
            </button>

            {/* Divider */}
            <div className="relative py-1 flex items-center justify-center">
              <div className="border-t border-stone-800 w-full absolute" />
              <span className="relative bg-stone-950 px-3 text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
                {t('orChooseOption')}
              </span>
            </div>

            {/* Multi-Provider Alternative Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              
              {/* Option 2: Gmail Direct */}
              <button
                id="btn-signin-gmail"
                onClick={onSignInGmail}
                disabled={isLoading}
                className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-stone-900/90 hover:bg-stone-800/90 border border-stone-800 hover:border-amber-500/30 text-stone-200 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-98 disabled:opacity-50 cursor-pointer"
                title="Sign in with Gmail"
              >
                {isLoading && loadingProvider === 'gmail' ? (
                  <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                ) : (
                  <div className="w-4 h-4 text-rose-400 flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                )}
                <span>Gmail</span>
              </button>

              {/* Option 3: GitHub Account */}
              <button
                id="btn-signin-github"
                onClick={onSignInGithub}
                disabled={isLoading}
                className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-stone-900/90 hover:bg-stone-800/90 border border-stone-800 hover:border-amber-500/30 text-stone-200 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-98 disabled:opacity-50 cursor-pointer"
                title="Sign in with GitHub"
              >
                {isLoading && loadingProvider === 'github' ? (
                  <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                ) : (
                  <svg className="w-4 h-4 text-stone-200 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                )}
                <span>GitHub</span>
              </button>

              {/* Option 4: LinkedIn Account */}
              <button
                id="btn-signin-linkedin"
                onClick={onSignInLinkedin}
                disabled={isLoading}
                className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-stone-900/90 hover:bg-stone-800/90 border border-stone-800 hover:border-amber-500/30 text-stone-200 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-98 disabled:opacity-50 cursor-pointer"
                title="Sign in with LinkedIn"
              >
                {isLoading && loadingProvider === 'linkedin' ? (
                  <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                ) : (
                  <svg className="w-4 h-4 text-sky-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                )}
                <span>LinkedIn</span>
              </button>

            </div>

            <p className="text-[11px] text-stone-500 text-center pt-1 flex items-center justify-center space-x-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>{t('instantAccess')}</span>
            </p>
          </div>
        </div>

        {/* Feature Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-14 sm:mt-20">
          
          <div className="p-6 rounded-3xl bg-stone-900/60 border border-stone-800 text-stone-200 space-y-3 shadow-md hover:border-amber-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-100 font-serif-display">
              {t('feature1Title')}
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              {t('feature1Desc')}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-stone-900/60 border border-stone-800 text-stone-200 space-y-3 shadow-md hover:border-amber-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-100 font-serif-display">
              {t('feature2Title')}
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              {t('feature2Desc')}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-stone-900/60 border border-stone-800 text-stone-200 space-y-3 shadow-md hover:border-amber-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Languages className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-100 font-serif-display">
              {t('feature3Title')}
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              {t('feature3Desc')}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-stone-900/60 border border-stone-800 text-stone-200 space-y-3 shadow-md hover:border-amber-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-100 font-serif-display">
              {t('feature4Title')}
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              {t('feature4Desc')}
            </p>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-stone-800/80 py-6 text-center text-xs text-stone-500 px-4">
        <p>{t('disclaimer')}</p>
      </footer>
    </div>
  );
};
