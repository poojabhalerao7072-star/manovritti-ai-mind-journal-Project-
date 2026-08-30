import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  auth, 
  signInWithGoogle, 
  signInWithGmail,
  signInWithGithub,
  signInWithLinkedin,
  logOut, 
  onAuthStateChanged, 
  db, 
  collection, 
  doc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  type User 
} from './lib/firebase';
import { 
  getOrCreateUserKey, 
  getKeyFingerprint, 
  decryptText 
} from './lib/crypto';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { WelcomeBanner } from './components/WelcomeBanner';
import { JournalEditor } from './components/JournalEditor';
import { EntryCard } from './components/EntryCard';
import { AnalyticsView } from './components/AnalyticsView';
import { WeeklySynthesisView } from './components/WeeklySynthesisModal';
import { ChatWithGeminiModal } from './components/ChatWithGeminiModal';
import { EncryptionKeyModal } from './components/EncryptionKeyModal';
import { 
  Search, 
  Tag, 
  BookOpen, 
  Sparkles, 
  Lock, 
  AlertCircle, 
  PlusCircle, 
  Filter 
} from 'lucide-react';
import type { 
  JournalEntry, 
  WeeklySynthesisReport, 
  DailyPromptResponse 
} from './types';

export default function App() {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language as 'en' | 'mr') || 'en';

  // Auth & Encryption state
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'gmail' | 'github' | 'linkedin' | null>(null);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);
  const [keyFingerprint, setKeyFingerprint] = useState<string>('Initializing...');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);

  // App UI State
  const [activeTab, setActiveTab] = useState<'journal' | 'analytics' | 'syntheses' | 'entries'>('journal');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [syntheses, setSyntheses] = useState<WeeklySynthesisReport[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Daily Starter Prompt
  const [dailyPrompt, setDailyPrompt] = useState<DailyPromptResponse | null>(null);
  const [isPromptLoading, setIsPromptLoading] = useState<boolean>(false);
  const [editorInitialPrompt, setEditorInitialPrompt] = useState<string>('');

  // Active Chat on Entry
  const [activeChatEntry, setActiveChatEntry] = useState<JournalEntry | null>(null);

  // 1. Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (currentUser) {
        // Initialize or load the user's AES-256 GCM client encryption key
        try {
          const key = await getOrCreateUserKey(currentUser.uid);
          setCryptoKey(key);
          const fp = await getKeyFingerprint(key);
          setKeyFingerprint(fp);
        } catch (err) {
          console.error('Failed to initialize user encryption key:', err);
          setKeyFingerprint('ERROR');
        }
      } else {
        setCryptoKey(null);
        setEntries([]);
        setSyntheses([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time Firestore Sync & Client-Side Decryption for Entries
  useEffect(() => {
    if (!user || !cryptoKey) return;

    const entriesRef = collection(db, 'users', user.uid, 'entries');
    const q = query(entriesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const rawDocs = snapshot.docs.map((d) => d.data() as JournalEntry);

      // Decrypt each entry locally in the browser with the user's Web Crypto Key
      const decryptedList = await Promise.all(
        rawDocs.map(async (docData) => {
          try {
            const plainText = await decryptText(docData.encryptedText, docData.iv, cryptoKey);
            return {
              ...docData,
              decryptedText: plainText,
            };
          } catch (err) {
            console.error('Decryption failed for doc:', docData.id, err);
            return {
              ...docData,
              decryptedText: '[Encrypted Entry]',
            };
          }
        })
      );

      setEntries(decryptedList);
    });

    return () => unsubscribe();
  }, [user, cryptoKey]);

  // 3. Real-time Firestore Sync for Syntheses
  useEffect(() => {
    if (!user || !cryptoKey) return;

    const synthesesRef = collection(db, 'users', user.uid, 'syntheses');
    const q = query(synthesesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const rawList = snapshot.docs.map((d) => d.data() as WeeklySynthesisReport);

      const decryptedList = await Promise.all(
        rawList.map(async (synth) => {
          if (synth.encryptedSummary && synth.iv) {
            try {
              const plain = await decryptText(synth.encryptedSummary, synth.iv, cryptoKey);
              return { ...synth, weeklySummary: plain };
            } catch {
              return synth;
            }
          }
          return synth;
        })
      );

      setSyntheses(decryptedList);
    });

    return () => unsubscribe();
  }, [user, cryptoKey]);

  // 4. Fetch Context-Aware Daily Prompt from Gemini using last 3 decrypted entries
  const fetchDailyPrompt = useCallback(async () => {
    setIsPromptLoading(true);
    try {
      const recentThree = entries.slice(0, 3).map((e) => ({
        date: new Date(e.createdAt).toLocaleDateString(),
        text: e.decryptedText || '',
        moodLabel: e.moodLabel,
        tags: e.tags,
      }));

      const res = await fetch('/api/gemini/daily-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recentEntries: recentThree,
          language: currentLang,
        }),
      });

      if (res.ok) {
        const data: DailyPromptResponse = await res.json();
        setDailyPrompt(data);
      }
    } catch (err) {
      console.warn('Daily prompt fetch error:', err);
    } finally {
      setIsPromptLoading(false);
    }
  }, [entries, currentLang]);

  useEffect(() => {
    if (user && cryptoKey) {
      fetchDailyPrompt();
    }
  }, [user, cryptoKey, currentLang]); // Refreshes prompt if language or user changes

  // Authentication Handlers
  const handleSignInProvider = async (providerName: 'google' | 'gmail' | 'github' | 'linkedin') => {
    try {
      setAuthLoading(true);
      setLoadingProvider(providerName);
      setAuthErrorMessage(null);

      if (providerName === 'google') {
        await signInWithGoogle();
      } else if (providerName === 'gmail') {
        await signInWithGmail();
      } else if (providerName === 'github') {
        await signInWithGithub();
      } else if (providerName === 'linkedin') {
        await signInWithLinkedin();
      }
    } catch (err: any) {
      console.error(`${providerName} Sign In failed:`, err);
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user') {
        setAuthErrorMessage('Sign-in cancelled by user.');
      } else if (code === 'auth/operation-not-allowed') {
        setAuthErrorMessage(`The ${providerName} provider is not enabled yet in your Firebase console. Please sign in with Google or enable this provider.`);
      } else if (code === 'auth/account-exists-with-different-credential') {
        setAuthErrorMessage('An account already exists with the same email using a different sign-in provider.');
      } else {
        setAuthErrorMessage(err?.message || `Failed to sign in with ${providerName}.`);
      }
    } finally {
      setAuthLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (err) {
      console.error('Sign Out error:', err);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!user) return;
    const confirmed = window.confirm(t('deleteEntryConfirm'));
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'entries', entryId));
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
    } catch (err) {
      console.error('Error deleting entry:', err);
      alert('Failed to delete entry from Firestore.');
    }
  };

  const handleKeyUpdated = (newKey: CryptoKey, newFingerprint: string) => {
    setCryptoKey(newKey);
    setKeyFingerprint(newFingerprint);
  };

  const handleSelectPromptForEditor = (promptText: string) => {
    setEditorInitialPrompt(promptText);
    setActiveTab('journal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtered entries based on Search & Tag
  const filteredEntries = entries.filter((e) => {
    const matchesTag = !selectedTag || (e.tags && e.tags.includes(selectedTag));
    const searchLower = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !searchLower ||
      (e.decryptedText && e.decryptedText.toLowerCase().includes(searchLower)) ||
      (e.moodLabel && e.moodLabel.toLowerCase().includes(searchLower)) ||
      (e.tags && e.tags.some((t) => t.toLowerCase().includes(searchLower)));

    return matchesTag && matchesSearch;
  });

  if (authLoading && !loadingProvider) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center text-stone-100 space-y-4">
        <Sparkles className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-sm text-stone-400 font-serif-display">
          Initializing Manovritti AI Mind Journal...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <LandingPage
        onSignInGoogle={() => handleSignInProvider('google')}
        onSignInGmail={() => handleSignInProvider('gmail')}
        onSignInGithub={() => handleSignInProvider('github')}
        onSignInLinkedin={() => handleSignInProvider('linkedin')}
        isLoading={authLoading}
        loadingProvider={loadingProvider}
        errorMessage={authErrorMessage}
        onClearError={() => setAuthErrorMessage(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col selection:bg-amber-500 selection:text-stone-950">
      
      {/* Top Sticky Navigation */}
      <Navbar
        user={user}
        keyFingerprint={keyFingerprint}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
        onSignOut={handleSignOut}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB 1: JOURNAL & WRITE */}
        {activeTab === 'journal' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Personalized Welcome Banner with User Name & Daily Cognitive Starter */}
            <WelcomeBanner
              user={user}
              promptData={dailyPrompt}
              isLoading={isPromptLoading}
              onRefresh={fetchDailyPrompt}
              onSelectPrompt={handleSelectPromptForEditor}
              totalEntries={entries.length}
            />

            {/* Zero-Knowledge Encrypted Journal Editor */}
            <JournalEditor
              userId={user.uid}
              cryptoKey={cryptoKey}
              initialPrompt={editorInitialPrompt}
              onEntrySaved={(savedEntry) => {
                setEntries((prev) => [savedEntry, ...prev]);
                setEditorInitialPrompt('');
              }}
              onStartChat={(entry) => setActiveChatEntry(entry)}
            />

            {/* Recent 3 Entries Preview */}
            {entries.length > 0 && (
              <div className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold font-serif-display text-stone-200 flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-amber-400" />
                    <span>{t('tabEntries')}</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('entries')}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    View All ({entries.length}) →
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {entries.slice(0, 3).map((entry) => (
                    <EntryCard
                      key={entry.id}
                      entry={entry}
                      onDelete={handleDeleteEntry}
                      onStartChat={(e) => setActiveChatEntry(e)}
                      onTagClick={(tag) => {
                        setSelectedTag(tag);
                        setActiveTab('entries');
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PAST ENTRIES TIMELINE */}
        {activeTab === 'entries' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Search and Tag Filtering Controls */}
            <div className="bg-stone-900/90 rounded-3xl border border-stone-800 p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="search-entries-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('searchPlaceholder')}
                    className="w-full bg-stone-950 border border-stone-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                {selectedTag && (
                  <div className="flex items-center space-x-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-2 rounded-2xl text-xs font-medium shrink-0">
                    <Tag className="w-3.5 h-3.5" />
                    <span>#{selectedTag}</span>
                    <button
                      onClick={() => setSelectedTag(null)}
                      className="ml-1 hover:text-white font-bold"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-stone-400 border-t border-stone-800/80 pt-3">
                <span>
                  Showing {filteredEntries.length} of {entries.length} decrypted entries
                </span>
                <span className="flex items-center space-x-1 text-emerald-400">
                  <Lock className="w-3 h-3" />
                  <span>Decrypted in Browser</span>
                </span>
              </div>
            </div>

            {/* Entries List */}
            {filteredEntries.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredEntries.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    onDelete={handleDeleteEntry}
                    onStartChat={(e) => setActiveChatEntry(e)}
                    onTagClick={(tag) => setSelectedTag(tag)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center space-y-4 bg-stone-900/40 rounded-3xl border border-stone-800/60 p-8">
                <BookOpen className="w-10 h-10 mx-auto text-stone-600" />
                <p className="text-stone-400 text-sm">{t('noEntriesFound')}</p>
                <button
                  onClick={() => setActiveTab('journal')}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs shadow-md hover:bg-amber-400 transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{t('tabJournal')}</span>
                </button>
              </div>
            )}

          </div>
        )}

        {/* TAB 3: MOOD ANALYTICS */}
        {activeTab === 'analytics' && (
          <AnalyticsView
            entries={entries}
            onSelectTag={(tag) => {
              setSelectedTag(tag || null);
              setActiveTab('entries');
            }}
            selectedTag={selectedTag}
          />
        )}

        {/* TAB 4: WEEKLY SYNTHESIS */}
        {activeTab === 'syntheses' && (
          <WeeklySynthesisView
            userId={user.uid}
            cryptoKey={cryptoKey}
            entries={entries}
            savedSyntheses={syntheses}
            onSynthesisCreated={(newReport) => {
              setSyntheses((prev) => [newReport, ...prev]);
            }}
          />
        )}

      </main>

      {/* Multi-turn Chat Exploration Modal with Gemini */}
      <ChatWithGeminiModal
        entry={activeChatEntry}
        isOpen={Boolean(activeChatEntry)}
        onClose={() => setActiveChatEntry(null)}
      />

      {/* Encryption Key Management & Backup Modal */}
      <EncryptionKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        userId={user.uid}
        cryptoKey={cryptoKey}
        onKeyUpdated={handleKeyUpdated}
      />

    </div>
  );
}
