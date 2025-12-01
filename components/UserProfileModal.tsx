
import React, { useState } from 'react';
import { User, PlanType } from '../types';
import { X, User as UserIcon, Mail, Calendar, Check, CreditCard, Crown, Briefcase, Coffee } from 'lucide-react';
import { Button } from './Button';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onPlanChange: (plan: PlanType) => void;
  onLogout: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, user, onPlanChange, onLogout }) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(user.plan);

  if (!isOpen) return null;

  const handleSave = () => {
    if (selectedPlan !== user.plan) {
      onPlanChange(selectedPlan);
    }
    onClose();
  };

  const expiryDate = user.subscriptionExpiry 
    ? new Date(user.subscriptionExpiry).toLocaleDateString('pt-BR') 
    : 'Vitalício / Indefinido';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-slate-400" /> Perfil do Usuário
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* User Details */}
          <div className="space-y-3">
             <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-bold text-lg">
                    {user.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {user.email}
                    </p>
                </div>
             </div>

             {/* Subscription Info */}
             <div className="flex justify-between items-center p-3 rounded-xl border border-slate-100 bg-white">
                 <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Plano Atual</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      user.plan === 'pro' ? 'bg-brand-100 text-brand-700' : 
                      user.plan === 'agency' ? 'bg-purple-100 text-purple-700' : 
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {user.plan === 'pro' ? 'PROFISSIONAL' : user.plan === 'agency' ? 'AGÊNCIA' : 'GRATUITO'}
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

          <hr className="border-slate-100" />

          {/* Plan Selection */}
          <div>
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

                {/* Agency Option */}
                <label className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${selectedPlan === 'agency' ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500' : 'border-slate-200 hover:border-purple-300'}`}>
                    <input type="radio" name="plan" value="agency" checked={selectedPlan === 'agency'} onChange={() => setSelectedPlan('agency')} className="sr-only" />
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
                        <Briefcase className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-purple-700">Agência</p>
                        <p className="text-xs text-purple-600/80">Multi-marcas • R$ 197/mês</p>
                    </div>
                    {selectedPlan === 'agency' && <Check className="w-5 h-5 text-purple-600" />}
                </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-2">
             <Button onClick={handleSave} className="w-full" disabled={selectedPlan === user.plan}>
                {selectedPlan !== user.plan ? 'Ir para Pagamento / Salvar' : 'Nenhuma alteração'}
             </Button>
             
             <button onClick={onLogout} className="text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 py-2 rounded-lg transition-colors">
                Sair da Conta
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};