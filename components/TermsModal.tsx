import React, { useEffect, useState } from 'react';
import { X, FileText } from 'lucide-react';
import { storageService } from '../services/storageService';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  const [terms, setTerms] = useState('');

  useEffect(() => {
    if (isOpen) {
      const settings = storageService.getSettings();
      setTerms(settings.termsOfService);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-600" /> Termos de Uso
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto whitespace-pre-wrap text-sm text-slate-600 leading-relaxed font-sans">
          {terms || "Termos de uso não definidos pelo administrador."}
        </div>
        <div className="p-4 border-t border-slate-100 text-right bg-slate-50 rounded-b-2xl sticky bottom-0 z-10">
          <button onClick={onClose} className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-bold transition-colors">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};