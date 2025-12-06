
import React, { useState } from 'react';
import { Button } from './Button';
import { Sparkles, ArrowLeft, Mail, Lock, User, Shield, Crown, Coffee, Briefcase, CheckCircle2 } from 'lucide-react';
import { storageService } from '../services/storageService';
import { BUSINESS_SEGMENTS, BusinessSegment } from '../types';
import { TermsModal } from './TermsModal';

interface AuthScreenProps {
  onSuccess: () => void;
  onBack: () => void;
  isPrePaid?: boolean;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess, onBack, isPrePaid = false }) => {
  const [isLogin, setIsLogin] = useState(!isPrePaid);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '',
    businessSegment: BUSINESS_SEGMENTS[0] as BusinessSegment
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      if (isLogin) {
        storageService.login(formData.email, formData.password);
      } else {
        if (!formData.name) throw new Error("Nome é obrigatório");
        
        // Se isPrePaid for true, passa 'pro' como plano inicial
        const initialPlan = isPrePaid ? 'pro' : 'free';
        
        storageService.register(formData.email, formData.password, formData.name, formData.businessSegment, initialPlan);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Erro na autenticação");
    } finally {
      setLoading(false);
    }
  };

  const autoFill = (email: string, pass: string) => {
    setFormData({ ...formData, email, password: pass });
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 animate-in fade-in zoom-in duration-300">
        
        {!isPrePaid && (
            <button onClick={onBack} className="text-slate-400 hover:text-slate-600 mb-6 flex items-center gap-1 text-sm">
            <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
        )}

        <div className="text-center mb-8">
          {isPrePaid ? (
             <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-4">
                 <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                    <CheckCircle2 className="w-6 h-6" />
                 </div>
                 <h2 className="text-lg font-bold text-green-800">Pagamento Confirmado!</h2>
                 <p className="text-green-700 text-sm">Crie sua conta abaixo para ativar seu acesso <span className="font-bold">PRO Ilimitado</span>.</p>
             </div>
          ) : (
            <>
                <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-6 h-6 fill-current" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                    {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta Grátis'}
                </h2>
                <p className="text-slate-500 text-sm mt-2">
                    {isLogin ? 'Entre para continuar criando.' : 'Comece a gerar ofertas com IA em segundos.'}
                </p>
            </>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
                <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">Nome</label>
                <div className="relative">
                    <User className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">Segmento do Negócio</label>
                    <div className="relative">
                        <Briefcase className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                        <select 
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none appearance-none bg-white text-slate-700 text-sm"
                            value={formData.businessSegment}
                            onChange={e => setFormData({...formData, businessSegment: e.target.value as BusinessSegment})}
                        >
                            {BUSINESS_SEGMENTS.map(segment => (
                                <option key={segment} value={segment}>{segment}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">E-mail</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">Senha</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                placeholder="******"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg text-center font-medium">
              {error}
            </div>
          )}

          <Button type="submit" isLoading={loading} className="w-full py-3 shadow-lg shadow-brand-500/20">
            {isLogin ? 'Entrar' : isPrePaid ? 'Ativar Conta PRO' : 'Criar Conta'}
          </Button>

          <p className="text-xs text-center text-slate-400 mt-2">
            Ao continuar, você concorda com nossos <button type="button" onClick={() => setShowTerms(true)} className="text-brand-600 hover:underline">Termos de Uso</button>.
          </p>
        </form>
        
        {/* --- TEST CREDENTIALS (DEV ONLY) - Hide on prepaid flow --- */}
        {isLogin && !isPrePaid && (
          <div className="mt-8 pt-6 border-t border-slate-100">
             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">Ambiente de Teste (Clique para Preencher)</p>
             <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => autoFill('admin@promogen.com', 'admin123')}
                  className="flex items-center gap-2 p-2 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-700 transition-colors justify-center"
                >
                  <Shield className="w-3 h-3" /> Admin
                </button>
                <button 
                   onClick={() => autoFill('pro@promogen.com', '123456')}
                   className="flex items-center gap-2 p-2 bg-brand-600 text-white rounded-lg text-xs font-medium hover:bg-brand-500 transition-colors justify-center"
                >
                  <Crown className="w-3 h-3" /> Pro
                </button>
                <button 
                   onClick={() => autoFill('free@promogen.com', '123456')}
                   className="flex items-center gap-2 p-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors justify-center"
                >
                  <Coffee className="w-3 h-3" /> Grátis
                </button>
             </div>
          </div>
        )}

        {!isPrePaid && (
            <div className="mt-6 text-center pt-6 border-t border-slate-100">
            <p className="text-sm text-slate-600">
                {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="ml-1 text-brand-600 font-bold hover:underline"
                >
                {isLogin ? 'Cadastre-se' : 'Faça login'}
                </button>
            </p>
            </div>
        )}

        {isPrePaid && isLogin && (
            <div className="mt-4 text-center">
                 <button onClick={() => setIsLogin(false)} className="text-xs text-brand-600 hover:underline">
                    Não tenho conta, quero cadastrar
                 </button>
            </div>
        )}
      </div>
    </div>
  );
};