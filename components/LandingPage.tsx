
import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Zap, LayoutTemplate, Smartphone, ArrowRight, ShieldCheck, MessageCircle, Star, Quote, Building2, Briefcase } from 'lucide-react';
import { Button } from './Button';
import { storageService } from '../services/storageService';

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onLogin }) => {
  
  const [whatsappUrl, setWhatsappUrl] = useState('');

  useEffect(() => {
    const settings = storageService.getSettings();
    const number = settings.whatsappNumber || '5511999999999';
    const message = settings.whatsappMessage || 'Olá, gostaria de saber mais sobre o PromoGen.';
    setWhatsappUrl(`https://wa.me/${number}?text=${encodeURIComponent(message)}`);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold uppercase tracking-wider mb-6 animate-in fade-in slide-in-from-bottom-4">
          <Zap className="w-3 h-3 fill-current" /> Nova IA 2.5 Flash Integrada
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
          Crie Ofertas Irresistíveis em <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600">Segundos</span>
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
          A inteligência artificial que cria o texto persuasivo, o design e a imagem do seu produto automaticamente. Pare de perder horas no Canva.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button onClick={onStart} className="px-8 py-4 text-lg w-full sm:w-auto shadow-xl shadow-brand-500/20">
            Criar Minha Primeira Oferta
          </Button>
          <p className="text-sm text-slate-400 mt-2 sm:mt-0">Sem necessidade de cartão para começar</p>
        </div>
      </section>

      {/* Gallery / Examples Section */}
      <section className="py-12 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-slate-900">Resultados Profissionais Instantâneos</h2>
                <p className="text-slate-500">Veja o que nossa IA cria a partir de um simples texto</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Example 1 */}
                <div className="group relative aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                    <img 
                        src="https://pollinations.ai/p/delicious-gourmet-burger-professional-food-photography-advertising-dark-background?width=600&height=600&nologo=true" 
                        alt="Exemplo Hamburguer" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                        <span className="text-white font-bold text-lg">Hambúrguer Gourmet</span>
                        <span className="text-brand-300 text-sm">Gerado em 5 segundos</span>
                    </div>
                </div>
                {/* Example 2 */}
                <div className="group relative aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 md:-translate-y-4">
                    <img 
                        src="https://pollinations.ai/p/futuristic-neon-sneakers-product-advertising-8k-purple-lighting?width=600&height=600&nologo=true" 
                        alt="Exemplo Tênis" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                        <span className="text-white font-bold text-lg">Moda & Sneakers</span>
                        <span className="text-purple-300 text-sm">Modo Remix IA</span>
                    </div>
                </div>
                {/* Example 3 */}
                <div className="group relative aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                    <img 
                        src="https://pollinations.ai/p/luxury-gold-watch-elegant-black-background-advertising-bokeh?width=600&height=600&nologo=true" 
                        alt="Exemplo Relógio" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                        <span className="text-white font-bold text-lg">Acessórios de Luxo</span>
                        <span className="text-yellow-300 text-sm">Alta Definição</span>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                <LayoutTemplate className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Copywriting Automático</h3>
              <p className="text-slate-600 leading-relaxed">
                Não sabe o que escrever? Nossa IA analisa seu produto e cria headlines persuasivas e listas de benefícios focadas em conversão.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Formatos Prontos</h3>
              <p className="text-slate-600 leading-relaxed">
                Gere automaticamente para Feed (Quadrado), Stories (Vertical) ou Capas (Horizontal) com um único clique.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Imagens Exclusivas</h3>
              <p className="text-slate-600 leading-relaxed">
                Esqueça bancos de imagem genéricos. Crie fundos únicos e profissionais que destacam seu produto usando IA generativa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Quem usa, vende mais</h2>
                <p className="text-slate-600">Junte-se a mais de 2.000 empreendedores digitais.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                {/* Testimonial 1 */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative">
                    <Quote className="absolute top-6 right-6 text-slate-100 w-10 h-10 fill-current" />
                    <div className="flex gap-1 mb-4 text-yellow-400">
                        <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
                    </div>
                    <p className="text-slate-600 mb-6 relative z-10">"Antes eu demorava 1 hora para fazer um post no Instagram da minha confeitaria. Agora faço em 30 segundos e fica muito mais bonito."</p>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold">A</div>
                        <div>
                            <p className="font-bold text-slate-900 text-sm">Ana Clara</p>
                            <p className="text-xs text-slate-400">Confeitaria Artesanal</p>
                        </div>
                    </div>
                </div>

                {/* Testimonial 2 */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative">
                    <Quote className="absolute top-6 right-6 text-slate-100 w-10 h-10 fill-current" />
                    <div className="flex gap-1 mb-4 text-yellow-400">
                        <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
                    </div>
                    <p className="text-slate-600 mb-6 relative z-10">"Para quem faz Dropshipping, testar criativos rápido é essencial. O PromoGen cria 10 variações enquanto eu tomo café. Surreal."</p>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">R</div>
                        <div>
                            <p className="font-bold text-slate-900 text-sm">Ricardo Mendes</p>
                            <p className="text-xs text-slate-400">E-commerce & Drop</p>
                        </div>
                    </div>
                </div>

                {/* Testimonial 3 */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative">
                    <Quote className="absolute top-6 right-6 text-slate-100 w-10 h-10 fill-current" />
                    <div className="flex gap-1 mb-4 text-yellow-400">
                        <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
                    </div>
                    <p className="text-slate-600 mb-6 relative z-10">"O modo 'Recriar Imagem' salvou minha vida. Eu tiro foto do produto na mesa e a IA coloca ele num estúdio profissional."</p>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">J</div>
                        <div>
                            <p className="font-bold text-slate-900 text-sm">Júlia Santos</p>
                            <p className="text-xs text-slate-400">Gestora de Redes Sociais</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Planos Simples e Transparentes</h2>
            <p className="text-slate-600">Escolha a melhor opção para o seu negócio</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Iniciante</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-slate-900">R$ 0</span>
                <span className="text-slate-500">/mês</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-slate-600">
                  <CheckCircle2 className="w-5 h-5 text-slate-400" /> 2 gerações por dia
                </li>
                <li className="flex items-center gap-3 text-slate-600">
                  <CheckCircle2 className="w-5 h-5 text-slate-400" /> Qualidade Standard
                </li>
                <li className="flex items-center gap-3 text-slate-600">
                  <CheckCircle2 className="w-5 h-5 text-slate-400" /> Modelos básicos
                </li>
                <li className="flex items-center gap-3 text-slate-600">
                  <CheckCircle2 className="w-5 h-5 text-slate-400" /> Marca d'água no canto
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
                <li className="flex items-center gap-3 text-white">
                  <CheckCircle2 className="w-5 h-5 text-brand-400" /> <strong>Gerações Ilimitadas</strong>
                </li>
                <li className="flex items-center gap-3 text-white">
                  <CheckCircle2 className="w-5 h-5 text-brand-400" /> <strong>IA Avançada (Alta Definição)</strong>
                </li>
                <li className="flex items-center gap-3 text-white">
                  <CheckCircle2 className="w-5 h-5 text-brand-400" /> Modo Remix (Image-to-Image)
                </li>
                <li className="flex items-center gap-3 text-white">
                  <CheckCircle2 className="w-5 h-5 text-brand-400" /> Sem marca d'água
                </li>
                <li className="flex items-center gap-3 text-white">
                  <CheckCircle2 className="w-5 h-5 text-brand-400" /> Suporte Prioritário
                </li>
              </ul>
              <Button onClick={onStart} variant="primary" className="w-full py-4 text-lg bg-brand-500 hover:bg-brand-400 border-none">
                Assinar Agora <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <div className="mt-4 flex justify-center items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-3 h-3" /> Garantia de 7 dias
              </div>
            </div>

            {/* Agency Plan (New) */}
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 p-8 rounded-3xl border border-purple-800 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 bg-yellow-400 text-purple-900 text-xs font-bold px-3 py-1 rounded-bl-xl">
                AGÊNCIAS
              </div>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                 Agency <Briefcase className="w-4 h-4 text-purple-300" />
              </h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-white">R$ 197</span>
                <span className="text-purple-200">/mês</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-purple-100">
                  <CheckCircle2 className="w-5 h-5 text-yellow-400" /> <strong>Tudo do Plano PRO</strong>
                </li>
                <li className="flex items-center gap-3 text-purple-100">
                  <CheckCircle2 className="w-5 h-5 text-yellow-400" /> <strong>Multi-Marcas (Até 10)</strong>
                </li>
                <li className="flex items-center gap-3 text-purple-100">
                  <CheckCircle2 className="w-5 h-5 text-yellow-400" /> Gestão de Logotipos
                </li>
                <li className="flex items-center gap-3 text-purple-100">
                  <CheckCircle2 className="w-5 h-5 text-yellow-400" /> Alternância rápida de clientes
                </li>
                 <li className="flex items-center gap-3 text-purple-100">
                  <CheckCircle2 className="w-5 h-5 text-yellow-400" /> Licença Comercial Estendida
                </li>
              </ul>
              <Button onClick={onStart} className="w-full !bg-yellow-400 !text-purple-900 !hover:bg-yellow-500 border-none font-bold">
                Plano Agência
              </Button>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>&copy; 2024 PromoGen IA. Todos os direitos reservados.</p>
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
