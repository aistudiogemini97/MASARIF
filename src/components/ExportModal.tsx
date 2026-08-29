import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  FileSpreadsheet, 
  Users, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  FileText 
} from 'lucide-react';
import { Category, CurrencyConfig, FamilyMember, Transaction } from '../types';
import { exportToCSV, calculateMemberStats } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';
import { AppLogo } from './AppLogo';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  members: FamilyMember[];
  categories: Category[];
  currency: CurrencyConfig;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  members,
  categories,
  currency,
}) => {
  const { t, formatCategory, formatRole, formatPaymentMethod, formatCurrencyAmount, formatDate, isRTL } = useLanguage();

  if (!isOpen) return null;

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;
  const memberStats = calculateMemberStats(members, transactions);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    exportToCSV(transactions, members, categories, currency.symbol);
  };

  const handleExportJSON = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      currency: currency.code,
      members,
      categories,
      transactions,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_family_expenses_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 print:p-0 print:bg-white print:static" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden my-6 print:shadow-none print:border-none print:w-full print:max-w-none">
        
        {/* Header (Hidden in Print) */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t('exportReport')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('printReport')} / CSV / JSON
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white rounded-xl transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{t('printReport')}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{t('exportCsv')}</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{t('backup')}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Preview Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0">
          
          {/* Print Header */}
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <AppLogo className="w-10 h-10" />
              <div>
                <h1 className="text-xl font-bold text-slate-900">{t('appName')}</h1>
                <p className="text-xs text-slate-500">{t('appTagline')}</p>
              </div>
            </div>
            <div className={`${isRTL ? 'text-left' : 'text-right'} text-xs text-slate-500`}>
              <p>{formatDate(new Date())}</p>
              <p>{transactions.length} {t('transactions')}</p>
            </div>
          </div>

          {/* Key Totals */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="text-xs font-medium text-emerald-800">{t('totalIncome')}</span>
              <p className="text-lg font-bold text-emerald-700 mt-1">
                {formatCurrencyAmount(totalIncome, currency.symbol)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-100">
              <span className="text-xs font-medium text-rose-800">{t('totalExpenses')}</span>
              <p className="text-lg font-bold text-rose-700 mt-1">
                {formatCurrencyAmount(totalExpense, currency.symbol)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
              <span className="text-xs font-medium text-indigo-800">{t('netBalance')}</span>
              <p className="text-lg font-bold text-indigo-700 mt-1">
                {formatCurrencyAmount(netBalance, currency.symbol)}
              </p>
            </div>
          </div>

          {/* Member Stats */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-3">{t('memberExpensesOverview')}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {memberStats.map((stat) => (
                <div key={stat.member.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{stat.member.avatarIcon || '👤'}</span>
                    <span className="text-xs font-bold text-slate-800 truncate">{stat.member.name}</span>
                  </div>
                  <div className="text-xs text-slate-600 flex justify-between">
                    <span>{t('totalExpenses')}:</span>
                    <strong className="text-slate-900">{formatCurrencyAmount(stat.totalExpense, currency.symbol)}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transactions Table */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-3">{t('recentTransactions')}</h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left border-collapse" dir={isRTL ? 'rtl' : 'ltr'}>
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="p-2.5">{t('date')}</th>
                    <th className="p-2.5">{t('title')}</th>
                    <th className="p-2.5">{t('category')}</th>
                    <th className="p-2.5">{t('whoPaid')}</th>
                    <th className="p-2.5">{t('paymentMethod')}</th>
                    <th className="p-2.5">{t('amount')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.slice(0, 50).map((tItem) => {
                    const mem = members.find((m) => m.id === tItem.memberId);
                    return (
                      <tr key={tItem.id} className="hover:bg-slate-50">
                        <td className="p-2.5 text-slate-500 whitespace-nowrap">{formatDate(tItem.date)}</td>
                        <td className="p-2.5 font-bold text-slate-900">{tItem.title}</td>
                        <td className="p-2.5 text-slate-600">{formatCategory(tItem.categoryId)}</td>
                        <td className="p-2.5 text-slate-600">{mem?.name || '-'}</td>
                        <td className="p-2.5 text-slate-500">{formatPaymentMethod(tItem.paymentMethod)}</td>
                        <td className={`p-2.5 font-bold whitespace-nowrap ${tItem.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {tItem.type === 'income' ? '+' : '-'}{formatCurrencyAmount(tItem.amount, currency.symbol)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
