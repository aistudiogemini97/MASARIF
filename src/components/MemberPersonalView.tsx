import React, { useState, useMemo } from 'react';
import { 
  FamilyMember, 
  Transaction, 
  Category, 
  PaymentMethod,
  RecurringExpense
} from '../types';
import { ROLE_LABELS, ROLE_BADGE_COLORS } from '../data/initialData';
import { useLanguage } from '../context/LanguageContext';
import { MemberCommitmentsSection } from './MemberCommitmentsSection';
import { MemberPinSettingsModal } from './MemberPinSettingsModal';
import { 
  Wallet, 
  TrendingDown, 
  TrendingUp, 
  PiggyBank, 
  ShieldCheck, 
  ShieldAlert,
  KeyRound,
  Lock, 
  PlusCircle, 
  MinusCircle, 
  Search, 
  Filter, 
  Calendar, 
  AlertTriangle, 
  Sparkles, 
  Users, 
  ChevronDown, 
  Edit3, 
  Trash2,
  PieChart as PieChartIcon,
  Tag,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CalendarClock,
  Languages
} from 'lucide-react';

interface MemberPersonalViewProps {
  currentMember: FamilyMember;
  allMembers: FamilyMember[];
  transactions: Transaction[];
  categories: Category[];
  recurringExpenses: RecurringExpense[];
  currencySymbol: string;
  onOpenAddExpense: () => void;
  onOpenAddIncome: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onSwitchToFounderMode: () => void;
  onSwitchMember: (memberId: string) => void;
  onUpdateMember?: (id: string, updates: Partial<FamilyMember>) => void;
  founderPin?: string;
  onAddRecurring: (expense: Omit<RecurringExpense, 'id' | 'createdAt'>) => void;
  onUpdateRecurring: (id: string, updates: Partial<RecurringExpense>) => void;
  onDeleteRecurring: (id: string) => void;
  onToggleRecurringActive: (id: string) => void;
  onPayRecurringForMonth: (recurring: RecurringExpense) => void;
  onBatchPayRecurringForMonth?: (recurringList: RecurringExpense[]) => void;
  onOpenLanguageModal?: () => void;
}

