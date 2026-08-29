import React, { useState } from 'react';
import { 
  CalendarClock, 
  CheckCircle2, 
  SlidersHorizontal, 
  X, 
  Sparkles, 
  ArrowRight,
  Calendar,
  Layers
} from 'lucide-react';
import confetti from '../utils/confetti';
import { Category, FamilyMember, RecurringExpense } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface RecurringSuggestionBannerProps {
  pendingExpenses: RecurringExpense[];
  allRecurringCount: number;
  categories: Category[];
  members: FamilyMember[];
  currencySymbol: string;
  onBatchAddAll: (expenseIds: string[]) => void;
  onOpenReviewModal: () => void;
  onOpenManageModal: () => void;
}

export const RecurringSuggestionBanner: React.FC<RecurringSuggestionBannerProps> = ({
  pendingExpenses,
  allRecurringCount,
  categories,
  members,
  currencySymbol,
  onBatchAddAll,
  onOpenReviewModal,
  onOpenManageModal,
}) => {
  const { t, formatCategory, formatCurrencyAmount, isRTL, language } = useLanguage();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed || pendingExpenses.length === 0) {
    return null;
  }

  const currentDate = new Date();
  const currentMonthName = new Intl.DateTimeFormat(language, { month: 'long', year: 'numeric' }).format(currentDate);

  const totalPendingAmount = pendingExpenses.reduce((sum, item) => sum + item.amount, 0);

  const categoryMap = new Map<string, Category>(categories.map((c) => [c.id, c]));
  const memberMap = new Map<string, FamilyMember>(members.map((m) => [m.id, m]));

  const handleQuickAddAll = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Confetti fallback
    }
    const ids = pendingExpenses.map((e) => e.id);
    onBatchAddAll(ids);
  };

  return (
    <div className="mb-6 bg-gradient-to-l from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-lg shadow-indigo-950/20 border border-indigo-700/50 relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Decorative background glow */}
      <div className="absolute top-0 -left-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 -right-10 w-48 h-48 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        
        {/* Info Side */}
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              {currentMonthName}
            </span>
            <span className="text-xs text-indigo-200 font-medium">
              {pendingExpenses.length} / {allRecurringCount} {t('recurringExpenses')}
            </span>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-indigo-300 shrink-0" />
              <span>{t('manageRecurringDesc')}</span>
            </h3>
            <p className="text-xs sm:text-sm text-indigo-200 mt-1 leading-relaxed">
              {t('totalExpenses')}:{' '}
              <strong className="text-amber-300 font-bold text-sm sm:text-base">
                {formatCurrencyAmount(totalPendingAmount, currencySymbol)}
              </strong>
            </p>
          </div>

          {/* Quick List Preview Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {pendingExpenses.slice(0, 4).map((item) => {
              const cat = categoryMap.get(item.categoryId);
              return (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-white/10 hover:bg-white/15 text-indigo-100 border border-white/10 backdrop-blur-xs transition"
                >
                  <span>{cat?.icon === 'Home' ? '🏠' : cat?.icon === 'Zap' ? '⚡' : '📋'}</span>
                  <span className="font-semibold">{item.title}</span>
                  <span className="text-indigo-300 text-[11px]">
                    ({formatCurrencyAmount(item.amount, currencySymbol)})
                  </span>
                </span>
              );
            })}
            {pendingExpenses.length > 4 && (
              <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs bg-white/5 text-indigo-200 border border-white/5">
                +{pendingExpenses.length - 4}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0">
          <button
            onClick={handleQuickAddAll}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 text-xs sm:text-sm font-bold shadow-md shadow-emerald-950/30 transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{t('recordMonthlyCommitments')}</span>
          </button>

          <button
            onClick={onOpenReviewModal}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-98 text-white text-xs sm:text-sm font-semibold border border-white/20 backdrop-blur-xs transition cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{t('edit')}</span>
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-2 rounded-xl text-indigo-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title={t('cancel')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
};
