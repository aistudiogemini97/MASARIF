import React, { useState } from 'react';
import { 
  Users, 
  PlusCircle, 
  MinusCircle, 
  FileSpreadsheet, 
  RotateCcw,
  Sparkles, 
  Wallet,
  CalendarClock,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Shield,
  KeyRound,
  Eye,
  Lock,
  UserCheck,
  WifiOff,
  Wifi,
  Globe2,
  Coins,
  Languages,
  Sun,
  Moon
} from 'lucide-react';
import { AppMode, CurrencyConfig, FamilyMember } from '../types';
import { DEFAULT_CURRENCIES, ROLE_LABELS } from '../data/initialData';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { AppLogo } from './AppLogo';

interface HeaderProps {
  currentCurrency: CurrencyConfig;
  onSelectCurrency: (c: CurrencyConfig) => void;
  onOpenCurrencyModal: () => void;
  onOpenLanguageModal: () => void;
  members: FamilyMember[];
  recurringCount: number;
  pendingRecurringCount: number;
  appMode: AppMode;
  activeMember: FamilyMember | null;
  onSwitchToFounder: () => void;
  onSwitchToMember: (memberId: string) => void;
  onOpenFounderPinSettings: () => void;
  onOpenAddExpense: () => void;
  onOpenAddIncome: () => void;
  onOpenMembersModal: () => void;
  onOpenRecurringModal: () => void;
  onOpenExportModal: () => void;
  onResetSampleData: () => void;
  onOpenAuthModal?: () => void;
  isCloudSynced?: boolean;
  isOnline?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentCurrency,
  onSelectCurrency,
  onOpenCurrencyModal,
  onOpenLanguageModal,
  members,
  recurringCount,
  pendingRecurringCount,
  appMode,
  activeMember,
  onSwitchToFounder,
  onSwitchToMember,
  onOpenFounderPinSettings,
  onOpenAddExpense,
  onOpenAddIncome,
  onOpenMembersModal,
  onOpenRecurringModal,
  onOpenExportModal,
  onResetSampleData,
  onOpenAuthModal,
  isCloudSynced = true,
  isOnline = true,
}) => {
  const { currentUser, logout } = useAuth();
  const { language, languageInfo, t, isRTL } = useLanguage();
  const { theme, isDark, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);

  const userInitial = currentUser?.displayName
    ? currentUser.displayName.charAt(0).toUpperCase()
    : currentUser?.email
    ? currentUser.email.charAt(0).toUpperCase()
    : 'ع';

  const isFounderMode = appMode === 'founder';

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs transition-colors duration-200" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
          
          {/* Top Row: Logo & Brand + Mode Switcher Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AppLogo size="md" animate />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {t('appName')}
                  </h1>
                  
                  {/* Cloud Database / Offline Status */}
                  {!isOnline ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-2xs" title={t('offline')}>
                      <WifiOff className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                      <span>{t('offline')}</span>
                    </span>
                  ) : currentUser ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="hidden sm:inline">{t('online')}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      <Sparkles className="w-3 h-3 ml-0.5 text-amber-600 dark:text-amber-400" />
                      {t('demo')}
                    </span>
                  )}
                </div>
                
                {/* Current Active Mode Subtitle */}
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isFounderMode ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-800/60">
                      <Shield className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                      <span>{t('founderSubtitleFull')}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-800/60">
                      <UserCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>{t('memberPersonalView')}: {activeMember?.name}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Mode Switcher, Language, Currency & Dark Mode */}
            <div className="md:hidden flex items-center gap-1">
              {/* Mobile Theme Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center cursor-pointer transition"
                title={isDark ? t('switchToLightMode') : t('switchToDarkMode')}
                aria-label={t('toggleTheme')}
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-600" />
                )}
              </button>

              {/* Mobile Language Button */}
              <button
                type="button"
                onClick={onOpenLanguageModal}
                className="px-2 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-1 cursor-pointer transition"
                title={t('changeLanguage')}
              >
                <span>{languageInfo.flag || '🌐'}</span>
                <span className="font-mono text-[11px] uppercase">{language}</span>
              </button>

              {/* Mobile Currency Button */}
              <button
                type="button"
                onClick={onOpenCurrencyModal}
                className="px-2 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-1 cursor-pointer transition"
                title={t('changeCurrency')}
              >
                <span>{currentCurrency.flag || '🌍'}</span>
                <span className="font-mono text-[11px]">{currentCurrency.code}</span>
              </button>

              {isFounderMode ? (
                <button
                  onClick={() => setShowModeMenu(!showModeMenu)}
                  className="px-2 py-1.5 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <span>👑 {t('founder')}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
              ) : (
                <button
                  onClick={onSwitchToFounder}
                  className="px-2 py-1.5 text-xs font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Lock className="w-3 h-3" />
                  <span>{t('founderBadge')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Actions & Role Controls (Desktop & Responsive) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            
            {/* Mode & Profile Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowModeMenu(!showModeMenu)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition border shadow-2xs cursor-pointer ${
                  isFounderMode
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 shadow-indigo-600/20'
                    : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                }`}
                title={t('founderMode')}
              >
                {isFounderMode ? (
                  <>
                    <Shield className="w-3.5 h-3.5" />
                    <span>👑 {t('founder')}</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm">{activeMember?.avatarIcon || '👤'}</span>
                    <span className="truncate max-w-[90px]">{activeMember?.name}</span>
                  </>
                )}
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              {/* Mode Switcher Menu */}
              {showModeMenu && (
                <div 
                  className={`absolute ${isRTL ? 'left-0 sm:right-0' : 'right-0 sm:left-0'} mt-2 w-72 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-fadeIn`}
                  onMouseLeave={() => setShowModeMenu(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {t('founderMode')}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {t('founderPanelDesc')}
                    </p>
                  </div>

                  {/* Founder Option */}
                  <div className="p-1.5">
                    <button
                      onClick={() => {
                        setShowModeMenu(false);
                        onSwitchToFounder();
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl ${isRTL ? 'text-right' : 'text-left'} transition cursor-pointer ${
                        isFounderMode 
                          ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-200 font-bold border border-indigo-100 dark:border-indigo-800/60' 
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-xs">
                          👑
                        </div>
                        <div>
                          <div className="text-xs font-bold">{t('founderPanelTitle')}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{t('fullPrivileges')}</div>
                        </div>
                      </div>
                      {isFounderMode && <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">✓</span>}
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="px-4 py-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 border-y border-slate-100 dark:border-slate-800">
                    {t('familyMembers')}:
                  </div>

                  {/* Individual Members Options */}
                  <div className="p-1.5 max-h-56 overflow-y-auto space-y-1">
                    {members.map((m) => {
                      const isCurrentMemberActive = !isFounderMode && activeMember?.id === m.id;
                      const role = m.customRoleTitle || ROLE_LABELS[m.role] || m.role;

                      return (
                        <button
                          key={m.id}
                          onClick={() => {
                            setShowModeMenu(false);
                            onSwitchToMember(m.id);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl ${isRTL ? 'text-right' : 'text-left'} transition cursor-pointer ${
                            isCurrentMemberActive
                              ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-200 font-bold border border-emerald-200 dark:border-emerald-800/60'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{m.avatarIcon || '👤'}</span>
                            <div>
                              <div className="text-xs font-semibold">{m.name}</div>
                              <div className="text-[10px] text-slate-400 dark:text-slate-500">{role}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {m.pin && (
                              <span title={t('securityProtected')}>
                                <Lock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                              </span>
                            )}
                            {isCurrentMemberActive && (
                              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Founder Pin quick action in menu */}
                  {isFounderMode && (
                    <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                      <button
                        onClick={() => {
                          setShowModeMenu(false);
                          onOpenFounderPinSettings();
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>{t('founderSecurityPin')}</span>
                      </button>
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* Language Selector (Desktop) */}
            <button
              type="button"
              onClick={onOpenLanguageModal}
              className="hidden md:inline-flex items-center gap-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/90 dark:hover:bg-slate-700/90 border border-slate-200/90 dark:border-slate-700 rounded-xl px-2.5 py-1.5 transition text-right cursor-pointer shadow-2xs group"
              title={t('changeLanguage')}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{languageInfo.flag || '🌐'}</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                  {languageInfo.nativeName}
                </span>
                <span className="font-mono text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-1.5 py-0.2 rounded uppercase">
                  {language}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition" />
            </button>

            {/* Currency Selector (Desktop) */}
            <button
              type="button"
              onClick={onOpenCurrencyModal}
              className="hidden md:inline-flex items-center gap-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/90 dark:hover:bg-slate-700/90 border border-slate-200/90 dark:border-slate-700 rounded-xl px-2.5 py-1.5 transition text-right cursor-pointer shadow-2xs group"
              title={t('changeCurrency')}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{currentCurrency.flag || '🌍'}</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition">
                  {currentCurrency.name}
                </span>
                <span className="font-mono text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-1.5 py-0.2 rounded">
                  {currentCurrency.symbol}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition" />
            </button>

            {/* Theme Toggle Button (Desktop) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="hidden md:inline-flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/90 dark:hover:bg-slate-700 border border-slate-200/90 dark:border-slate-700 rounded-xl px-2.5 py-1.5 transition cursor-pointer shadow-2xs group"
              title={isDark ? t('switchToLightMode') : t('switchToDarkMode')}
              aria-label={t('toggleTheme')}
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
                  <span className="text-xs font-bold text-slate-200 hidden lg:inline">{t('lightMode')}</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600 group-hover:-rotate-12 transition-transform" />
                  <span className="text-xs font-bold text-slate-800 hidden lg:inline">{t('darkMode')}</span>
                </>
              )}
            </button>

            {/* FOUNDER SPECIFIC CONTROLS */}
            {isFounderMode ? (
              <>
                {/* Recurring Expenses Button */}
                <button
                  id="header-recurring-btn"
                  onClick={onOpenRecurringModal}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition border shadow-2xs cursor-pointer ${
                    pendingRecurringCount > 0
                      ? 'bg-amber-50 dark:bg-amber-950/70 hover:bg-amber-100 dark:hover:bg-amber-900/80 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700 ring-1 ring-amber-400/40'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                  }`}
                  title={t('recurringExpenses')}
                >
                  <CalendarClock className={`w-4 h-4 ${pendingRecurringCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400'}`} />
                  <span className="hidden lg:inline">{t('recurringExpenses')}</span>
                  {pendingRecurringCount > 0 ? (
                    <span className="bg-amber-500 text-white text-[11px] px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                      {pendingRecurringCount}
                    </span>
                  ) : (
                    <span className="bg-slate-300/80 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] px-1.5 py-0.2 rounded-full font-bold">
                      {recurringCount}
                    </span>
                  )}
                </button>

                {/* Family Members Button */}
                <button
                  id="header-members-btn"
                  onClick={onOpenMembersModal}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition border border-slate-200 dark:border-slate-700 shadow-2xs cursor-pointer"
                  title={t('familyMembers')}
                >
                  <Users className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <span className="hidden sm:inline">{t('familyMembers')}</span>
                  <span className="bg-slate-300/80 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] px-1.5 py-0.2 rounded-full font-bold">
                    {members.length}
                  </span>
                </button>

                {/* Reports / Export */}
                <button
                  id="header-export-btn"
                  onClick={onOpenExportModal}
                  title={t('exportReports')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition shadow-2xs cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden sm:inline">{t('exportReports')}</span>
                </button>

                {/* Reset sample data */}
                <button
                  id="header-reset-btn"
                  onClick={onResetSampleData}
                  title={t('cleanResetButton')}
                  className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            ) : (
              /* MEMBER SPECIFIC CONTROLS */
              <button
                onClick={onSwitchToFounder}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-amber-50 dark:bg-amber-950/70 hover:bg-amber-100 dark:hover:bg-amber-900/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 shadow-2xs transition cursor-pointer"
                title={t('founderBadge')}
              >
                <Lock className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span className="hidden sm:inline">{t('founderBadge')}</span>
              </button>
            )}

            {/* Main Action Buttons (Add Expense & Add Income) */}
            <div className="flex items-center gap-1.5">
              <button
                id="header-add-expense-btn"
                onClick={onOpenAddExpense}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/20 transition active:scale-98 cursor-pointer"
              >
                <MinusCircle className="w-3.5 h-3.5" />
                <span>+ {t('expense')}</span>
              </button>

              <button
                id="header-add-income-btn"
                onClick={onOpenAddIncome}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 transition active:scale-98 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ {t('income')}</span>
              </button>
            </div>

            {/* User Account / Profile & Sign Out dropdown */}
            {currentUser ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 pl-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 transition cursor-pointer"
                  title="إعدادات الحساب والمزامنة"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                    {userInitial}
                  </div>
                  <span className="text-xs font-bold hidden lg:inline max-w-[90px] truncate">
                    {currentUser.displayName || currentUser.email?.split('@')[0] || 'حسابي'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                </button>

                {showUserMenu && (
                  <div 
                    className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-fadeIn`}
                    onMouseLeave={() => setShowUserMenu(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {currentUser.displayName || 'مؤسس العائلة'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {currentUser.email}
                      </p>
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-md border border-emerald-100 dark:border-emerald-800">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>قاعدة البيانات السحابية نشطة</span>
                      </div>
                    </div>

                    <div className="p-1 space-y-1">
                      {/* Dark Mode toggle inside user menu */}
                      <button
                        onClick={() => {
                          toggleTheme();
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          {isDark ? (
                            <Sun className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Moon className="w-4 h-4 text-indigo-600" />
                          )}
                          <span>{t('theme')}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-normal">
                          {isDark ? t('darkMode') : t('lightMode')}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenLanguageModal();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                      >
                        <Languages className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span>{t('changeLanguage')} ({languageInfo.nativeName})</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenCurrencyModal();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                      >
                        <Globe2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>{t('changeCurrency')} ({currentCurrency.code})</span>
                      </button>

                      {isFounderMode && (
                        <>
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              onOpenFounderPinSettings();
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                          >
                            <KeyRound className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <span>{t('founderSecurityPin')}</span>
                          </button>

                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              onResetSampleData();
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/60 rounded-xl transition cursor-pointer"
                          >
                            <RotateCcw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            <span>{t('cleanResetButton')}</span>
                          </button>
                        </>
                      )}

                      <button
                        onClick={async () => {
                          setShowUserMenu(false);
                          await logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              onOpenAuthModal && (
                <button
                  type="button"
                  onClick={onOpenAuthModal}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>تسجيل الدخول</span>
                </button>
              )
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
