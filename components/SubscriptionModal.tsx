
import React, { useState } from 'react';
import { X, Sparkles, Check, Crown, ShieldCheck, ExternalLink, MessageCircle, Clock } from 'lucide-react';
import { Button } from './Button';
import { storageService } from '../services/storageService';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  isUpgradeTriggered: boolean; // If true, shows "Quota Exceeded" message
}

type ModalStep = 'select' | 'payment_pending' | 'success';

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, userId, isUpgradeTriggered }) => {
  const [step, setStep] = useState<ModalStep>('select');

  if (!isOpen) return null;

  const handleSubscribeClick = () => {
      // 1. Get correct link from dynamic settings
      const settings = storageService.getSettings();
      const link = settings.proPlanLink;
      
      // 2. Open in new tab
      if (link && link !== '') {
          window.open(link, '_blank');
      } else {
          alert("Erro: Link de pagamento não configurado pelo administrador.");
          return;
      }
      
      // 3. Register pending transaction
      const currentUser = storageService.getCurrentUser();
      if (currentUser) {
          storageService.createSubscriptionTransaction(userId, currentUser.name);
      }

      // 4. Change step to waiting
      setStep('payment_pending');
  };

  const handleWhatsAppContact = () => {
      const settings = storageService.getSettings();
      const message = `Olá! Acabei de fazer o pagamento do *Plano Profissional* no PromoGen. Segue meu email de cadastro (${storageService.getCurrentUser()?.email}) para liberação do acesso.`;
      
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
                <p className="text-slate-600">Seu plano Profissional está ativo.</p>
            </div>
        ) : step === 'payment_pending' ? (
            <div className="p-8 text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <Clock className="w-8 h-8 text-yellow-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Pagamento Iniciado</h2>
                <p className="text-slate-600 mb-6 text-sm">
                    Sua solicitação foi registrada no sistema.
                    <br/>
                    Assim que nosso time financeiro confirmar o pagamento, seu plano será liberado automaticamente.
                </p>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Quer acelerar?</p>
                    <Button 
                        onClick={handleWhatsAppContact} 
                        className="w-full py-3 bg-[#25D366] hover:bg-[#20bd5a] shadow-lg shadow-green-500/20 text-white border-none font-bold text-sm"
                        icon={<MessageCircle className="w-4 h-4" />}
                    >
                        Enviar Comprovante
                    </Button>
                </div>
                
                <button 
                    onClick={onClose}
                    className="mt-2 text-sm text-slate-400 hover:text-slate-600 underline"
                >
                    Fechar e Aguardar
                </button>
            </div>
        ) : (
          <>
            {/* Header with visual distinction */}
            <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 0%, transparent 70%)'}}></div>
                <div className="relative z-10">
                    <div className="inline-flex p-3 bg-white/10 rounded-2xl mb-4 backdrop-blur-md ring-1 ring-white/20">
                         <Crown className="w-8 h-8 text-brand-400 fill-brand-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {isUpgradeTriggered ? 'Limite Diário Atingido' : 'Seja PromoGen PRO'}
                    </h2>
                    <p className="text-slate-300 text-sm max-w-xs mx-auto">
                        {isUpgradeTriggered 
                            ? 'Você usou suas 2 gerações gratuitas de hoje. Desbloqueie o poder ilimitado agora.'
                            : 'A escolha inteligente para quem quer vender mais.'}
                    </p>
                </div>
            </div>

            <div className="p-8">
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

                {/* CTA Button */}
                <Button 
                    onClick={handleSubscribeClick} 
                    className="w-full py-4 text-lg font-extrabold shadow-xl ring-4 transition-all !bg-brand-700 hover:!bg-brand-800 shadow-brand-900/20 ring-brand-50"
                >
                    <Sparkles className="w-5 h-5 mr-2 fill-current" />
                    Ir para Pagamento (R$ 97)
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
