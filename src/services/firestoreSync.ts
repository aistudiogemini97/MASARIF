import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc, 
  onSnapshot, 
  writeBatch,
  query,
  orderBy
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { CurrencyConfig, FamilyMember, FounderSettings, RecurringExpense, Transaction } from '../types';
import { 
  DEFAULT_CATEGORIES, 
  DEFAULT_CURRENCIES, 
  INITIAL_MEMBERS, 
  INITIAL_RECURRING_EXPENSES, 
  INITIAL_TRANSACTIONS,
  createCleanFounderMember 
} from '../data/initialData';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Security Error Context:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface UserDataSyncState {
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  syncError: string | null;
}

/**
 * Initializes the user's Firestore cloud database with initial or existing local data if empty.
 */
/**
 * Checks and sanitizes legacy mock data if a registered user's Firestore contains old template data.
 */
async function sanitizeLegacyMockData(
  userId: string, 
  userDisplayName?: string | null, 
  userEmail?: string | null
): Promise<boolean> {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.exists() ? userDoc.data() : null;

    const memberSnapshot = await getDocs(collection(db, 'users', userId, 'members'));
    const membersList: FamilyMember[] = [];
    memberSnapshot.forEach((d) => membersList.push(d.data() as FamilyMember));

    const txSnapshot = await getDocs(collection(db, 'users', userId, 'transactions'));
    const txList: Transaction[] = [];
    txSnapshot.forEach((d) => txList.push(d.data() as Transaction));

    const recSnapshot = await getDocs(collection(db, 'users', userId, 'recurringExpenses'));
    const recList: RecurringExpense[] = [];
    recSnapshot.forEach((d) => recList.push(d.data() as RecurringExpense));

    // Check if the user has legacy mock data
    const hasMockMembers = membersList.some((m) => 
      m.id === 'mem-1' || 
      m.id === 'mem-2' || 
      m.id === 'mem-3' || 
      m.id === 'mem-4' || 
      m.name?.includes('أبو فهد') || 
      m.name?.includes('أم فهد')
    );

    const hasMockTransactions = txList.some((t) => 
      t.id?.startsWith('tx-') || 
      t.description?.includes('الراتب الشهري الأساسي') || 
      t.description?.includes('الهايبرماركت')
    );

    const hasMockRecurring = recList.some((r) => 
      r.id?.startsWith('rec-') || 
      r.title?.includes('إيجار المنزل / السكن') || 
      r.title?.includes('فاتورة الكهرباء والمياه')
    );

    const isOutdatedVersion = !userData || userData.databaseVersion !== 2;

    if (hasMockMembers || hasMockTransactions || hasMockRecurring || isOutdatedVersion) {
      const batch = writeBatch(db);

      // 1. Delete all existing mock members
      memberSnapshot.forEach((d) => batch.delete(d.ref));

      // 2. Delete all existing mock transactions
      txSnapshot.forEach((d) => batch.delete(d.ref));

      // 3. Delete all existing mock recurring expenses
      recSnapshot.forEach((d) => batch.delete(d.ref));

      // 4. Create single clean founder member for the registered user
      const cleanFounder = createCleanFounderMember(userDisplayName, userEmail);
      const memberRef = doc(db, 'users', userId, 'members', cleanFounder.id);
      batch.set(memberRef, cleanFounder);

      // 5. Update user profile root
      batch.set(userDocRef, {
        userId,
        displayName: userDisplayName?.trim() || cleanFounder.name,
        email: userEmail || '',
        updatedAt: new Date().toISOString(),
        databaseVersion: 2,
      }, { merge: true });

      // 6. Ensure default settings
      const settingsRef = doc(db, 'users', userId, 'settings', 'general');
      batch.set(settingsRef, {
        currency: DEFAULT_CURRENCIES[0],
        founderPin: '1234',
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      await batch.commit();
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Could not check or sanitize legacy mock data:', err);
    return false;
  }
}

/**
 * Initializes the user's Firestore cloud database.
 * FOR REGISTERED USERS: Only creates their own account (Founder) with 0 transactions and 0 recurring items.
 */
export async function initializeUserCloudDatabase(
  userId: string, 
  userDisplayName?: string | null,
  userEmail?: string | null
): Promise<void> {
  if (!userId) return;

  const userDocRef = doc(db, 'users', userId);
  try {
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // First time setup for this user in Firestore -> CLEAN STATE
      const batch = writeBatch(db);
      const founderName = userDisplayName?.trim() || 'رب الأسرة';

      // 1. User profile root
      batch.set(userDocRef, {
        userId,
        displayName: founderName,
        email: userEmail || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        databaseVersion: 2,
      });

      // 2. Settings (Currency & Security)
      const settingsRef = doc(db, 'users', userId, 'settings', 'general');
      batch.set(settingsRef, {
        currency: DEFAULT_CURRENCIES[0],
        founderPin: '1234',
        updatedAt: new Date().toISOString(),
      });

      // 3. Family Members: ONLY THE REGISTERED FOUNDER!
      const founderMember = createCleanFounderMember(founderName, userEmail);
      const memberRef = doc(db, 'users', userId, 'members', founderMember.id);
      batch.set(memberRef, founderMember);

      // 4. Zero transactions and Zero recurring expenses are seeded!

      await batch.commit();
    } else {
      // If user already existed, check if they have mock template data and sanitize
      await sanitizeLegacyMockData(userId, userDisplayName, userEmail);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
  }
}

/**
 * Explicitly resets a user's database to a clean, empty state with only their founder account.
 */
export async function resetUserToCleanState(
  userId: string, 
  userDisplayName?: string | null, 
  userEmail?: string | null
): Promise<void> {
  if (!userId) return;

  try {
    const batch = writeBatch(db);

    // Delete all transactions
    const txSnapshot = await getDocs(collection(db, 'users', userId, 'transactions'));
    txSnapshot.forEach((d) => batch.delete(d.ref));

    // Delete all members
    const memberSnapshot = await getDocs(collection(db, 'users', userId, 'members'));
    memberSnapshot.forEach((d) => batch.delete(d.ref));

    // Delete all recurring
    const recSnapshot = await getDocs(collection(db, 'users', userId, 'recurringExpenses'));
    recSnapshot.forEach((d) => batch.delete(d.ref));

    // Create single founder
    const cleanFounder = createCleanFounderMember(userDisplayName, userEmail);
    const memberRef = doc(db, 'users', userId, 'members', cleanFounder.id);
    batch.set(memberRef, cleanFounder);

    // Update settings
    const settingsRef = doc(db, 'users', userId, 'settings', 'general');
    batch.set(settingsRef, {
      currency: DEFAULT_CURRENCIES[0],
      founderPin: '1234',
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    // Update user root
    const userDocRef = doc(db, 'users', userId);
    batch.set(userDocRef, {
      userId,
      displayName: userDisplayName?.trim() || cleanFounder.name,
      email: userEmail || '',
      updatedAt: new Date().toISOString(),
      databaseVersion: 2,
    }, { merge: true });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
  }
}

/**
 * Subscribes to real-time updates for all user collections from Firestore.
 */
export function subscribeToUserCloudData(
  userId: string,
  callbacks: {
    onMembersUpdate: (members: FamilyMember[]) => void;
    onTransactionsUpdate: (transactions: Transaction[]) => void;
    onRecurringUpdate: (recurring: RecurringExpense[]) => void;
    onCurrencyUpdate: (currency: CurrencyConfig) => void;
    onFounderPinUpdate?: (pin: string) => void;
    onError?: (err: Error) => void;
  }
): () => void {
  const unsubscribers: (() => void)[] = [];

  try {
    // 1. Members
    const membersPath = `users/${userId}/members`;
    const membersQuery = query(collection(db, 'users', userId, 'members'));
    const unsubMembers = onSnapshot(membersQuery, (snapshot) => {
      const list: FamilyMember[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as FamilyMember);
      });
      callbacks.onMembersUpdate(list);
    }, (err) => {
      callbacks.onError?.(err);
      console.warn('Firestore Snapshot Error (members):', err.message);
    });
    unsubscribers.push(unsubMembers);

    // 2. Transactions
    const txPath = `users/${userId}/transactions`;
    const txQuery = query(collection(db, 'users', userId, 'transactions'));
    const unsubTx = onSnapshot(txQuery, (snapshot) => {
      const list: Transaction[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Transaction);
      });
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      callbacks.onTransactionsUpdate(list);
    }, (err) => {
      callbacks.onError?.(err);
      console.warn('Firestore Snapshot Error (transactions):', err.message);
    });
    unsubscribers.push(unsubTx);

    // 3. Recurring Expenses
    const recPath = `users/${userId}/recurringExpenses`;
    const recQuery = query(collection(db, 'users', userId, 'recurringExpenses'));
    const unsubRec = onSnapshot(recQuery, (snapshot) => {
      const list: RecurringExpense[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as RecurringExpense);
      });
      callbacks.onRecurringUpdate(list);
    }, (err) => {
      callbacks.onError?.(err);
      console.warn('Firestore Snapshot Error (recurringExpenses):', err.message);
    });
    unsubscribers.push(unsubRec);

    // 4. Settings (Currency & Security PIN)
    const settingsDoc = doc(db, 'users', userId, 'settings', 'general');
    const unsubSettings = onSnapshot(settingsDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.currency) {
          callbacks.onCurrencyUpdate(data.currency as CurrencyConfig);
        }
        if (data.founderPin && callbacks.onFounderPinUpdate) {
          callbacks.onFounderPinUpdate(data.founderPin);
        }
      }
    }, (err) => {
      callbacks.onError?.(err);
      console.warn('Firestore Snapshot Error (settings):', err.message);
    });
    unsubscribers.push(unsubSettings);

  } catch (err: any) {
    callbacks.onError?.(err);
  }

  // Return master unsubscribe function
  return () => {
    unsubscribers.forEach((fn) => fn());
  };
}

