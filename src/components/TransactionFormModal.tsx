import React, { useState, useEffect } from 'react';
import { 
  X, 
  PlusCircle, 
  MinusCircle, 
  Calendar, 
  CreditCard, 
  Tag, 
  User, 
  Check, 
  AlertCircle,
  ShoppingBag,
  Home,
  Zap,
  GraduationCap,
  HeartPulse,
  Car,
  Shirt,
  Utensils,
  Coins,
  Gift,
  MoreHorizontal,
  Briefcase,
  Award,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import confetti from '../utils/confetti';
import { Category, FamilyMember, PaymentMethod, Transaction, TransactionType } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    transaction: Omit<Transaction, 'id' | 'createdAt'>,
    saveAsRecurring?: { dueDay: number; title: string }
  ) => void;
  members: FamilyMember[];
  categories: Category[];
  initialType?: TransactionType;
  editingTransaction?: Transaction | null;
  currencySymbol: string;
  preselectedMemberId?: string;
}

const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  ShoppingBag,
  Home,
  Zap,
  GraduationCap,
  HeartPulse,
  Car,
  Shirt,
  Utensils,
  Coins,
  Gift,
  MoreHorizontal,
  Briefcase,
  Award,
  TrendingUp,
  ShieldCheck,
  PlusCircle,
};

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000, 2000];

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  members,
  categories,
  initialType = 'expense',
  editingTransaction,
  currencySymbol,
  preselectedMemberId,
}) => {
  const { t, formatCategory, formatRole, formatPaymentMethod, isRTL } = useLanguage();

  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [memberId, setMemberId] = useState<string>('');
  const [beneficiaryMemberId, setBeneficiaryMemberId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [description, setDescription] = useState<string>('');
  const [saveAsRecurring, setSaveAsRecurring] = useState<boolean>(false);
  const [recurringDueDay, setRecurringDueDay] = useState<number>(1);
  const [recurringTitle, setRecurringTitle] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setCategoryId(editingTransaction.categoryId);
      setMemberId(editingTransaction.memberId);
      setBeneficiaryMemberId(editingTransaction.beneficiaryMemberId || '');
      setDate(editingTransaction.date);
      setPaymentMethod(editingTransaction.paymentMethod);
      setDescription(editingTransaction.description);
    } else {
      setType(initialType);
      setAmount('');
      // Default to first matching category
      const defaultCat = categories.find((c) => c.type === initialType);
      setCategoryId(defaultCat ? defaultCat.id : (categories[0]?.id || ''));
      setMemberId(preselectedMemberId || (members[0]?.id || ''));
      setBeneficiaryMemberId('');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('card');
      setDescription('');
      setSaveAsRecurring(false);
      setRecurringDueDay(1);
      setRecurringTitle('');
    }
    setError('');
  }, [editingTransaction, initialType, categories, members, preselectedMemberId, isOpen]);

  // When type changes, re-adjust default category
  useEffect(() => {
    if (!editingTransaction) {
      const matchCat = categories.find((c) => c.type === type);
      if (matchCat) {
        setCategoryId(matchCat.id);
      }
    }
  }, [type, categories, editingTransaction]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError(t('amountRequired'));
      return;
    }

    if (!categoryId) {
      setError(t('categoryRequired'));
      return;
    }

    if (!memberId) {
      setError(t('memberRequired'));
      return;
    }

    onSubmit(
      {
        type,
        amount: numAmount,
        categoryId,
        memberId,
        beneficiaryMemberId: beneficiaryMemberId || undefined,
        date,
        paymentMethod,
        description: description.trim(),
      },
      saveAsRecurring ? { dueDay: recurringDueDay, title: recurringTitle.trim() || description.trim() || (categories.find(c => c.id === categoryId)?.name || 'Recurring Expense') } : undefined
    );

    // Trigger celebratory confetti on income or significant addition
    if (type === 'income') {
      confetti();
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn" dir={isRTL ? 'rtl' : 'ltr'}>
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                type === 'expense'
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                  : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {type === 'expense' ? <MinusCircle className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingTransaction
                  ? t('editTransaction')
                  : type === 'expense'
                  ? t('addExpense')
                  : t('addIncome')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('recordExpenseDesc')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Type Toggle: Expense / Income */}
          {!editingTransaction && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  type === 'expense'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <MinusCircle className="w-4 h-4" />
                <span>{t('expense')}</span>
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  type === 'income'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t('income')}</span>
              </button>
            </div>
          )}

          {/* Amount Field & Quick Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('amount')} ({currencySymbol}) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0.1"
                required
                autoFocus
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full text-lg sm:text-xl font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 ${isRTL ? 'pl-16' : 'pr-16'}`}
              />
              <span className={`absolute ${isRTL ? 'left-3.5' : 'right-3.5'} top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 dark:text-slate-500`}>
                {currencySymbol}
              </span>
            </div>

            {/* Quick Amount Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[11px] text-slate-400 dark:text-slate-500 self-center ml-1">{t('quickAmounts')}:</span>
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt.toString())}
                  className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition font-medium cursor-pointer"
                >
                  +{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Family Member Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{t('whoPaid')}</span>
                <span className="text-red-500">*</span>
              </label>
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                required
                className="w-full text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.avatarIcon || '👤'} {m.name} ({m.customRoleTitle || formatRole(m.role) || m.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Beneficiary (Optional - who benefits from this expense) */}
            {type === 'expense' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('beneficiaryMember')}
                </label>
                <select
                  value={beneficiaryMemberId}
                  onChange={(e) => setBeneficiaryMemberId(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">{t('generalFamily')} 🏡</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.customRoleTitle || formatRole(m.role) || m.role})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t('category')}</span>
              <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/50">
              {filteredCategories.map((cat) => {
                const IconComponent = CATEGORY_ICON_MAP[cat.icon] || Tag;
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg ${isRTL ? 'text-right' : 'text-left'} text-xs transition border cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs font-bold'
                        : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">{formatCategory(cat.id)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{t('date')}</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{t('paymentMethod')}</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="card">{formatPaymentMethod('card')} 💳</option>
                <option value="digital_wallet">{formatPaymentMethod('digital_wallet')} 📱</option>
                <option value="bank_transfer">{formatPaymentMethod('bank_transfer')} 🏦</option>
                <option value="cash">{formatPaymentMethod('cash')} 💵</option>
                <option value="other">{t('other')}</option>
              </select>
            </div>
          </div>

          {/* Description & Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('descriptionOptional')}
            </label>
            <input
              type="text"
              placeholder={t('descriptionPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Optional Recurring Checkbox (when adding new expense) */}
          {type === 'expense' && !editingTransaction && (
            <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-xl space-y-2.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveAsRecurring}
                  onChange={(e) => setSaveAsRecurring(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded-md border-indigo-300 dark:border-indigo-700 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                  🔁 {t('saveAsMonthlyRecurring')}
                </span>
              </label>

              {saveAsRecurring && (
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 ${isRTL ? 'pr-6' : 'pl-6'}`}>
                  <div>
                    <label className="block text-[11px] font-semibold text-indigo-900 dark:text-indigo-300 mb-1">
                      {t('expenseName')}
                    </label>
                    <input
                      type="text"
                      placeholder={description || t('titlePlaceholder')}
                      value={recurringTitle}
                      onChange={(e) => setRecurringTitle(e.target.value)}
                      className="w-full text-xs bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-indigo-900 dark:text-indigo-300 mb-1">
                      {t('dueDay')}
                    </label>
                    <select
                      value={recurringDueDay}
                      onChange={(e) => setRecurringDueDay(parseInt(e.target.value, 10))}
                      className="w-full text-xs bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>
                          {t('day')} {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className={`inline-flex items-center gap-1.5 px-5 py-2.5 text-xs sm:text-sm font-bold text-white rounded-xl shadow-xs transition cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{editingTransaction ? t('saveChanges') : type === 'expense' ? t('addExpense') : t('addIncome')}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
