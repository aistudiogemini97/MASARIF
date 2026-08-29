import React from 'react';
import { WifiOff, Wifi, CheckCircle2, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface OfflineBannerProps {
  isOnline: boolean;
  wasOffline: boolean;
  onDismissReconnected?: () => void;
  isSyncing?: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOnline,
  wasOffline,
  onDismissReconnected,
  isSyncing = false,
}) => {
  const { t, isRTL } = useLanguage();

  if (isOnline && !wasOffline && !isSyncing) {
    return null;
  }

  // 1. Offline Mode Banner
  if (!isOnline) {
    return (
      <div 
        className="bg-amber-500 text-amber-950 px-4 py-2 text-xs sm:text-sm font-medium border-b border-amber-600/30 flex items-center justify-between gap-3 shadow-xs animate-fadeIn"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <div className="w-6 h-6 rounded-full bg-amber-600/20 text-amber-950 flex items-center justify-center shrink-0">
            <WifiOff className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 flex flex-wrap items-center justify-between gap-2">
            <span>
              <strong>{t('offline')}</strong>
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Just Reconnected / Syncing Banner
  if (wasOffline || isSyncing) {
    return (
      <div 
        className="bg-emerald-600 text-white px-4 py-2 text-xs sm:text-sm font-medium border-b border-emerald-700 flex items-center justify-between gap-3 shadow-xs animate-fadeIn"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
            {isSyncing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Wifi className="w-3.5 h-3.5" />
            )}
          </div>
          <div className="flex-1 flex items-center justify-between">
            <span>
              {isSyncing ? t('syncing') : t('online')}
            </span>
            {onDismissReconnected && !isSyncing && (
              <button
                onClick={onDismissReconnected}
                className="text-[11px] bg-emerald-700 hover:bg-emerald-800 text-white px-2 py-0.5 rounded-full font-bold transition cursor-pointer"
              >
                {t('cancel')}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};
