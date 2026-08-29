import React from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  TrendingUp, 
  Users,
  Target
} from 'lucide-react';
import { FamilyMember, Transaction } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface SummaryCardsProps {
  transactions: Transaction[];
  members: FamilyMember[];
  currencySymbol: string;
  selectedMemberId: string;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  transactions,
  members,
  currencySymbol,
  selectedMemberId,
}) => {
  const { t, formatCurrencyAmount } = useLanguage();

  // Filter transactions based on selection
  const relevantTransactions = selectedMemberId === 'all'
    ? transactions
    : transactions.filter(
        (t) => t.memberId === selectedMemberId || t.beneficiaryMemberId === selectedMemberId
      );

  const totalIncome = relevantTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = relevantTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  // Selected member info if specific
  const activeMember = members.find((m) => m.id === selectedMemberId);

  // Total monthly budget configured
  const totalBudget = selectedMemberId === 'all'
    ? members.reduce((sum, m) => sum + (m.monthlyBudget || 0), 0)
    : (activeMember?.monthlyBudget || 0);

  const budgetUsagePercent = totalBudget > 0 ? Math.min(100, Math.round((totalExpense / totalBudget) * 100)) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* Total Income Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {selectedMemberId === 'all' ? t('totalIncome') : `${activeMember?.name || ''} - ${t('income')}`}
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrencyAmount(totalIncome, currencySymbol)}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>
              {relevantTransactions.filter((t) => t.type === 'income').length} {t('income')}
            </span>
          </div>
        </div>
      </div>

      {/* Total Expenses Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {selectedMemberId === 'all' ? t('totalExpenses') : `${activeMember?.name || ''} - ${t('expense')}`}
          </span>
          <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrencyAmount(totalExpense, currencySymbol)}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
            <span>
              {relevantTransactions.filter((t) => t.type === 'expense').length} {t('expense')}
            </span>
          </div>
        </div>
      </div>

      {/* Net Balance / Savings */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {t('totalBalance')}
          </span>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
            netBalance >= 0 
              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400' 
              : 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400'
          }`}>
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className={`text-xl sm:text-2xl font-black ${
            netBalance >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {formatCurrencyAmount(netBalance, currencySymbol)}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
            <span>{t('remaining')}: </span>
            <span className={`font-bold ${savingsRate >= 20 ? 'text-emerald-600 dark:text-emerald-400' : savingsRate >= 0 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
              {savingsRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Budget / Family Status */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {totalBudget > 0 ? t('monthlyBudget') : t('familyMembers')}
          </span>
          <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            {totalBudget > 0 ? <Target className="w-4 h-4" /> : <Users className="w-4 h-4" />}
          </div>
        </div>

        {totalBudget > 0 ? (
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {formatCurrencyAmount(totalBudget, currencySymbol)}
              </span>
              <span className={`text-xs font-bold ${
                budgetUsagePercent >= 100 ? 'text-red-600 dark:text-red-400' : budgetUsagePercent >= 80 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                {budgetUsagePercent}%
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetUsagePercent >= 100
                    ? 'bg-red-500'
                    : budgetUsagePercent >= 80
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, budgetUsagePercent)}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {members.length} {t('familyMembers')}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
              {t('allMembers')}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
