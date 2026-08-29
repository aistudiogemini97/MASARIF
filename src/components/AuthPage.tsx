import React, { useState, useEffect, useRef } from 'react';
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Sparkles, 
  KeyRound, 
  ShieldCheck, 
  LogIn, 
  UserPlus, 
  WifiOff, 
  Send, 
  RotateCw, 
  Edit3, 
  Check, 
  Copy,
  Inbox
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useOnlineStatus } from '../utils/useOnlineStatus';
import { AppLogo } from './AppLogo';

interface AuthPageProps {
  onContinueAsGuest?: () => void;
}

type AuthMode = 'login' | 'register' | 'verify_email' | 'forgot_password' | 'reset_password_code';

export const AuthPage: React.FC<AuthPageProps> = ({ onContinueAsGuest }) => {
  const { 
    loginWithEmail, 
    sendRegistrationCode, 
    verifyRegistrationCode, 
    resendVerificationCode, 
    sendResetPasswordCode, 
    verifyResetPasswordCode, 
    loginWithGoogle, 
    getFriendlyErrorMessage 
  } = useAuth();
  const { isOnline } = useOnlineStatus();

  // Mode state
  const [mode, setMode] = useState<AuthMode>('login');

  // Form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP 6-digit inputs
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Simulation & feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [lastGeneratedCode, setLastGeneratedCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Resend Timer (60s countdown)
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const resetFormState = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSwitchMode = (newMode: AuthMode) => {
    resetFormState();
    setMode(newMode);
    setOtpDigits(['', '', '', '', '', '']);
  };

  // 1. Handle Login Submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();

    if (!email.trim()) {
      setErrorMessage('يرجى إدخال البريد الإلكتروني.');
      return;
    }
    if (!password) {
      setErrorMessage('يرجى إدخال كلمة المرور.');
      return;
    }

    try {
      setIsLoading(true);
      await loginWithEmail(email, password);
    } catch (err: any) {
      if (err?.code === 'auth/unverified-email') {
        // Account exists but not verified yet -> switch to OTP verification
        try {
          const { code } = await resendVerificationCode(email);
          setLastGeneratedCode(code);
          setResendCooldown(60);
          setMode('verify_email');
          setErrorMessage('هذا الحساب بانتظار التفعيل. تم إرسال كود تفعيل جديد إلى بريدك.');
          return;
        } catch {
          // Fall through
        }
      }
      const friendly = getFriendlyErrorMessage(err?.code || err?.message || '');
      setErrorMessage(friendly);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Register -> Sends 6-digit OTP Code
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();

    if (!name.trim()) {
      setErrorMessage('يرجى إدخال الاسم أو اللقب (مثال: أبو راشد).');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('يرجى إدخال بريد إلكتروني صالح.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('كلمة المرور يجب أن تتكون من 6 خانات أو أكثر.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('كلمتا المرور غير متطابقتين.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await sendRegistrationCode(name, email, password);
      setLastGeneratedCode(res.code);
      setResendCooldown(60);
      setMode('verify_email');
      setSuccessMessage(`تم إرسال كود التفعيل المكون من 6 أرقام إلى بريدك الإلكتروني: ${email}`);
      // Focus first OTP input after render
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      const friendly = getFriendlyErrorMessage(err?.code || err?.message || '');
      setErrorMessage(friendly);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Handle OTP Digits Change & Auto Focus
  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric digits
    const cleaned = value.replace(/[^0-9]/g, '');
    const newOtp = [...otpDigits];

    if (cleaned.length > 1) {
      // User pasted multiple characters into this input
      const chars = cleaned.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newOtp[i] = chars[i] || '';
      }
      setOtpDigits(newOtp);
      const nextFocus = Math.min(chars.length, 5);
      otpInputsRef.current[nextFocus]?.focus();
      return;
    }

    newOtp[index] = cleaned;
    setOtpDigits(newOtp);

    // Auto advance
    if (cleaned && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (pastedData) {
      const newOtp = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pastedData[i] || '';
      }
      setOtpDigits(newOtp);
      const nextFocus = Math.min(pastedData.length, 5);
      otpInputsRef.current[nextFocus]?.focus();
    }
  };

  // 4. Handle Verify Email OTP Submit
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();

    const fullCode = otpDigits.join('');
    if (fullCode.length !== 6) {
      setErrorMessage('يرجى إدخال كود التفعيل كاملاً (6 أرقام).');
      return;
    }

    try {
      setIsLoading(true);
      await verifyRegistrationCode(email, fullCode);
      
      // Celebrate
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
    } catch (err: any) {
      const friendly = getFriendlyErrorMessage(err?.code || err?.message || '');
      setErrorMessage(friendly);
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Handle Resend Verification Code
  const handleResendCode = async () => {
    if (resendCooldown > 0 || isLoading) return;
    resetFormState();

    try {
      setIsLoading(true);
      const res = await resendVerificationCode(email);
      setLastGeneratedCode(res.code);
      setResendCooldown(60);
      setOtpDigits(['', '', '', '', '', '']);
      setSuccessMessage(`تم إرسال كود تفعيل جديد بنجاح إلى: ${email}`);
      otpInputsRef.current[0]?.focus();
    } catch (err: any) {
      const friendly = getFriendlyErrorMessage(err?.code || err?.message || '');
      setErrorMessage(friendly);
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Handle Forgot Password Submit -> Sends Reset Code
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();

    if (!email.trim()) {
      setErrorMessage('يرجى إدخال عنوان بريدك الإلكتروني المسجل.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await sendResetPasswordCode(email);
      setLastGeneratedCode(res.code);
      setResendCooldown(60);
      setMode('reset_password_code');
      setSuccessMessage(`تم إرسال كود استعادة كلمة المرور المكون من 6 أرقام إلى: ${email}`);
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      const friendly = getFriendlyErrorMessage(err?.code || err?.message || '');
      setErrorMessage(friendly);
    } finally {
      setIsLoading(false);
    }
  };

  // 7. Handle Reset Password with OTP Code
  const handleResetPasswordWithCode = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();

    const fullCode = otpDigits.join('');
    if (fullCode.length !== 6) {
      setErrorMessage('يرجى إدخال كود التحقق كاملاً (6 أرقام).');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('كلمة المرور الجديدة يجب أن تتكون من 6 خانات أو أكثر.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('كلمتا المرور غير متطابقتين.');
      return;
    }

    try {
      setIsLoading(true);
      await verifyResetPasswordCode(email, fullCode, password);
      setSuccessMessage('تم تغيير كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.');
      setMode('login');
      setPassword('');
      setConfirmPassword('');
      setOtpDigits(['', '', '', '', '', '']);
    } catch (err: any) {
      const friendly = getFriendlyErrorMessage(err?.code || err?.message || '');
      setErrorMessage(friendly);
    } finally {
      setIsLoading(false);
    }
  };

  // 8. Handle Google Sign-in
  const handleGoogleSignIn = async () => {
    resetFormState();
    try {
      setIsLoading(true);
      await loginWithGoogle();
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        const friendly = getFriendlyErrorMessage(err?.code || '');
        setErrorMessage(friendly);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Quick auto-fill helper for test convenience
  const handleAutoFillCode = () => {
    if (!lastGeneratedCode) return;
    const digits = lastGeneratedCode.split('');
    setOtpDigits(digits);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 relative overflow-hidden" dir="rtl">
      
      {/* Decorative Background Glows */}
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Auth Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-slate-900 relative z-10">
        
        {/* Header */}
        <div className="bg-gradient-to-b from-slate-50 to-white px-6 sm:px-8 pt-8 pb-6 border-b border-slate-100 text-center flex flex-col items-center">
          <div className="mb-3.5">
            <AppLogo size="xl" animate />
          </div>
          
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            مصاريف العائلة
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            {mode === 'login' && 'تسجيل الدخول إلى حسابك وقاعدة بيانات العائلة'}
            {mode === 'register' && 'إنشاء حساب وتأكيد البريد الإلكتروني برمز التفعيل'}
            {mode === 'verify_email' && 'تأكيد وتفعيل البريد الإلكتروني'}
            {mode === 'forgot_password' && 'استعادة كلمة المرور عبر كود التحقق'}
            {mode === 'reset_password_code' && 'تعيين كلمة المرور الجديدة'}
          </p>

          {/* Mode Switch Tabs (Login / Register) */}
          {(mode === 'login' || mode === 'register') && (
            <div className="flex bg-slate-100 p-1 rounded-xl mt-5 w-full">
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === 'login'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>تسجيل الدخول</span>
              </button>
              <button
                type="button"
                onClick={() => handleSwitchMode('register')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === 'register'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>إنشاء حساب جديد</span>
              </button>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8 space-y-4">
          
          {/* Offline Warning Banner */}
          {!isOnline && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 animate-fadeIn">
              <WifiOff className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
              <div className="space-y-1">
                <p className="font-bold text-amber-950">أنت غير متصل بالإنترنت حالياً (Offline)</p>
                <p className="leading-relaxed text-[11px] text-amber-800">
                  يمكنك الدخول فوراً باستخدام وضع الحفظ المحلي دون الحاجة للاتصال بالإنترنت.
                </p>
                {onContinueAsGuest && (
                  <button
                    type="button"
                    onClick={onContinueAsGuest}
                    className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-xs transition cursor-pointer"
                  >
                    <span>الدخول في وضع عدم الاتصال الآن ⚡</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex flex-col gap-2 animate-fadeIn">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span className="leading-relaxed font-medium">{successMessage}</span>
            </div>
          )}

          {/* 1. LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="example@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 pl-10 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    كلمة المرور
                  </label>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('forgot_password')}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 pl-10 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>تسجيل الدخول</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* 2. REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الاسم الكامل أو صفة رب الأسرة
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="مثال: أحمد عبد الله أو أبو خالد"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 pl-10 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="example@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 pl-10 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="6 خانات فأكثر"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 pl-8 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    تأكيد كلمة المرور
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="تأكيد كلمة المرور"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>إنشاء الحساب وإرسال كود التفعيل</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* 3. VERIFY EMAIL OTP SCREEN */}
          {mode === 'verify_email' && (
            <form onSubmit={handleVerifyEmail} className="space-y-4 animate-fadeIn">
              
              {/* Notification Box with Code Badge */}
              <div className="p-4 rounded-2xl bg-indigo-50/90 border border-indigo-100 text-indigo-950 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <Inbox className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-indigo-900">رسالة تفعيل الحساب</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('register')}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>تعديل البريد</span>
                  </button>
                </div>
                
                <p className="text-xs text-indigo-800/90 leading-relaxed">
                  تم إرسال كود التفعيل المكون من 6 أرقام إلى: <strong className="text-indigo-950 font-bold">{email}</strong>
                </p>

                {/* Instant Verification Code Card & Quick-fill Button */}
                {lastGeneratedCode && (
                  <div className="pt-2 border-t border-indigo-200/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">كود التفعيل:</span>
                      <span className="font-mono text-sm font-black tracking-widest bg-white px-2.5 py-1 rounded-md border border-indigo-200 text-indigo-700 select-all shadow-2xs">
                        {lastGeneratedCode}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleAutoFillCode}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 shadow-2xs transition cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCode ? 'تم التعبئة' : 'تعبئة فورية'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 6 Digit PIN Inputs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 text-center mb-2.5">
                  أدخل رمز التفعيل المكون من 6 أرقام
                </label>
                <div className="flex justify-center gap-2 sm:gap-2.5" dir="ltr">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { otpInputsRef.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className={`w-11 h-13 sm:w-12 sm:h-14 text-center font-mono font-black text-xl rounded-xl border transition shadow-2xs ${
                        digit
                          ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || otpDigits.join('').length !== 6}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تأكيد الرمز وتفعيل الحساب</span>
                  </>
                )}
              </button>

              {/* Resend Code & Back */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0 || isLoading}
                  className="font-bold text-indigo-600 hover:text-indigo-800 disabled:text-slate-400 transition flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>
                    {resendCooldown > 0 ? `إعادة الإرسال خلال (${resendCooldown} ثانية)` : 'إعادة إرسال رمز جديد'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchMode('register')}
                  className="font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  العودة للخلف
                </button>
              </div>
            </form>
          )}

          {/* 4. FORGOT PASSWORD FORM */}
          {mode === 'forgot_password' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-900 flex items-start gap-2">
                <KeyRound className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  أدخل بريدك الإلكتروني وسنرسل لك كود تحقق مكون من 6 أرقام لتعيين كلمة مرور جديدة.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  البريد الإلكتروني المسجل
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="example@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 pl-10 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>إرسال كود استعادة كلمة المرور</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>العودة لصفحة تسجيل الدخول</span>
                </button>
              </div>
            </form>
          )}

          {/* 5. RESET PASSWORD CODE FORM */}
          {mode === 'reset_password_code' && (
            <form onSubmit={handleResetPasswordWithCode} className="space-y-3.5 animate-fadeIn">
              <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-950 text-xs">
                <p className="font-bold mb-1">أدخل كود التحقق المرسل إلى: {email}</p>
                {lastGeneratedCode && (
                  <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-indigo-200/60">
                    <span className="text-[11px] text-slate-500">كود التحقق:</span>
                    <span className="font-mono text-xs font-bold bg-white px-2 py-0.5 rounded border border-indigo-200 text-indigo-700">
                      {lastGeneratedCode}
                    </span>
                    <button
                      type="button"
                      onClick={handleAutoFillCode}
                      className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-600 text-white cursor-pointer"
                    >
                      تعبئة
                    </button>
                  </div>
                )}
              </div>

              {/* 6 Digit Inputs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 text-center">
                  كود التحقق (6 أرقام)
                </label>
                <div className="flex justify-center gap-2" dir="ltr">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { otpInputsRef.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className="w-10 h-12 text-center font-mono font-black text-lg rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition shadow-2xs"
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  required
                  placeholder="6 خانات فأكثر"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  تأكيد كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  required
                  placeholder="تأكيد كلمة المرور"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>تحديث كلمة المرور والدخول</span>
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  العودة لتسجيل الدخول
                </button>
              </div>
            </form>
          )}

          {/* Social / Alternative Sign-in Options */}
          {(mode === 'login' || mode === 'register') && (
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              
              {/* Google Sign-in */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs transition flex items-center justify-center gap-2.5 shadow-2xs cursor-pointer active:scale-99 disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>المتابعة باستخدام حساب Google</span>
              </button>

              {/* Guest / Fast Offline Mode */}
              {onContinueAsGuest && (
                <button
                  type="button"
                  onClick={onContinueAsGuest}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-50/80 hover:bg-amber-100/90 border border-amber-200/80 text-amber-900 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>المتابعة في وضع التجربة السريعة (حفظ محلي فوري)</span>
                </button>
              )}
            </div>
          )}

        </div>

        {/* Card Footer Features */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>بيانات مشفرة ومصادقة بالرمز</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>مزامنة فورية لكل الأجهزة</span>
          </div>
        </div>

      </div>
    </div>
  );
};

