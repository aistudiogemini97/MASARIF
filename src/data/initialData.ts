import { Category, CurrencyConfig, FamilyMember, RecurringExpense, Transaction } from '../types';
import { WORLD_CURRENCIES } from './currencies';

export const DEFAULT_CURRENCIES: CurrencyConfig[] = WORLD_CURRENCIES;

export const DEFAULT_FOUNDER_PIN = '1234';

export function createCleanFounderMember(displayName?: string | null, email?: string | null): FamilyMember {
  const name = displayName?.trim() || 'رب الأسرة (صاحب الحساب)';
  return {
    id: 'mem-founder',
    name,
    role: 'head',
    customRoleTitle: 'مؤسس الحساب / رب الأسرة',
    avatarColor: 'bg-indigo-600',
    avatarIcon: '👨',
    monthlyBudget: 0,
    phone: '',
    isFounder: true,
    email: email || undefined,
    notes: 'مؤسس الحساب ورب الأسرة',
    createdAt: new Date().toISOString(),
  };
}

export const ROLE_LABELS: Record<string, string> = {
  head: 'صاحب الحساب / رب الأسرة',
  wife: 'الزوجة الأولى',
  wife2: 'الزوجة الثانية',
  son: 'الابن',
  daughter: 'البنت',
  father: 'الوالد',
  mother: 'الوالدة',
  brother: 'الأخ',
  sister: 'الأخت',
  driver: 'السائق',
  maid: 'المساعدة المنزلية',
  other: 'فرد آخر',
};

export const ROLE_BADGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  head: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  wife: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  wife2: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  son: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  daughter: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  father: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  mother: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  brother: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  sister: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  driver: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
  maid: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  other: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
};

export const DEFAULT_CATEGORIES: Category[] = [
  // مصاريف
  { id: 'cat-food', name: 'طعام وبقالة وسوبرماركت', type: 'expense', icon: 'ShoppingBag', color: '#10b981' },
  { id: 'cat-housing', name: 'سكن وإيجار وصيانة', type: 'expense', icon: 'Home', color: '#6366f1' },
  { id: 'cat-bills', name: 'فواتير (كهرباء، ماء، إنترنت)', type: 'expense', icon: 'Zap', color: '#f59e0b' },
  { id: 'cat-education', name: 'تعليم ورسوم دراسية وكتب', type: 'expense', icon: 'GraduationCap', color: '#8b5cf6' },
  { id: 'cat-health', name: 'صحة وأدوية ومستشفيات', type: 'expense', icon: 'HeartPulse', color: '#ef4444' },
  { id: 'cat-transport', name: 'مواصلات وبنزين وصيانة سيارة', type: 'expense', icon: 'Car', color: '#06b6d4' },
  { id: 'cat-shopping', name: 'ملابس وتسوق ومستلزمات', type: 'expense', icon: 'Shirt', color: '#ec4899' },
  { id: 'cat-entertainment', name: 'ترفيه ومطاعم ونزهات', type: 'expense', icon: 'Utensils', color: '#f97316' },
  { id: 'cat-allowance', name: 'مصروف جيب ونثريات شخصية', type: 'expense', icon: 'Coins', color: '#14b8a6' },
  { id: 'cat-charity', name: 'صدقات وزكاة وهدايا عائلية', type: 'expense', icon: 'Gift', color: '#84cc16' },
  { id: 'cat-other-exp', name: 'مصاريف أخرى متنوعة', type: 'expense', icon: 'MoreHorizontal', color: '#64748b' },

  // دخل
  { id: 'cat-salary', name: 'راتب شهري', type: 'income', icon: 'Briefcase', color: '#10b981' },
  { id: 'cat-bonus', name: 'مكافآت وحوافز', type: 'income', icon: 'Award', color: '#3b82f6' },
  { id: 'cat-investment', name: 'أرباح تجارة واستثمار', type: 'income', icon: 'TrendingUp', color: '#8b5cf6' },
  { id: 'cat-support', name: 'دعم حكومي / حساب المواطن', type: 'income', icon: 'ShieldCheck', color: '#06b6d4' },
  { id: 'cat-other-inc', name: 'دخل إضافي آخر', type: 'income', icon: 'PlusCircle', color: '#64748b' },
];

export const INITIAL_MEMBERS: FamilyMember[] = [
  createCleanFounderMember('رب الأسرة (صاحب الحساب)')
];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_RECURRING_EXPENSES: RecurringExpense[] = [];

