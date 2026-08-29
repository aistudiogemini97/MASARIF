import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Coins, 
  Check, 
  Globe2, 
  Sparkles, 
  Plus, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { CurrencyConfig } from '../types';
import { WORLD_CURRENCIES, REGION_TABS, WorldCurrency } from '../data/currencies';
import { formatCurrency } from '../utils/formatters';

interface CurrencySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCurrency: CurrencyConfig;
  onSelectCurrency: (currency: CurrencyConfig) => void;
  isFounderMode?: boolean;
}

export const CurrencySelectorModal: React.FC<CurrencySelectorModalProps> = ({
  isOpen,
  onClose,
  currentCurrency,
  onSelectCurrency,
  isFounderMode = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState(currentCurrency.code);
  const [showSavedSuccess, setShowSavedSuccess] = useState(false);

  // Custom Currency Form State
  const [customCode, setCustomCode] = useState('');
  const [customSymbol, setCustomSymbol] = useState('');
  const [customName, setCustomName] = useState('');
  const [customFlag, setCustomFlag] = useState('🪙');
  const [customError, setCustomError] = useState('');

  // Filter currencies based on tab and search
  const filteredCurrencies = useMemo(() => {
    let list = WORLD_CURRENCIES;

    // Filter by tab
    if (activeTab !== 'all' && activeTab !== 'custom') {
      list = list.filter((c) => c.region === activeTab);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((c) => 
        c.name.toLowerCase().includes(q) ||
        c.englishName.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeTab, searchQuery]);

  if (!isOpen) return null;

  const handleSelect = (curr: CurrencyConfig) => {
    setSelectedCurrencyCode(curr.code);
    onSelectCurrency(curr);
    setShowSavedSuccess(true);
    setTimeout(() => {
      setShowSavedSuccess(false);
      onClose();
    }, 400);
  };

  const handleCreateCustomCurrency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCode.trim() || !customSymbol.trim() || !customName.trim()) {
      setCustomError('يرجى ملء جميع الحقول المطلوبة للعملة المخصصة.');
      return;
    }

    const newCustomCurrency: CurrencyConfig = {
      code: customCode.trim().toUpperCase(),
      symbol: customSymbol.trim(),
      name: customName.trim(),
      flag: customFlag.trim() || '🪙',
      country: 'عملة مخصصة للمؤسس',
      isCustom: true,
    };

    setCustomError('');
    handleSelect(newCustomCurrency);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn" 
      dir="rtl"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute left-4 sm:left-6 top-5 sm:top-6 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
              <Globe2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  اختيار عملة النظام لجميع دول العالم
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                  <ShieldCheck className="w-3 h-3" />
                  صلاحية المؤسس
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                اختر عملة الحساب المعتمدة ليتم تطبيقها على كافة المصاريف والدخول وتقارير أفراد الأسرة
              </p>
            </div>
          </div>

          {/* Current Active Currency Banner */}
          <div className="mt-4 p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{currentCurrency.flag || '💰'}</span>
              <div>
                <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <span>العملة الحالية النشطة:</span>
                  <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-md text-[11px] font-mono">
                    {currentCurrency.code}
                  </span>
                  <span>{currentCurrency.name}</span>
                </div>
                <div className="text-[11px] text-emerald-700 mt-0.5 font-mono">
                  مثال العرض: <strong>{formatCurrency(1500, currentCurrency.symbol)}</strong>
                </div>
              </div>
            </div>

            <span className="text-xs font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-xl shadow-2xs border border-emerald-100">
              {currentCurrency.symbol}
            </span>
          </div>

          {/* Search Input Bar */}
          {activeTab !== 'custom' && (
            <div className="mt-3 relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم، رمز العملة (SAR, USD, EUR)، الدولة، أو الرمز..."
                className="w-full pl-4 pr-10 py-2.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs font-semibold text-slate-900 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  مسح
                </button>
              )}
            </div>
          )}
        </div>

        {/* Region Filter Tabs */}
        <div className="px-5 sm:px-6 py-2 border-b border-slate-100 bg-slate-50/70 overflow-x-auto scrollbar-none flex items-center gap-1.5 shrink-0">
          {REGION_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'custom') setSearchQuery('');
                }}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/60'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Currency List or Custom Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 max-h-[50vh]">
          
          {activeTab === 'custom' ? (
            /* Custom Currency Creation Form */
            <form onSubmit={handleCreateCustomCurrency} className="max-w-lg mx-auto space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>تخصيص عملة يدوية خاصة</span>
                </div>
                يمكنك هنا إضافة أي عملة خاصة أو محلية أو نظام نقاط ترغب به إذا لم تكن عملتك مدرجة في القائمة العالمية.
              </div>

              {customError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                  {customError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    كود العملة (ISO Code) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                    placeholder="مثال: GOLD أو PTS"
                    className="w-full px-3.5 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رمز العرض (Symbol) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={customSymbol}
                    onChange={(e) => setCustomSymbol(e.target.value)}
                    placeholder="مثال: 🪙 أو غ.ذ أو نقطة"
                    className="w-full px-3.5 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم العملة بالعربي <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="مثال: غرام ذهب أو نقاط العائلة"
                    className="w-full px-3.5 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    أيقونة أو علم تعبيري
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={customFlag}
                    onChange={(e) => setCustomFlag(e.target.value)}
                    placeholder="🪙"
                    className="w-full px-3.5 py-2 text-center text-lg bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                {/* Live Preview Box */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    معاينة الشكل النهائي
                  </label>
                  <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-mono font-bold text-emerald-800 flex items-center justify-between">
                    <span>1,500.00 {customSymbol || '؟'}</span>
                    <span className="text-lg">{customFlag || '🪙'}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>حفظ وتطبيق العملة المخصصة</span>
              </button>
            </form>
          ) : (
            /* Currencies Grid */
            <>
              {filteredCurrencies.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Coins className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-600">لم يتم العثور على عملة مطابقة</p>
                  <p className="text-xs text-slate-400 mt-1">
                    جرب البحث بكلمات أخرى أو أضف عملتك المخصصة من تبويب "عملة مخصصة"
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {filteredCurrencies.map((curr) => {
                    const isSelected = selectedCurrencyCode === curr.code;

                    return (
                      <button
                        key={curr.code}
                        type="button"
                        onClick={() => handleSelect(curr)}
                        className={`w-full p-3.5 rounded-2xl text-right transition border flex items-center justify-between cursor-pointer group ${
                          isSelected
                            ? 'bg-emerald-50/90 border-emerald-500 shadow-sm ring-2 ring-emerald-400/30'
                            : 'bg-white hover:bg-slate-50 border-slate-200/80 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Flag */}
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-xl shrink-0 shadow-2xs group-hover:scale-105 transition">
                            {curr.flag}
                          </div>

                          {/* Info */}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-slate-900">
                                {curr.name}
                              </span>
                              <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                                {curr.code}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                              <span>{curr.country}</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-400">{curr.englishName}</span>
                            </div>
                          </div>
                        </div>

                        {/* Symbol & Selected State */}
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100/80 border border-slate-200 px-2 py-0.5 rounded-lg">
                              {curr.symbol}
                            </span>
                          </div>

                          {isSelected ? (
                            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full border border-slate-200 text-transparent group-hover:border-emerald-400 flex items-center justify-center transition" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>يتوفر أكثر من 75+ عملة عالمية مع حفظ ومزامنة فورية</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
