import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  Trash2, 
  Edit3, 
  Users, 
  Check, 
  AlertCircle,
  Eye,
  Crown,
  Lock
} from 'lucide-react';
import { FamilyMember, FamilyRole, Transaction } from '../types';
import { ROLE_LABELS, ROLE_BADGE_COLORS } from '../data/initialData';
import { useLanguage } from '../context/LanguageContext';

interface MemberManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  onAddMember: (member: Omit<FamilyMember, 'id' | 'createdAt'>) => void;
  onUpdateMember: (id: string, member: Partial<FamilyMember>) => void;
  onDeleteMember: (id: string) => void;
  onPreviewMember?: (memberId: string) => void;
  transactions: Transaction[];
  currencySymbol: string;
}

const EMOJI_OPTIONS = ['👨', '👩', '👦', '👧', '👴', '👵', '👶', '🧕', '🧔', '🧑', '🚗', '🎓', '💼', '🏡', '🌟'];

export const MemberManagementModal: React.FC<MemberManagementModalProps> = ({
  isOpen,
  onClose,
  members,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  onPreviewMember,
  transactions,
  currencySymbol,
}) => {
  const { t, formatRole, formatCurrencyAmount, isRTL } = useLanguage();

  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState<FamilyRole>('son');
  const [customRoleTitle, setCustomRoleTitle] = useState('');
  const [avatarIcon, setAvatarIcon] = useState('👦');
  const [avatarColor, setAvatarColor] = useState('bg-blue-600');
  const [monthlyBudget, setMonthlyBudget] = useState<string>('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isFounder, setIsFounder] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setRole('son');
    setCustomRoleTitle('');
    setAvatarIcon('👦');
    setAvatarColor('bg-blue-600');
    setMonthlyBudget('');
    setPhone('');
    setNotes('');
    setIsFounder(false);
    setPin('');
    setEditingMemberId(null);
    setIsAddingNew(false);
    setError('');
  };

  const startEdit = (member: FamilyMember) => {
    setEditingMemberId(member.id);
    setName(member.name);
    setRole(member.role);
    setCustomRoleTitle(member.customRoleTitle || '');
    setAvatarIcon(member.avatarIcon || '👤');
    setAvatarColor(member.avatarColor || 'bg-slate-700');
    setMonthlyBudget(member.monthlyBudget ? member.monthlyBudget.toString() : '');
    setPhone(member.phone || '');
    setNotes(member.notes || '');
    setIsFounder(!!member.isFounder);
    setPin(member.pin || '');
    setIsAddingNew(false);
    setError('');
  };

  const handleRoleChange = (newRole: FamilyRole) => {
    setRole(newRole);
    // Suggest appropriate avatar icon based on role
    switch (newRole) {
      case 'father':
        setAvatarIcon('👨');
        setAvatarColor('bg-indigo-600');
        break;
      case 'mother':
        setAvatarIcon('👩');
        setAvatarColor('bg-rose-500');
        break;
      case 'son':
        setAvatarIcon('👦');
        setAvatarColor('bg-blue-600');
        break;
      case 'daughter':
        setAvatarIcon('👧');
        setAvatarColor('bg-pink-500');
        break;
      case 'father':
        setAvatarIcon('👴');
        setAvatarColor('bg-slate-700');
        break;
      case 'mother':
        setAvatarIcon('👵');
        setAvatarColor('bg-amber-600');
        break;
      case 'brother':
        setAvatarIcon('👦');
        setAvatarColor('bg-cyan-600');
        break;
      case 'sister':
        setAvatarIcon('👧');
        setAvatarColor('bg-purple-600');
        break;
      case 'driver':
        setAvatarIcon('🚗');
        setAvatarColor('bg-emerald-600');
        break;
      case 'maid':
        setAvatarIcon('🧹');
        setAvatarColor('bg-teal-600');
        break;
      default:
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t('memberRequired'));
      return;
    }

    const parsedBudget = monthlyBudget.trim() ? parseFloat(monthlyBudget) : undefined;

    if (editingMemberId) {
      onUpdateMember(editingMemberId, {
        name: name.trim(),
        role,
        customRoleTitle: customRoleTitle.trim() || undefined,
        avatarIcon,
        avatarColor,
        monthlyBudget: parsedBudget,
        phone: phone.trim() || undefined,
        notes: notes.trim() || undefined,
        isFounder,
        pin: pin.trim() ? pin.trim() : undefined,
      });
    } else {
      onAddMember({
        name: name.trim(),
        role,
        customRoleTitle: customRoleTitle.trim() || undefined,
        avatarIcon,
        avatarColor,
        monthlyBudget: parsedBudget,
        phone: phone.trim() || undefined,
        notes: notes.trim() || undefined,
        isFounder,
        pin: pin.trim() ? pin.trim() : undefined,
      });
    }

    resetForm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn" dir={isRTL ? 'rtl' : 'ltr'}>
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t('manageMembers')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('memberBudgetsTrackingDesc')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Top Actions: Add New Member Toggle */}
          {!isAddingNew && !editingMemberId && (
            <div className="flex justify-between items-center bg-emerald-50/70 border border-emerald-200/70 rounded-2xl p-4">
              <div>
                <h4 className="text-xs font-bold text-emerald-950">
                  {t('addNewMember')}
                </h4>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  {t('recordExpenseDesc')}
                </p>
              </div>
              <button
                id="modal-start-add-member"
                onClick={() => {
                  resetForm();
                  setIsAddingNew(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition cursor-pointer shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ {t('addNewMember')}</span>
              </button>
            </div>
          )}

          {/* Add / Edit Form */}
          {(isAddingNew || editingMemberId) && (
            <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  {editingMemberId ? <Edit3 className="w-4 h-4 text-indigo-600" /> : <UserPlus className="w-4 h-4 text-emerald-600" />}
                  <span>{editingMemberId ? t('edit') : t('addNewMember')}</span>
                </h4>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-slate-500 hover:text-slate-700 underline cursor-pointer"
                >
                  {t('cancel')}
                </button>
              </div>

              {error && (
                <div className="mb-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('memberName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('memberName')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Role / Relation */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('role')}
                  </label>
                  <select
                    value={role}
                    onChange={(e) => handleRoleChange(e.target.value as FamilyRole)}
                    className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    {Object.keys(ROLE_LABELS).map((roleKey) => (
                      <option key={roleKey} value={roleKey}>
                        {formatRole(roleKey as FamilyRole)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom Role Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('customRoleTitle')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('customRoleTitle')}
                    value={customRoleTitle}
                    onChange={(e) => setCustomRoleTitle(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Monthly Budget */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('monthlyBudget')} ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0.00"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Avatar Icon */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {t('selectAvatar')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setAvatarIcon(emoji)}
                        className={`w-9 h-9 text-lg rounded-xl flex items-center justify-center border transition cursor-pointer ${
                          avatarIcon === emoji
                            ? 'bg-emerald-100 border-emerald-500 scale-110 shadow-xs ring-2 ring-emerald-500/20'
                            : 'bg-white border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Founder Role Designation */}
                <div className="sm:col-span-2 bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-indigo-600" />
                    <div>
                      <div className="text-xs font-bold text-indigo-900">{t('founder')}</div>
                      <div className="text-[10px] text-indigo-600">{t('founderModeDesc')}</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isFounder}
                    onChange={(e) => setIsFounder(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500"
                  />
                </div>

                {/* Member PIN Protection Field */}
                <div className="sm:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{t('memberPinPlaceholder')}</span>
                    </label>
                    {pin && (
                      <button
                        type="button"
                        onClick={() => setPin('')}
                        className="text-[11px] text-rose-600 hover:underline font-semibold cursor-pointer"
                      >
                        {t('cancel')}
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="****"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 tracking-wider"
                  />
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('notes')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('descriptionPlaceholder')}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

              </div>

              {/* Submit Buttons */}
              <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-xl transition cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingMemberId ? t('saveChanges') : t('addNewMember')}</span>
                </button>
              </div>

            </form>
          )}

          {/* Members List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-600 mb-2">
              {t('allMembers')} ({members.length}):
            </h4>

            {members.map((member) => {
              const badge = ROLE_BADGE_COLORS[member.role] || {
                bg: 'bg-slate-100',
                text: 'text-slate-700',
                border: 'border-slate-200',
              };

              // Compute stats for this member
              const memberExpenses = transactions
                .filter((t) => t.type === 'expense' && (t.memberId === member.id || t.beneficiaryMemberId === member.id))
                .reduce((sum, t) => sum + t.amount, 0);

              const memberIncome = transactions
                .filter((t) => t.type === 'income' && t.memberId === member.id)
                .reduce((sum, t) => sum + t.amount, 0);

              return (
                <div
                  key={member.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-2xs text-white shrink-0 ${
                        member.avatarColor || 'bg-slate-700'
                      }`}
                    >
                      {member.avatarIcon || '👤'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900">
                          {member.name}
                        </span>
                        
                        {member.isFounder && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200">
                            👑 {t('founder')}
                          </span>
                        )}

                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {member.customRoleTitle || formatRole(member.role) || ROLE_LABELS[member.role] || member.role}
                        </span>

                        {member.pin ? (
                          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5 text-emerald-600" />
                            <span>PIN</span>
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                        <span>
                          {t('totalExpenses')}:{' '}
                          <strong className="text-rose-600 font-bold">
                            {formatCurrencyAmount(memberExpenses, currencySymbol)}
                          </strong>
                        </span>
                        {memberIncome > 0 && (
                          <span>
                            {t('totalIncome')}:{' '}
                            <strong className="text-emerald-600 font-bold">
                              {formatCurrencyAmount(memberIncome, currencySymbol)}
                            </strong>
                          </span>
                        )}
                        {member.monthlyBudget && member.monthlyBudget > 0 && (
                          <span className="text-slate-600">
                            {t('budgetLimit')}:{' '}
                            <span className="font-semibold">
                              {formatCurrencyAmount(member.monthlyBudget, currencySymbol)}
                            </span>
                          </span>
                        )}
                      </div>

                      {member.notes && (
                        <p className="text-[11px] text-slate-400 mt-1">
                          {member.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    
                    {/* Preview Member View Button */}
                    {onPreviewMember && (
                      <button
                        onClick={() => {
                          onPreviewMember(member.id);
                          onClose();
                        }}
                        title={t('viewMemberTransactions')}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition border border-emerald-200 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{t('previewAccount')}</span>
                      </button>
                    )}

                    <button
                      onClick={() => startEdit(member)}
                      title={t('edit')}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition border border-slate-200 cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {members.length > 1 && (
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `${t('confirmDelete')} (${member.name})?`
                            )
                          ) {
                            onDeleteMember(member.id);
                          }
                        }}
                        title={t('delete')}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition border border-slate-200 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {t('founderModeDesc')}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            {t('close')}
          </button>
        </div>

      </div>
    </div>
  );
};
