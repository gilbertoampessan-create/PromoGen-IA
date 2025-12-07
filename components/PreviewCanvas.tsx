
import React, { useRef, forwardRef } from 'react';
import { OfferData, BannerContent, ImageAspect, CompanyInfo } from '../types';
import { Sparkles } from 'lucide-react';

interface PreviewCanvasProps {
  data: OfferData;
  companyInfo: CompanyInfo;
  backgroundImage: string | null;
  content: BannerContent | null;
  isLoading: boolean;
  isPro: boolean; // Received from App
}

export const PreviewCanvas = forwardRef<HTMLDivElement, PreviewCanvasProps>(({ data, companyInfo, backgroundImage, content, isLoading, isPro }, ref) => {
  const { offerText, textColor, layout, verticalAlignment, aspect, font, fontSize, customColor } = data;

  const getTextColorClasses = () => {
    switch (textColor) {
      case 'black': return {
        main: 'text-slate-900',
        sub: 'text-slate-800',
        pill: 'bg-slate-900 text-white'
      };
      case 'brand': return {
        main: 'text-brand-600',
        sub: 'text-brand-800',
        pill: 'bg-brand-600 text-white'
      };
      case 'red': return {
        main: 'text-red-600',
        sub: 'text-red-700',
        pill: 'bg-red-600 text-white'
      };
      case 'yellow': return {
        main: 'text-yellow-400',
        sub: 'text-yellow-500',
        pill: 'bg-yellow-400 text-slate-900'
      };
      case 'green': return {
        main: 'text-emerald-500',
        sub: 'text-emerald-700',
        pill: 'bg-emerald-500 text-white'
      };
      case 'purple': return {
        main: 'text-purple-600',
        sub: 'text-purple-800',
        pill: 'bg-purple-600 text-white'
      };
      case 'pink': return {
        main: 'text-pink-500',
        sub: 'text-pink-700',
        pill: 'bg-pink-500 text-white'
      };
      case 'orange': return {
        main: 'text-orange-500',
        sub: 'text-orange-700',
        pill: 'bg-orange-500 text-white'
      };
      case 'teal': return {
        main: 'text-teal-500',
        sub: 'text-teal-700',
        pill: 'bg-teal-500 text-white'
      };
      case 'navy': return {
        main: 'text-slate-900',
        sub: 'text-slate-700',
        pill: 'bg-slate-900 text-white'
      };
      case 'custom': return {
        // Special case: we will apply style inline
        main: '',
        sub: '',
        pill: ''
      };
      default: return {
        main: 'text-white',
        sub: 'text-white/90',
        pill: 'bg-white text-brand-900'
      };
    }
  };

  const colors = getTextColorClasses();

  // Helper styles for custom colors
  const mainStyle = textColor === 'custom' && customColor ? { color: customColor } : {};
  const subStyle = textColor === 'custom' && customColor ? { color: customColor, opacity: 0.9 } : {};
  const pillStyle = textColor === 'custom' && customColor ? { backgroundColor: customColor, color: '#fff' } : {};

  const getLayoutClasses = () => {
    switch (layout) {
      case 'left': return 'items-start text-left pl-10 pr-4';
      case 'right': return 'items-end text-right pr-10 pl-4';
      default: return 'items-center text-center px-8';
    }
  };

  const getVerticalAlignmentClasses = () => {
    switch (verticalAlignment) {
      case 'top': return 'justify-start pt-12';
      case 'bottom': return 'justify-end pb-12';
      default: return 'justify-center'; // Center by default
    }
  };

  // Determine dimensions based on aspect ratio
  const getContainerClasses = () => {
    switch (aspect) {
      case ImageAspect.PORTRAIT: // Story 9:16
        return 'aspect-[9/16] max-w-[340px]'; 
      case ImageAspect.LANDSCAPE: // 16:9
        return 'aspect-video max-w-[600px]';
      case ImageAspect.SQUARE: // Feed 1:1
      default:
        return 'aspect-square max-w-[500px]';
    }
  };

  const getFontFamily = () => {
    switch (font) {
      case 'classic': return '"Playfair Display", serif';
      case 'handwritten': return '"Permanent Marker", cursive';
      case 'modern':
      default: return '"Inter", sans-serif';
    }
  };

  const getFontSizeClasses = (type: 'headline' | 'subtext' | 'highlight') => {
    const isPortrait = aspect === ImageAspect.PORTRAIT;
    
    switch (type) {
      case 'headline':
        switch (fontSize) {
          case 'small': return isPortrait ? 'text-2xl' : 'text-3xl md:text-4xl';
          case 'large': return isPortrait ? 'text-4xl' : 'text-5xl md:text-6xl';
          case 'medium': 
          default: return isPortrait ? 'text-3xl' : 'text-4xl md:text-5xl';
        }
      case 'subtext':
        switch (fontSize) {
          case 'small': return 'text-sm md:text-base';
          case 'large': return 'text-lg md:text-2xl';
          case 'medium':
          default: return isPortrait ? 'text-base' : 'text-lg md:text-xl';
        }
      case 'highlight':
         switch (fontSize) {
          case 'small': return isPortrait ? 'text-lg px-4 py-2' : 'text-lg md:text-xl px-5 py-2';
          case 'large': return isPortrait ? 'text-2xl px-8 py-4' : 'text-2xl md:text-4xl px-8 py-4';
          case 'medium':
          default: return isPortrait ? 'text-xl px-6 py-3' : 'text-xl md:text-2xl px-6 py-3';
        }
    }
  };

  // Placeholder background if none generated
  // Note: We wrap the backgroundImage URL in quotes to handle base64 strings safely
  const backgroundStyle = backgroundImage 
    ? { backgroundImage: `url("${backgroundImage}")` }
    : { backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' };

  return (
    <div className={`w-full mx-auto bg-white rounded-xl shadow-2xl overflow-hidden relative group transition-all duration-300 ${getContainerClasses()}`}>
      
      {/* Capture Area */}
      <div 
        ref={ref}
        className="w-full h-full relative bg-cover bg-center bg-no-repeat transition-all duration-500"
        style={backgroundStyle}
        id="offer-preview"
      >
        {/* Overlay for readability */}
        <div className={`absolute inset-0 ${textColor === 'white' || textColor === 'yellow' ? 'bg-black/30' : 'bg-white/30'}`}></div>

        {/* Company Identity Layer */}
        {companyInfo.showOnImage && (
          <div className="absolute inset-0 z-20 pointer-events-none">
            {/* Logo - Top Left */}
            {companyInfo.logo && (
              <div className="absolute top-6 left-6 w-16 h-16 bg-white/90 p-1.5 rounded-lg shadow-md flex items-center justify-center">
                 <img src={companyInfo.logo} alt="Company Logo" className="max-w-full max-h-full object-contain" />
              </div>
            )}
            
            {/* Contact Info - Bottom Bar */}
            {(companyInfo.name || companyInfo.phone) && (
              <div className="absolute bottom-5 left-0 right-0 flex justify-center">
                 <div className="bg-white/90 backdrop-blur-sm px-6 py-2 rounded-full shadow-lg flex items-center gap-3">
                   {companyInfo.name && (
                     <span className="text-slate-900 font-bold text-sm border-r border-slate-300 pr-3 uppercase tracking-wider">
                       {companyInfo.name}
                     </span>
                   )}
                   {companyInfo.phone && (
                     <span className="text-slate-700 font-semibold text-sm">
                       {companyInfo.phone}
                     </span>
                   )}
                 </div>
              </div>
            )}
          </div>
        )}

        {/* --- WATERMARK (Free Tier) --- */}
        {!isPro && (
          <div className="absolute bottom-2 right-2 z-30 opacity-60 bg-black/40 backdrop-blur-sm px-2 py-1 rounded text-[8px] font-bold text-white flex items-center gap-1 pointer-events-none">
            <Sparkles className="w-2 h-2" />
            Criado com PromoGen
          </div>
        )}

        {/* Content Container */}
        <div className={`relative z-10 h-full flex flex-col gap-4 ${getVerticalAlignmentClasses()} ${getLayoutClasses()}`}>
          
          {content ? (
            // AI Structured Content
            <>
              {/* Headline */}
              <div 
                className={`font-extrabold leading-tight drop-shadow-xl ${colors.main} ${getFontSizeClasses('headline')}`} 
                style={{ fontFamily: getFontFamily(), ...mainStyle }}
              >
                {content.headline}
              </div>

              {/* Subtext - Note whitespace-pre-line for vertical lists */}
              <div 
                 className={`font-medium leading-relaxed max-w-[90%] drop-shadow-md whitespace-pre-line ${colors.sub} ${getFontSizeClasses('subtext')}`}
                 style={subStyle}
              >
                {content.subtext}
              </div>

              {/* Highlight/Price Pill */}
              <div 
                className={`mt-4 rounded-full shadow-xl tracking-wide ${colors.pill} ${getFontSizeClasses('highlight')}`}
                style={{ fontFamily: getFontFamily(), fontWeight: 700, ...pillStyle }}
              >
                {content.highlight}
              </div>
            </>
          ) : (
            // Fallback / Initial State (Raw Text)
            <div 
              className={`font-bold whitespace-pre-wrap leading-tight drop-shadow-lg ${colors.main} ${getFontSizeClasses('headline')}`}
              style={{ fontFamily: getFontFamily(), ...mainStyle }}
            >
              {offerText || "Digite sua oferta..."}
            </div>
          )}

        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center text-white">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
          <p className="font-bold text-lg animate-pulse">Otimizando design...</p>
          <p className="text-sm text-white/60 mt-2">Ajustando para {aspect === ImageAspect.PORTRAIT ? 'Story' : aspect === ImageAspect.LANDSCAPE ? 'Paisagem' : 'Feed'}</p>
        </div>
      )}

      {/* Empty State Hint */}
      {!backgroundImage && !isLoading && (
        <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
          <p className="text-white/60 text-sm font-medium drop-shadow-md">Preencha a oferta e clique em Gerar</p>
        </div>
      )}
    </div>
  );
});

PreviewCanvas.displayName = 'PreviewCanvas';
