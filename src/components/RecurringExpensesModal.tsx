import React, { useState } from 'react';
import { 
  X, 
  CalendarClock, 
  Plus, 
  Check, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  Power, 
  Sparkles, 
  CheckCircle2, 
  Tag, 
  User, 
  CreditCard, 
  Calendar, 
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';
import confetti from '../utils/confetti';
import { Category, FamilyMember, PaymentMethod, RecurringExpense } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface RecurringExpensesModalProps {
  isOpen: boolean;
  onClose: () => void;
  recurringExpenses: RecurringExpense[];
  categories: Category[];
  members: FamilyMember[];
  currencySymbol: string;
  onAddRecurring: (expense: Omit<RecurringExpense, 'id' | 'createdAt'>) => void;
  onUpdateRecurring: (id: string, updates: Partial<RecurringExpense>) => void;
  onDeleteRecurring: (id: string) => void;
  onToggleActive: (id: string) => void;
  onAddSingleToMonth: (recurringId: string, customAmount?: number, customDate?: string) => void;
  onBatchAddToMonth: (selectedIds: string[], customAmounts?: Record<string, number>) => void;
  initialMode?: 'list' | 'create' | 'review';
}

export const RecurringExpensesModal: React.FC<RecurringExpensesModalProps> = ({
  isOpen,
  onClose,
  recurringExpenses,
  categories,
  members,
  currencySymbol,
  onAddRecurring,
  onUpdateRecurring,
  onDeleteRecurring,
  onToggleActive,
  onAddSingleToMonth,
  onBatchAddToMonth,
  initialMode = 'list',
}) => {
  const { t, formatCategory, formatRole, formatPaymentMethod, formatCurrencyAmount, isRTL, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'list' | 'form' | 'review'>(
    initialMode === 'review' ? 'review' : initialMode === 'create' ? 'form' : 'list'
  );
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [memberId, setMemberId] = useState('');
  const [beneficiaryMemberId, setBeneficiaryMemberId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [dueDay, setDueDay] = useState<number>(1);
  const [frequency, setFrequency] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Review / Batch Selection State
  const currentMonthKey = new Date().toISOString().substring(0, 7); // e.g. "2026-08"
  const currentMonthName = new Intl.DateTimeFormat(language, { month: 'long', year: 'numeric' }).format(new Date());

  const pendingExpenses = recurringExpenses.filter(
    (e) => e.isActive && e.lastGeneratedMonth !== currentMonthKey
  );

  const [selectedReviewIds, setSelectedReviewIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    pendingExpenses.forEach((e) => {
      initial[e.id] = true;
    });
    return initial;
  });

  const [customReviewAmounts, setCustomReviewAmounts] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    pendingExpenses.forEach((e) => {
      initial[e.id] = e.amount.toString();
    });
    return initial;
  });

  if (!isOpen) return null;

  const categoryMap = new Map<string, Category>(categories.map((c) => [c.id, c]));
  const memberMap = new Map<string, FamilyMember>(members.map((m) => [m.id, m]));

  const totalMonthlyCommitment = recurringExpenses
    .filter((e) => e.isActive)
    .reduce((sum, e) => sum + e.amount, 0);

  const handleOpenAddForm = () => {
    setEditingId(null);
    setTitle('');
    setAmount('');
    setCategoryId(categories.find((c) => c.type === 'expense')?.id || '');
    setMemberId(members[0]?.id || '');
    setBeneficiaryMemberId('');
    setPaymentMethod('card');
    setDueDay(1);
    setFrequency('monthly');
    setIsActive(true);
    setNotes('');
    setFormError('');
    setActiveTab('form');
  };

  const handleOpenEditForm = (item: RecurringExpense) => {
    setEditingId(item.id);
    setTitle(item.title);
    setAmount(item.amount.toString());
    setCategoryId(item.categoryId);
    setMemberId(item.memberId);
    setBeneficiaryMemberId(item.beneficiaryMemberId || '');
    setPaymentMethod(item.paymentMethod);
    setDueDay(item.dueDay || 1);
    setFrequency(item.frequency || 'monthly');
    setIsActive(item.isActive);
    setNotes(item.notes || '');
    setFormError('');
    setActiveTab('form');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!title.trim()) {
      setFormError(t('titleRequired'));
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError(t('amountRequired'));
      return;
    }
    if (!categoryId) {
      setFormError(t('categoryRequired'));
      return;
    }
    if (!memberId) {
      setFormError(t('memberRequired'));
      return;
    }

    if (editingId) {
      onUpdateRecurring(editingId, {
        title: title.trim(),
        amount: parsedAmount,
        categoryId,
        memberId,
        beneficiaryMemberId: beneficiaryMemberId || undefined,
        paymentMethod,
        dueDay: Math.min(31, Math.max(1, dueDay)),
        frequency,
        isActive,
        notes: notes.trim() || undefined,
      });
    } else {
      onAddRecurring({
        title: title.trim(),
        amount: parsedAmount,
        categoryId,
        memberId,
        beneficiaryMemberId: beneficiaryMemberId || undefined,
        paymentMethod,
        dueDay: Math.min(31, Math.max(1, dueDay)),
        frequency,
        isActive,
        notes: notes.trim() || undefined,
      });
    }

    setActiveTab('list');
  };

  const handleConfirmBatchReview = () => {
    const selectedIds = Object.keys(selectedReviewIds).filter((id) => selectedReviewIds[id]);
    if (selectedIds.length === 0) {
      return;
    }

    const amountsToPass: Record<string, number> = {};
    selectedIds.forEach((id) => {
      const parsed = parseFloat(customReviewAmounts[id]);
      if (!isNaN(parsed) && parsed > 0) {
        amountsToPass[id] = parsed;
      }
    });

    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {
      // safe fallback
    }

    onBatchAddToMonth(selectedIds, amountsToPass);
    setActiveTab('list');
  };

  const handleSingleAddWithFeedback = (item: RecurringExpense) => {
    try {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    } catch {
      // safe fallback
    }
    onAddSingleToMonth(item.id);
  };

  const toggleSelectAllReview = () => {
    const allSelected = pendingExpenses.every((e) => selectedReviewIds[e.id]);
    const updated: Record<string, boolean> = {};
    pendingExpenses.forEach((e) => {
      updated[e.id] = !allSelected;
    });
    setSelectedReviewIds(updated);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-xs">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {t('recurringExpenses')}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('manageRecurringDesc')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-3 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'list'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{t('recurringExpenses')} ({recurringExpenses.length})</span>
            </button>

            {pendingExpenses.length > 0 && (
              <button
                onClick={() => setActiveTab('review')}
                className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'review'
                    ? 'border-amber-500 text-amber-700'
                    : 'border-transparent text-amber-600 hover:text-amber-700'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{currentMonthName} ({pendingExpenses.length})</span>
              </button>
            )}

            <button
              onClick={handleOpenAddForm}
              className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'form'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{editingId ? t('edit') : t('addRecurringCommitment')}</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 pb-2 text-xs text-slate-600 font-medium">
            <span>{t('totalExpenses')}:</span>
            <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
              {formatCurrencyAmount(totalMonthlyCommitment, currencySymbol)}
            </span>
          </div>
        </div>

        {/* Tab Content Container */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50/50">
          
          {/* TAB 1: LIST OF RECURRING EXPENSES */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              
              {/* Monthly Overview Callout */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-indigo-950">
                      {currentMonthName}
                    </h4>
                    <p className="text-xs text-indigo-700 mt-0.5">
                      {pendingExpenses.length === 0
                        ? t('allRecurringExpensesRecorded')
                        : `${pendingExpenses.length} ${t('pendingCommitmentsCount')}`}
                    </p>
                  </div>
                </div>

                {pendingExpenses.length > 0 && (
                  <button
                    onClick={() => setActiveTab('review')}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs cursor-pointer whitespace-nowrap"
                  >
                    <span>{t('recordMonthlyCommitments')} ({pendingExpenses.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Items List */}
              {recurringExpenses.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                    <CalendarClock className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">{t('noRecurringExpenses')}</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {t('manageRecurringDesc')}
                  </p>
                  <button
                    onClick={handleOpenAddForm}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t('addRecurringCommitment')}</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {recurringExpenses.map((item) => {
                    const cat = categoryMap.get(item.categoryId);
                    const payer = memberMap.get(item.memberId);
                    const beneficiary = item.beneficiaryMemberId ? memberMap.get(item.beneficiaryMemberId) : null;
                    const isAddedThisMonth = item.lastGeneratedMonth === currentMonthKey;

                    return (
                      <div
                        key={item.id}
                        className={`bg-white rounded-xl border transition p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                          !item.isActive
                            ? 'opacity-60 bg-slate-100/70 border-slate-200'
                            : isAddedThisMonth
                            ? 'border-emerald-200 bg-emerald-50/20'
                            : 'border-slate-200 hover:border-indigo-300 shadow-2xs'
                        }`}
                      >
                        {/* Details */}
                        <div className="flex items-start sm:items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm ${
                              !item.isActive
                                ? 'bg-slate-200 text-slate-500'
                                : isAddedThisMonth
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-indigo-100 text-indigo-700'
                            }`}
                          >
                            {cat?.icon === 'Home' ? '🏠' : cat?.icon === 'Zap' ? '⚡' : cat?.icon === 'ShoppingBag' ? '🛍️' : '📋'}
                          </div>

                          <div>
                            <div className="flex items-center flex-wrap gap-2">
                              <h4 className="text-sm font-bold text-slate-900">
                                {item.title}
                              </h4>
                              
                              {/* Monthly Status Badge */}
                              {item.isActive ? (
                                isAddedThisMonth ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3" />
                                    {t('addedForMonth')}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                                    <AlertCircle className="w-3 h-3" />
                                    {t('dueForMonth')}
                                  </span>
                                )
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-200 text-slate-600">
                                  {t('paused')}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                              <span>{t('category')}: <strong className="text-slate-700">{cat ? formatCategory(cat.id) : t('all')}</strong></span>
                              <span>•</span>
                              <span>{t('whoPaid')}: <strong className="text-slate-700">{payer?.name || t('founder')}</strong></span>
                              {beneficiary && (
                                <>
                                  <span>•</span>
                                  <span>{t('beneficiaryMember')}: <strong className="text-indigo-600">{beneficiary.name}</strong></span>
                                </>
                              )}
                              <span>•</span>
                              <span>{t('dueDay')}: <strong className="text-slate-700">{t('day')} {item.dueDay}</strong></span>
                            </div>

                            {item.notes && (
                              <p className="text-[11px] text-slate-400 mt-1 italic">
                                {item.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Left / Amount & Actions */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          <div className={isRTL ? 'text-left sm:text-right' : 'text-right sm:text-left'}>
                            <div className="text-base font-bold text-slate-900">
                              {formatCurrencyAmount(item.amount, currencySymbol)}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {formatPaymentMethod(item.paymentMethod)}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Trigger Single Add Button if not added this month and active */}
                            {item.isActive && !isAddedThisMonth && (
                              <button
                                onClick={() => handleSingleAddWithFeedback(item)}
                                title={t('addForMonth')}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>{t('addForMonth')}</span>
                              </button>
                            )}

                            {/* Toggle Active Button */}
                            <button
                              onClick={() => onToggleActive(item.id)}
                              title={item.isActive ? t('paused') : t('confirm')}
                              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                item.isActive
                                  ? 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Button */}
                            <button
                              onClick={() => handleOpenEditForm(item)}
                              title={t('edit')}
                              className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => {
                                if (window.confirm(`${t('confirmDelete')} "${item.title}"?`)) {
                                  onDeleteRecurring(item.id);
                                }
                              }}
                              title={t('delete')}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* TAB 2: REVIEW & BATCH ADD FOR CURRENT MONTH */}
          {activeTab === 'review' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5">
                <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900">
                  <p className="font-bold text-sm">{currentMonthName}</p>
                  <p className="mt-0.5 text-amber-800">
                    {t('manageRecurringDesc')}
                  </p>
                </div>
              </div>

              {pendingExpenses.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">{t('allRecurringExpensesRecorded')}</h4>
                  <button
                    onClick={() => setActiveTab('list')}
                    className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                  >
                    {t('cancel')}
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={toggleSelectAllReview}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      {pendingExpenses.every((e) => selectedReviewIds[e.id])
                        ? t('cancel')
                        : t('all')}
                    </button>
                    <span className="text-xs text-slate-500">
                      {Object.values(selectedReviewIds).filter(Boolean).length} / {pendingExpenses.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {pendingExpenses.map((item) => {
                      const cat = categoryMap.get(item.categoryId);
                      const payer = memberMap.get(item.memberId);
                      const isSelected = !!selectedReviewIds[item.id];

                      return (
                        <div
                          key={item.id}
                          className={`p-3 rounded-xl border transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                            isSelected
                              ? 'bg-white border-indigo-300 shadow-xs ring-1 ring-indigo-500/20'
                              : 'bg-slate-50 border-slate-200 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              id={`check-${item.id}`}
                              checked={isSelected}
                              onChange={(e) =>
                                setSelectedReviewIds((prev) => ({
                                  ...prev,
                                  [item.id]: e.target.checked,
                                }))
                              }
                              className="w-4 h-4 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500 cursor-pointer"
                            />
                            <div>
                              <label
                                htmlFor={`check-${item.id}`}
                                className="text-xs sm:text-sm font-bold text-slate-900 cursor-pointer block"
                              >
                                {item.title}
                              </label>
                              <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                                <span>{cat ? formatCategory(cat.id) : ''}</span>
                                <span>•</span>
                                <span>{payer?.name}</span>
                                <span>•</span>
                                <span>{t('day')} {item.dueDay}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <input
                                type="number"
                                step="any"
                                value={customReviewAmounts[item.id] || ''}
                                onChange={(e) =>
                                  setCustomReviewAmounts((prev) => ({
                                    ...prev,
                                    [item.id]: e.target.value,
                                  }))
                                }
                                disabled={!isSelected}
                                className={`w-28 text-xs font-bold bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${isRTL ? 'pl-8' : 'pr-8'}`}
                              />
                              <span className={`absolute ${isRTL ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-bold`}>
                                {currencySymbol}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setActiveTab('list')}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmBatchReview}
                      disabled={Object.values(selectedReviewIds).filter(Boolean).length === 0}
                      className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-xs transition cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>{t('recordMonthlyCommitments')}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 3: CREATE / EDIT FORM */}
          {activeTab === 'form' && (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('expenseName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('titlePlaceholder')}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('amount')} ({currencySymbol}) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="0.1"
                      required
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className={`w-full text-xs sm:text-sm font-bold bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${isRTL ? 'pl-12' : 'pr-12'}`}
                    />
                    <span className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400`}>
                      {currencySymbol}
                    </span>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('category')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {formatCategory(c.id)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Member Responsible */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('whoPaid')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    required
                    className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.avatarIcon || '👤'} {m.name} ({m.customRoleTitle || formatRole(m.role) || m.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Beneficiary */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('beneficiaryMember')}
                  </label>
                  <select
                    value={beneficiaryMemberId}
                    onChange={(e) => setBeneficiaryMemberId(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">{t('generalFamily')} 🏡</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.customRoleTitle || formatRole(m.role) || m.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Due Day */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('dueDay')}
                  </label>
                  <select
                    value={dueDay}
                    onChange={(e) => setDueDay(parseInt(e.target.value, 10))}
                    className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>
                        {t('day')} {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('paymentMethod')}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="card">{formatPaymentMethod('card')} 💳</option>
                    <option value="digital_wallet">{formatPaymentMethod('digital_wallet')} 📱</option>
                    <option value="bank_transfer">{formatPaymentMethod('bank_transfer')} 🏦</option>
                    <option value="cash">{formatPaymentMethod('cash')} 💵</option>
                    <option value="other">{t('other')}</option>
                  </select>
                </div>

                {/* Active Checkbox */}
                <div className="flex items-center gap-2 sm:col-span-2 p-3 bg-white rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    id="is-active-check"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="is-active-check" className="text-xs font-bold text-slate-800 cursor-pointer">
                    {t('saveAsMonthlyRecurring')}
                  </label>
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('notes')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('descriptionPlaceholder')}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingId ? t('saveChanges') : t('addRecurringCommitment')}</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
