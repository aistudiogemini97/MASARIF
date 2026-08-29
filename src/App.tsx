import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { OfflineBanner } from './components/OfflineBanner';
import { RecurringSuggestionBanner } from './components/RecurringSuggestionBanner';
import { MemberFilterTabs } from './components/MemberFilterTabs';
import { SummaryCards } from './components/SummaryCards';
import { AnalyticsSection } from './components/AnalyticsSection';
import { MemberBudgetCards } from './components/MemberBudgetCards';
import { TransactionList } from './components/TransactionList';
import { TransactionFormModal } from './components/TransactionFormModal';
import { MemberManagementModal } from './components/MemberManagementModal';
import { RecurringExpensesModal } from './components/RecurringExpensesModal';
import { ExportModal } from './components/ExportModal';
import { CurrencySelectorModal } from './components/CurrencySelectorModal';
import { LanguageSelectorModal } from './components/LanguageSelectorModal';
import { AuthPage } from './components/AuthPage';
import { PinModal } from './components/PinModal';
import { FounderPinSettingsModal } from './components/FounderPinSettingsModal';
import { MemberPersonalView } from './components/MemberPersonalView';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import { useOnlineStatus } from './utils/useOnlineStatus';
import { 
  Shield, 
  Crown, 
  KeyRound, 
  Eye, 
  Lock, 
  Users, 
  Sparkles,
  UserCheck 
} from 'lucide-react';

import { 
  AppMode,
  Category, 
  CurrencyConfig, 
  FamilyMember, 
  RecurringExpense, 
  Transaction, 
  TransactionType 
} from './types';
import { 
  DEFAULT_CATEGORIES, 
  DEFAULT_CURRENCIES, 
  INITIAL_MEMBERS, 
  INITIAL_RECURRING_EXPENSES, 
  INITIAL_TRANSACTIONS,
  DEFAULT_FOUNDER_PIN,
  createCleanFounderMember
} from './data/initialData';
import { 
  initializeUserCloudDatabase, 
  subscribeToUserCloudData,
  addTransactionCloud,
  updateTransactionCloud,
  deleteTransactionCloud,
  addMemberCloud,
  updateMemberCloud,
  deleteMemberCloud,
  addRecurringExpenseCloud,
  updateRecurringExpenseCloud,
  deleteRecurringExpenseCloud,
  updateCurrencyCloud,
  updateFounderPinCloud,
  resetToDemoDataCloud,
  resetUserToCleanState
} from './services/firestoreSync';

const STORAGE_KEYS = {
  MEMBERS: 'family_expenses_members_v2',
  TRANSACTIONS: 'family_expenses_transactions_v2',
  CATEGORIES: 'family_expenses_categories_v2',
  CURRENCY: 'family_expenses_currency_v2',
  RECURRING: 'family_expenses_recurring_v2',
  GUEST_MODE: 'family_expenses_guest_mode_v2',
  APP_MODE: 'family_expenses_app_mode_v2',
  ACTIVE_MEMBER_ID: 'family_expenses_active_member_id_v2',
  FOUNDER_PIN: 'family_expenses_founder_pin_v2',
};

