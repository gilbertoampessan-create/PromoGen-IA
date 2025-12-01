
import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, Crown, ShieldCheck, Briefcase, ExternalLink, MessageCircle } from 'lucide-react';
import { Button } from './Button';
import { storageService } from '../services/storageService';
import { PlanType } from '../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  isUpgradeTriggered: boolean; // If true, shows "Quota Exceeded" message
  initialPlan?: PlanType; // New prop to pre-select plan
}

type ModalStep = 'select' | 'payment_pending' | 'success';

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, userId, isUpgradeTriggered, initialPlan }) => {
  const [step, setStep] = useState<ModalStep>('select');
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('pro');

  // Initialize plan based on prop, default to 'pro' if free or undefined passed
  useEffect(() => {
    if (isOpen) {
        if (initialPlan && initialPlan !== 'free') {
            setSelectedPlan(initialPlan);
        } else {
            setSelectedPlan('pro');
        }
    }
  }, [isOpen, initialPlan]);

  if (!isOpen) return null;

  const handleSubscribeClick = () => {
      // 1. Get correct link from dynamic settings
      const settings = storageService.getSettings();
      const link = selectedPlan === 'agency' ? settings.agencyPlanLink : settings.proPlanLink;
      
      // 2. Open in new tab
      if (link && link !== '') {
          window.open(link, '_blank');
      } else {
          alert("Erro: Link de pagamento não configurado pelo administrador.");
          return;
      }
      
      // 3. Change step to waiting
      setStep('payment_pending');
  };

  const handleWhatsAppContact = () => {
      const settings = storageService.getSettings();
      const planName = selectedPlan === 'agency' ? 'Plano Agência' : 'Plano Profissional';
      const message = `Olá! Acabei de fazer o pagamento do *${planName}* no PromoGen. Segue meu email de cadastro (${storageService.getCurrentUser()?.email}) para liberação do acesso.`;
      
      const whatsappUrl = `https://wa.me/${settings.whatsappNumber || '5511999999999'}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      onClose(); // Fecha o modal pois o fluxo continua fora
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors z-10">
          <X className="w-5 h-5 text-slate-500" />
        </button>

        {step === 'success' ? (
             <div className="p-12 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <Check className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Pagamento Confirmado!</h2>
                <p className="text-slate-600">Seu plano {selectedPlan === 'agency' ? 'Agência' : 'Profissional'} está ativo.</p>
            </div>
        ) : step === 'payment_pending' ? (
            <div className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <ExternalLink className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Finalize o Pagamento</h2>
                <p className="text-slate-600 mb-6 text-sm">
                    Abrimos a página de pagamento seguro do Mercado Pago em uma nova aba.
                    <br/><br/>
                    <strong>Após concluir o pagamento, envie o comprovante no nosso WhatsApp para liberarmos seu acesso imediatamente.</strong>
                </p>
                
                <Button 
                    onClick={handleWhatsAppContact} 
                    className="w-full py-4 bg-[#25D366] hover:bg-[#20bd5a] shadow-lg shadow-green-500/20 text-white border-none font-bold"
                    icon={<MessageCircle className="w-5 h-5" />}
                >
                    Enviar Comprovante no WhatsApp
                </Button>
                
                <button 
                    onClick={() => setStep('select')}
                    className="mt-4 text-sm text-slate-400 hover:text-slate-600 underline"
                >
                    Voltar e escolher outro plano
                </button>
            </div>
        ) : (
          <>
            {/* Header with visual distinction */}
            <div className={`${selectedPlan === 'agency' ? 'bg-purple-900' : 'bg-slate-900'} p-8 text-center relative overflow-hidden transition-colors duration-300`}>
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 0%, transparent 70%)'}}></div>
                <div className="relative z-10">
                    <div className="inline-flex p-3 bg-white/10 rounded-2xl mb-4 backdrop-blur-md ring-1 ring-white/20">
                        {selectedPlan === 'agency' ? (
                             <Briefcase className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                        ) : (
                             <Crown className="w-8 h-8 text-brand-400 fill-brand-400" />
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {isUpgradeTriggered ? 'Limite Diário Atingido' : (selectedPlan === 'agency' ? 'Plano Agência' : 'Seja PromoGen PRO')}
                    </h2>
                    <p className="text-slate-300 text-sm max-w-xs mx-auto">
                        {isUpgradeTriggered 
                            ? 'Você usou suas 2 gerações gratuitas de hoje. Desbloqueie o poder ilimitado agora.'
                            : 'Escolha o plano ideal para você.'}
                    </p>
                </div>
            </div>

            <div className="p-8">
                {/* Plan Toggle - High Contrast */}
                <div className="flex bg-slate-100 p-1.5 rounded-xl mb-6">
                    <button 
                        onClick={() => setSelectedPlan('pro')} 
                        className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${selectedPlan === 'pro' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        Profissional
                    </button>
                    <button 
                        onClick={() => setSelectedPlan('agency')} 
                        className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${selectedPlan === 'agency' ? 'bg-purple-900 text-white shadow-md' : 'text-slate-500 hover:text-purple-900'}`}
                    >
                        Agência (Multi-marcas)
                    </button>
                </div>

                {selectedPlan === 'pro' ? (
                    <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                        <div className="flex items-center justify-center mb-8">
                            <span className="text-5xl font-extrabold text-slate-900">R$ 97</span>
                            <div className="ml-3 text-left leading-tight">
                                <span className="block text-sm font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full w-fit">ANUAL</span>
                                <span className="text-xs text-slate-500">Apenas R$ 8,08 / mês</span>
                            </div>
                        </div>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                                <div className="p-1 bg-green-100 rounded-full"><Check className="w-3 h-3 text-green-600" /></div>
                                Gerações Ilimitadas (Adeus cotas!)
                            </li>
                             <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                                <div className="p-1 bg-green-100 rounded-full"><Check className="w-3 h-3 text-green-600" /></div>
                                IA Avançada (Ultra-HD)
                            </li>
                             <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                                <div className="p-1 bg-green-100 rounded-full"><Check className="w-3 h-3 text-green-600" /></div>
                                Sem Marca D'água
                            </li>
                        </ul>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                         <div className="flex items-center justify-center mb-8">
                            <span className="text-5xl font-extrabold text-purple-900">R$ 197</span>
                            <div className="ml-3 text-left leading-tight">
                                <span className="block text-sm font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full w-fit">MENSAL</span>
                                <span className="text-xs text-slate-500">Para Agências</span>
                            </div>
                        </div>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                                <div className="p-1 bg-yellow-100 rounded-full"><Check className="w-3 h-3 text-yellow-600" /></div>
                                <strong>Tudo do Plano Pro</strong>
                            </li>
                             <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                                <div className="p-1 bg-yellow-100 rounded-full"><Check className="w-3 h-3 text-yellow-600" /></div>
                                <strong>Multi-Marcas (Salve logos de clientes)</strong>
                            </li>
                             <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                                <div className="p-1 bg-yellow-100 rounded-full"><Check className="w-3 h-3 text-yellow-600" /></div>
                                Alternância Rápida de Identidade
                            </li>
                        </ul>
                    </div>
                )}

                {/* CTA Button - High Contrast & Extra Bold */}
                <Button 
                    onClick={handleSubscribeClick} 
                    className={`w-full py-4 text-lg font-extrabold shadow-xl ring-4 transition-all ${selectedPlan === 'agency' ? '!bg-purple-700 hover:!bg-purple-800 shadow-purple-900/20 ring-purple-50' : '!bg-brand-700 hover:!bg-brand-800 shadow-brand-900/20 ring-brand-50'}`}
                >
                    <Sparkles className="w-5 h-5 mr-2 fill-current" />
                    {selectedPlan === 'agency' ? 'Ir para Pagamento (R$ 197)' : 'Ir para Pagamento (R$ 97)'}
                </Button>
                
                <p className="mt-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Pagamento processado pelo Mercado Pago
                </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};