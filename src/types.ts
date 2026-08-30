export type SupportedLanguage = 'en' | 'mr';

export interface EncryptedPayload {
  cipherText: string;
  iv: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  encryptedText: string;
  iv: string;
  // Decrypted text is only held in memory in the client app
  decryptedText?: string;
  moodScore: number; // 1 to 10
  moodLabel: string; // e.g. "Hopeful", "Anxious", "Grateful", "शांतीपूर्ण"
  tags: string[];
  nextPrompt?: string;
  reflection?: string;
  language: SupportedLanguage;
  createdAt: number; // Unix timestamp
  updatedAt?: number;
}

export interface EntryAnalysisResponse {
  reflection: string;
  moodScore: number; // 1-10
  moodLabel: string;
  tags: string[];
  nextSuggestedPrompt: string;
}

export interface WeeklySynthesisReport {
  id?: string;
  userId?: string;
  createdAt: number;
  encryptedSummary?: string;
  iv?: string;
  weeklySummary: string;
  topThemes: string[];
  averageMoodScore: number;
  actionableInsight: string;
  language: SupportedLanguage;
  entryCount: number;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface DailyPromptResponse {
  prompt: string;
  theme: string;
  inspirationalQuote?: string;
}

export interface UserEncryptionState {
  hasKey: boolean;
  keyFingerprint: string;
}
