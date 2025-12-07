
import React from 'react';
import { X, CreditCard, ExternalLink, Video, CheckCircle2, AlertTriangle, ChevronRight } from 'lucide-react';

interface VeoTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VeoTutorialModal: React.FC<VeoTutorialModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-purple-600 px-6 py-4 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-purple-200" /> Como Ativar a Geração de Vídeo?
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-purple-500 rounded-full transition-colors text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3">
             <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
             <div>
                <h3 className="text-sm font-bold text-yellow-800">Requisito Importante</h3>
                <p className="text-sm text-yellow-700 mt-1 leading-relaxed">
                   O modelo de vídeo <strong>Veo</strong> é um recurso premium do Google. Ao contrário do texto, ele <strong>não funciona com chaves gratuitas</strong>. Você precisa de uma chave vinculada a um projeto com faturamento (Billing) ativado no Google Cloud.
                </p>
             </div>
          </div>

          <div className="space-y-4">
             <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Passo a Passo</h3>
             
             {/* Step 1 */}
             <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 border border-slate-200">1</div>
                <div className="flex-1">
                   <h4 className="font-bold text-slate-800">Crie um Projeto no Google Cloud</h4>
                   <p className="text-sm text-slate-600 mt-1">Acesse o console e crie um novo projeto.</p>
                   <a href="https://console.cloud.google.com/projectcreate" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-brand-600 font-bold mt-2 hover:underline">
                      Ir para Google Cloud Console <ExternalLink className="w-3 h-3" />
                   </a>
                </div>
             </div>

             {/* Step 2 */}
             <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 border border-slate-200">2</div>
                <div className="flex-1">
                   <h4 className="font-bold text-slate-800 flex items-center gap-2">
                      Ative o Faturamento (Billing) <CreditCard className="w-4 h-4 text-green-600" />
                   </h4>
                   <p className="text-sm text-slate-600 mt-1">
                      No menu lateral do Google Cloud, vá em "Faturamento" e vincule um cartão de crédito ao projeto criado.
                      <br/>
                      <span className="text-xs text-slate-400 italic">* O Google geralmente oferece créditos gratuitos para novos usuários, mas o cartão é obrigatório para liberar o Veo.</span>
                   </p>
                </div>
             </div>

             {/* Step 3 */}
             <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 border border-slate-200">3</div>
                <div className="flex-1">
                   <h4 className="font-bold text-slate-800">Gere a Chave no AI Studio</h4>
                   <p className="text-sm text-slate-600 mt-1">
                      Vá para o Google AI Studio. Clique em <strong>"Get API Key"</strong> e depois em <strong>"Create API Key in existing project"</strong>.
                   </p>
                   <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
                      ⚠️ <strong>Crucial:</strong> Selecione o projeto que você configurou o cartão de crédito no passo anterior. Não use "Create in new project" se ele criar um projeto sem billing.
                   </div>
                   <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-brand-600 font-bold mt-2 hover:underline">
                      Ir para AI Studio <ExternalLink className="w-3 h-3" />
                   </a>
                </div>
             </div>

             {/* Step 4 */}
             <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-600 border border-purple-200">4</div>
                <div className="flex-1">
                   <h4 className="font-bold text-slate-800">Cole a Chave no PromoGen</h4>
                   <p className="text-sm text-slate-600 mt-1">
                      Copie a chave gerada (começa com "AIza...") e cole no campo "Chave Veo/Vídeo" no seu perfil.
                   </p>
                </div>
             </div>
          </div>

        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
           <button onClick={onClose} className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition-colors">
              Entendi
           </button>
        </div>
      </div>
    </div>
  );
};
