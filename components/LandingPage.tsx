
import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Zap, LayoutTemplate, Smartphone, ArrowRight, ShieldCheck, MessageCircle, Star, Quote, XCircle, Lock, FileText, MousePointerClick, Download, PenLine, Video, CalendarRange, Palette, Target, ChevronLeft, ChevronRight, Image as ImageIcon, Briefcase, Users, Cpu, Crown, Check } from 'lucide-react';
import { Button } from './Button';
import { storageService } from '../services/storageService';
import { TermsModal } from './TermsModal';

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
}

// --- AUDITORIA DE IMAGENS & ESTILO ---
// Seleção Curada: Imagens com alta faixa dinâmica (HDR), profundidade de campo e iluminação de estúdio.
const STYLE_EXAMPLES = [
  { 
      name: 'Minimalista', 
      prompt: 'Minimalist product white background',
      // Tênis branco com sombra suave e iluminação difusa
      image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=800&q=80', 
      color: 'from-slate-500', 
      sub: 'Clean & Moderno' 
  },
  { 
      name: 'Luxo', 
      prompt: 'Luxury gold perfume bottle',
      // Garrafa com reflexos dourados e fundo escuro dramático
      image: 'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?auto=format&fit=crop&w=800&q=80', 
      color: 'from-yellow-700', 
      sub: 'Gold & Premium' 
  },
  { 
      name: 'Gourmet', 
      prompt: 'Delicious burger food photography',
      // Prato com iluminação lateral forte, fumaça/vapor sugerido, cores ricas
      image: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=800&q=80', 
      color: 'from-orange-700', 
      sub: 'Alta Gastronomia' 
  },
  { 
      name: 'Tech / Neon', 
      prompt: 'Cyberpunk gaming setup',
      // Setup com luzes neon azul/roxo, reflexos em vidro
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80', 
      color: 'from-purple-600', 
      sub: 'Futurista & Gamer' 
  },
  { 
      name: 'Orgânico', 
      prompt: 'Natural spa products leaves',
      // Produto em pedra com folhas e luz solar filtrada (Gobo)
      image: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=800&q=80', 
      color: 'from-green-700', 
      sub: 'Natureza & Frescor' 
  },
  { 
      name: 'Rústico', 
      prompt: 'Coffee on wood table',
      // Textura de madeira escura, iluminação quente (Tungstênio)
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80', 
      color: 'from-amber-800', 
      sub: 'Artesanal & Cozy' 
  },
  { 
      name: 'Pop Art', 
      prompt: 'Vibrant headphones color background',
      // Cores sólidas, sombras duras, alto contraste
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', 
      color: 'from-pink-600', 
      sub: 'Vibrante & Ousado' 
  },
  { 
      name: 'Corporativo', 
      prompt: 'Modern office desk laptop',
      // Vidro, aço, tons de azul frio, profundidade de escritório
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80', 
      color: 'from-blue-700', 
      sub: 'Business & Trust' 
  },
  { 
      name: 'Fitness', 
      prompt: 'Gym weights dark background',
      // Luz de recorte (Rim light), suor/água, fundo preto
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80', 
      color: 'from-red-700', 
      sub: 'Energia & Força' 
  },
   { 
      name: 'Infantil', 
      prompt: 'Colorful toys kid room',
      // Tons pastéis brilhantes, iluminação suave (Softbox), alegria
      image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80', 
      color: 'from-indigo-600', 
      sub: 'Kids & Diversão' 
  },
];

