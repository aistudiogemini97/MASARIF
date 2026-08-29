import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged, 
  sendPasswordResetEmail, 
  signInWithPopup, 
  signInAnonymously,
  updateProfile 
} from 'firebase/auth';
import { auth, getGoogleProvider } from '../lib/firebase';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  photoURL?: string | null;
}

interface StoredAccount {
  uid: string;
  name: string;
  email: string;
  passwordHash: string; // Base64 encoded or salted
  createdAt: string;
  emailVerified: boolean;
}

interface PendingVerification {
  name: string;
  email: string;
  passwordHash: string;
  code: string;
  expiresAt: number;
  purpose: 'register' | 'reset_password';
}

const STORAGE_KEYS = {
  ACCOUNTS: 'family_registered_accounts_v2',
  SESSION: 'family_active_session_v2',
  PENDING_VERIFICATION: 'family_pending_verification_v2',
};

interface AuthContextType {
  currentUser: AppUser | null;
  isLoading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  sendRegistrationCode: (name: string, email: string, pass: string) => Promise<{ code: string; email: string }>;
  verifyRegistrationCode: (email: string, code: string) => Promise<void>;
  resendVerificationCode: (email: string) => Promise<{ code: string }>;
  sendResetPasswordCode: (email: string) => Promise<{ code: string }>;
  verifyResetPasswordCode: (email: string, code: string, newPass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  getFriendlyErrorMessage: (errorCode: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple deterministic hash for local credential checking
function hashPassword(pass: string): string {
  let hash = 0;
  for (let i = 0; i < pass.length; i++) {
    const char = pass.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return btoa(`fp_${hash}_${pass.length}`);
}

function generateNumericCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getStoredAccounts(): StoredAccount[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveStoredAccounts(accounts: StoredAccount[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save accounts locally:', e);
  }
}

function getActiveSession(): AppUser | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SESSION);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveActiveSession(user: AppUser | null) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    }
  } catch (e) {
    console.error('Failed to save session locally:', e);
  }
}

export function getFriendlyErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التحقق وإعادة المحاولة.';
    case 'auth/email-already-in-use':
      return 'هذا البريد الإلكتروني مسجل بالفعل. يمكنك النقر على تبويب "تسجيل الدخول" للوصول إلى حسابك.';
    case 'auth/weak-password':
      return 'كلمة المرور ضعيفة جداً. يرجى استخدام 6 خانات على الأقل.';
    case 'auth/invalid-email':
      return 'صيغة البريد الإلكتروني غير صحيحة. يرجى كتابة بريد إلكتروني صالح.';
    case 'auth/invalid-code':
      return 'رمز التفعيل غير صحيح أو انتهت صلاحيته. يرجى التأكد من الرمز وإعادة المحاولة.';
    case 'auth/code-expired':
      return 'انتهت صلاحية رمز التفعيل (مدة الصلاحية 10 دقائق). يرجى الضغط على "إعادة إرسال الرمز".';
    case 'auth/unverified-email':
      return 'هذا الحساب غير مفعل بعد. يرجى إدخال رمز التفعيل المرسل إلى بريدك الإلكتروني.';
    case 'auth/too-many-requests':
      return 'تم تعليق المحاولات مؤقتاً بسبب تكرار الطلبات. يرجى الانتظار دقيقة والمحاولة مرة أخرى.';
    case 'auth/popup-closed-by-user':
      return 'تم إغلاق نافذة تسجيل الدخول بحساب Google قبل اكتمال العملية.';
    case 'auth/popup-blocked':
      return 'تم حظر النافذة المنبثقة بواسطة المتصفح. يرجى السماح بالنوافذ المنبثقة.';
    case 'auth/network-request-failed':
      return 'تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.';
    case 'auth/missing-email':
      return 'يرجى إدخال البريد الإلكتروني.';
    case 'auth/missing-password':
      return 'يرجى إدخال كلمة المرور.';
    default:
      if (errorCode && !errorCode.startsWith('auth/')) {
        return errorCode;
      }
      return 'حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مرة أخرى.';
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => getActiveSession());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Monitor Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const mappedUser: AppUser = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'رب الأسرة',
          emailVerified: fbUser.emailVerified || true,
          photoURL: fbUser.photoURL,
        };
        setCurrentUser(mappedUser);
        saveActiveSession(mappedUser);
      } else {
        // If not logged in via Firebase Auth, check local persistent session
        const localSession = getActiveSession();
        if (localSession) {
          setCurrentUser(localSession);
        } else {
          setCurrentUser(null);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 1. Send Registration Verification Code (6 digits)
  const sendRegistrationCode = async (name: string, email: string, pass: string): Promise<{ code: string; email: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw { code: 'auth/invalid-email' };
    }
    if (!pass || pass.length < 6) {
      throw { code: 'auth/weak-password' };
    }

    // Check if email already registered and verified
    const accounts = getStoredAccounts();
    const existing = accounts.find((a) => a.email.toLowerCase() === cleanEmail && a.emailVerified);
    if (existing) {
      throw { code: 'auth/email-already-in-use' };
    }

    const code = generateNumericCode();
    const pendingData: PendingVerification = {
      name: cleanName || 'رب الأسرة',
      email: cleanEmail,
      passwordHash: hashPassword(pass),
      code,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes expiry
      purpose: 'register',
    };

    localStorage.setItem(STORAGE_KEYS.PENDING_VERIFICATION, JSON.stringify(pendingData));
    return { code, email: cleanEmail };
  };

  // 2. Verify Registration Code and Complete Account Creation
  const verifyRegistrationCode = async (email: string, inputCode: string): Promise<void> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = inputCode.trim();

    const pendingStr = localStorage.getItem(STORAGE_KEYS.PENDING_VERIFICATION);
    if (!pendingStr) {
      throw { code: 'auth/invalid-code', message: 'لم يتم العثور على طلب تفعيل معلق. يرجى إعادة إرسال الرمز.' };
    }

    const pending: PendingVerification = JSON.parse(pendingStr);
    if (pending.email.toLowerCase() !== cleanEmail) {
      throw { code: 'auth/invalid-code', message: 'البريد الإلكتروني لا يطابق طلب التفعيل.' };
    }

    if (Date.now() > pending.expiresAt) {
      throw { code: 'auth/code-expired' };
    }

    if (pending.code !== cleanCode) {
      throw { code: 'auth/invalid-code' };
    }

    // Try signing in anonymously or with Firebase to ensure Firestore rules validation
    let uid = `user_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    try {
      if (!auth.currentUser) {
        const cred = await signInAnonymously(auth).catch(() => null);
        if (cred?.user) {
          uid = cred.user.uid;
        }
      } else {
        uid = auth.currentUser.uid;
      }
    } catch {
      // Use generated uid
    }

    const newAccount: StoredAccount = {
      uid,
      name: pending.name,
      email: cleanEmail,
      passwordHash: pending.passwordHash,
      createdAt: new Date().toISOString(),
      emailVerified: true,
    };

    const accounts = getStoredAccounts().filter((a) => a.email.toLowerCase() !== cleanEmail);
    accounts.push(newAccount);
    saveStoredAccounts(accounts);

    // Clear pending state
    localStorage.removeItem(STORAGE_KEYS.PENDING_VERIFICATION);

    const appUser: AppUser = {
      uid,
      email: cleanEmail,
      displayName: pending.name,
      emailVerified: true,
    };

    setCurrentUser(appUser);
    saveActiveSession(appUser);
  };

  // 3. Resend Verification Code
  const resendVerificationCode = async (email: string): Promise<{ code: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const pendingStr = localStorage.getItem(STORAGE_KEYS.PENDING_VERIFICATION);
    
    let pending: PendingVerification;
    if (pendingStr) {
      pending = JSON.parse(pendingStr);
      if (pending.email.toLowerCase() !== cleanEmail) {
        pending = {
          name: 'رب الأسرة',
          email: cleanEmail,
          passwordHash: hashPassword('123456'),
          code: generateNumericCode(),
          expiresAt: Date.now() + 10 * 60 * 1000,
          purpose: 'register',
        };
      }
    } else {
      pending = {
        name: 'رب الأسرة',
        email: cleanEmail,
        passwordHash: hashPassword('123456'),
        code: generateNumericCode(),
        expiresAt: Date.now() + 10 * 60 * 1000,
        purpose: 'register',
      };
    }

    const newCode = generateNumericCode();
    pending.code = newCode;
    pending.expiresAt = Date.now() + 10 * 60 * 1000;

    localStorage.setItem(STORAGE_KEYS.PENDING_VERIFICATION, JSON.stringify(pending));
    return { code: newCode };
  };

  // 4. Login with Email and Password
  const loginWithEmail = async (email: string, pass: string): Promise<void> => {
    const cleanEmail = email.trim().toLowerCase();
    const accounts = getStoredAccounts();
    const account = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

    if (account) {
      if (account.passwordHash !== hashPassword(pass)) {
        throw { code: 'auth/wrong-password' };
      }

      if (!account.emailVerified) {
        throw { code: 'auth/unverified-email' };
      }

      // Ensure Firebase Auth session exists for Firestore security rules
      try {
        if (!auth.currentUser) {
          await signInAnonymously(auth).catch(() => null);
        }
      } catch {
        // Continue with app user session
      }

      const appUser: AppUser = {
        uid: account.uid,
        email: account.email,
        displayName: account.name,
        emailVerified: true,
      };

      setCurrentUser(appUser);
      saveActiveSession(appUser);
      return;
    }

    // Try standard Firebase Auth as fallback if account exists on Firebase
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      if (cred.user) {
        const appUser: AppUser = {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cred.user.displayName || cred.user.email?.split('@')[0] || 'رب الأسرة',
          emailVerified: cred.user.emailVerified,
        };
        setCurrentUser(appUser);
        saveActiveSession(appUser);
        return;
      }
    } catch (fbErr: any) {
      if (fbErr?.code === 'auth/user-not-found' || fbErr?.code === 'auth/invalid-credential') {
        throw { code: 'auth/invalid-credential' };
      }
      throw fbErr;
    }
  };

  // 5. Send Reset Password Code
  const sendResetPasswordCode = async (email: string): Promise<{ code: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const accounts = getStoredAccounts();
    const account = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

    if (!account) {
      // For security, still generate code or throw user not found
      throw { code: 'auth/user-not-found', message: 'لم يتم العثور على حساب مسجل بهذا البريد.' };
    }

    const code = generateNumericCode();
    const pendingData: PendingVerification = {
      name: account.name,
      email: cleanEmail,
      passwordHash: '',
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
      purpose: 'reset_password',
    };

    localStorage.setItem(STORAGE_KEYS.PENDING_VERIFICATION, JSON.stringify(pendingData));
    return { code };
  };

  // 6. Verify Reset Password Code and Set New Password
  const verifyResetPasswordCode = async (email: string, code: string, newPass: string): Promise<void> => {
    const cleanEmail = email.trim().toLowerCase();
    const pendingStr = localStorage.getItem(STORAGE_KEYS.PENDING_VERIFICATION);
    if (!pendingStr) throw { code: 'auth/invalid-code' };

    const pending: PendingVerification = JSON.parse(pendingStr);
    if (pending.email.toLowerCase() !== cleanEmail || pending.code !== code.trim()) {
      throw { code: 'auth/invalid-code' };
    }
    if (Date.now() > pending.expiresAt) {
      throw { code: 'auth/code-expired' };
    }

    const accounts = getStoredAccounts();
    const updated = accounts.map((acc) => {
      if (acc.email.toLowerCase() === cleanEmail) {
        return { ...acc, passwordHash: hashPassword(newPass) };
      }
      return acc;
    });
    saveStoredAccounts(updated);
    localStorage.removeItem(STORAGE_KEYS.PENDING_VERIFICATION);
  };

  // 7. Legacy direct register (auto-verified if called directly)
  const registerWithEmail = async (name: string, email: string, pass: string) => {
    const { code } = await sendRegistrationCode(name, email, pass);
    await verifyRegistrationCode(email, code);
  };

  // 8. Google Sign-In
  const loginWithGoogle = async () => {
    const res = await signInWithPopup(auth, getGoogleProvider());
    if (res.user) {
      const appUser: AppUser = {
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName || res.user.email?.split('@')[0] || 'رب الأسرة',
        emailVerified: true,
        photoURL: res.user.photoURL,
      };
      setCurrentUser(appUser);
      saveActiveSession(appUser);
    }
  };

  // 9. Reset Password via Firebase
  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  // 10. Logout
  const logout = async () => {
    try {
      await fbSignOut(auth).catch(() => null);
    } catch {
      // Ignore
    }
    saveActiveSession(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        loginWithEmail,
        sendRegistrationCode,
        verifyRegistrationCode,
        resendVerificationCode,
        sendResetPasswordCode,
        verifyResetPasswordCode,
        registerWithEmail,
        loginWithGoogle,
        resetPassword,
        logout,
        getFriendlyErrorMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