export default function App() {
  const { currentUser, isLoading: isAuthLoading } = useAuth();
  const { isOnline, wasOffline, setWasOffline } = useOnlineStatus();
  const { t, isRTL } = useLanguage();
  const [isGuestMode, setIsGuestMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.GUEST_MODE) === 'true';
    } catch {
      return false;
    }
  });

  // 1. App State with LocalStorage & Firestore Hybrid - Defaults to clean empty state!
  const [members, setMembers] = useState<FamilyMember[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && !parsed.some(m => m.name?.includes('أبو فهد') || m.id === 'mem-1')) {
          return parsed;
        }
      }
      return [createCleanFounderMember('رب الأسرة (صاحب الحساب)')];
    } catch {
      return [createCleanFounderMember('رب الأسرة (صاحب الحساب)')];
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && !parsed.some(t => t.id?.startsWith('tx-') || t.description?.includes('الراتب الشهري'))) {
          return parsed;
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECURRING);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && !parsed.some(r => r.id?.startsWith('rec-') || r.title?.includes('إيجار المنزل'))) {
          return parsed;
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  const [currency, setCurrency] = useState<CurrencyConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENCY);
      return saved ? JSON.parse(saved) : DEFAULT_CURRENCIES[0];
    } catch {
      return DEFAULT_CURRENCIES[0];
    }
  });

  // 2. Role-Based Access Control State (Founder vs. Member)
  const [appMode, setAppMode] = useState<AppMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.APP_MODE);
      return saved === 'member' ? 'member' : 'founder';
    } catch {
      return 'founder';
    }
  });

  const [activeMemberId, setActiveMemberId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_MEMBER_ID);
      return saved && saved !== 'mem-2' && saved !== 'mem-1' ? saved : 'mem-founder';
    } catch {
      return 'mem-founder';
    }
  });

  const [founderPin, setFounderPin] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FOUNDER_PIN);
      return saved || DEFAULT_FOUNDER_PIN;
    } catch {
      return DEFAULT_FOUNDER_PIN;
    }
  });

  // 3. Modals & Filter State
  const [selectedMemberId, setSelectedMemberId] = useState<string>('all');
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalType, setTxModalType] = useState<TransactionType>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [preselectedMemberIdForTx, setPreselectedMemberIdForTx] = useState<string | undefined>(undefined);

  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [recurringModalMode, setRecurringModalMode] = useState<'list' | 'create' | 'review'>('list');

  // PIN Protection Modals
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isFounderPinSettingsOpen, setIsFounderPinSettingsOpen] = useState(false);
  const [isMemberPinModalOpen, setIsMemberPinModalOpen] = useState(false);
  const [pendingMemberToUnlock, setPendingMemberToUnlock] = useState<FamilyMember | null>(null);

  // Firestore Real-Time Listener Effect
  useEffect(() => {
    if (!currentUser) return;

    setIsGuestMode(false);
    try {
      localStorage.removeItem(STORAGE_KEYS.GUEST_MODE);
    } catch {}

    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    const setupCloudDatabase = async () => {
      try {
        await initializeUserCloudDatabase(
          currentUser.uid,
          currentUser.displayName,
          currentUser.email
        );

        if (!isMounted) return;

        unsubscribe = subscribeToUserCloudData(currentUser.uid, {
          onMembersUpdate: (cloudMembers) => {
            if (cloudMembers && cloudMembers.length > 0) {
              setMembers(cloudMembers);
              setActiveMemberId((prev) => {
                const exists = cloudMembers.some((m) => m.id === prev);
                return exists ? prev : cloudMembers[0].id;
              });
            } else {
              const founder = createCleanFounderMember(currentUser.displayName, currentUser.email);
              setMembers([founder]);
              setActiveMemberId(founder.id);
            }
          },
          onTransactionsUpdate: (cloudTx) => {
            setTransactions(cloudTx || []);
          },
          onRecurringUpdate: (cloudRec) => {
            setRecurringExpenses(cloudRec || []);
          },
          onCurrencyUpdate: (cloudCurr) => {
            if (cloudCurr) setCurrency(cloudCurr);
          },
          onFounderPinUpdate: (cloudPin) => {
            if (cloudPin) setFounderPin(cloudPin);
          },
          onError: (err) => {
            console.error('Firestore cloud sync error:', err);
          },
        });
      } catch (err) {
        console.error('Error initializing Firestore database:', err);
      }
    };

    setupCloudDatabase();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser]);

  // LocalStorage backups
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    } catch (e) {
      console.error('Failed to save members to localStorage', e);
    }
  }, [members]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions to localStorage', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(recurringExpenses));
    } catch (e) {
      console.error('Failed to save recurring expenses to localStorage', e);
    }
  }, [recurringExpenses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save categories to localStorage', e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENCY, JSON.stringify(currency));
    } catch (e) {
      console.error('Failed to save currency to localStorage', e);
    }
  }, [currency]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.APP_MODE, appMode);
    } catch (e) {
      console.error('Failed to save appMode to localStorage', e);
    }
  }, [appMode]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_MEMBER_ID, activeMemberId);
    } catch (e) {
      console.error('Failed to save activeMemberId to localStorage', e);
    }
  }, [activeMemberId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FOUNDER_PIN, founderPin);
    } catch (e) {
      console.error('Failed to save founderPin to localStorage', e);
    }
  }, [founderPin]);

  // Current Active Member Object
  const currentActiveMember = useMemo(() => {
    return members.find((m) => m.id === activeMemberId) || members[0] || INITIAL_MEMBERS[0];
  }, [members, activeMemberId]);

  // Current Month Key (e.g., "2026-08")
  const currentMonthKey = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }, []);

  // Compute pending recurring expenses for current month
  const pendingRecurringExpenses = useMemo(() => {
    return recurringExpenses.filter(
      (e) => e.isActive && e.lastGeneratedMonth !== currentMonthKey
    );
  }, [recurringExpenses, currentMonthKey]);

  // Mode Switch Handlers
  const handleSwitchToFounderRequest = () => {
    if (appMode === 'founder') return;
    setIsPinModalOpen(true);
  };

  const handlePinSuccess = () => {
    setAppMode('founder');
  };

  const handleSwitchToMember = (memberId: string) => {
    const targetMember = members.find((m) => m.id === memberId);
    if (!targetMember) return;

    // Check if target member has a PIN protection configured
    if (targetMember.pin && targetMember.pin.length === 4) {
      // If user is already on this member view, no need to ask again
      if (appMode === 'member' && activeMemberId === memberId) {
        return;
      }
      setPendingMemberToUnlock(targetMember);
      setIsMemberPinModalOpen(true);
      return;
    }

    // No PIN -> direct switch
    setActiveMemberId(memberId);
    setAppMode('member');
  };

  const handleMemberPinSuccess = () => {
    if (pendingMemberToUnlock) {
      setActiveMemberId(pendingMemberToUnlock.id);
      setAppMode('member');
    }
    setIsMemberPinModalOpen(false);
    setPendingMemberToUnlock(null);
  };

  const handleSaveFounderPin = async (newPin: string) => {
    setFounderPin(newPin);
    if (currentUser) {
      try {
        await updateFounderPinCloud(currentUser.uid, newPin);
      } catch (e) {
        console.error('Failed to sync founder pin to cloud', e);
      }
    }
  };

  // Currency Update Handler
  const handleSelectCurrency = (newCurrency: CurrencyConfig) => {
    setCurrency(newCurrency);
    if (currentUser) {
      updateCurrencyCloud(currentUser.uid, newCurrency).catch(console.error);
    }
  };

  // Transaction Handlers
  const handleOpenAddExpense = () => {
    setEditingTransaction(null);
    setTxModalType('expense');
    setPreselectedMemberIdForTx(appMode === 'member' ? currentActiveMember.id : undefined);
    setIsTxModalOpen(true);
  };

  const handleOpenAddIncome = () => {
    setEditingTransaction(null);
    setTxModalType('income');
    setPreselectedMemberIdForTx(appMode === 'member' ? currentActiveMember.id : undefined);
    setIsTxModalOpen(true);
  };

  const handleOpenAddExpenseForMember = (memberId: string) => {
    setEditingTransaction(null);
    setTxModalType('expense');
    setPreselectedMemberIdForTx(memberId);
    setIsTxModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setTxModalType(tx.type);
    setPreselectedMemberIdForTx(tx.memberId);
    setIsTxModalOpen(true);
  };

  const handleSaveTransaction = async (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (editingTransaction) {
      // Edit existing
      const updatedTx: Transaction = {
        ...data,
        id: editingTransaction.id,
        createdAt: editingTransaction.createdAt,
      };

      setTransactions((prev) =>
        prev.map((t) => (t.id === editingTransaction.id ? updatedTx : t))
      );

      if (currentUser) {
        await updateTransactionCloud(currentUser.uid, editingTransaction.id, data).catch(console.error);
      }
    } else {
      // Add new
      const newTx: Transaction = {
        ...data,
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        createdAt: new Date().toISOString(),
      };

      setTransactions((prev) => [newTx, ...prev]);

      if (currentUser) {
        await addTransactionCloud(currentUser.uid, newTx).catch(console.error);
      }
    }

    setIsTxModalOpen(false);
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = async (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (currentUser) {
      await deleteTransactionCloud(currentUser.uid, id).catch(console.error);
    }
  };

  // Member Management Handlers
  const handleAddMember = async (newMemberData: Omit<FamilyMember, 'id' | 'createdAt'>) => {
    const newMember: FamilyMember = {
      ...newMemberData,
      id: `mem-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setMembers((prev) => [...prev, newMember]);

    if (currentUser) {
      await addMemberCloud(currentUser.uid, newMember).catch(console.error);
    }
  };

  const handleUpdateMember = async (id: string, updatedData: Partial<FamilyMember>) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updatedData } : m))
    );

    if (currentUser) {
      await updateMemberCloud(currentUser.uid, id, updatedData).catch(console.error);
    }
  };

  const handleDeleteMember = async (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    if (selectedMemberId === id) {
      setSelectedMemberId('all');
    }
    if (activeMemberId === id) {
      const remaining = members.filter((m) => m.id !== id);
      if (remaining.length > 0) setActiveMemberId(remaining[0].id);
    }

    if (currentUser) {
      await deleteMemberCloud(currentUser.uid, id).catch(console.error);
    }
  };

  // Recurring Expenses Handlers
  const handleAddRecurring = async (data: Omit<RecurringExpense, 'id' | 'createdAt'>) => {
    const newRec: RecurringExpense = {
      ...data,
      id: `rec-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setRecurringExpenses((prev) => [...prev, newRec]);

    if (currentUser) {
      await addRecurringExpenseCloud(currentUser.uid, newRec).catch(console.error);
    }
  };

  const handleUpdateRecurring = async (id: string, data: Partial<RecurringExpense>) => {
    setRecurringExpenses((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...data } : r))
    );

    if (currentUser) {
      await updateRecurringExpenseCloud(currentUser.uid, id, data).catch(console.error);
    }
  };

  const handleDeleteRecurring = async (id: string) => {
    setRecurringExpenses((prev) => prev.filter((r) => r.id !== id));
    if (currentUser) {
      await deleteRecurringExpenseCloud(currentUser.uid, id).catch(console.error);
    }
  };

  const handleToggleRecurringActive = async (id: string) => {
    const target = recurringExpenses.find((r) => r.id === id);
    if (!target) return;
    const newActive = !target.isActive;

    setRecurringExpenses((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: newActive } : r))
    );

    if (currentUser) {
      await updateRecurringExpenseCloud(currentUser.uid, id, { isActive: newActive }).catch(console.error);
    }
  };

  // Generate a single recurring expense for current month
  const handleSingleAddRecurringToMonth = async (
    target: RecurringExpense | string,
    customAmount?: number,
    customDate?: string
  ) => {
    let rec: RecurringExpense | undefined;
    if (typeof target === 'string') {
      rec = recurringExpenses.find((r) => r.id === target);
    } else if (target && typeof target === 'object') {
      rec = target;
    }
    if (!rec || !rec.id) return;

    const today = customDate || new Date().toISOString().split('T')[0];
    const finalAmount = (customAmount !== undefined && !isNaN(customAmount) && customAmount > 0)
      ? customAmount
      : (Number(rec.amount) || 0);

    const newTx: Transaction = {
      id: `tx-rec-${rec.id}-${Date.now()}`,
      amount: finalAmount,
      type: 'expense',
      categoryId: rec.categoryId || categories[0]?.id || 'other',
      memberId: rec.memberId || members[0]?.id || 'founder',
      beneficiaryMemberId: rec.beneficiaryMemberId || undefined,
      description: (rec.title || 'فاتورة مجدولة') + ' (فاتورة شهرية مجدولة)',
      date: today,
      paymentMethod: rec.paymentMethod || 'cash',
      isRecurring: true,
      recurringId: rec.id,
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    setRecurringExpenses((prev) =>
      prev.map((r) => (r.id === rec!.id ? { ...r, lastGeneratedMonth: currentMonthKey } : r))
    );

    if (currentUser) {
      await addTransactionCloud(currentUser.uid, newTx).catch(console.error);
      await updateRecurringExpenseCloud(currentUser.uid, rec.id, { lastGeneratedMonth: currentMonthKey }).catch(console.error);
    }
  };

  // Batch add all pending recurring expenses
  const handleBatchAddRecurring = async (
    itemsOrIds: (RecurringExpense | string)[],
    customAmounts?: Record<string, number>
  ) => {
    if (!itemsOrIds || !Array.isArray(itemsOrIds) || itemsOrIds.length === 0) return;
    const today = new Date().toISOString().split('T')[0];

    const resolvedItems: { rec: RecurringExpense; amount: number }[] = [];

    for (const item of itemsOrIds) {
      let rec: RecurringExpense | undefined;
      let customAmount: number | undefined;

      if (typeof item === 'string') {
        rec = recurringExpenses.find((r) => r.id === item);
        if (customAmounts && customAmounts[item] !== undefined) {
          customAmount = customAmounts[item];
        }
      } else if (item && typeof item === 'object' && item.id) {
        rec = item;
        if (customAmounts && customAmounts[item.id] !== undefined) {
          customAmount = customAmounts[item.id];
        }
      }

      if (rec && rec.id) {
        const finalAmount = (customAmount !== undefined && !isNaN(customAmount) && customAmount > 0)
          ? customAmount
          : (Number(rec.amount) || 0);
        resolvedItems.push({ rec, amount: finalAmount });
      }
    }

    if (resolvedItems.length === 0) return;

    const newTransactions: Transaction[] = resolvedItems.map(({ rec, amount }) => ({
      id: `tx-batch-${rec.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      amount: amount,
      type: 'expense' as const,
      categoryId: rec.categoryId || categories[0]?.id || 'other',
      memberId: rec.memberId || members[0]?.id || 'founder',
      beneficiaryMemberId: rec.beneficiaryMemberId || undefined,
      description: (rec.title || 'فاتورة متكررة') + ' (فاتورة شهرية متكررة)',
      date: today,
      paymentMethod: rec.paymentMethod || 'cash',
      isRecurring: true,
      recurringId: rec.id,
      createdAt: new Date().toISOString(),
    }));

    setTransactions((prev) => [...newTransactions, ...prev]);

    const recIdsToUpdate = new Set(resolvedItems.map(({ rec }) => rec.id));
    setRecurringExpenses((prev) =>
      prev.map((r) => (recIdsToUpdate.has(r.id) ? { ...r, lastGeneratedMonth: currentMonthKey } : r))
    );

    if (currentUser) {
      for (const tx of newTransactions) {
        await addTransactionCloud(currentUser.uid, tx).catch(console.error);
      }
      for (const { rec } of resolvedItems) {
        await updateRecurringExpenseCloud(currentUser.uid, rec.id, { lastGeneratedMonth: currentMonthKey }).catch(console.error);
      }
    }
  };

  // Reset to clean user account
  const handleResetSampleData = async () => {
    if (window.confirm(t('cleanResetConfirm'))) {
      if (currentUser) {
        try {
          await resetUserToCleanState(currentUser.uid, currentUser.displayName, currentUser.email);
        } catch (e) {
          console.error('Failed to reset clean user data', e);
        }
      } else {
        const founder = createCleanFounderMember('رب الأسرة (صاحب الحساب)');
        setMembers([founder]);
        setTransactions([]);
        setRecurringExpenses([]);
        setCategories(DEFAULT_CATEGORIES);
        setCurrency(DEFAULT_CURRENCIES[0]);
        setSelectedMemberId('all');
        setActiveMemberId(founder.id);
        setFounderPin(DEFAULT_FOUNDER_PIN);
      }
    }
  };

  const handleContinueAsGuest = () => {
    setIsGuestMode(true);
    try {
      localStorage.setItem(STORAGE_KEYS.GUEST_MODE, 'true');
    } catch {}
  };

  // 4. Authentication Loading State
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-300">
          {isRTL ? 'جارٍ التحقق من بيانات الدخول وقاعدة البيانات السحابية...' : 'Verifying authentication and syncing cloud database...'}
        </p>
      </div>
    );
  }

  // 5. If Not Authenticated and Not in Guest Mode -> Show Authentication Page
  if (!currentUser && !isGuestMode) {
    return <AuthPage onContinueAsGuest={handleContinueAsGuest} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16 transition-colors duration-200" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Offline Alert & Status Banner */}
      <OfflineBanner
        isOnline={isOnline}
        wasOffline={wasOffline}
        onDismissReconnected={() => setWasOffline(false)}
      />

      {/* Top Navigation Bar with Dynamic Founder & Member Modes */}
      <Header
        currentCurrency={currency}
        onSelectCurrency={handleSelectCurrency}
        onOpenCurrencyModal={() => setIsCurrencyModalOpen(true)}
        onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
        members={members}
        recurringCount={recurringExpenses.filter((e) => e.isActive).length}
        pendingRecurringCount={pendingRecurringExpenses.length}
        appMode={appMode}
        activeMember={currentActiveMember}
        onSwitchToFounder={handleSwitchToFounderRequest}
        onSwitchToMember={handleSwitchToMember}
        onOpenFounderPinSettings={() => setIsFounderPinSettingsOpen(true)}
        onOpenAddExpense={handleOpenAddExpense}
        onOpenAddIncome={handleOpenAddIncome}
        onOpenMembersModal={() => setIsMembersModalOpen(true)}
        onOpenRecurringModal={() => {
          setRecurringModalMode('list');
          setIsRecurringModalOpen(true);
        }}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onResetSampleData={handleResetSampleData}
        onOpenAuthModal={() => setIsGuestMode(false)}
        isCloudSynced={!!currentUser}
        isOnline={isOnline}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-5">
        
        {/* ========================================================= */}
        {/* VIEW 1: FOUNDER CONTROL PANEL (لوحة تحكم مؤسس العائلة الشاملة) */}
        {/* ========================================================= */}
        {appMode === 'founder' ? (
          <div className="space-y-6">
            
            {/* Founder Status & Quick Preview Bar */}
            <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-800 rounded-3xl p-5 sm:p-6 text-white shadow-xl border border-indigo-900/40 relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/80 border border-indigo-400/30 flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/20 shrink-0">
                    👑
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                        {t('founderControlPanel')}
                      </h2>
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {t('fullPermissions')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      {t('founderModeDesc')}
                    </p>
                  </div>
                </div>

                {/* Quick Switch to Member View */}
                <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-700/60">
                  <span className="text-xs font-semibold text-slate-300">
                    {t('previewMemberPage')}:
                  </span>
                  
                  {members.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleSwitchToMember(m.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white font-semibold backdrop-blur-xs border border-white/10 transition active:scale-95 cursor-pointer"
                      title={`${t('preview')} (${m.name})`}
                    >
                      <span>{m.avatarIcon || '👤'}</span>
                      <span>{m.name}</span>
                      <Eye className="w-3 h-3 text-slate-400" />
                    </button>
                  ))}

                  <button
                    onClick={() => setIsFounderPinSettingsOpen(true)}
                    className="p-2 rounded-xl bg-indigo-600/40 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-400/30 transition cursor-pointer"
                    title={t('founderPinSettings')}
                  >
                    <KeyRound className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>

            {/* Monthly Recurring Expenses Suggestion Alert Banner */}
            <RecurringSuggestionBanner
              pendingExpenses={pendingRecurringExpenses}
              allRecurringCount={recurringExpenses.filter((e) => e.isActive).length}
              categories={categories}
              members={members}
              currencySymbol={currency.symbol}
              onBatchAddAll={handleBatchAddRecurring}
              onOpenReviewModal={() => {
                setRecurringModalMode('review');
                setIsRecurringModalOpen(true);
              }}
              onOpenManageModal={() => {
                setRecurringModalMode('list');
                setIsRecurringModalOpen(true);
              }}
            />

            {/* Family Member Filter Tabs */}
            <MemberFilterTabs
              members={members}
              selectedMemberId={selectedMemberId}
              onSelectMember={setSelectedMemberId}
              onOpenAddMember={() => setIsMembersModalOpen(true)}
              transactions={transactions}
              currencySymbol={currency.symbol}
            />

            {/* High Level KPI & Balance Summary Cards */}
            <SummaryCards
              transactions={transactions}
              members={members}
              currencySymbol={currency.symbol}
              selectedMemberId={selectedMemberId}
            />

            {/* Visual Charts & Analytics */}
            <AnalyticsSection
              transactions={transactions}
              members={members}
              categories={categories}
              currencySymbol={currency.symbol}
              selectedMemberId={selectedMemberId}
            />

            {/* Member Budget & Allowance Cards */}
            <MemberBudgetCards
              members={members}
              transactions={transactions}
              currencySymbol={currency.symbol}
              onOpenAddExpenseForMember={handleOpenAddExpenseForMember}
              onSelectMember={setSelectedMemberId}
            />

            {/* Interactive Transaction History & Filters */}
            <TransactionList
              transactions={transactions}
              members={members}
              categories={categories}
              currencySymbol={currency.symbol}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onOpenAddExpense={handleOpenAddExpense}
              onOpenAddIncome={handleOpenAddIncome}
              selectedMemberId={selectedMemberId}
              onSelectMember={setSelectedMemberId}
            />

          </div>
        ) : (
          /* ========================================================= */
          /* VIEW 2: INDIVIDUAL MEMBER PERSONAL VIEW (صفحة فرد العائلة) */
          /* ========================================================= */
          <MemberPersonalView
            currentMember={currentActiveMember}
            allMembers={members}
            transactions={transactions}
            categories={categories}
            recurringExpenses={recurringExpenses}
            currencySymbol={currency.symbol}
            onOpenAddExpense={handleOpenAddExpense}
            onOpenAddIncome={handleOpenAddIncome}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onSwitchToFounderMode={handleSwitchToFounderRequest}
            onSwitchMember={handleSwitchToMember}
            onUpdateMember={handleUpdateMember}
            founderPin={founderPin}
            onAddRecurring={handleAddRecurring}
            onUpdateRecurring={handleUpdateRecurring}
            onDeleteRecurring={handleDeleteRecurring}
            onToggleRecurringActive={handleToggleRecurringActive}
            onPayRecurringForMonth={handleSingleAddRecurringToMonth}
            onBatchPayRecurringForMonth={handleBatchAddRecurring}
            onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
          />
        )}

      </main>

      {/* ========================================================= */}
      {/* MODALS */}
      {/* ========================================================= */}

      {/* 1. Transaction Form Modal (Expense / Income) */}
      <TransactionFormModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleSaveTransaction}
        members={members}
        categories={categories}
        initialType={txModalType}
        editingTransaction={editingTransaction}
        currencySymbol={currency.symbol}
        preselectedMemberId={preselectedMemberIdForTx}
      />

      {/* 2. Member Management Modal */}
      <MemberManagementModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        members={members}
        onAddMember={handleAddMember}
        onUpdateMember={handleUpdateMember}
        onDeleteMember={handleDeleteMember}
        onPreviewMember={handleSwitchToMember}
        transactions={transactions}
        currencySymbol={currency.symbol}
      />

      {/* 3. Recurring Expenses Modal */}
      <RecurringExpensesModal
        isOpen={isRecurringModalOpen}
        onClose={() => setIsRecurringModalOpen(false)}
        recurringExpenses={recurringExpenses}
        categories={categories}
        members={members}
        currencySymbol={currency.symbol}
        onAddRecurring={handleAddRecurring}
        onUpdateRecurring={handleUpdateRecurring}
        onDeleteRecurring={handleDeleteRecurring}
        onToggleActive={handleToggleRecurringActive}
        onAddSingleToMonth={handleSingleAddRecurringToMonth}
        onBatchAddToMonth={handleBatchAddRecurring}
        initialMode={recurringModalMode}
      />

      {/* 4. Export & Reports Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        transactions={transactions}
        members={members}
        categories={categories}
        currency={currency}
      />

      {/* 5. World Currency Selector Modal */}
      <CurrencySelectorModal
        isOpen={isCurrencyModalOpen}
        onClose={() => setIsCurrencyModalOpen(false)}
        currentCurrency={currency}
        onSelectCurrency={handleSelectCurrency}
        isFounderMode={appMode === 'founder'}
      />

      {/* 6. Language Selector Modal (Global languages for Founder & Members) */}
      <LanguageSelectorModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        activeMemberName={appMode === 'founder' ? t('founder') : currentActiveMember.name}
        isFounderMode={appMode === 'founder'}
      />

      {/* 7. Founder Security PIN Modal */}
      <PinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handlePinSuccess}
        expectedPin={founderPin}
        title={t('enterFounderPin')}
        description={t('founderPinDesc')}
      />

      {/* 6. Individual Member PIN Unlock Modal */}
      {pendingMemberToUnlock && (
        <PinModal
          isOpen={isMemberPinModalOpen}
          onClose={() => {
            setIsMemberPinModalOpen(false);
            setPendingMemberToUnlock(null);
          }}
          onSuccess={handleMemberPinSuccess}
          expectedPin={pendingMemberToUnlock.pin || '1234'}
          masterPin={founderPin}
          avatarIcon={pendingMemberToUnlock.avatarIcon}
          avatarColor={pendingMemberToUnlock.avatarColor}
          showDefaultHint={false}
          title={`${t('pinConfigured')}: ${pendingMemberToUnlock.name}`}
          description={t('pinLockNotice')}
        />
      )}

      {/* 7. Founder PIN Settings Modal */}
      <FounderPinSettingsModal
        isOpen={isFounderPinSettingsOpen}
        onClose={() => setIsFounderPinSettingsOpen(false)}
        currentPin={founderPin}
        onSavePin={handleSaveFounderPin}
      />

    </div>
  );
}
