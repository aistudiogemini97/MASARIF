import React from 'react';
import { FamilyMember, Transaction } from '../types';
import { ROLE_LABELS, ROLE_BADGE_COLORS } from '../data/initialData';
import { AlertCircle, CheckCircle2, ShieldAlert, PlusCircle, UserCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface MemberBudgetCardsProps {
  members: FamilyMember[];
  transactions: Transaction[];
  currencySymbol: string;
  onOpenAddExpenseForMember: (memberId: string) => void;
  onSelectMember: (memberId: string) => void;
}

export const MemberBudgetCards: React.FC<MemberBudgetCardsProps> = ({
  members,
  transactions,
  currencySymbol,
  onOpenAddExpenseForMember,
  onSelectMember,
}) => {
  const { t, formatRole, formatCurrencyAmount } = useLanguage();

  // Members with budget or expenses
  const membersWithStats = members.map((member) => {
    const memberExpenses = transactions
      .filter((t) => t.type === 'expense' && (t.memberId === member.id || t.beneficiaryMemberId === member.id))
      .reduce((sum, t) => sum + t.amount, 0);

    const budget = member.monthlyBudget || 0;
    const remaining = budget > 0 ? budget - memberExpenses : 0;
    const usagePercent = budget > 0 ? Math.round((memberExpenses / budget) * 100) : 0;

    return {
      member,
      spent: memberExpenses,
      budget,
      remaining,
      usagePercent,
    };
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs mb-6 transition-colors">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t('memberBudgetsTracking')}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('memberBudgetsTrackingDesc')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {membersWithStats.map(({ member, spent, budget, remaining, usagePercent }) => {
          const badge = ROLE_BADGE_COLORS[member.role] || {
            bg: 'bg-slate-100 dark:bg-slate-800',
            text: 'text-slate-700 dark:text-slate-300',
            border: 'border-slate-200 dark:border-slate-700',
          };

          const isExceeded = budget > 0 && spent > budget;
          const isWarning = budget > 0 && usagePercent >= 80 && !isExceeded;

          return (
            <div
              key={member.id}
              className={`rounded-2xl p-4 border transition-all duration-200 ${
                isExceeded
                  ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 hover:border-rose-300'
                  : isWarning
                  ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 hover:border-amber-300'
                  : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {/* Member Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg text-white shadow-2xs ${
                      member.avatarColor || 'bg-slate-700'
                    }`}
                  >
                    {member.avatarIcon || '👤'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[130px]">
                      {member.name}
                    </h4>
                    <span
                      className={`inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded-md border mt-0.5 ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {member.customRoleTitle || formatRole(member.role) || ROLE_LABELS[member.role] || member.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenAddExpenseForMember(member.id)}
                  title={`+ ${t('addExpense')} - ${member.name}`}
                  className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                </button>
              </div>

              {/* Spending & Budget Figures */}
              <div className="mt-3.5 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">{t('spent')}:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatCurrencyAmount(spent, currencySymbol)}
                  </span>
                </div>

                {budget > 0 ? (
                  <>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">{t('budgetLimit')}:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {formatCurrencyAmount(budget, currencySymbol)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200/80 dark:bg-slate-700 rounded-full h-2 mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isExceeded
                            ? 'bg-rose-500'
                            : isWarning
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, usagePercent)}%` }}
                      />
                    </div>

                    {/* Remaining & Status */}
                    <div className="flex items-center justify-between text-[11px] pt-1 font-medium">
                      {isExceeded ? (
                        <span className="text-rose-700 dark:text-rose-400 font-bold flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          {t('exceededBy')} {formatCurrencyAmount(Math.abs(remaining), currencySymbol)}
                        </span>
                      ) : (
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {t('remaining')}: {formatCurrencyAmount(remaining, currencySymbol)}
                        </span>
                      )}
                      <span className="text-slate-500 dark:text-slate-400 font-bold">{usagePercent}%</span>
                    </div>
                  </>
                ) : (
                  <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span>{t('noBudgetSet')}</span>
                  </div>
                )}
              </div>

              {/* View details button */}
              <button
                onClick={() => onSelectMember(member.id)}
                className="w-full mt-3 py-1.5 text-center text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              >
                {t('viewMemberTransactions')} ({member.name.split(' ')[0]})
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
