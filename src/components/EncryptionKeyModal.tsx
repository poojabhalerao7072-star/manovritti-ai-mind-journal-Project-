import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  X, 
  ShieldCheck, 
  Key, 
  Copy, 
  Check, 
  AlertTriangle, 
  Download, 
  Upload,
  Lock
} from 'lucide-react';
import { exportKeyToBase64, importKeyFromBase64, storeUserKey, getKeyFingerprint } from '../lib/crypto';

interface EncryptionKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  cryptoKey: CryptoKey | null;
  onKeyUpdated: (key: CryptoKey, fingerprint: string) => void;
}

export const EncryptionKeyModal: React.FC<EncryptionKeyModalProps> = ({
  isOpen,
  onClose,
  userId,
  cryptoKey,
  onKeyUpdated,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language as 'en' | 'mr') || 'en';

  const [base64Key, setBase64Key] = useState<string>('');
  const [fingerprint, setFingerprint] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [importKeyString, setImportKeyString] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  React.useEffect(() => {
    if (cryptoKey) {
      exportKeyToBase64(cryptoKey).then(setBase64Key);
      getKeyFingerprint(cryptoKey).then(setFingerprint);
    }
  }, [cryptoKey]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (base64Key) {
      navigator.clipboard.writeText(base64Key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadBackup = () => {
    if (!base64Key) return;
    const blob = new Blob(
      [
        JSON.stringify(
          {
            appName: 'Manovritti AI Mind Journal',
            algorithm: 'AES-GCM-256',
            userId: userId,
            key: base64Key,
            fingerprint: fingerprint,
            exportedAt: new Date().toISOString(),
          },
          null,
          2
        ),
      ],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manovritti-key-backup-${fingerprint.replace(/:/g, '')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportError(null);
    setImportSuccess(null);

    const cleanKey = importKeyString.trim();
    if (!cleanKey) {
      setImportError('Please enter a valid base64 key.');
      return;
    }

    try {
      const imported = await importKeyFromBase64(cleanKey);
      await storeUserKey(userId, imported);
      const newFp = await getKeyFingerprint(imported);
      onKeyUpdated(imported, newFp);
      setImportSuccess('Encryption key updated successfully!');
      setImportKeyString('');
    } catch (err: any) {
      setImportError('Failed to import key. Please ensure it is a valid 256-bit AES-GCM base64 string.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="encryption-security-modal"
        className="relative w-full max-w-xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden text-stone-100 p-6 sm:p-7 space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif-display text-stone-100">
                {t('securityModalTitle')}
              </h3>
              <span className="text-xs text-stone-400 font-mono">
                Fingerprint: {fingerprint}
              </span>
            </div>
          </div>

          <button
            id="btn-close-key-modal"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Zero Knowledge Description */}
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-200 text-xs sm:text-sm leading-relaxed space-y-2">
          <div className="flex items-center space-x-1.5 font-bold text-emerald-300">
            <Lock className="w-4 h-4" />
            <span>Zero-Knowledge Architecture</span>
          </div>
          <p>{t('securityModalDesc')}</p>
        </div>

        {/* Current Key Display & Export */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">
            {t('localKeyLabel')}
          </label>
          <div className="relative">
            <input
              id="raw-crypto-key-input"
              type="text"
              readOnly
              value={base64Key}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 font-mono text-xs text-stone-300 focus:outline-none select-all"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              id="btn-copy-key"
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-semibold transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t('copied')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-400" />
                  <span>{t('copyKey')}</span>
                </>
              )}
            </button>

            <button
              id="btn-download-key-backup"
              onClick={handleDownloadBackup}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-stone-400" />
              <span>Download JSON Backup</span>
            </button>
          </div>
        </div>

        {/* Warning Callout */}
        <div className="flex items-start space-x-2 text-xs text-amber-300 bg-amber-950/40 p-3 rounded-xl border border-amber-800/40">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          <span>{t('keyExportWarning')}</span>
        </div>

        {/* Import Key Form */}
        <form onSubmit={handleImport} className="pt-2 border-t border-stone-800 space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">
            {t('importKey')}
          </label>
          <div className="flex gap-2">
            <input
              id="import-key-input"
              type="text"
              value={importKeyString}
              onChange={(e) => setImportKeyString(e.target.value)}
              placeholder="Paste 256-bit AES-GCM Base64 key..."
              className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <button
              id="btn-submit-import-key"
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors shrink-0 flex items-center space-x-1"
            >
              <Upload className="w-3 h-3" />
              <span>Restore</span>
            </button>
          </div>

          {importError && (
            <p className="text-xs text-rose-400">{importError}</p>
          )}
          {importSuccess && (
            <p className="text-xs text-emerald-400">{importSuccess}</p>
          )}
        </form>
      </div>
    </div>
  );
};
