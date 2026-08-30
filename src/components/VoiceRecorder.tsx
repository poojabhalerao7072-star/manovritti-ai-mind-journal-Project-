import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

interface VoiceRecorderProps {
  onTranscriptUpdate: (newTranscript: string) => void;
  language: 'en' | 'mr';
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscriptUpdate,
  language,
}) => {
  const { t } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language === 'mr' ? 'mr-IN' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            currentTranscript += transcriptPiece + ' ';
          }
        }
        if (currentTranscript.trim()) {
          onTranscriptUpdate(currentTranscript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage(t('voicePermissionDenied'));
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Speech recognition initialization error:', err);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [language, onTranscriptUpdate, t]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setErrorMessage(null);
      try {
        recognitionRef.current.lang = language === 'mr' ? 'mr-IN' : 'en-US';
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Failed to start speech recognition:', err);
      }
    }
  };

  if (!isSupported) {
    return (
      <span className="text-xs text-stone-400 italic">
        {t('voiceNotSupported')}
      </span>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        id="btn-voice-input"
        type="button"
        onClick={toggleListening}
        className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-sm ${
          isListening
            ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse shadow-rose-950/30'
            : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700'
        }`}
        title={isListening ? t('voiceInputStop') : t('voiceInputStart')}
      >
        {isListening ? (
          <>
            <MicOff className="w-3.5 h-3.5 animate-bounce" />
            <span>{t('voiceInputListening')}</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
          </>
        ) : (
          <>
            <Mic className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('voiceInputStart')}</span>
          </>
        )}
      </button>

      {errorMessage && (
        <div className="flex items-center space-x-1 text-xs text-rose-400 bg-rose-950/40 px-2 py-1 rounded border border-rose-800/40">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