// --- Cloud Mutation Helpers ---

function sanitizePayload<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;
  const result: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      if (v !== null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)) {
        result[k] = sanitizePayload(v);
      } else {
        result[k] = v;
      }
    }
  }
  return result as T;
}

export async function addTransactionCloud(userId: string, tx: Transaction): Promise<void> {
  if (!userId || !tx || !tx.id || tx.id === 'undefined') return;
  const cleanTx = sanitizePayload(tx);
  const path = `users/${userId}/transactions/${cleanTx.id}`;
  try {
    const txRef = doc(db, 'users', userId, 'transactions', cleanTx.id);
    await setDoc(txRef, cleanTx);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateTransactionCloud(userId: string, id: string, updates: Partial<Transaction>): Promise<void> {
  if (!userId || !id || id === 'undefined' || !updates) return;
  const cleanUpdates = sanitizePayload(updates);
  if (Object.keys(cleanUpdates).length === 0) return;
  const path = `users/${userId}/transactions/${id}`;
  try {
    const txRef = doc(db, 'users', userId, 'transactions', id);
    await updateDoc(txRef, cleanUpdates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteTransactionCloud(userId: string, id: string): Promise<void> {
  if (!userId || !id || id === 'undefined') return;
  const path = `users/${userId}/transactions/${id}`;
  try {
    const txRef = doc(db, 'users', userId, 'transactions', id);
    await deleteDoc(txRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function addMemberCloud(userId: string, member: FamilyMember): Promise<void> {
  if (!userId || !member || !member.id || member.id === 'undefined') return;
  const cleanMember = sanitizePayload(member);
  const path = `users/${userId}/members/${cleanMember.id}`;
  try {
    const memberRef = doc(db, 'users', userId, 'members', cleanMember.id);
    await setDoc(memberRef, cleanMember);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateMemberCloud(userId: string, id: string, updates: Partial<FamilyMember>): Promise<void> {
  if (!userId || !id || id === 'undefined' || !updates) return;
  const cleanUpdates = sanitizePayload(updates);
  if (Object.keys(cleanUpdates).length === 0) return;
  const path = `users/${userId}/members/${id}`;
  try {
    const memberRef = doc(db, 'users', userId, 'members', id);
    await updateDoc(memberRef, cleanUpdates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteMemberCloud(userId: string, id: string): Promise<void> {
  if (!userId || !id || id === 'undefined') return;
  const path = `users/${userId}/members/${id}`;
  try {
    const memberRef = doc(db, 'users', userId, 'members', id);
    await deleteDoc(memberRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function addRecurringExpenseCloud(userId: string, item: RecurringExpense): Promise<void> {
  if (!userId || !item || !item.id || item.id === 'undefined') return;
  const cleanItem = sanitizePayload(item);
  const path = `users/${userId}/recurringExpenses/${cleanItem.id}`;
  try {
    const recRef = doc(db, 'users', userId, 'recurringExpenses', cleanItem.id);
    await setDoc(recRef, cleanItem);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateRecurringExpenseCloud(userId: string, id: string, updates: Partial<RecurringExpense>): Promise<void> {
  if (!userId || !id || id === 'undefined' || !updates) return;
  const cleanUpdates = sanitizePayload(updates);
  if (Object.keys(cleanUpdates).length === 0) return;
  const path = `users/${userId}/recurringExpenses/${id}`;
  try {
    const recRef = doc(db, 'users', userId, 'recurringExpenses', id);
    await updateDoc(recRef, cleanUpdates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteRecurringExpenseCloud(userId: string, id: string): Promise<void> {
  if (!userId || !id || id === 'undefined') return;
  const path = `users/${userId}/recurringExpenses/${id}`;
  try {
    const recRef = doc(db, 'users', userId, 'recurringExpenses', id);
    await deleteDoc(recRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function updateCurrencyCloud(userId: string, currency: CurrencyConfig): Promise<void> {
  if (!userId || !currency) return;
  const cleanCurrency = sanitizePayload(currency);
  const path = `users/${userId}/settings/general`;
  try {
    const settingsRef = doc(db, 'users', userId, 'settings', 'general');
    await setDoc(settingsRef, { currency: cleanCurrency, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateFounderPinCloud(userId: string, founderPin: string): Promise<void> {
  if (!userId || !founderPin) return;
  const path = `users/${userId}/settings/general`;
  try {
    const settingsRef = doc(db, 'users', userId, 'settings', 'general');
    await setDoc(settingsRef, { founderPin, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function resetToDemoDataCloud(userId: string): Promise<void> {
  const batch = writeBatch(db);

  try {
    // Clear existing transactions
    const txSnapshot = await getDocs(collection(db, 'users', userId, 'transactions'));
    txSnapshot.forEach((d) => batch.delete(d.ref));

    // Clear existing members
    const memberSnapshot = await getDocs(collection(db, 'users', userId, 'members'));
    memberSnapshot.forEach((d) => batch.delete(d.ref));

    // Clear recurring
    const recSnapshot = await getDocs(collection(db, 'users', userId, 'recurringExpenses'));
    recSnapshot.forEach((d) => batch.delete(d.ref));

    // Seed Initial Members
    for (const m of INITIAL_MEMBERS) {
      batch.set(doc(db, 'users', userId, 'members', m.id), m);
    }

    // Seed Initial Recurring
    for (const r of INITIAL_RECURRING_EXPENSES) {
      batch.set(doc(db, 'users', userId, 'recurringExpenses', r.id), r);
    }

    // Seed Initial Transactions
    for (const t of INITIAL_TRANSACTIONS) {
      batch.set(doc(db, 'users', userId, 'transactions', t.id), t);
    }

    // Reset Currency
    batch.set(doc(db, 'users', userId, 'settings', 'general'), {
      currency: DEFAULT_CURRENCIES[0],
      founderPin: '1234',
      updatedAt: new Date().toISOString(),
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
  }
}
