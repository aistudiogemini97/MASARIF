import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  ShieldCheck, 
  ShieldAlert, 
  KeyRound, 
  Check, 
  Trash2, 
  Eye, 
  EyeOff, 
  AlertCircle
} from 'lucide-react';
import { FamilyMember } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface MemberPinSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: FamilyMember;
  onSavePin: (memberId: string, newPin: string | undefined) => void;
  founderPin?: string;
}

export const MemberPinSettingsModal: React.FC<MemberPinSettingsModalProps> = ({
  isOpen,
  onClose,
  member,
  onSavePin,
  founderPin,
}) => {
  const { t, isRTL } = useLanguage();
  const hasExistingPin = Boolean(member.pin && member.pin.length === 4);

  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPins, setShowPins] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCurrentPinInput('');
      setNewPin('');
      setConfirmPin('');
      setShowPins(false);
      setError('');
      setSuccessMsg('');
    }
  }, [isOpen, member]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // If member already has a PIN, verify current PIN or founder master PIN
    if (hasExistingPin) {
      if (!currentPinInput) {
        setError(t('pinMismatch'));
        return;
      }
      if (currentPinInput !== member.pin && currentPinInput !== founderPin) {
        setError(t('invalidPin'));
        return;
      }
    }

    // Validate new PIN
    if (!newPin || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setError(t('pinDigitsNotice'));
      return;
    }

    if (newPin !== confirmPin) {
      setError(t('pinMismatch'));
      return;
    }

    // Success! Save PIN
    onSavePin(member.id, newPin);
    setSuccessMsg(t('saveChanges'));
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden relative transform transition-all">
        
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-100 relative">
          <button
            onClick={onClose}
            className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer`}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl ${member.avatarColor || 'bg-indigo-600'} text-white flex items-center justify-center text-2xl shadow-sm shrink-0`}>
              {member.avatarIcon || '👤'}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t('setPin')}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {member.name}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          
          {/* Status Alert Banner */}
          {hasExistingPin ? (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">{t('pinConfigured')}</span>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  {t('pinLockNotice')}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">{t('pinNotConfigured')}</span>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  {t('pinDigitsNotice')}
                </p>
              </div>
            </div>
          )}

          {/* Feedback Messages */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 shrink-0 stroke-[3]" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            
            {/* 1. Current PIN (Only if member has an existing PIN) */}
            {hasExistingPin && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('currentPin')} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPins ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="••••"
                    value={currentPinInput}
                    onChange={(e) => setCurrentPinInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center text-lg tracking-widest bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <KeyRound className={`w-4 h-4 text-slate-400 absolute ${isRTL ? 'right-3' : 'left-3'} top-3`} />
                </div>
              </div>
            )}

            {/* 2. New PIN Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  {t('newPin')} (4 {t('digits')}) <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPins(!showPins)}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer font-medium"
                >
                  {showPins ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>

              <input
                type={showPins ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={4}
                placeholder="••••"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center text-lg tracking-widest bg-white border border-slate-300 rounded-xl px-4 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* 3. Confirm New PIN */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('confirmPin')} <span className="text-rose-500">*</span>
              </label>
              <input
                type={showPins ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={4}
                placeholder="••••"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center text-lg tracking-widest bg-white border border-slate-300 rounded-xl px-4 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                {t('cancel')}
              </button>

              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition active:scale-98 cursor-pointer"
              >
                {t('saveChanges')}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};
