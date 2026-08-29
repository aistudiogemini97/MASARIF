import React, { useState, useMemo } from 'react';
import { 
  CalendarClock, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  Power, 
  Sparkles, 
  CreditCard, 
  Calendar, 
  Layers,
  ArrowRight,
  Info,
  Check,
  X,
  Clock,
  Zap,
  HelpCircle
} from 'lucide-react';
import confetti from '../utils/confetti';
import { Category, FamilyMember, PaymentMethod, RecurringExpense } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface MemberCommitmentsSectionProps {
  currentMember: FamilyMember;
  recurringExpenses: RecurringExpense[];
  categories: Category[];
  currencySymbol: string;
  onAddRecurring: (expense: Omit<RecurringExpense, 'id' | 'createdAt'>) => void;
  onUpdateRecurring: (id: string, updates: Partial<RecurringExpense>) => void;
  onDeleteRecurring: (id: string) => void;
  onToggleRecurringActive: (id: string) => void;
  onPayRecurringForMonth: (recurring: RecurringExpense) => void;
  onBatchPayRecurringForMonth?: (recurringList: RecurringExpense[]) => void;
}

export const MemberCommitmentsSection: React.FC<MemberCommitmentsSectionProps> = ({
  currentMember,
  recurringExpenses,
  categories,
  currencySymbol,
  onAddRecurring,
  onUpdateRecurring,
  onDeleteRecurring,
  onToggleRecurringActive,
  onPayRecurringForMonth,
  onBatchPayRecurringForMonth,
}) => {
  const { t, formatCategory, formatPaymentMethod, formatCurrencyAmount, isRTL, language } = useLanguage();

  // Current month key & current day
  const today = new Date();
  const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const currentDay = today.getDate();
  const currentMonthName = new Intl.DateTimeFormat(language, { month: 'long' }).format(today);

  // Filter only commitments relevant to this member
  const memberCommitments = useMemo(() => {
    return recurringExpenses.filter(
      (r) => r.memberId === currentMember.id || r.beneficiaryMemberId === currentMember.id
    );
  }, [recurringExpenses, currentMember.id]);

  // Statistics
  const activeCommitments = memberCommitments.filter((r) => r.isActive);
  const totalMonthlyObligations = activeCommitments.reduce((sum, r) => sum + r.amount, 0);

  const paidThisMonthCommitments = activeCommitments.filter(
    (r) => r.lastGeneratedMonth === currentMonthKey
  );
  const paidThisMonthTotal = paidThisMonthCommitments.reduce((sum, r) => sum + r.amount, 0);

  const pendingCommitments = activeCommitments.filter(
    (r) => r.lastGeneratedMonth !== currentMonthKey
  );
  const pendingTotal = pendingCommitments.reduce((sum, r) => sum + r.amount, 0);

  // Category map
  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  // Tabs / Filters for commitments list
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'paid' | 'inactive'>('all');
  
  // Modal State for Add/Edit Commitment
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [dueDay, setDueDay] = useState<number>(1);
  const [frequency, setFrequency] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Handle open add modal
  const handleOpenAdd = () => {
    setEditingId(null);
    setTitle('');
    setAmount('');
    setCategoryId(categories.length > 0 ? categories[0].id : '');
    setPaymentMethod('card');
    setDueDay(1);
    setFrequency('monthly');
    setNotes('');
    setFormError('');
    setIsModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEdit = (rec: RecurringExpense) => {
    setEditingId(rec.id);
    setTitle(rec.title);
    setAmount(rec.amount.toString());
    setCategoryId(rec.categoryId);
    setPaymentMethod(rec.paymentMethod);
    setDueDay(rec.dueDay || 1);
    setFrequency(rec.frequency || 'monthly');
    setNotes(rec.notes || '');
    setFormError('');
    setIsModalOpen(true);
  };

  // Handle submit commitment form
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError(t('titleRequired'));
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError(t('amountRequired'));
      return;
    }
    if (!categoryId) {
      setFormError(t('categoryRequired'));
      return;
    }

    if (editingId) {
      onUpdateRecurring(editingId, {
        title: title.trim(),
        amount: parsedAmount,
        categoryId,
        paymentMethod,
        dueDay: Number(dueDay),
        frequency,
        notes: notes.trim() || undefined,
      });
    } else {
      onAddRecurring({
        title: title.trim(),
        amount: parsedAmount,
        categoryId,
        memberId: currentMember.id,
        beneficiaryMemberId: currentMember.id,
        paymentMethod,
        dueDay: Number(dueDay),
        frequency,
        isActive: true,
        notes: notes.trim() || undefined,
      });
    }

    setIsModalOpen(false);
  };

  // Trigger Pay Single
  const handlePaySingle = (rec: RecurringExpense) => {
    onPayRecurringForMonth(rec);
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {}
  };

  // Trigger Batch Pay for Member
  const handleBatchPayAllPending = () => {
    if (pendingCommitments.length === 0) return;
    if (
      window.confirm(
        `${t('recordMonthlyCommitments')} (${currentMonthName}): ${formatCurrencyAmount(pendingTotal, currencySymbol)}?`
      )
    ) {
      if (onBatchPayRecurringForMonth) {
        onBatchPayRecurringForMonth(pendingCommitments);
      } else {
        pendingCommitments.forEach((rec) => onPayRecurringForMonth(rec));
      }
      try {
        confetti({
          particleCount: 80,
          spread: 90,
          origin: { y: 0.7 },
        });
      } catch {}
    }
  };

  // Filtered list
  const filteredCommitments = useMemo(() => {
    return memberCommitments.filter((r) => {
      if (filterStatus === 'inactive') return !r.isActive;
      if (filterStatus === 'paid') return r.isActive && r.lastGeneratedMonth === currentMonthKey;
      if (filterStatus === 'pending') return r.isActive && r.lastGeneratedMonth !== currentMonthKey;
      return true;
    });
  }, [memberCommitments, filterStatus, currentMonthKey]);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-xs space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* 1. Service Header & High-Level Summary */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-2xs">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  {t('myMonthlyCommitments')}
                </h2>
                <span className="text-[11px] bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold border border-indigo-100">
                  {activeCommitments.length} {t('recurringExpenses')}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('manageRecurringDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {pendingCommitments.length > 0 && (
            <button
              onClick={handleBatchPayAllPending}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 transition active:scale-98 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>{t('recordMonthlyCommitments')} ({formatCurrencyAmount(pendingTotal, currencySymbol)})</span>
            </button>
          )}

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-600/20 transition active:scale-98 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ {t('addRecurringCommitment')}</span>
          </button>
        </div>
      </div>

      {/* 2. Commitments KPI Mini Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Metric 1: Total monthly obligations */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500">{t('totalExpenses')}</span>
            <div className="text-xl font-black text-slate-900 mt-1">
              {formatCurrencyAmount(totalMonthlyObligations, currencySymbol)}
            </div>
            <span className="text-[10px] text-slate-400">
              {activeCommitments.length} {t('recurringExpenses')}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-100/80 text-indigo-700 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 2: Paid this month */}
        <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-emerald-800">{t('addedForMonth')}</span>
            <div className="text-xl font-black text-emerald-700 mt-1">
              {formatCurrencyAmount(paidThisMonthTotal, currencySymbol)}
            </div>
            <span className="text-[10px] text-emerald-600">
              {paidThisMonthCommitments.length} / {activeCommitments.length}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 3: Pending / Due this month */}
        <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-amber-800">{t('dueForMonth')}</span>
            <div className="text-xl font-black text-amber-700 mt-1">
              {formatCurrencyAmount(pendingTotal, currencySymbol)}
            </div>
            <span className="text-[10px] text-amber-600">
              {pendingCommitments.length} {t('dueForMonth')}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
        </div>

      </div>

      {/* 3. Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl text-xs font-semibold">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('all')} ({memberCommitments.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              filterStatus === 'pending'
                ? 'bg-white text-amber-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-amber-700'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>{t('dueForMonth')} ({pendingCommitments.length})</span>
          </button>
          <button
            onClick={() => setFilterStatus('paid')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              filterStatus === 'paid'
                ? 'bg-white text-emerald-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{t('addedForMonth')} ({paidThisMonthCommitments.length})</span>
          </button>
          {memberCommitments.some((r) => !r.isActive) && (
            <button
              onClick={() => setFilterStatus('inactive')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                filterStatus === 'inactive'
                  ? 'bg-white text-slate-700 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t('paused')} ({memberCommitments.filter((r) => !r.isActive).length})
            </button>
          )}
        </div>

        <span className="text-[11px] text-slate-400">
          {currentMonthName} ({currentMonthKey})
        </span>
      </div>

      {/* 4. Commitments Grid / List */}
      {filteredCommitments.length === 0 ? (
        <div className="text-center py-10 px-4 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-3">
            <CalendarClock className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 mb-1">
            {t('noRecurringExpenses')}
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            {t('manageRecurringDesc')}
          </p>
          {memberCommitments.length === 0 && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition active:scale-98 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('addRecurringCommitment')}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCommitments.map((rec) => {
            const cat = categoryMap.get(rec.categoryId);
            const isPaid = rec.lastGeneratedMonth === currentMonthKey;
            const dueDayNum = rec.dueDay || 1;
            
            let dueStatusLabel = `${t('day')} ${dueDayNum}`;
            let dueStatusClass = 'bg-slate-100 text-slate-600 border-slate-200';
            
            if (rec.isActive) {
              if (isPaid) {
                dueStatusLabel = t('addedForMonth');
                dueStatusClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
              } else if (dueDayNum < currentDay) {
                dueStatusLabel = `${t('dueDay')} ${dueDayNum}`;
                dueStatusClass = 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';
              } else if (dueDayNum === currentDay) {
                dueStatusLabel = `${t('dueDay')} ${dueDayNum}`;
                dueStatusClass = 'bg-amber-50 text-amber-800 border-amber-300 font-bold';
              } else {
                dueStatusLabel = `${t('day')} ${dueDayNum}`;
                dueStatusClass = 'bg-indigo-50 text-indigo-700 border-indigo-200';
              }
            } else {
              dueStatusLabel = t('paused');
              dueStatusClass = 'bg-slate-100 text-slate-500 border-slate-200';
            }

            return (
              <div 
                key={rec.id}
                className={`rounded-2xl p-4.5 border transition relative flex flex-col justify-between ${
                  !rec.isActive
                    ? 'bg-slate-50/60 border-slate-200 opacity-60'
                    : isPaid
                    ? 'bg-emerald-50/20 border-emerald-200/80 shadow-2xs'
                    : 'bg-white border-slate-200/90 shadow-2xs hover:border-indigo-200'
                }`}
              >
                <div>
                  {/* Top Row: Title, Category & Active Toggle */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs bg-indigo-600"
                      >
                        <CalendarClock className="w-5 h-5" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 leading-tight">
                            {rec.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                          <span>{cat ? formatCategory(cat.id) : t('all')}</span>
                          <span>•</span>
                          <span>{formatPaymentMethod(rec.paymentMethod)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Amount & Active Switch */}
                    <div className={`${isRTL ? 'text-left' : 'text-right'} flex flex-col ${isRTL ? 'items-end' : 'items-start'}`}>
                      <div className="text-base font-black text-slate-900">
                        {formatCurrencyAmount(rec.amount, currencySymbol)}
                      </div>
                    </div>
                  </div>

                  {/* Notes if any */}
                  {rec.notes && (
                    <p className="text-[11px] text-slate-500 mt-2.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      💬 {rec.notes}
                    </p>
                  )}

                  {/* Due Status Badge */}
                  <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2">
                    <span className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold inline-flex items-center gap-1.5 ${dueStatusClass}`}>
                      {isPaid ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : rec.isActive ? (
                        <Calendar className="w-3.5 h-3.5" />
                      ) : (
                        <Power className="w-3.5 h-3.5" />
                      )}
                      <span>{dueStatusLabel}</span>
                    </span>

                    {/* Actions: Edit & Delete & Toggle Active */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onToggleRecurringActive(rec.id)}
                        className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                          rec.isActive 
                            ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50' 
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={rec.isActive ? t('paused') : t('confirm')}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(rec)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                        title={t('edit')}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`${t('confirmDelete')} "${rec.title}"?`)) {
                            onDeleteRecurring(rec.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title={t('delete')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Action: Pay for Month Button */}
                {rec.isActive && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    {isPaid ? (
                      <div className="w-full py-2 px-3 bg-emerald-100/60 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>{t('addedForMonth')}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handlePaySingle(rec)}
                        className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-bold rounded-xl transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>{t('addForMonth')} 💳</span>
                      </button>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* 5. Modal for Add / Edit Commitment */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <CalendarClock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingId ? t('edit') : t('addRecurringCommitment')}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {currentMember.name}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmitForm} className="p-5 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t('expenseName')} *
                </label>
                <input
                  type="text"
                  placeholder={t('titlePlaceholder')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                  required
                />
              </div>

              {/* Amount & Due Day */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {t('amount')} ({currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {t('dueDay')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={dueDay}
                    onChange={(e) => setDueDay(parseInt(e.target.value) || 1)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>
              </div>

              {/* Category & Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {t('category')} *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer"
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {formatCategory(c.id)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {t('paymentMethod')}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer"
                  >
                    <option value="card">{formatPaymentMethod('card')} 💳</option>
                    <option value="cash">{formatPaymentMethod('cash')} 💵</option>
                    <option value="bank_transfer">{formatPaymentMethod('bank_transfer')} 🏦</option>
                    <option value="digital_wallet">{formatPaymentMethod('digital_wallet')} 📱</option>
                    <option value="other">{t('other')}</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t('notes')}
                </label>
                <input
                  type="text"
                  placeholder={t('descriptionPlaceholder')}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Form Error */}
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold">
                  {formError}
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition active:scale-98 cursor-pointer"
                >
                  {editingId ? t('saveChanges') : t('addRecurringCommitment')}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
