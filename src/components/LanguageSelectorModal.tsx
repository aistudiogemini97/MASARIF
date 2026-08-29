import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Languages, 
  Check, 
  Globe, 
  Sparkles, 
  CheckCircle2,
  SlidersHorizontal,
  Users
} from 'lucide-react';
import { useLanguage, LANGUAGES, LanguageCode, LanguageInfo } from '../context/LanguageContext';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMemberName?: string;
  isFounderMode?: boolean;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  isOpen,
  onClose,
  activeMemberName,
  isFounderMode = true,
}) => {
  const { language, setLanguage, t, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'popular' | 'rtl' | 'ltr'>('all');
  const [justSelected, setJustSelected] = useState(false);

  const filteredLanguages = useMemo(() => {
    let list = LANGUAGES;

    if (filterType === 'popular') {
      list = list.filter((l) => l.popular);
    } else if (filterType === 'rtl') {
      list = list.filter((l) => l.dir === 'rtl');
    } else if (filterType === 'ltr') {
      list = list.filter((l) => l.dir === 'ltr');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((l) => 
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
      );
    }

    return list;
  }, [filterType, searchQuery]);

  if (!isOpen) return null;

  const handleSelectLanguage = (code: LanguageCode) => {
    setLanguage(code);
    setJustSelected(true);
    setTimeout(() => {
      setJustSelected(false);
      onClose();
    }, 350);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white relative shrink-0">
          <button
            onClick={onClose}
            className={`absolute ${isRTL ? 'left-4 sm:left-6' : 'right-4 sm:right-6'} top-5 sm:top-6 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer`}
            aria-label={t('close')}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
              <Languages className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {t('languageSelectorTitle')}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeMemberName ? (
                  <span>
                    تخصيص لغة الحساب لـ <strong>{activeMemberName}</strong> ({isFounderMode ? 'المؤسس' : 'عضو الأسرة'})
                  </span>
                ) : (
                  t('languageSelectorSubtitle')
                )}
              </p>
            </div>
          </div>

          {/* Current Active Language Banner */}
          <div className="mt-4 p-3 bg-indigo-50/80 border border-indigo-200/80 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{LANGUAGES.find((l) => l.code === language)?.flag || '🌐'}</span>
              <div>
                <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <span>{t('activeLanguage')}:</span>
                  <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-md text-[11px] font-mono">
                    {language.toUpperCase()}
                  </span>
                  <span>{LANGUAGES.find((l) => l.code === language)?.nativeName}</span>
                </div>
                <div className="text-[11px] text-indigo-700 mt-0.5">
                  {LANGUAGES.find((l) => l.code === language)?.name} • {LANGUAGES.find((l) => l.code === language)?.dir === 'rtl' ? 'Right-to-Left (RTL)' : 'Left-to-Right (LTR)'}
                </div>
              </div>
            </div>

            <span className="text-xs font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-xl shadow-2xs border border-indigo-100">
              {LANGUAGES.find((l) => l.code === language)?.flag} {LANGUAGES.find((l) => l.code === language)?.code.toUpperCase()}
            </span>
          </div>

          {/* Search Input Bar */}
          <div className="mt-3 relative">
            <Search className={`w-4 h-4 text-slate-400 absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search language / ابحث عن اللغة بالاسم أو الرمز (Arabic, English, Français, Türkçe, Urdu...)"
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs font-semibold text-slate-900 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs`}
              >
                مسح
              </button>
            )}
          </div>
        </div>

        {/* Filter Quick Pills */}
        <div className="px-5 sm:px-6 py-2 border-b border-slate-100 bg-slate-50/70 overflow-x-auto scrollbar-none flex items-center gap-1.5 shrink-0">
          {[
            { id: 'all', label: 'جميع اللغات (All Languages)', icon: '🌍' },
            { id: 'popular', label: 'الأكثر استخداماً (Popular)', icon: '⭐' },
            { id: 'rtl', label: 'من اليمين لليسار (RTL)', icon: '➡️' },
            { id: 'ltr', label: 'من اليسار لليمين (LTR)', icon: '⬅️' },
          ].map((tab) => {
            const isActive = filterType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
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

        {/* Language Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 max-h-[50vh]">
          {filteredLanguages.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Globe className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-600">لم يتم العثور على لغة مطابقة</p>
              <p className="text-xs text-slate-400 mt-1">
                جرب البحث بالاسم الإنجليزي أو رمز اللغة
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredLanguages.map((langItem) => {
                const isSelected = language === langItem.code;

                return (
                  <button
                    key={langItem.code}
                    type="button"
                    onClick={() => handleSelectLanguage(langItem.code)}
                    className={`w-full p-3.5 rounded-2xl ${isRTL ? 'text-right' : 'text-left'} transition border flex items-center justify-between cursor-pointer group ${
                      isSelected
                        ? 'bg-indigo-50/90 border-indigo-500 shadow-sm ring-2 ring-indigo-400/30'
                        : 'bg-white hover:bg-slate-50 border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Flag */}
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-xl shrink-0 shadow-2xs group-hover:scale-105 transition">
                        {langItem.flag}
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-900">
                            {langItem.nativeName}
                          </span>
                          <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                            {langItem.code.toUpperCase()}
                          </span>
                          {langItem.popular && (
                            <span className="text-[9px] bg-amber-100 text-amber-800 px-1 rounded font-bold">
                              شائع
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <span>{langItem.name}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-400 text-[10px]">{langItem.dir.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Selected Checkmark */}
                    <div>
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-slate-200 text-transparent group-hover:border-indigo-400 flex items-center justify-center transition" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>يستطيع المؤسس أو أي فرد من العائلة تغيير اللغة في أي وقت</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            {t('close')}
          </button>
        </div>

      </div>
    </div>
  );
};
