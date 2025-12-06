
import React, { useState, useEffect } from 'react';
import { User, PlanType, BUSINESS_SEGMENTS, BusinessSegment, FinancialTransaction } from '../types';
import { X, User as UserIcon, Mail, Calendar, Check, CreditCard, Crown, Coffee, Briefcase, Phone, Pencil, Save, LogOut, Clock, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { storageService } from '../services/storageService';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onPlanChange: (plan: PlanType) => void;
  onProfileUpdate: (user: User) => void;
  onLogout: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, user, onPlanChange, onProfileUpdate, onLogout }) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(user.plan);
  const [isEditing, setIsEditing] = useState(false);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  
  // Edit Form State
  const [formData, setFormData] = useState({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      businessSegment: user.businessSegment
  });

  useEffect(() => {
      if (isOpen) {
          // Reset state on open
          setSelectedPlan(user.plan);
          setIsEditing(false);
          setFormData({
              name: user.name,
              email: user.email,
              phone: user.phone || '',
              businessSegment: user.businessSegment
          });
          // Load transactions
          const txs = storageService.getFinancialTransactions(user.id);
          setTransactions(txs);
      }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handlePlanSave = () => {
    if (selectedPlan !== user.plan) {
      onPlanChange(selectedPlan);
    }
    // onClose handled by parent usually for plans
  };

  const handleProfileSave = (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const updatedUser = storageService.updateUser(user.id, {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              businessSegment: formData.businessSegment
          });
          onProfileUpdate(updatedUser);
          setIsEditing(false);
          alert('Perfil atualizado com sucesso!');
      } catch (err) {
          alert('Erro ao atualizar perfil.');
      }
  };

  const expiryDate = user.subscriptionExpiry 
    ? new Date(user.subscriptionExpiry).toLocaleDateString('pt-BR') 
    : 'Vitalício / Indefinido';

  // Only show plan selection if user is Free, per request
  const showUpgradeOptions = user.plan === 'free';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-slate-400" /> Perfil do Usuário
          </h2>
          <div className="flex items-center gap-2">
             {!isEditing && (
                 <button onClick={() => setIsEditing(true)} className="p-1.5 text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors text-xs font-bold flex items-center gap-1">
                    <Pencil className="w-3 h-3" /> Editar
                 </button>
             )}
             <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
             </button>
          </div>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* User Details - READ OR EDIT MODE */}
          {isEditing ? (
              <form onSubmit={handleProfileSave} className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Nome</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">E-mail</label>
                      <input 
                        type="email" 
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Celular / WhatsApp</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                        placeholder="(00) 00000-0000"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Segmento</label>
                      <select 
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                        value={formData.businessSegment}
                        onChange={e => setFormData({...formData, businessSegment: e.target.value as BusinessSegment})}
                      >
                          {BUSINESS_SEGMENTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                  </div>
                  <div className="flex gap-2 pt-2">
                      <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-2 text-sm text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancelar</button>
                      <button type="submit" className="flex-1 py-2 text-sm text-white bg-brand-600 rounded-lg hover:bg-brand-700 font-bold flex items-center justify-center gap-2">
                          <Save className="w-4 h-4" /> Salvar
                      </button>
                  </div>
              </form>
          ) : (
            <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-bold text-xl shrink-0">
                        {user.name.charAt(0)}
                    </div>
                    <div className="overflow-hidden w-full">
                        <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate flex items-center gap-1 mb-1">
                            <Mail className="w-3 h-3" /> {user.email}
                        </p>
                        {user.phone && (
                            <p className="text-xs text-slate-500 truncate flex items-center gap-1 mb-1">
                                <Phone className="w-3 h-3" /> {user.phone}
                            </p>
                        )}
                        <p className="text-xs text-slate-500 truncate flex items-center gap-1 bg-slate-200 w-fit px-1.5 py-0.5 rounded">
                            <Briefcase className="w-3 h-3" /> {user.businessSegment || 'Não informado'}
                        </p>
                    </div>
                </div>

                {/* Subscription Info */}
                <div className="flex justify-between items-center p-3 rounded-xl border border-slate-100 bg-white">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Plano Atual</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        user.plan === 'pro' ? 'bg-brand-100 text-brand-700' : 
                        'bg-slate-100 text-slate-600'
                        }`}>
                        {user.plan === 'pro' ? 'PROFISSIONAL' : 'GRATUITO'}
                        </span>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Validade</p>
                        <p className="text-sm font-medium text-slate-700 flex items-center justify-end gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" /> {user.plan === 'free' ? '-' : expiryDate}
                        </p>
                    </div>
                </div>
            </div>
          )}

          {/* Payment History / Pending Requests */}
          {!isEditing && transactions.length > 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-2">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Histórico Financeiro</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {transactions.map(tx => (
                          <div key={tx.id} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                              <div>
                                  <p className="text-xs font-bold text-slate-800">{tx.description}</p>
                                  <p className="text-[10px] text-slate-500">{new Date(tx.date).toLocaleDateString()}</p>
                              </div>
                              <div className="text-right">
                                  <p className="text-xs font-bold text-slate-900">R$ {tx.amount.toFixed(2)}</p>
                                  {tx.status === 'paid' && <span className="text-[10px] font-bold text-green-600 flex items-center justify-end gap-1"><Check className="w-3 h-3" /> Pago</span>}
                                  {tx.status === 'pending' && <span className="text-[10px] font-bold text-yellow-600 flex items-center justify-end gap-1"><Clock className="w-3 h-3" /> Pendente</span>}
                                  {tx.status === 'rejected' && <span className="text-[10px] font-bold text-red-600 flex items-center justify-end gap-1"><AlertCircle className="w-3 h-3" /> Recusado</span>}
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          <hr className="border-slate-100" />

          {/* Plan Selection - Only Visible for Free Users AND Not in Edit Mode */}
          {showUpgradeOptions && !isEditing && (
            <div className="animate-in fade-in slide-in-from-top-2">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-slate-400" /> Alterar Plano
                </h3>
                <div className="space-y-2">
                    
                    {/* Free Option */}
                    <label className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${selectedPlan === 'free' ? 'border-slate-400 bg-slate-50 ring-1 ring-slate-400' : 'border-slate-200 hover:border-slate-300'}`}>
                        <input type="radio" name="plan" value="free" checked={selectedPlan === 'free'} onChange={() => setSelectedPlan('free')} className="sr-only" />
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 mr-3">
                            <Coffee className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-slate-700">Gratuito</p>
                            <p className="text-xs text-slate-500">2 gerações/dia</p>
                        </div>
                        {selectedPlan === 'free' && <Check className="w-5 h-5 text-slate-600" />}
                    </label>

                    {/* Pro Option */}
                    <label className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${selectedPlan === 'pro' ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' : 'border-slate-200 hover:border-brand-300'}`}>
                        <input type="radio" name="plan" value="pro" checked={selectedPlan === 'pro'} onChange={() => setSelectedPlan('pro')} className="sr-only" />
                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 mr-3">
                            <Crown className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-brand-700">Profissional</p>
                            <p className="text-xs text-brand-600/80">Ilimitado • R$ 97/ano</p>
                        </div>
                        {selectedPlan === 'pro' && <Check className="w-5 h-5 text-brand-600" />}
                    </label>
                </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-2">
             {!isEditing && showUpgradeOptions && (
                 <Button onClick={handlePlanSave} className="w-full" disabled={selectedPlan === user.plan}>
                    {selectedPlan !== user.plan ? 'Ir para Pagamento / Salvar' : 'Nenhuma alteração de plano'}
                 </Button>
             )}
             
             {!isEditing && !showUpgradeOptions && (
                <div className="text-center p-2 bg-green-50 rounded-lg text-green-700 text-sm font-medium flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" /> Você já é um assinante PRO
                </div>
             )}

             {!isEditing && (
                 <button onClick={onLogout} className="w-full py-2.5 text-sm text-red-500 border border-red-100 hover:bg-red-50 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
                     <LogOut className="w-4 h-4" /> Sair da Conta
                 </button>
             )}
          </div>

        </div>
      </div>
    </div>
  );
};
