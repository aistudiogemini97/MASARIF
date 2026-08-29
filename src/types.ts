export type TransactionType = 'expense' | 'income';

export type FamilyRole = 
  | 'head' // رب الأسرة / صاحب الحساب
  | 'wife' // الزوجة
  | 'wife2' // الزوجة الثانية
  | 'son' // الابن
  | 'daughter' // البنت
  | 'father' // الوالد
  | 'mother' // الوالدة
  | 'brother' // الأخ
  | 'sister' // الأخت
  | 'driver' // السائق
  | 'maid' // المساعدة المنزلية
  | 'other'; // فرد آخر

export interface FamilyMember {
  id: string;
  name: string;
  role: FamilyRole;
  customRoleTitle?: string;
  avatarColor: string;
  avatarIcon: string;
  monthlyBudget?: number; // ميزانية شهرية مخصصة للفرد (اختياري)
  phone?: string;
  email?: string;
  notes?: string;
  isFounder?: boolean; // هل هو مؤسس العائلة / رب الأسرة المسؤول
  pin?: string; // رمز سري خاص بالفرد (اختياري)
  createdAt: string;
}

export type AppMode = 'founder' | 'member';

export interface FounderSettings {
  founderPin: string;
  founderName?: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  isDefault?: boolean;
}

export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'digital_wallet' | 'other';

export interface RecurringExpense {
  id: string;
  title: string;
  amount: number;
  categoryId: string;
  memberId: string; // الشخص الدافع
  beneficiaryMemberId?: string; // المستفيد (اختياري)
  paymentMethod: PaymentMethod;
  frequency: 'monthly' | 'weekly' | 'yearly';
  dueDay: number; // يوم الاستحقاق من 1 إلى 31
  isActive: boolean;
  notes?: string;
  lastGeneratedMonth?: string; // صيغة YYYY-MM
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  memberId: string; // الشخص الذي دفع أو استلم
  beneficiaryMemberId?: string; // المستفيد من المصروف (اختياري)
  date: string; // ISO date string (YYYY-MM-DD)
  paymentMethod: PaymentMethod;
  description: string;
  isRecurring?: boolean;
  recurringFrequency?: 'monthly' | 'weekly' | 'yearly';
  recurringExpenseId?: string; // معرف قالب المصروف المتكرر
  recurringId?: string; // معرف المصروف المتكرر
  tags?: string[];
  createdAt: string;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  englishName?: string;
  flag?: string;
  country?: string;
  isCustom?: boolean;
}

export interface FilterOptions {
  memberId: string; // 'all' or memberId
  type: 'all' | 'expense' | 'income';
  categoryId: string; // 'all' or categoryId
  paymentMethod: string; // 'all' or method
  dateRange: 'all' | 'today' | 'this_week' | 'this_month' | 'last_month' | 'this_year' | 'custom';
  startDate?: string;
  endDate?: string;
  searchQuery: string;
}
