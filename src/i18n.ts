import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      appName: 'Manovritti',
      appTagline: 'Privacy-First AI Mind Journal',
      appSubtitle: 'End-to-end encrypted cognitive journaling & mood analytics with Gemini.',
      signInWithGoogle: 'Continue with Google',
      signInWithGmail: 'Sign in with Gmail',
      signInWithGithub: 'Continue with GitHub',
      signInWithLinkedin: 'Continue with LinkedIn',
      orChooseOption: 'or sign in with',
      instantAccess: 'Fast, secure federated sign-in with zero-knowledge privacy',
      signOut: 'Sign Out',
      welcome: 'Welcome',
      welcomeUser: 'Welcome, {{name}}!',
      welcomeBackUser: 'Welcome back, {{name}}!',
      goodMorning: 'Good morning, {{name}}',
      goodAfternoon: 'Good afternoon, {{name}}',
      goodEvening: 'Good evening, {{name}}',
      welcomeBannerSubtitle: 'Take a mindful pause. Your safe, encrypted sanctuary to reflect and gain clarity.',
      dailyCognitivePrompt: 'Daily Cognitive Prompt',
      friend: 'Friend',
      secureSession: 'AES-256 GCM Encrypted',
      keyFingerprint: 'Key Fingerprint',
      viewKey: 'Key & Security',
      
      // Navigation & Tabs
      tabJournal: 'Journal & Write',
      tabAnalytics: 'Mood Analytics',
      tabSyntheses: 'Weekly Syntheses',
      tabEntries: 'Past Entries',
      
      // Daily Prompt Banner
      dailyPromptTitle: "Today's Cognitive Starter",
      dailyPromptSub: 'Personalized based on your recent reflections',
      writeAboutThis: 'Reflect on this',
      refreshPrompt: 'Get New Prompt',
      
      // Editor
      editorPlaceholder: 'How is your mind feeling today? Share your thoughts, wins, challenges, or uncensored reflections...',
      wordCount: 'words',
      charCount: 'chars',
      voiceInputStart: 'Start Voice Input',
      voiceInputListening: 'Listening... (Speak now)',
      voiceInputStop: 'Stop Voice',
      voiceInputClear: 'Clear Audio',
      voiceNotSupported: 'Speech recognition is not supported in this browser. Please type your entry.',
      voicePermissionDenied: 'Microphone permission was denied. Please allow microphone access.',
      saveAndAnalyze: 'Encrypt & Analyze with Gemini',
      analyzing: 'Encrypting & Generating AI Reflection...',
      entrySavedSuccess: 'Entry encrypted locally and saved safely to Firestore!',
      
      // Reflection & Analysis
      aiReflectionTitle: 'Gemini Cognitive Reflection',
      moodScoreLabel: 'Mood Level',
      moodLabelText: 'Emotional State',
      suggestedTags: 'Smart Tags',
      nextSuggestedPromptTitle: 'Suggested Next Reflection',
      chatAboutEntry: 'Explore with Gemini',
      
      // Mood Labels
      moodJoyful: 'Joyful & Energized',
      moodHopeful: 'Hopeful & Optimistic',
      moodCalm: 'Calm & Grounded',
      moodNeutral: 'Neutral & Observant',
      moodAnxious: 'Anxious & Overwhelmed',
      moodDistressed: 'Distressed & Vulnerable',
      
      // Past Entries
      entriesTitle: 'Your Encrypted Journal Timeline',
      filterByTag: 'Filter by Tag',
      allTags: 'All Tags',
      searchPlaceholder: 'Search decrypted entries...',
      noEntriesFound: 'No journal entries yet. Start writing your first reflection above!',
      deleteEntryConfirm: 'Are you sure you want to delete this entry? This action is irreversible.',
      deleteSuccess: 'Entry deleted.',
      
      // Chat Modal
      chatModalTitle: 'Reflect & Converse on this Entry',
      chatPlaceholder: 'Ask a question or dive deeper into your emotions...',
      send: 'Send',
      chatThinking: 'Gemini is reflecting...',
      
      // Weekly Synthesis
      weeklyReportTitle: '7-Day Cognitive Synthesis',
      weeklyReportSubtitle: 'AI deep summary synthesized across your decrypted entries from the past 7 days',
      generateWeeklyReport: 'Generate Weekly Synthesis',
      generatingWeekly: 'Synthesizing 7-day emotional trends...',
      averageMoodScore: 'Average Mood Score',
      topThemes: 'Dominant Cognitive Themes',
      actionableInsight: 'Actionable Cognitive Insight',
      noEntriesForWeekly: 'You need at least one entry in the past 7 days to generate a weekly synthesis.',
      saveSynthesisSuccess: 'Weekly synthesis encrypted and saved!',
      
      // Analytics Dashboard
      analyticsTitle: 'Emotional Landscape & Trends',
      moodTrendOverTime: 'Mood Score Trajectory (1-10)',
      totalEntries: 'Total Reflections',
      averageMood: 'Overall Average Mood',
      streakDays: 'Active Streak',
      days: 'days',
      frequentTags: 'Top Emotional Categories',
      
      // Encryption Modal
      securityModalTitle: 'Client-Side Zero-Knowledge Encryption',
      securityModalDesc: 'Your thoughts are encrypted locally using the browser Web Crypto API (AES-GCM 256-bit) BEFORE leaving your device. Even database administrators cannot read your plain journal text.',
      localKeyLabel: 'Your Base64 AES-256 Master Key:',
      copyKey: 'Copy Key to Clipboard',
      copied: 'Copied!',
      importKey: 'Import / Restore Key',
      keyExportWarning: 'Keep this key safe if you switch devices or clear your browser data.',
      
      // Landing Page
      heroTitle: 'Your Sanctuary for Mindful Reflection',
      heroSubtitle: 'Capture your authentic thoughts with complete privacy. Encrypted locally before cloud sync, guided by empathetic bilingual Gemini AI.',
      feature1Title: 'Zero-Knowledge AES-GCM',
      feature1Desc: 'Native 256-bit Web Crypto encryption. Your entries stay locked on your machine.',
      feature2Title: 'Gemini 3.6 Flash Insights',
      feature2Desc: 'Structured emotional evaluation, smart cognitive tagging, and personalized daily prompts.',
      feature3Title: 'Bilingual English & Marathi',
      feature3Desc: 'Express yourself fluently in English or Marathi with native script speech-to-text.',
      feature4Title: 'Mood Landscape & Syntheses',
      feature4Desc: 'Visual mood trajectory charts and 7-day holistic cognitive summaries.',
      getStarted: 'Begin Encrypted Journaling',
      disclaimer: 'Manovritti is an AI reflection tool, not a medical device or psychiatric therapy replacement.'
    }
  },
  mr: {
    translation: {
      appName: 'मनोवृत्ती',
      appTagline: 'गोपनीयतेवर आधारित AI मनोजन रोजनिशी',
      appSubtitle: 'Gemini द्वारा समर्थित एंड-टू-एंड एनक्रिप्टेड विचार मंथन आणि भावना विश्लेषण.',
      signInWithGoogle: 'Google सह सुरू करा',
      signInWithGmail: 'Gmail सह सुरू करा',
      signInWithGithub: 'GitHub सह सुरू करा',
      signInWithLinkedin: 'LinkedIn सह सुरू करा',
      orChooseOption: 'किंवा इतर पर्यायाने सुरू करा',
      instantAccess: 'सुरक्षित आणि पासवर्ड-मुक्त प्रवेश (Zero-Knowledge)',
      signOut: 'बाहेर पडा (Sign Out)',
      welcome: 'स्वागत आहे',
      welcomeUser: 'स्वागत आहे, {{name}}!',
      welcomeBackUser: 'पुन्हा स्वागत आहे, {{name}}!',
      goodMorning: 'शुभ प्रभात, {{name}}',
      goodAfternoon: 'शुभ दुपार, {{name}}',
      goodEvening: 'शुभ संध्याकाळ, {{name}}',
      welcomeBannerSubtitle: 'मनाला शांतता द्या. स्वतःच्या विचारांचे आणि भावनांचे मनमोकळेपणाने चिंतन करा.',
      dailyCognitivePrompt: 'आजचा चिंतन प्रश्न',
      friend: 'मित्र',
      secureSession: 'AES-256 GCM एनक्रिप्टेड',
      keyFingerprint: 'सुरक्षा की फिंगरप्रिंट',
      viewKey: 'की आणि गोपनीयता',
      
      // Navigation & Tabs
      tabJournal: 'रोजनिशी लिहा',
      tabAnalytics: 'भावना विश्लेषण',
      tabSyntheses: 'साप्ताहिक सारांश',
      tabEntries: 'मागील नोंदी',
      
      // Daily Prompt Banner
      dailyPromptTitle: 'आजचा चिंतन प्रश्न (Daily Prompt)',
      dailyPromptSub: 'तुमच्या मागील नोंदींवर आधारित खास तयार केलेला विचार',
      writeAboutThis: 'यावर लिहा',
      refreshPrompt: 'नवीन प्रश्न मिळवा',
      
      // Editor
      editorPlaceholder: 'आज तुमचे मन कसे आहे? तुमचे विचार, अनुभव, आव्हाने किंवा आनंद मनमोकळेपणाने लिहा...',
      wordCount: 'शब्द',
      charCount: 'अक्षरे',
      voiceInputStart: 'व्हॉइस इनपुट सुरू करा',
      voiceInputListening: 'ऐकत आहे... (मराठीत बोला)',
      voiceInputStop: 'आवाज थांबवा',
      voiceInputClear: 'हटवा',
      voiceNotSupported: 'या ब्राउझरमध्ये व्हॉइस इनपुट उपलब्ध नाही. कृपया टाइप करा.',
      voicePermissionDenied: 'मायक्रोफोन परवानगी नाकारली आहे. कृपया परवानगी द्या.',
      saveAndAnalyze: 'एनक्रिप्ट करा आणि Gemini सह विश्लेषण मिळवा',
      analyzing: 'एनक्रिप्ट करत आहे आणि AI विश्लेषण तयार होत आहे...',
      entrySavedSuccess: 'नोंद ब्राउझरमध्ये एनक्रिप्ट करून Firestore मध्ये सुरक्षित सेव्ह झाली!',
      
      // Reflection & Analysis
      aiReflectionTitle: 'Gemini सहसंवेदना आणि विश्लेषण',
      moodScoreLabel: 'मनःस्थिती स्तर (Mood Score)',
      moodLabelText: 'भावनिक स्थिती',
      suggestedTags: 'स्मार्ट टॅग्ज',
      nextSuggestedPromptTitle: 'पुढील चिंतनासाठी सुचवलेला प्रश्न',
      chatAboutEntry: 'Gemini शी यावर संवाद साधा',
      
      // Mood Labels
      moodJoyful: 'आनंदी आणि उत्साही',
      moodHopeful: 'आशावादी आणि सकारात्मक',
      moodCalm: 'शांत आणि स्थिर',
      moodNeutral: 'तटस्थ आणि समतोल',
      moodAnxious: 'चिंताग्रस्त आणि तणावग्रस्त',
      moodDistressed: 'अस्वस्थ आणि व्यथित',
      
      // Past Entries
      entriesTitle: 'तुमची एनक्रिप्टेड रोजनिशी दिनदर्शिका',
      filterByTag: 'टॅगनुसार शोधा',
      allTags: 'सर्व टॅग्ज',
      searchPlaceholder: 'नोंदींमध्ये शोधा...',
      noEntriesFound: 'अद्याप कोणत्याही नोंदी नाहीत. वरून तुमची पहिली नोंद लिहा!',
      deleteEntryConfirm: 'तुम्हाला ही नोंद नक्की हटवायची आहे का? ही क्रिया पूर्ववत करता येणार नाही.',
      deleteSuccess: 'नोंद हटवली गेली.',
      
      // Chat Modal
      chatModalTitle: 'या नोंदीवर Gemini सोबत सखोल संवाद',
      chatPlaceholder: 'काहीही विचारा किंवा तुमच्या भावनांबद्दल चर्चा करा...',
      send: 'पाठवा',
      chatThinking: 'Gemini विचार करत आहे...',
      
      // Weekly Synthesis
      weeklyReportTitle: '७ दिवसांचा मानसिक सारांश (Weekly Synthesis)',
      weeklyReportSubtitle: 'मागील ७ दिवसांच्या नोंदींमधून Gemini ने काढलेला सखोल भावनिक व मानसिक निष्कर्ष',
      generateWeeklyReport: 'साप्ताहिक सारांश तयार करा',
      generatingWeekly: '७ दिवसांच्या नोंदींचे विश्लेषण होत आहे...',
      averageMoodScore: 'सरासरी मनःस्थिती गुण',
      topThemes: 'प्रमुख विचार आणि विषय',
      actionableInsight: 'उपयुक्त मानसिक दृष्टिकोन (Insight)',
      noEntriesForWeekly: 'साप्ताहिक सारांशासाठी मागील ७ दिवसांत किमान एक नोंद आवश्यक आहे.',
      saveSynthesisSuccess: 'साप्ताहिक सारांश एनक्रिप्ट करून सेव्ह केला!',
      
      // Analytics Dashboard
      analyticsTitle: 'भावनिक आलेख आणि प्रगती',
      moodTrendOverTime: 'मनःस्थिती चढ-उतार आलेख (१-१०)',
      totalEntries: 'एकूण नोंदी',
      averageMood: 'सरासरी मनःस्थिती',
      streakDays: 'सलग दिवस (Streak)',
      days: 'दिवस',
      frequentTags: 'सर्वाधिक वारंवार येणारे विषय',
      
      // Encryption Modal
      securityModalTitle: 'क्लायंट-साइड झिरो-नॉलेज एनक्रिप्शन',
      securityModalDesc: 'तुमचे खाजगी विचार तुमच्या डिव्हाइसवरून बाहेर पडण्यापूर्वीच Web Crypto API (AES-GCM 256-bit) ने एनक्रिप्ट केले जातात. अगदी डेटाबेस ॲडमिनिस्ट्रेटर सुद्धा तुमचे मूळ लिखाण वाचू शकत नाही.',
      localKeyLabel: 'तुमची Base64 AES-256 मास्टर सुरक्षा की:',
      copyKey: 'सुरक्षा की कॉपी करा',
      copied: 'कॉपी झाले!',
      importKey: 'की आयात करा / रिस्टोअर करा',
      keyExportWarning: 'डिव्हाइस बदलल्यास किंवा ब्राउझर डेटा क्लिअर केल्यास ही की सुरक्षित ठेवा.',
      
      // Landing Page
      heroTitle: 'तुमच्या अंतरंगातील विचारांचे सुरक्षित दालन',
      heroSubtitle: 'संपूर्ण गोपनीयतेसह आपले विचार नोंदवा. क्लाऊडवर जाण्यापूर्वी स्थानिक पातळीवर एनक्रिप्ट केलेले, मराठी आणि इंग्रजीत Gemini AI च्या सोबतीने.',
      feature1Title: 'झिरो-नॉलेज AES-GCM एनक्रिप्शन',
      feature1Desc: 'स्थानिक २५६-बिट सुरक्षा. तुमचे लिखाण केवळ तुमच्याकडेच उलगडते.',
      feature2Title: 'Gemini 3.6 Flash बुद्धिमत्ता',
      feature2Desc: 'भावनिक मूल्यांकन, स्मार्ट टॅगिंग आणि दररोजचे वैयक्तिक विचार प्रश्न.',
      feature3Title: 'मराठी व इंग्रजी द्विभाषिक सपोर्ट',
      feature3Desc: 'मराठी आवाज-ते-मजकूर (Voice typing) आणि अस्खलित मराठीत AI विश्लेषण.',
      feature4Title: 'साप्ताहिक मानसिक सारांश',
      feature4Desc: 'भावनांचा आलेख आणि ७ दिवसांचा सर्वसमावेशक मानसिक अहवाल.',
      getStarted: 'सुरक्षित रोजनिशी सुरू करा',
      disclaimer: 'मनोवृत्ती हे एक AI चिंतन साधन आहे, हे वैद्यकीय किंवा मनोचिकित्सक उपचारांचा पर्याय नाही.'
    }
  }
};

const savedLang = localStorage.getItem('manovritti_lang') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export function changeAppLanguage(lang: 'en' | 'mr') {
  i18n.changeLanguage(lang);
  localStorage.setItem('manovritti_lang', lang);
}

export default i18n;