// Card Visual Refinado - Efeito de profundidade e Luz
const StyleCard = ({ style }: { style: any }) => {
    return (
        <div className="group relative aspect-[3/4] rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] shadow-lg border border-slate-100">
            {/* Imagem com Zoom Suave */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
                <img 
                    src={style.image} 
                    alt={`Estilo ${style.name}`} 
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:rotate-1"
                    loading="lazy"
                />
            </div>
            
            {/* Camada de Iluminação (Vignette + Cor da Marca) */}
            <div className={`absolute inset-0 bg-gradient-to-t ${style.color} via-transparent to-black/10 opacity-60 group-hover:opacity-70 transition-opacity duration-500 mix-blend-multiply`}></div>
            
            {/* Camada de Brilho Superior (Glass reflection effect) */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none"></div>

            {/* Conteúdo Flutuante */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                {/* Linha decorativa */}
                <div className="w-12 h-1 bg-white/80 rounded-full mb-3 shadow-[0_0_10px_rgba(255,255,255,0.5)] group-hover:w-20 transition-all duration-500"></div>
                
                <h3 className="font-bold text-2xl text-white tracking-tight drop-shadow-md mb-1">{style.name}</h3>
                <p className="text-white/90 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75">
                   <Sparkles className="w-3 h-3 text-yellow-300" /> {style.sub}
                </p>
            </div>
        </div>
    );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onLogin }) => {
  
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [showTerms, setShowTerms] = useState(false);
  
  // Carousel State
  const [currentStyleIndex, setCurrentStyleIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);

  useEffect(() => {
    const settings = storageService.getSettings();
    const number = settings.whatsappNumber || '5511999999999';
    const message = settings.whatsappMessage || 'Olá, gostaria de saber mais sobre a PromoGen.';
    setWhatsappUrl(`https://wa.me/${number}?text=${encodeURIComponent(message)}`);

    // Responsive Carousel Logic
    const handleResize = () => {
        if (window.innerWidth < 640) {
            setItemsPerView(1);
        } else if (window.innerWidth < 1024) {
            setItemsPerView(2);
        } else {
            setItemsPerView(3);
        }
    };

    handleResize(); // Init
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = () => {
      const maxIndex = STYLE_EXAMPLES.length - itemsPerView;
      setCurrentStyleIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
      const maxIndex = STYLE_EXAMPLES.length - itemsPerView;
      setCurrentStyleIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-brand-100 selection:text-brand-900">
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />

      {/* Navbar (Light & Clean) */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-brand-600 p-2 rounded-xl shadow-brand-500/20 shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">PromoGen <span className="text-brand-600">Agency</span></span>
          </div>
          <div className="flex gap-4 items-center">
            <button onClick={onLogin} className="text-sm font-semibold text-slate-500 hover:text-brand-600 transition-colors hidden sm:block">
              Área do Cliente
            </button>
            <Button onClick={onStart} className="px-6 py-2.5 h-auto text-sm rounded-xl bg-brand-600 text-white hover:bg-brand-700 border-none font-bold shadow-lg shadow-brand-500/20">
              Contratar Agência IA
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section (Light & Professional) */}
      <section className="pt-32 pb-20 px-4 text-center max-w-6xl mx-auto relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-50 via-white to-white -z-10"></div>
        <div className="absolute top-20 right-0 w-96 h-96 bg-purple-50 rounded-full blur-3xl -z-10 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl -z-10 opacity-60"></div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider mb-8 shadow-sm hover:shadow-md transition-all cursor-default animate-in fade-in slide-in-from-bottom-4">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Agência Digital Aberta 24h
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 leading-[1.1]">
          Pare de gastar com <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600">Freelancers Caros</span>
        </h1>
        
        <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
          Contrate nossa <strong>Agência de Inteligência Artificial</strong>. Tenha um Designer, um Redator e um Estrategista trabalhando juntos para criar campanhas completas em segundos.
        </p>
        
        {/* The Agency Team - Visual Representation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
           <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><PenLine className="w-5 h-5" /></div>
              <div className="text-left">
                 <p className="text-xs font-bold text-slate-400 uppercase">Seu</p>
                 <p className="text-sm font-bold text-slate-800">Copywriter</p>
              </div>
           </div>
           <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><Palette className="w-5 h-5" /></div>
              <div className="text-left">
                 <p className="text-xs font-bold text-slate-400 uppercase">Seu</p>
                 <p className="text-sm font-bold text-slate-800">Designer</p>
              </div>
           </div>
           <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100">
              <div className="p-2 bg-amber-100 rounded-lg text-amber-600"><Target className="w-5 h-5" /></div>
              <div className="text-left">
                 <p className="text-xs font-bold text-slate-400 uppercase">Seu</p>
                 <p className="text-sm font-bold text-slate-800">Estrategista</p>
              </div>
           </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button onClick={onStart} className="px-10 py-5 text-lg w-full sm:w-auto shadow-xl shadow-brand-600/20 bg-brand-600 hover:bg-brand-700 border-none transition-transform hover:scale-105">
            <Zap className="w-5 h-5 mr-2 fill-current" /> Contratar Minha Agência IA
          </Button>
          <p className="text-sm text-slate-500 mt-2 sm:mt-0 flex items-center gap-1 font-medium">
             <CheckCircle2 className="w-4 h-4 text-green-500" /> Teste sem compromisso
          </p>
        </div>
      </section>

      {/* Styles Carousel (Light Gray Background) */}
      <section className="py-20 bg-slate-50 relative border-y border-slate-100 overflow-hidden">
        {/* Efeito de luz de fundo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-full bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Portfolio da Agência</h2>
                <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                    Nossa IA não apenas cria imagens; ela entende de luz, composição e emoção. Escolha o estilo que combina com sua marca.
                </p>
            </div>
            
            <div className="relative group px-4 md:px-12">
                <button 
                    onClick={prevSlide}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm hover:bg-white text-slate-700 hover:text-brand-600 p-4 rounded-full shadow-2xl border border-slate-100 transition-all hover:scale-110 group"
                >
                    <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                </button>
                <button 
                    onClick={nextSlide}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm hover:bg-white text-slate-700 hover:text-brand-600 p-4 rounded-full shadow-2xl border border-slate-100 transition-all hover:scale-110 group"
                >
                    <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="overflow-hidden p-8 -m-8">
                    <div 
                        className="flex transition-transform duration-700 cubic-bezier(0.25, 1, 0.5, 1)"
                        style={{ transform: `translateX(-${currentStyleIndex * (100 / itemsPerView)}%)` }}
                    >
                        {STYLE_EXAMPLES.map((style, index) => (
                            <div 
                                key={index} 
                                className="flex-shrink-0 px-4"
                                style={{ width: `${100 / itemsPerView}%` }}
                            >
                                <StyleCard style={style} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* --- AGENCY WORKFLOW (Clean White) --- */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-slate-900">Como sua Nova Agência Trabalha</h2>
                <p className="text-slate-500 mt-2">Um fluxo de trabalho profissional, automatizado para você.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 relative">
                {/* Connector Line (Desktop) */}
                <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-slate-100 z-0"></div>

                {/* Step 1 */}
                <div className="flex flex-col items-center text-center group relative z-10">
                    <div className="w-24 h-24 bg-white border-2 border-slate-100 rounded-3xl flex items-center justify-center mb-6 shadow-sm group-hover:shadow-md transition-all group-hover:border-brand-200 group-hover:-translate-y-1">
                        <Briefcase className="w-10 h-10 text-slate-400 group-hover:text-brand-600 transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">1. O Briefing</h3>
                    <p className="text-slate-600 leading-relaxed text-sm px-4">
                        Você atua como o Diretor. Apenas diga qual produto quer vender e qual o objetivo da campanha.
                    </p>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center text-center group relative z-10">
                    <div className="w-24 h-24 bg-white border-2 border-slate-100 rounded-3xl flex items-center justify-center mb-6 shadow-sm group-hover:shadow-md transition-all group-hover:border-purple-200 group-hover:-translate-y-1">
                        <Cpu className="w-10 h-10 text-slate-400 group-hover:text-purple-600 transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">2. A Produção</h3>
                    <p className="text-slate-600 leading-relaxed text-sm px-4">
                        Nossos agentes de IA (Designer e Redator) criam imagens 8k, textos persuasivos e scripts de venda.
                    </p>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center text-center group relative z-10">
                    <div className="w-24 h-24 bg-white border-2 border-slate-100 rounded-3xl flex items-center justify-center mb-6 shadow-sm group-hover:shadow-md transition-all group-hover:border-green-200 group-hover:-translate-y-1">
                        <Target className="w-10 h-10 text-slate-400 group-hover:text-green-600 transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">3. O Resultado</h3>
                    <p className="text-slate-600 leading-relaxed text-sm px-4">
                        Você recebe a campanha pronta para postar e os roteiros para fechar vendas no WhatsApp.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* Pricing Section (Updated to Highlight Differentiators) */}
      <section className="py-24 bg-slate-50 border-t border-slate-200" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Investimento</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
                Escolha entre contratar um "Estagiário" limitado ou ter a força de uma Agência Completa trabalhando por você 24 horas por dia.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">
            
            {/* Free Plan (The Intern) */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 opacity-80 hover:opacity-100 transition-all hover:shadow-lg">
              <h3 className="text-lg font-bold text-slate-600 mb-2">O Estagiário (Grátis)</h3>
              <p className="text-xs text-slate-400 mb-6 h-8">Para quem está só testando e não se importa com limitações.</p>
              
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-extrabold text-slate-400">R$ 0</span>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-slate-500 text-sm">
                  <CheckCircle2 className="w-4 h-4" /> Apenas 2 artes por dia
                </li>
                <li className="flex items-center gap-3 text-slate-500 text-sm">
                  <CheckCircle2 className="w-4 h-4" /> Qualidade Padrão
                </li>
                 <li className="flex items-center gap-3 text-slate-400 text-sm line-through decoration-slate-300">
                  <XCircle className="w-4 h-4 text-slate-300" /> Sem Vídeos Comerciais
                </li>
                 <li className="flex items-center gap-3 text-slate-400 text-sm line-through decoration-slate-300">
                  <XCircle className="w-4 h-4 text-slate-300" /> Com marca d'água
                </li>
                 <li className="flex items-center gap-3 text-slate-400 text-sm line-through decoration-slate-300">
                  <XCircle className="w-4 h-4 text-slate-300" /> Sem Identidade Visual
                </li>
              </ul>
              <Button onClick={onStart} variant="outline" className="w-full border-slate-200 text-slate-500 hover:bg-slate-50">
                Contratar Estagiário
              </Button>
            </div>

            {/* Pro Plan - Agency Style (The Differentiators) */}
            <div className="bg-white p-10 rounded-3xl border-2 border-brand-500 shadow-2xl relative overflow-hidden transform md:scale-105 z-10">
              <div className="absolute top-0 right-0 bg-brand-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-lg uppercase tracking-wider">
                Recomendado
              </div>
              
              <h3 className="text-xl font-extrabold text-slate-900 mb-1 flex items-center gap-2">
                 Agência Privada <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              </h3>
              <p className="text-xs text-brand-600 font-medium mb-6 h-8">Sua equipe completa de marketing, disponível 24h.</p>
              
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-5xl font-extrabold text-slate-900">R$ 97</span>
                <span className="text-slate-400 text-sm font-medium">/ano</span>
              </div>
              <p className="text-slate-400 text-xs mb-8">
                 Isso é apenas <span className="font-bold text-brand-600">R$ 8,08 por mês</span>
              </p>
              
              <div className="space-y-4 mb-8">
                {/* Diferencial 1: Volume */}
                <div className="flex gap-3">
                    <div className="mt-0.5 bg-green-100 p-1 rounded-full h-fit"><Check className="w-3 h-3 text-green-600" /></div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">Equipe Ilimitada</p>
                        <p className="text-xs text-slate-500">Gere quantas campanhas quiser, sem travas.</p>
                    </div>
                </div>

                {/* Diferencial 2: Video (High Value) */}
                <div className="flex gap-3">
                    <div className="mt-0.5 bg-purple-100 p-1 rounded-full h-fit"><Video className="w-3 h-3 text-purple-600" /></div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">Produtora de Vídeo (Veo)</p>
                        <p className="text-xs text-slate-500">Crie comerciais de TV cinematográficos.</p>
                    </div>
                </div>

                {/* Diferencial 3: Branding */}
                <div className="flex gap-3">
                    <div className="mt-0.5 bg-brand-100 p-1 rounded-full h-fit"><Palette className="w-3 h-3 text-brand-600" /></div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">Sua Marca em Tudo</p>
                        <p className="text-xs text-slate-500">Logo, cores e telefone aplicados automaticamente.</p>
                    </div>
                </div>
                
                 {/* Diferencial 4: Whitelabel */}
                <div className="flex gap-3">
                    <div className="mt-0.5 bg-blue-100 p-1 rounded-full h-fit"><ShieldCheck className="w-3 h-3 text-blue-600" /></div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">100% Profissional</p>
                        <p className="text-xs text-slate-500">Sem marcas d'água. Arte pronta para postar.</p>
                    </div>
                </div>
              </div>

              <Button onClick={onStart} variant="primary" className="w-full py-4 text-lg bg-brand-600 hover:bg-brand-700 border-none shadow-xl shadow-brand-500/30 group">
                Contratar Minha Agência <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-center text-[10px] text-slate-400 mt-3 flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" /> Pagamento Único • Acesso por 1 Ano
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer (Clean & Corporate) */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
           <div className="flex justify-center items-center gap-2 mb-6 opacity-50 grayscale hover:grayscale-0 transition-all">
               <div className="bg-slate-200 p-1.5 rounded-lg">
                   <Sparkles className="w-4 h-4 text-slate-500" />
               </div>
               <span className="font-bold text-slate-500">PromoGen Agency</span>
           </div>
           
           <div className="flex justify-center items-center gap-6 mb-8">
             <button onClick={() => setShowTerms(true)} className="text-sm text-slate-500 hover:text-brand-600 transition-colors flex items-center gap-1 font-medium">
                <FileText className="w-4 h-4" /> Termos de Serviço da Agência
             </button>
           </div>
          <p className="text-slate-400 text-xs">&copy; 2024 PromoGen IA. Todos os direitos reservados. Fotos: Unsplash.</p>
        </div>
      </footer>

      {/* WhatsApp Support Button */}
      <a 
        href={whatsappUrl}
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-[#25D366] hover:bg-[#20bd5a] text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-110 z-50 flex items-center justify-center group"
        title="Falar com Suporte"
      >
        <MessageCircle className="w-7 h-7 fill-current" />
        <span className="absolute right-full mr-3 bg-white text-slate-700 shadow-md text-xs font-bold py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Fale com um Humano
        </span>
      </a>
    </div>
  );
};
