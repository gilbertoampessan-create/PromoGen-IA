
import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Zap, LayoutTemplate, Smartphone, ArrowRight, ShieldCheck, MessageCircle, Star, Quote, XCircle, Lock, FileText, MousePointerClick, Download, PenLine, Video, CalendarRange, Palette, Target, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { storageService } from '../services/storageService';
import { TermsModal } from './TermsModal';

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
}

const STYLE_EXAMPLES = [
  { name: 'Minimalista', prompt: 'minimalist clean vast white space soft shadows studio', color: 'from-gray-900', sub: 'Limpo e Moderno' },
  { name: 'Luxo / Gold', prompt: 'luxury elegant gold and black textures marble cinematic bokeh', color: 'from-yellow-600', sub: 'Joias e Premium' },
  { name: 'Gourmet', prompt: 'delicious gourmet food photography steam fresh ingredients warm', color: 'from-orange-600', sub: 'Restaurantes' },
  { name: 'Tech / Neon', prompt: 'futuristic cyberpunk neon lights blue and purple glow sleek', color: 'from-blue-600', sub: 'Eletrônicos e Games' },
  { name: 'Orgânico', prompt: 'nature eco friendly green leaves sunlight wooden texture', color: 'from-green-600', sub: 'Produtos Naturais' },
  { name: 'Rústico', prompt: 'rustic vintage aged wood background warm tones cozy atmosphere', color: 'from-amber-700', sub: 'Cafés e Artesanato' },
  { name: 'Pop Art', prompt: 'pop art vibrant colors halftone patterns comic book style', color: 'from-pink-500', sub: 'Moda Jovem' },
  { name: 'Corporativo', prompt: 'corporate professional office background glass and steel blue', color: 'from-slate-700', sub: 'Serviços e B2B' },
  { name: 'Fitness', prompt: 'fitness gym atmosphere dynamic energy sweat dark background', color: 'from-red-600', sub: 'Suplementos e Gym' },
  { name: 'Infantil', prompt: 'kids playful pastel colors balloons toys background soft lighting', color: 'from-purple-500', sub: 'Brinquedos e Roupas' },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onLogin }) => {
  
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [showTerms, setShowTerms] = useState(false);
  
  // Carousel State
  const [currentStyleIndex, setCurrentStyleIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);

  useEffect(() => {
    const settings = storageService.getSettings();
    const number = settings.whatsappNumber || '5511999999999';
    const message = settings.whatsappMessage || 'Olá, gostaria de saber mais sobre o PromoGen.';
    setWhatsappUrl(`https://wa.me/${number}?text=${encodeURIComponent(message)}`);

    // Responsive Carousel Logic
    const handleResize = () => {
        if (window.innerWidth < 768) {
            setItemsPerView(1);
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
    <div className="min-h-screen bg-slate-50 font-sans">
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />

      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-600 fill-brand-100" />
            <span className="text-xl font-bold text-slate-900">PromoGen IA</span>
          </div>
          <div className="flex gap-4">
            <button onClick={onLogin} className="text-sm font-semibold text-slate-600 hover:text-brand-600">
              Entrar
            </button>
            <Button onClick={onStart} className="px-5 py-2 h-auto text-sm rounded-lg">
              Começar Agora
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider mb-6 animate-in fade-in slide-in-from-bottom-4">
          <Video className="w-3 h-3 fill-current" /> Novo: Geração de Vídeo com Veo
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
          Crie Ofertas, Imagens e <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-brand-600">Vídeos</span> com IA
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto">
          A primeira plataforma que gera <strong>campanhas completas</strong>: Banner promocional, legendas, scripts de venda, calendário de posts e vídeos comerciais cinematográficos. Tudo em segundos.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button onClick={onStart} className="px-8 py-4 text-lg w-full sm:w-auto shadow-xl shadow-brand-500/20 bg-slate-900 hover:bg-slate-800">
            Criar Minha Campanha
          </Button>
          <p className="text-sm text-slate-400 mt-2 sm:mt-0 flex items-center gap-1">
             <CheckCircle2 className="w-3 h-3 text-green-500" /> Teste Grátis Disponível
          </p>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900">Do Texto à Venda em 3 Passos</h2>
                <p className="text-slate-500 mt-2">Você descreve, a IA cria tudo.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
                {/* Connecting Line (Desktop) */}
                <div className="hidden md:block absolute top-12 left-20 right-20 h-0.5 bg-gradient-to-r from-slate-200 via-brand-200 to-slate-200 -z-0"></div>

                {/* Step 1 */}
                <div className="relative z-10 flex flex-col items-center text-center group">
                    <div className="w-24 h-24 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center shadow-sm group-hover:border-brand-500 group-hover:shadow-brand-100 group-hover:scale-110 transition-all duration-300 mb-6">
                        <PenLine className="w-10 h-10 text-slate-400 group-hover:text-brand-600 transition-colors" />
                    </div>
                    <div className="bg-white px-2">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">1. Descreva a Oferta</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Ex: "Tênis de corrida neon por R$ 299". Escolha um estilo (Luxo, Pop, Rústico...) ou deixe a IA livre.
                        </p>
                    </div>
                </div>

                {/* Step 2 */}
                <div className="relative z-10 flex flex-col items-center text-center group">
                    <div className="w-24 h-24 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center shadow-sm group-hover:border-purple-500 group-hover:shadow-purple-100 group-hover:scale-110 transition-all duration-300 mb-6">
                        <Sparkles className="w-10 h-10 text-slate-400 group-hover:text-purple-600 transition-colors" />
                    </div>
                    <div className="bg-white px-2">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">2. Magia da IA</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Geramos a imagem do produto, o texto persuasivo (copy), scripts de WhatsApp e até um vídeo comercial.
                        </p>
                    </div>
                </div>

                {/* Step 3 */}
                <div className="relative z-10 flex flex-col items-center text-center group">
                    <div className="w-24 h-24 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center shadow-sm group-hover:border-green-500 group-hover:shadow-green-100 group-hover:scale-110 transition-all duration-300 mb-6">
                        <Download className="w-10 h-10 text-slate-400 group-hover:text-green-600 transition-colors" />
                    </div>
                    <div className="bg-white px-2">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">3. Publique e Lucre</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Baixe os materiais prontos para Feed, Stories e Status. Use nosso calendário de 5 dias para vender mais.
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Features Grid (Updated) */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Muito Mais que um Gerador de Imagens</h2>
            <p className="text-slate-600">Uma agência de marketing completa no seu bolso.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-brand-200 transition-all group">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Vídeos Comerciais (Veo)</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Transforme sua oferta em um vídeo cinematográfico usando o modelo Google Veo. Ideal para Reels e TikTok.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-brand-200 transition-all group">
              <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center text-brand-600 mb-4 group-hover:scale-110 transition-transform">
                <Palette className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">10+ Estilos Visuais</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Do Minimalista ao Cyberpunk, do Rústico ao Infantil. Ou use o modo "Livre" para criar qualquer coisa que imaginar.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-brand-200 transition-all group">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-4 group-hover:scale-110 transition-transform">
                <CalendarRange className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Planejamento Semanal</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                A IA cria um calendário de 5 dias com ideias de conteúdo para manter sua audiência engajada após a oferta.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-brand-200 transition-all group">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Scripts de Venda</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Receba roteiros prontos para o WhatsApp: como abordar, como quebrar a objeção "tá caro" e como fechar a venda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Styles Carousel */}
      <section className="py-16 bg-white overflow-hidden border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-slate-900">Qualidade de Estúdio (8k)</h2>
                <p className="text-slate-500">Mais de 10 estilos prontos para sua marca</p>
            </div>
            
            <div className="relative group">
                {/* Navigation Buttons */}
                <button 
                    onClick={prevSlide}
                    className="absolute left-0 md:-left-12 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-slate-700 p-3 rounded-full shadow-lg backdrop-blur-sm border border-slate-200 transition-all hover:scale-110"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                    onClick={nextSlide}
                    className="absolute right-0 md:-right-12 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-slate-700 p-3 rounded-full shadow-lg backdrop-blur-sm border border-slate-200 transition-all hover:scale-110"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>

                {/* Slider Track */}
                <div className="overflow-hidden rounded-2xl p-2 -m-2">
                    <div 
                        className="flex transition-transform duration-500 ease-out"
                        style={{ transform: `translateX(-${currentStyleIndex * (100 / itemsPerView)}%)` }}
                    >
                        {STYLE_EXAMPLES.map((style, index) => (
                            <div 
                                key={index} 
                                className="flex-shrink-0 px-2"
                                style={{ width: `${100 / itemsPerView}%` }}
                            >
                                <div className="group relative aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-slate-100">
                                    <img 
                                        src={`https://pollinations.ai/p/${encodeURIComponent(style.prompt)}?width=600&height=600&nologo=true&seed=${index + 42}`} 
                                        alt={`Estilo ${style.name}`} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                    <div className={`absolute inset-0 bg-gradient-to-t ${style.color} via-transparent to-transparent opacity-0 group-hover:opacity-90 transition-opacity flex flex-col justify-end p-6`}>
                                        <span className="text-white font-bold text-xl">{style.name}</span>
                                        <span className="text-white/80 text-sm">{style.sub}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="flex justify-center mt-6 gap-2">
                {Array.from({ length: Math.ceil(STYLE_EXAMPLES.length - itemsPerView + 1) }).map((_, idx) => (
                    <div 
                        key={idx} 
                        className={`h-1.5 rounded-full transition-all duration-300 ${currentStyleIndex === idx ? 'w-8 bg-brand-600' : 'w-2 bg-slate-300'}`}
                    />
                ))}
            </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-slate-50 border-t border-slate-200" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Escolha seu Poder de Venda</h2>
            <p className="text-slate-600">Comece grátis e escale quando quiser</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Iniciante</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-slate-900">R$ 0</span>
                <span className="text-slate-500">/mês</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-slate-600 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-500" /> 2 gerações de imagem por dia
                </li>
                <li className="flex items-center gap-3 text-slate-600 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-500" /> Copywriting básico
                </li>
                 <li className="flex items-center gap-3 text-slate-400 text-sm">
                  <XCircle className="w-5 h-5 text-slate-300" /> Sem Geração de Vídeo
                </li>
                <li className="flex items-center gap-3 text-slate-400 text-sm">
                  <XCircle className="w-5 h-5 text-slate-300" /> Sem Estilos Premium (10+)
                </li>
                <li className="flex items-center gap-3 text-slate-400 text-sm">
                  <XCircle className="w-5 h-5 text-slate-300" /> Sem Scripts de Venda/Calendário
                </li>
                 <li className="flex items-center gap-3 text-slate-400 text-sm">
                  <XCircle className="w-5 h-5 text-slate-300" /> Com marca d'água
                </li>
              </ul>
              <Button onClick={onStart} variant="outline" className="w-full">
                Começar Grátis
              </Button>
            </div>

            {/* Pro Plan */}
            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden transform md:-translate-y-4">
              <div className="absolute top-0 right-0 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                MAIS POPULAR
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Profissional</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-extrabold text-white">R$ 97</span>
                <span className="text-slate-400">/ano</span>
              </div>
              <p className="text-slate-400 text-sm mb-6">Equivalente a R$ 8,08/mês</p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-white text-sm">
                  <CheckCircle2 className="w-5 h-5 text-brand-400" /> <strong>Gerações de Imagem Ilimitadas</strong>
                </li>
                <li className="flex items-center gap-3 text-white text-sm">
                   <div className="bg-white/10 p-1 rounded">
                      <Video className="w-3 h-3 text-purple-400 fill-current" />
                   </div>
                   <strong>Geração de Vídeo (Veo 3)</strong>
                </li>
                <li className="flex items-center gap-3 text-white text-sm">
                  <CheckCircle2 className="w-5 h-5 text-brand-400" /> <strong>Modo Campanha</strong> (Scripts + Calendário)
                </li>
                <li className="flex items-center gap-3 text-white text-sm">
                  <CheckCircle2 className="w-5 h-5 text-brand-400" /> <strong>10+ Estilos & Modo Livre</strong>
                </li>
                <li className="flex items-center gap-3 text-white text-sm">
                  <CheckCircle2 className="w-5 h-5 text-brand-400" /> <strong>Modo Remix</strong> (Image-to-Image)
                </li>
                 <li className="flex items-center gap-3 text-white text-sm">
                  <CheckCircle2 className="w-5 h-5 text-brand-400" /> <strong>Sem marca d'água</strong>
                </li>
              </ul>
              <Button onClick={onStart} variant="primary" className="w-full py-4 text-lg bg-brand-500 hover:bg-brand-400 border-none">
                Assinar Agora <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <div className="mt-4 flex justify-center items-center gap-2 text-xs text-slate-400">
                <Zap className="w-3 h-3 text-yellow-400" /> Traga sua chave API (BYOK) para máxima performance
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
           <div className="flex justify-center items-center gap-6 mb-4">
             <button onClick={() => setShowTerms(true)} className="text-sm text-slate-500 hover:text-brand-600 transition-colors flex items-center gap-1">
                <FileText className="w-4 h-4" /> Termos de Uso
             </button>
           </div>
          <p className="text-slate-500 text-sm">&copy; 2024 PromoGen IA. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* WhatsApp Support Button */}
      <a 
        href={whatsappUrl}
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-[#25D366] hover:bg-[#20bd5a] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 z-50 flex items-center justify-center group"
        title="Falar com Suporte"
      >
        <MessageCircle className="w-7 h-7 fill-current" />
        <span className="absolute right-full mr-3 bg-slate-900 text-white text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Suporte WhatsApp
        </span>
      </a>
    </div>
  );
};
