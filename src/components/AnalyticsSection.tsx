import React, { useState } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { Category, FamilyMember, Transaction } from '../types';
import { calculateMemberStats, calculateCategoryStats } from '../utils/formatters';
import { PieChart as PieIcon, BarChart3, TrendingUp, Users } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AnalyticsSectionProps {
  transactions: Transaction[];
  members: FamilyMember[];
  categories: Category[];
  currencySymbol: string;
  selectedMemberId: string;
}

const COLORS = [
  '#4f46e5', // indigo
  '#f43f5e', // rose
  '#06b6d4', // cyan
  '#8b5cf6', // purple
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ec4899', // pink
  '#64748b', // slate
  '#14b8a6', // teal
  '#3b82f6', // blue
];

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  transactions,
  members,
  categories,
  currencySymbol,
  selectedMemberId,
}) => {
  const { t, formatRole, formatCategory, formatCurrencyAmount, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<'members' | 'categories' | 'trends'>('members');

  // Filter transactions if specific member is selected
  const relevantTx = selectedMemberId === 'all'
    ? transactions
    : transactions.filter(
        (t) => t.memberId === selectedMemberId || t.beneficiaryMemberId === selectedMemberId
      );

  // 1. Data for Family Members Pie & Bar Chart
  const memberStats = calculateMemberStats(members, transactions);
  const memberPieData = memberStats
    .filter((ms) => ms.totalExpense > 0)
    .map((ms) => ({
      name: ms.member.name,
      role: ms.member.customRoleTitle || formatRole(ms.member.role) || ms.member.role,
      value: ms.totalExpense,
      income: ms.totalIncome,
      percentage: ms.expensePercentage.toFixed(1),
    }));

  // 2. Data for Category Breakdown
  const categoryExpenseStats = calculateCategoryStats(categories, relevantTx, 'expense');
  const categoryBarData = categoryExpenseStats.slice(0, 7).map((cs) => {
    const catName = formatCategory(cs.category.id);
    return {
      name: catName.length > 15 ? catName.substring(0, 15) + '...' : catName,
      fullName: catName,
      amount: cs.totalAmount,
      percentage: cs.percentage.toFixed(1),
    };
  });

  // 3. Trends by Date / Grouping
  const dateMap: Record<string, { date: string; expense: number; income: number }> = {};
  relevantTx.forEach((tx) => {
    if (!dateMap[tx.date]) {
      dateMap[tx.date] = { date: tx.date, expense: 0, income: 0 };
    }
    if (tx.type === 'expense') {
      dateMap[tx.date].expense += tx.amount;
    } else {
      dateMap[tx.date].income += tx.amount;
    }
  });

  const trendData = Object.values(dateMap)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-10);

  const totalExpense = relevantTx
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs mb-6 transition-colors">
      
      {/* Header with Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t('analyticsTitle')}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('analyticsDesc')}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-center">
          <button
            onClick={() => setActiveTab('members')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'members'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{t('perMemberShare')}</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>{t('byCategory')}</span>
          </button>

          <button
            onClick={() => setActiveTab('trends')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'trends'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t('dailyMovement')}</span>
          </button>
        </div>
      </div>

      {/* Chart Views */}
      {totalExpense === 0 && relevantTx.length === 0 ? (
        <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs">
          {t('noTransactionsFound')}
        </div>
      ) : (
        <div>
          {/* Tab 1: Members Breakdown */}
          {activeTab === 'members' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Donut Chart */}
              <div className="lg:col-span-6 h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={memberPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {memberPieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number | undefined) => [
                        formatCurrencyAmount(val ?? 0, currencySymbol),
                        t('totalExpenses'),
                      ]}
                      contentStyle={{
                        borderRadius: '12px',
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        borderColor: '#334155',
                        color: '#f8fafc',
                        fontSize: '12px',
                        direction: isRTL ? 'rtl' : 'ltr',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
                      }}
                      itemStyle={{ color: '#f8fafc' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Members Breakdown List */}
              <div className="lg:col-span-6 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {t('memberExpenseRatio')}:
                </h4>
                {memberStats.map((ms, index) => {
                  const color = COLORS[index % COLORS.length];
                  return (
                    <div
                      key={ms.memberId}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {ms.member.name}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {ms.member.customRoleTitle || formatRole(ms.member.role) || ms.member.role}
                          </div>
                        </div>
                      </div>

                      <div className={isRTL ? 'text-left' : 'text-right'}>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {formatCurrencyAmount(ms.totalExpense, currencySymbol)}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                          {ms.expensePercentage.toFixed(1)}% {t('all')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Categories Breakdown */}
          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryBarData} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />
                    <XAxis type="number" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      stroke="#94a3b8"
                    />
                    <Tooltip
                      formatter={(val: number | undefined) => [
                        formatCurrencyAmount(val ?? 0, currencySymbol),
                        t('totalExpenses'),
                      ]}
                      contentStyle={{
                        borderRadius: '12px',
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        borderColor: '#334155',
                        color: '#f8fafc',
                        fontSize: '12px',
                        direction: isRTL ? 'rtl' : 'ltr',
                      }}
                      itemStyle={{ color: '#f8fafc' }}
                    />
                    <Bar dataKey="amount" fill="#10b981" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="lg:col-span-5 space-y-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {t('topSpendingAreas')}:
                </h4>
                {categoryExpenseStats.slice(0, 5).map((cs) => (
                  <div key={cs.category.id} className="p-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl">
                    <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      <span>{formatCategory(cs.category.id)}</span>
                      <span className="text-rose-600 dark:text-rose-400">{formatCurrencyAmount(cs.totalAmount, currencySymbol)}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${cs.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Trends */}
          {activeTab === 'trends' && (
            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <Tooltip
                    formatter={(val: number | undefined, name: string | undefined) => [
                      formatCurrencyAmount(val ?? 0, currencySymbol),
                      name === 'expense' ? t('expense') : t('income'),
                    ]}
                    contentStyle={{
                      borderRadius: '12px',
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderColor: '#334155',
                      color: '#f8fafc',
                      fontSize: '12px',
                      direction: isRTL ? 'rtl' : 'ltr',
                    }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Legend
                    formatter={(val: string) => (val === 'expense' ? t('totalExpenses') : t('totalIncome'))}
                  />
                  <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="income" />
                  <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} name="expense" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
