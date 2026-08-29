import React, { useState, useEffect } from 'react';
import { Lock, X, ShieldAlert, KeyRound, Delete, ShieldCheck, Timer } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  expectedPin: string;
  masterPin?: string;
  title?: string;
  description?: string;
  avatarIcon?: string;
  avatarColor?: string;
  showDefaultHint?: boolean;
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_SECONDS = 30;

export const PinModal: React.FC<PinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  expectedPin,
  masterPin,
  title,
  description,
  avatarIcon,
  avatarColor,
  showDefaultHint = true,
}) => {
  const { t, isRTL } = useLanguage();
  const modalTitle = title || t('enterPin');
  const modalDescription = description || t('pinLockNotice');

  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Reset inputs when opened
  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(false);
      setErrorMessage('');
    }
  }, [isOpen]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutRemaining <= 0) return;

    const interval = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          setError(false);
          setErrorMessage('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutRemaining]);

  if (!isOpen) return null;

  const isLocked = lockoutRemaining > 0;

  const handleKeyPress = (digit: string) => {
    if (isLocked) return;

    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);
      setErrorMessage('');

      if (nextPin.length === 4) {
        setTimeout(() => {
          verifyPin(nextPin);
        }, 150);
      }
    }
  };

  const handleBackspace = () => {
    if (isLocked) return;
    setPin((prev) => prev.slice(0, -1));
    setError(false);
    setErrorMessage('');
  };

  const handleClear = () => {
    if (isLocked) return;
    setPin('');
    setError(false);
    setErrorMessage('');
  };

  const verifyPin = (pinToVerify: string) => {
    const isMasterMatch = masterPin && pinToVerify === masterPin;
    const isDirectMatch = pinToVerify === expectedPin;

    if (isDirectMatch || isMasterMatch) {
      setError(false);
      setErrorMessage('');
      setFailedAttempts(0);
      onSuccess();
    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      setError(true);
      setPin('');

      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        setLockoutRemaining(LOCKOUT_DURATION_SECONDS);
        setErrorMessage(t('lockoutNotice') || 'Locked for security reasons');
      } else {
        const remaining = MAX_FAILED_ATTEMPTS - newAttempts;
        setErrorMessage(`${t('invalidPin')} (${remaining})`);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-100 overflow-hidden relative transform transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer z-10`}
          aria-label={t('cancel')}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        <div className="p-6 pt-8 text-center">
          {/* Avatar / Lock Icon */}
          <div className="flex justify-center mb-3">
            {avatarIcon ? (
              <div className={`w-16 h-16 rounded-2xl ${avatarColor || 'bg-indigo-600'} text-white flex items-center justify-center text-3xl shadow-lg ring-4 ring-slate-50 relative`}>
                <span>{avatarIcon}</span>
                <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs shadow-xs">
                  <Lock className="w-3 h-3" />
                </div>
              </div>
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
                <Lock className="w-7 h-7" />
              </div>
            )}
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-1">
            {modalTitle}
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mb-5 leading-relaxed">
            {modalDescription}
          </p>

          {/* PIN Indicators */}
          <div className="flex justify-center items-center gap-3 mb-4" dir="ltr">
            {[0, 1, 2, 3].map((index) => {
              const isFilled = pin.length > index;
              return (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    error
                      ? 'bg-rose-500 scale-110'
                      : isFilled
                      ? 'bg-indigo-600 scale-125 shadow-xs shadow-indigo-600/30'
                      : 'bg-slate-200 border border-slate-300'
                  }`}
                />
              );
            })}
          </div>

          {/* Error / Lockout Messages */}
          {error && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-rose-600 font-semibold mb-3 animate-shake">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isLocked && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 py-1.5 px-3 rounded-xl mb-3 font-medium">
              <Timer className="w-4 h-4 animate-spin text-amber-600" />
              <span>{lockoutRemaining} {t('seconds')}</span>
            </div>
          )}

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto pt-2" dir="ltr">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                disabled={isLocked}
                onClick={() => handleKeyPress(digit)}
                className="h-12 rounded-2xl bg-slate-50 hover:bg-indigo-50 active:bg-indigo-100 border border-slate-200/80 text-slate-800 text-lg font-bold transition shadow-2xs hover:border-indigo-200 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
              >
                {digit}
              </button>
            ))}

            <button
              type="button"
              disabled={isLocked || pin.length === 0}
              onClick={handleClear}
              className="h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs font-semibold transition border border-slate-200/80 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
            >
              {t('cancel')}
            </button>

            <button
              type="button"
              disabled={isLocked}
              onClick={() => handleKeyPress('0')}
              className="h-12 rounded-2xl bg-slate-50 hover:bg-indigo-50 active:bg-indigo-100 border border-slate-200/80 text-slate-800 text-lg font-bold transition shadow-2xs hover:border-indigo-200 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
            >
              0
            </button>

            <button
              type="button"
              disabled={isLocked || pin.length === 0}
              onClick={handleBackspace}
              className="h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition border border-slate-200/80 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
              aria-label="Delete"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
