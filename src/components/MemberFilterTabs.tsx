import React from 'react';
import { FamilyMember, Transaction } from '../types';
import { ROLE_LABELS } from '../data/initialData';
import { UserPlus, Users, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface MemberFilterTabsProps {
  members: FamilyMember[];
  selectedMemberId: string;
  onSelectMember: (id: string) => void;
  onOpenAddMember: () => void;
  transactions: Transaction[];
  currencySymbol: string;
}

export const MemberFilterTabs: React.FC<MemberFilterTabsProps> = ({
  members,
  selectedMemberId,
  onSelectMember,
  onOpenAddMember,
  transactions,
  currencySymbol,
}) => {
  const { t, formatRole, formatCurrencyAmount, isRTL } = useLanguage();

  // Compute total expenses per member
  const getMemberExpense = (memberId: string) => {
    return transactions
      .filter((t) => t.type === 'expense' && (t.memberId === memberId || t.beneficiaryMemberId === memberId))
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const totalAllExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-xs mb-6 transition-colors">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {t('filterBy')}: {t('familyMembers')}
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
            ({t('allMembers')})
          </span>
        </div>

        <button
          id="member-tabs-add-btn"
          onClick={onOpenAddMember}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-3 py-1.5 rounded-lg border border-emerald-200/80 dark:border-emerald-800/80 transition cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>+ {t('addMember')}</span>
        </button>
      </div>

      {/* Horizontal Scroll Member Pills */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin">
        {/* All Members Option */}
        <button
          onClick={() => onSelectMember('all')}
          className={`shrink-0 flex items-center gap-2.5 px-3.5 py-2 rounded-xl ${isRTL ? 'text-right' : 'text-left'} transition border cursor-pointer ${
            selectedMemberId === 'all'
              ? 'bg-slate-900 dark:bg-emerald-600 text-white border-slate-900 dark:border-emerald-600 shadow-xs'
              : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/80'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
              selectedMemberId === 'all'
                ? 'bg-white/20 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold leading-tight">{t('all')} ({t('allMembers')})</div>
            <div
              className={`text-[11px] font-medium mt-0.5 ${
                selectedMemberId === 'all' ? 'text-slate-300 dark:text-emerald-100' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {formatCurrencyAmount(totalAllExpenses, currencySymbol)}
            </div>
          </div>
        </button>

        {/* Individual Members */}
        {members.map((member) => {
          const isSelected = selectedMemberId === member.id;
          const memberExpense = getMemberExpense(member.id);
          const roleLabel = member.customRoleTitle || formatRole(member.role) || ROLE_LABELS[member.role] || member.role;

          return (
            <button
              key={member.id}
              onClick={() => onSelectMember(member.id)}
              className={`shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-xl ${isRTL ? 'text-right' : 'text-left'} transition border cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/80'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-2xs'
                }`}
              >
                {member.avatarIcon || '👤'}
              </div>
              <div>
                <div className="text-xs font-bold leading-tight">{member.name}</div>
                <div
                  className={`text-[10px] mt-0.5 ${
                    isSelected ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {roleLabel} • {formatCurrencyAmount(memberExpense, currencySymbol)}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
