import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Trash2, 
  Edit3, 
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
  Tag,
  PlusCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { Category, FamilyMember, FilterOptions, Transaction } from '../types';
import { ROLE_LABELS, ROLE_BADGE_COLORS } from '../data/initialData';
import { useLanguage } from '../context/LanguageContext';

interface TransactionListProps {
  transactions: Transaction[];
  members: FamilyMember[];
  categories: Category[];
  currencySymbol: string;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenAddExpense: () => void;
  onOpenAddIncome: () => void;
  selectedMemberId: string;
  onSelectMember: (id: string) => void;
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

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  members,
  categories,
  currencySymbol,
  onEditTransaction,
  onDeleteTransaction,
  onOpenAddExpense,
  onOpenAddIncome,
  selectedMemberId,
  onSelectMember,
}) => {
  const { t, formatCategory, formatRole, formatPaymentMethod, formatDate, formatCurrencyAmount, isRTL } = useLanguage();

  const [filters, setFilters] = useState<FilterOptions>({
    memberId: selectedMemberId,
    type: 'all',
    categoryId: 'all',
    paymentMethod: 'all',
    dateRange: 'all',
    searchQuery: '',
  });

  const [visibleCount, setVisibleCount] = useState(15);

  const memberMap = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);
  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  // Sync selectedMemberId with internal filters
  React.useEffect(() => {
    setFilters((prev) => ({ ...prev, memberId: selectedMemberId }));
  }, [selectedMemberId]);

  // Filter logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // 1. Member filter
      if (filters.memberId !== 'all') {
        if (t.memberId !== filters.memberId && t.beneficiaryMemberId !== filters.memberId) {
          return false;
        }
      }

      // 2. Type filter
      if (filters.type !== 'all' && t.type !== filters.type) {
        return false;
      }

      // 3. Category filter
      if (filters.categoryId !== 'all' && t.categoryId !== filters.categoryId) {
        return false;
      }

      // 4. Payment method filter
      if (filters.paymentMethod !== 'all' && t.paymentMethod !== filters.paymentMethod) {
        return false;
      }

      // 5. Date filter
      if (filters.dateRange !== 'all') {
        const txDate = new Date(t.date);
        const now = new Date();

        if (filters.dateRange === 'today') {
          if (txDate.toDateString() !== now.toDateString()) return false;
        } else if (filters.dateRange === 'this_week') {
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          if (txDate < weekAgo) return false;
        } else if (filters.dateRange === 'this_month') {
          if (txDate.getMonth() !== now.getMonth() || txDate.getFullYear() !== now.getFullYear()) {
            return false;
          }
        } else if (filters.dateRange === 'last_month') {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          if (txDate.getMonth() !== lastMonth.getMonth() || txDate.getFullYear() !== lastMonth.getFullYear()) {
            return false;
          }
        }
      }

      // 6. Search query
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const desc = (t.description || '').toLowerCase();
        const cat = (categoryMap.get(t.categoryId)?.name || '').toLowerCase();
        const mem = (memberMap.get(t.memberId)?.name || '').toLowerCase();
        const matches = desc.includes(query) || cat.includes(query) || mem.includes(query);
        if (!matches) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.id.localeCompare(a.id));
  }, [transactions, filters, memberMap, categoryMap]);

  const displayedTransactions = filteredTransactions.slice(0, visibleCount);

  // Compute stats of currently filtered results
  const totalFilteredExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFilteredIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs mb-8 transition-colors">
      
      {/* List Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('recentTransactions')}
            </h3>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-2 py-0.5 rounded-full">
              {filteredTransactions.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('searchPlaceholder')}
          </p>
        </div>

        {/* Filtered Totals Summary */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 p-2 sm:px-3.5 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700/80">
          <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>{t('totalExpenses')}:</span>
            <strong className="font-bold">{formatCurrencyAmount(totalFilteredExpense, currencySymbol)}</strong>
          </div>
          <div className="h-3 w-px bg-slate-300 dark:bg-slate-700" />
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{t('totalIncome')}:</span>
            <strong className="font-bold">{formatCurrencyAmount(totalFilteredIncome, currencySymbol)}</strong>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 mb-4">
        
        {/* Search */}
        <div className="relative lg:col-span-2">
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={filters.searchQuery}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            className={`w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl ${isRTL ? 'pl-3 pr-9' : 'pr-3 pl-9'} py-2 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500`}
          />
          <Search className={`w-4 h-4 text-slate-400 dark:text-slate-500 absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} />
        </div>

        {/* Member Selector */}
        <div>
          <select
            value={filters.memberId}
            onChange={(e) => {
              const val = e.target.value;
              setFilters({ ...filters, memberId: val });
              onSelectMember(val);
            }}
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="all">{t('allMembers')} 👨‍👩‍👧‍👦</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.customRoleTitle || formatRole(m.role) || m.role})
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="all">{t('all')} ({t('expense')} / {t('income')})</option>
            <option value="expense">{t('expense')} 🔻</option>
            <option value="income">{t('income')} 🔺</option>
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value as any })}
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="all">{t('all')}</option>
            <option value="today">{t('today')}</option>
            <option value="this_week">{t('thisWeek')}</option>
            <option value="this_month">{t('thisMonth')}</option>
            <option value="last_month">{t('yesterday')}</option>
          </select>
        </div>

      </div>

      {/* Transactions List Table / Cards */}
      {displayedTransactions.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 my-2">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('noTransactionsFound')}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {t('searchPlaceholder')}
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={onOpenAddExpense}
              className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition cursor-pointer"
            >
              + {t('addExpense')}
            </button>
            <button
              onClick={onOpenAddIncome}
              className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition cursor-pointer"
            >
              + {t('addIncome')}
            </button>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
          {displayedTransactions.map((tx) => {
            const member = memberMap.get(tx.memberId);
            const beneficiary = tx.beneficiaryMemberId ? memberMap.get(tx.beneficiaryMemberId) : null;
            const category = categoryMap.get(tx.categoryId);
            const IconComp = category ? CATEGORY_ICON_MAP[category.icon] || Tag : Tag;
            const isExpense = tx.type === 'expense';
            const roleBadge = member ? ROLE_BADGE_COLORS[member.role] : null;

            return (
              <div
                key={tx.id}
                className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition group"
              >
                {/* Left (Category Icon & Title) */}
                <div className="flex items-center gap-3">
                  {/* Category icon */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isExpense
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50'
                        : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50'
                    }`}
                  >
                    <IconComp className="w-5 h-5" />
                  </div>

                  {/* Details */}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {tx.description || (category ? formatCategory(category.id) : t('expense'))}
                      </span>
                      {category && tx.description && (
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          {formatCategory(category.id)}
                        </span>
                      )}
                      {tx.isRecurring && (
                        <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800/80 px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5" title={t('recurringMonthly')}>
                          <span>🔁</span>
                          <span>{t('recurringMonthly')}</span>
                        </span>
                      )}
                    </div>

                    {/* Metadata line: Member & Date & Method */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                      {/* Member avatar tag */}
                      {member && (
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                          <span>{member.avatarIcon || '👤'}</span>
                          <span>{member.name}</span>
                          {roleBadge && (
                            <span className={`text-[10px] ${roleBadge.text}`}>
                              ({member.customRoleTitle || formatRole(member.role) || member.role})
                            </span>
                          )}
                        </span>
                      )}

                      {/* Beneficiary */}
                      {beneficiary && beneficiary.id !== member?.id && (
                        <span className="inline-flex items-center gap-0.5 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.5 rounded-md border border-purple-200/60 dark:border-purple-800/60">
                          <span>{t('beneficiary')}:</span>
                          <span className="font-semibold">{beneficiary.name}</span>
                        </span>
                      )}

                      <span>•</span>
                      <span>{formatDate(tx.date)}</span>
                      <span>•</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {formatPaymentMethod(tx.paymentMethod)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className={`flex items-center justify-between ${isRTL ? 'sm:justify-end' : 'sm:justify-end'} gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800`}>
                  <div className={isRTL ? 'text-right sm:text-left' : 'text-left sm:text-right'}>
                    <div
                      className={`text-sm sm:text-base font-black flex items-center gap-1 ${
                        isExpense ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isExpense ? (
                        <ArrowUpRight className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                      )}
                      <span>
                        {isExpense ? '-' : '+'}
                        {formatCurrencyAmount(tx.amount, currencySymbol)}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">
                      {isExpense ? t('expense') : t('income')}
                    </div>
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => onEditTransaction(tx)}
                      title={t('edit')}
                      className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(t('delete') + '?')) {
                          onDeleteTransaction(tx.id);
                        }
                      }}
                      title={t('delete')}
                      className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Show more button if lots of records */}
      {filteredTransactions.length > visibleCount && (
        <div className="text-center pt-4">
          <button
            onClick={() => setVisibleCount((prev) => prev + 15)}
            className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
          >
            {t('all')} ({filteredTransactions.length - visibleCount})
          </button>
        </div>
      )}

    </div>
  );
};
