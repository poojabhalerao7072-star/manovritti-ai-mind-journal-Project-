import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Key, Globe, LogOut, Sparkles, User as UserIcon } from 'lucide-react';
import { changeAppLanguage } from '../i18n';
import type { User } from '../lib/firebase';

interface NavbarProps {
  user: User | null;
  keyFingerprint: string;
  onOpenKeyModal: () => void;
  onSignOut: () => void;
  activeTab: 'journal' | 'analytics' | 'syntheses' | 'entries';
  setActiveTab: (tab: 'journal' | 'analytics' | 'syntheses' | 'entries') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  keyFingerprint,
  onOpenKeyModal,
  onSignOut,
  activeTab,
  setActiveTab,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'en' | 'mr';

  const toggleLanguage = () => {
    const nextLang = currentLang === 'en' ? 'mr' : 'en';
    changeAppLanguage(nextLang);
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 text-stone-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* App Logo & Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('journal')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center text-stone-950 font-bold shadow-md shadow-amber-950/20">
              <Sparkles className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-stone-100 font-serif-display">
                  {t('appName')}
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  v3.6 Flash
                </span>
              </div>
              <p className="text-xs text-stone-400 hidden sm:block">
                {t('appTagline')}
              </p>
            </div>
          </div>

          {/* Tab Navigation (Desktop) */}
          {user && (
            <nav className="hidden md:flex items-center space-x-1 bg-stone-950/60 p-1.5 rounded-xl border border-stone-800">
              <button
                id="nav-tab-journal"
                onClick={() => setActiveTab('journal')}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'journal'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/60'
                }`}
              >
                {t('tabJournal')}
              </button>
              <button
                id="nav-tab-entries"
                onClick={() => setActiveTab('entries')}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'entries'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/60'
                }`}
              >
                {t('tabEntries')}
              </button>
              <button
                id="nav-tab-analytics"
                onClick={() => setActiveTab('analytics')}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'analytics'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/60'
                }`}
              >
                {t('tabAnalytics')}
              </button>
              <button
                id="nav-tab-syntheses"
                onClick={() => setActiveTab('syntheses')}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'syntheses'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/60'
                }`}
              >
                {t('tabSyntheses')}
              </button>
            </nav>
          )}

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Language Switcher */}
            <button
              id="btn-language-toggle"
              onClick={toggleLanguage}
              title="Toggle Language (English / मराठी)"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-semibold tracking-wide transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentLang === 'en' ? 'मराठी' : 'English'}</span>
            </button>

            {/* Zero-Knowledge Security Badge & Key Modal */}
            {user && (
              <button
                id="btn-key-security"
                onClick={onOpenKeyModal}
                title={`${t('secureSession')} (${keyFingerprint})`}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-700/50 hover:bg-emerald-900/60 text-emerald-300 text-xs font-medium transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="hidden lg:inline">{t('secureSession')}</span>
                <span className="font-mono text-[10px] bg-emerald-900/80 px-1.5 py-0.5 rounded text-emerald-200">
                  {keyFingerprint}
                </span>
              </button>
            )}

            {/* User Profile & Sign Out */}
            {user ? (
              <div className="flex items-center space-x-2 pl-1 sm:pl-2 border-l border-stone-800">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full ring-2 ring-amber-500/30 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-stone-300">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
                
                <button
                  id="btn-sign-out"
                  onClick={onSignOut}
                  title={t('signOut')}
                  className="p-2 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-stone-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>

        </div>

        {/* Mobile Sub-Navigation */}
        {user && (
          <div className="flex md:hidden items-center justify-around py-2 border-t border-stone-800/80">
            <button
              id="mobile-nav-journal"
              onClick={() => setActiveTab('journal')}
              className={`px-3 py-1 text-xs font-medium rounded-md ${
                activeTab === 'journal' ? 'bg-amber-600 text-white' : 'text-stone-400'
              }`}
            >
              {t('tabJournal')}
            </button>
            <button
              id="mobile-nav-entries"
              onClick={() => setActiveTab('entries')}
              className={`px-3 py-1 text-xs font-medium rounded-md ${
                activeTab === 'entries' ? 'bg-amber-600 text-white' : 'text-stone-400'
              }`}
            >
              {t('tabEntries')}
            </button>
            <button
              id="mobile-nav-analytics"
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1 text-xs font-medium rounded-md ${
                activeTab === 'analytics' ? 'bg-amber-600 text-white' : 'text-stone-400'
              }`}
            >
              {t('tabAnalytics')}
            </button>
            <button
              id="mobile-nav-syntheses"
              onClick={() => setActiveTab('syntheses')}
              className={`px-3 py-1 text-xs font-medium rounded-md ${
                activeTab === 'syntheses' ? 'bg-amber-600 text-white' : 'text-stone-400'
              }`}
            >
              {t('tabSyntheses')}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