export const MemberPersonalView: React.FC<MemberPersonalViewProps> = ({
  currentMember,
  allMembers,
  transactions,
  categories,
  recurringExpenses,
  currencySymbol,
  onOpenAddExpense,
  onOpenAddIncome,
  onEditTransaction,
  onDeleteTransaction,
  onSwitchToFounderMode,
  onSwitchMember,
  onUpdateMember,
  founderPin,
  onAddRecurring,
  onUpdateRecurring,
  onDeleteRecurring,
  onToggleRecurringActive,
  onPayRecurringForMonth,
  onBatchPayRecurringForMonth,
  onOpenLanguageModal,
}) => {
  const { language, languageInfo, t, formatRole, formatCategory, formatDate, formatPaymentMethod, formatCurrencyAmount, isRTL } = useLanguage();
  
  // Pin settings modal state
  const [isPinSettingsOpen, setIsPinSettingsOpen] = useState(false);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  // 1. Strict Data Isolation: ONLY transactions belonging to or benefiting this specific member
  const memberTransactions = useMemo(() => {
    return transactions.filter(
      (t) => t.memberId === currentMember.id || t.beneficiaryMemberId === currentMember.id
    );
  }, [transactions, currentMember.id]);

  // Current Month String (YYYY-MM)
  const currentMonth = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  // Filter this month's personal transactions
  const thisMonthTransactions = useMemo(() => {
    return memberTransactions.filter((t) => t.date.startsWith(currentMonth));
  }, [memberTransactions, currentMonth]);

  // Calculate Personal KPIs for this month
  const totalPersonalExpenseThisMonth = useMemo(() => {
    return thisMonthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [thisMonthTransactions]);

  const totalPersonalIncomeThisMonth = useMemo(() => {
    return thisMonthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [thisMonthTransactions]);

  // All-time personal totals
  const allTimePersonalExpense = useMemo(() => {
    return memberTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [memberTransactions]);

  const allTimePersonalIncome = useMemo(() => {
    return memberTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [memberTransactions]);

  const personalNetBalance = allTimePersonalIncome - allTimePersonalExpense;

  // Monthly Budget calculations
  const monthlyBudget = currentMember.monthlyBudget || 0;
  const remainingBudget = monthlyBudget > 0 ? monthlyBudget - totalPersonalExpenseThisMonth : 0;
  const budgetUsagePercent = monthlyBudget > 0 
    ? Math.min(100, Math.round((totalPersonalExpenseThisMonth / monthlyBudget) * 100)) 
    : 0;

  // Category breakdown for this member
  const categoryExpenses = useMemo(() => {
    const map = new Map<string, { category: Category; amount: number; count: number }>();
    
    memberTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const cat = categories.find((c) => c.id === t.categoryId) || {
          id: 'other',
          name: t('other'),
          icon: 'Tag',
          color: '#94a3b8',
          type: 'expense' as const,
        };

        const existing = map.get(cat.id) || { category: cat, amount: 0, count: 0 };
        existing.amount += t.amount;
        existing.count += 1;
        map.set(cat.id, existing);
      });

    return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
  }, [memberTransactions, categories, t]);

  // Filters for the transaction table
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredTransactions = useMemo(() => {
    return memberTransactions
      .filter((t) => {
        if (filterType !== 'all' && t.type !== filterType) return false;
        if (filterCategory !== 'all' && t.categoryId !== filterCategory) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const desc = (t.description || '').toLowerCase();
          const cat = (categories.find((c) => c.id === t.categoryId)?.name || '').toLowerCase();
          if (!desc.includes(q) && !cat.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [memberTransactions, filterType, filterCategory, searchQuery, categories]);

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const roleBadge = ROLE_BADGE_COLORS[currentMember.role] || { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
  const roleLabel = currentMember.customRoleTitle || formatRole(currentMember.role) || ROLE_LABELS[currentMember.role] || currentMember.role;

  return (
    <div className="space-y-6 pb-12 animate-fadeIn" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* 1. Header Banner for Member */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl border border-indigo-900/40 relative overflow-hidden">
        
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          
          {/* Member Profile Avatar & Welcome */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl sm:text-4xl shadow-inner shrink-0">
              {currentMember.avatarIcon || '👤'}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {currentMember.name}
                </h1>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${roleBadge.bg} ${roleBadge.text} ${roleBadge.border}`}>
                  {roleLabel}
                </span>
              </div>
              
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{t('memberViewDesc')}</span>
              </p>
            </div>
          </div>

          {/* Quick Actions for Member & Switcher */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Language Selector Button for Member */}
            {onOpenLanguageModal && (
              <button
                type="button"
                onClick={onOpenLanguageModal}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold backdrop-blur-xs border border-white/20 bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title={t('changeLanguage')}
              >
                <span>{languageInfo.flag || '🌐'}</span>
                <span>{languageInfo.nativeName}</span>
              </button>
            )}

            {/* Member PIN Protection Button */}
            <button
              type="button"
              onClick={() => setIsPinSettingsOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold backdrop-blur-xs border transition cursor-pointer ${
                currentMember.pin 
                  ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border-emerald-400/30' 
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-400/30'
              }`}
              title={t('memberSecurityPin')}
            >
              {currentMember.pin ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>PIN: {t('securityProtected')} 🔒</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('setPin')} 🔑</span>
                </>
              )}
            </button>

            {/* Switch Member Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMemberDropdown(!showMemberDropdown)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs border border-white/10 transition cursor-pointer"
                title={t('switchProfile')}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{t('switchProfile')}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showMemberDropdown && (
                <div 
                  className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-56 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-fadeIn`}
                  onMouseLeave={() => setShowMemberDropdown(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 text-[11px] font-bold text-slate-400 dark:text-slate-400">
                    {t('selectMemberToView')}:
                  </div>
                  {allMembers.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        onSwitchMember(m.id);
                        setShowMemberDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs ${isRTL ? 'text-right' : 'text-left'} hover:bg-slate-50 dark:hover:bg-slate-700/80 transition cursor-pointer ${
                        m.id === currentMember.id ? 'bg-indigo-50 dark:bg-indigo-950/60 font-bold text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{m.avatarIcon || '👤'}</span>
                        <span className="truncate max-w-[110px]">{m.name}</span>
                      </div>
                      {m.isFounder && (
                        <span className="text-[10px] bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded-full font-bold">
                          {t('founderBadge')}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Back to Founder Mode Button */}
            <button
              onClick={onSwitchToFounderMode}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition active:scale-98 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{t('founderPanelTitle')} 👑</span>
            </button>

          </div>

        </div>

      </div>

      {/* 2. Personal KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Personal Expenses This Month */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('myExpensesThisMonth')}</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatCurrencyAmount(totalPersonalExpenseThisMonth, currencySymbol)}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              {t('totalExpenses')} ({t('thisMonth')})
            </p>
          </div>
        </div>

        {/* Card 2: Personal Income / Allowance Received This Month */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('myIncomeThisMonth')}</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {formatCurrencyAmount(totalPersonalIncomeThisMonth, currencySymbol)}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              {t('totalIncome')} ({t('thisMonth')})
            </p>
          </div>
        </div>

        {/* Card 3: Monthly Budget / Allowance Status */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('remainingBudget')}</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              monthlyBudget === 0 
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' 
                : remainingBudget >= 0 
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400' 
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
            }`}>
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3">
            {monthlyBudget > 0 ? (
              <>
                <div className={`text-2xl font-black tracking-tight ${
                  remainingBudget >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {formatCurrencyAmount(remainingBudget, currencySymbol)}
                </div>
                
                {/* Progress bar */}
                <div className="mt-2.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-semibold mb-1">
                    <span>{budgetUsagePercent}%</span>
                    <span>/ {formatCurrencyAmount(monthlyBudget, currencySymbol)}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        budgetUsagePercent > 90 
                          ? 'bg-rose-500' 
                          : budgetUsagePercent > 70 
                          ? 'bg-amber-500' 
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${budgetUsagePercent}%` }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-lg font-bold text-slate-700 dark:text-slate-300">
                  {t('unspecified')}
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  {t('monthlyBudget')}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Card 4: Personal Net Balance */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('totalBalance')}</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-black tracking-tight ${
              personalNetBalance >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {formatCurrencyAmount(personalNetBalance, currencySymbol)}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              ({t('income')} - {t('expense')})
            </p>
          </div>
        </div>

      </div>

      {/* 3. Budget Alert if Exceeded */}
      {monthlyBudget > 0 && remainingBudget < 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4 flex items-center gap-3 text-rose-800 dark:text-rose-300 text-xs animate-fadeIn font-semibold">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
          <div>
            <span className="font-bold">{t('budgetWarning')}: </span>
            {formatCurrencyAmount(Math.abs(remainingBudget), currencySymbol)}
          </div>
        </div>
      )}

      {/* 4. Action Buttons & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Add Action Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('quickRecord')}</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
              {t('memberViewDesc')}
            </p>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={onOpenAddExpense}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm shadow-rose-600/20 transition active:scale-98 cursor-pointer"
            >
              <MinusCircle className="w-4 h-4" />
              <span>+ {t('addExpense')}</span>
            </button>

            <button
              onClick={onOpenAddIncome}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 transition active:scale-98 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ {t('addIncome')}</span>
            </button>
          </div>
        </div>

        {/* Category Breakdown for Member */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('categoryDistribution')}</h3>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {categoryExpenses.length} {t('categories')}
            </span>
          </div>

          {categoryExpenses.length === 0 ? (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
              {t('noTransactionsFound')}
            </div>
          ) : (
            <div className="space-y-3">
              {categoryExpenses.slice(0, 5).map(({ category, amount, count }) => {
                const percent = allTimePersonalExpense > 0 
                  ? Math.round((amount / allTimePersonalExpense) * 100) 
                  : 0;

                return (
                  <div key={category.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: category.color || '#64748b' }} 
                        />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCategory(category.id)}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">({count})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatCurrencyAmount(amount, currencySymbol)}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          {percent}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${percent}%`, 
                          backgroundColor: category.color || '#10b981' 
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* 5. Dedicated Commitments Service (المصاريف والالتزامات الشهرية المتكررة) */}
      <MemberCommitmentsSection
        currentMember={currentMember}
        recurringExpenses={recurringExpenses}
        categories={categories}
        currencySymbol={currencySymbol}
        onAddRecurring={onAddRecurring}
        onUpdateRecurring={onUpdateRecurring}
        onDeleteRecurring={onDeleteRecurring}
        onToggleRecurringActive={onToggleRecurringActive}
        onPayRecurringForMonth={onPayRecurringForMonth}
        onBatchPayRecurringForMonth={onBatchPayRecurringForMonth}
      />

      {/* 6. Personal Transactions List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        
        {/* Table Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3.5 pb-5 border-b border-slate-100 dark:border-slate-800">
          
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('recentTransactions')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('all')}: {filteredTransactions.length}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            
            {/* Search Input */}
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full text-xs ${isRTL ? 'pl-3 pr-8' : 'pr-3 pl-8'} py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500`}
              />
            </div>

            {/* Type Filter */}
            <select
              aria-label={t('filterBy')}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">{t('all')}</option>
              <option value="expense">{t('expense')} 🔴</option>
              <option value="income">{t('income')} 🟢</option>
            </select>

            {/* Category Filter */}
            <select
              aria-label={t('category')}
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">{t('all')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {formatCategory(c.id)}
                </option>
              ))}
            </select>

          </div>

        </div>

        {/* Transactions Items */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 mx-auto mb-2">
              <Clock className="w-6 h-6" />
            </div>
            <span>{t('noTransactionsFound')}</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
            {filteredTransactions.map((tx) => {
              const cat = categoryMap.get(tx.categoryId);
              const isExpense = tx.type === 'expense';

              return (
                <div 
                  key={tx.id}
                  className="py-3.5 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/60 px-2 rounded-xl transition group"
                >
                  <div className="flex items-center gap-3">
                    
                    {/* Icon */}
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                      style={{ backgroundColor: cat?.color || (isExpense ? '#ef4444' : '#10b981') }}
                    >
                      {isExpense ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {tx.description || (cat ? formatCategory(cat.id) : t('expense'))}
                        </span>
                        {tx.isRecurring && (
                          <span className="text-[10px] bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-1.5 py-0.2 rounded-md font-semibold border border-amber-200 dark:border-amber-800">
                            {t('recurringExpenses')}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        <span>{formatDate(tx.date)}</span>
                        <span>•</span>
                        <span>{cat ? formatCategory(cat.id) : t('other')}</span>
                        <span>•</span>
                        <span>{formatPaymentMethod(tx.paymentMethod)}</span>
                      </div>
                    </div>

                  </div>

                  {/* Amount & Actions */}
                  <div className="flex items-center gap-3">
                    
                    <div className={isRTL ? 'text-left' : 'text-right'}>
                      <span className={`text-sm sm:text-base font-black ${
                        isExpense ? 'text-slate-900 dark:text-white' : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {isExpense ? '-' : '+'} {formatCurrencyAmount(tx.amount, currencySymbol)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                      <button
                        onClick={() => onEditTransaction(tx)}
                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition cursor-pointer"
                        title={t('edit')}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(t('delete') + '?')) {
                            onDeleteTransaction(tx.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition cursor-pointer"
                        title={t('delete')}
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

      {/* Member PIN Settings / Change Modal */}
      {isPinSettingsOpen && onUpdateMember && (
        <MemberPinSettingsModal
          isOpen={isPinSettingsOpen}
          onClose={() => setIsPinSettingsOpen(false)}
          member={currentMember}
          founderPin={founderPin}
          onSavePin={(memberId, newPin) => {
            onUpdateMember(memberId, { pin: newPin });
          }}
        />
      )}

    </div>
  );
};
