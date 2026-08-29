import { Category, FamilyMember, Transaction } from '../types';

export const formatCurrency = (amount: number, currencySymbol: string = 'ر.س'): string => {
  const formattedNumber = new Intl.NumberFormat('ar-SA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${formattedNumber} ${currencySymbol}`;
};

export const formatPlainNumber = (amount: number): string => {
  return new Intl.NumberFormat('ar-SA').format(amount);
};

export const formatDateArabic = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return 'اليوم';
    if (isYesterday) return 'أمس';

    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    }).format(date);
  } catch {
    return dateStr;
  }
};

export const getPaymentMethodLabel = (method: string): string => {
  switch (method) {
    case 'cash':
      return 'نقدي (كاش)';
    case 'card':
      return 'بطاقة بنكية / مدى';
    case 'bank_transfer':
      return 'تحويل بنكي';
    case 'digital_wallet':
      return 'محفظة إلكترونية (Apple/STC Pay)';
    case 'other':
      return 'طريقة أخرى';
    default:
      return method;
  }
};

export interface MemberStats {
  memberId: string;
  member: FamilyMember;
  totalExpense: number;
  totalIncome: number;
  netContribution: number;
  transactionCount: number;
  expensePercentage: number;
}

export const calculateMemberStats = (
  members: FamilyMember[],
  transactions: Transaction[]
): MemberStats[] => {
  const totalFamilyExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return members.map((member) => {
    const memberTx = transactions.filter((t) => t.memberId === member.id);
    const totalExpense = memberTx
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = memberTx
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expensePercentage =
      totalFamilyExpense > 0 ? (totalExpense / totalFamilyExpense) * 100 : 0;

    return {
      memberId: member.id,
      member,
      totalExpense,
      totalIncome,
      netContribution: totalIncome - totalExpense,
      transactionCount: memberTx.length,
      expensePercentage,
    };
  });
};

export interface CategoryStats {
  category: Category;
  totalAmount: number;
  count: number;
  percentage: number;
}

export const calculateCategoryStats = (
  categories: Category[],
  transactions: Transaction[],
  type: 'expense' | 'income' = 'expense'
): CategoryStats[] => {
  const filteredTx = transactions.filter((t) => t.type === type);
  const totalAmount = filteredTx.reduce((sum, t) => sum + t.amount, 0);

  return categories
    .filter((c) => c.type === type)
    .map((category) => {
      const catTx = filteredTx.filter((t) => t.categoryId === category.id);
      const catTotal = catTx.reduce((sum, t) => sum + t.amount, 0);
      const percentage = totalAmount > 0 ? (catTotal / totalAmount) * 100 : 0;

      return {
        category,
        totalAmount: catTotal,
        count: catTx.length,
        percentage,
      };
    })
    .filter((item) => item.totalAmount > 0)
    .sort((a, b) => b.totalAmount - a.totalAmount);
};

export const exportToCSV = (
  transactions: Transaction[],
  members: FamilyMember[],
  categories: Category[],
  currencySymbol: string
) => {
  const memberMap = new Map(members.map((m) => [m.id, m.name]));
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const headers = [
    'النوع',
    'المبلغ',
    'العملة',
    'الفئة',
    'فرد العائلة',
    'التاريخ',
    'طريقة الدفع',
    'الوصف والملاحظات',
  ];

  const rows = transactions.map((t) => [
    t.type === 'expense' ? 'مصروف' : 'دخل',
    t.amount.toString(),
    currencySymbol,
    `"${categoryMap.get(t.categoryId) || t.categoryId}"`,
    `"${memberMap.get(t.memberId) || t.memberId}"`,
    t.date,
    getPaymentMethodLabel(t.paymentMethod),
    `"${(t.description || '').replace(/"/g, '""')}"`,
  ]);

  // UTF-8 BOM for Arabic Excel support
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `مصاريف_العائلة_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
