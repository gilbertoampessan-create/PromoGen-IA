
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Download, LayoutTemplate, Palette, Wand2, ImagePlus, Type, AlignLeft, AlignCenter, AlignRight, Square, Smartphone, RectangleHorizontal, Upload, MessageSquarePlus, ImageIcon, ArrowUpToLine, ArrowDownToLine, FoldVertical, RefreshCw, Building2, Phone, Trash2, Crown, LogOut, User as UserIcon, CheckCircle2, PencilLine, Diamond, Utensils, Cpu, Leaf, Eraser, Briefcase, Plus, Save, MessageCircle, ALargeSmall, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { OfferData, GeneratedImageState, ImageAspect, GenerationMode, CompanyInfo, AuthState, BannerContent, Brand, PlanType } from './types';
import { generateBackgroundFromText } from './services/geminiService';
import { storageService } from './services/storageService';
import { PreviewCanvas } from './components/PreviewCanvas';
import { Button } from './components/Button';
import { LandingPage } from './components/LandingPage';
import { AuthScreen } from './components/AuthScreen';
import { SubscriptionModal } from './components/SubscriptionModal';
import { AdminDashboard } from './components/AdminDashboard'; 
import { UserProfileModal } from './components/UserProfileModal';
import html2canvas from 'html2canvas';

const App: React.FC = () => {
  // --- Auth & View State ---
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    view: 'landing'
  });

  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [isQuotaTriggered, setIsQuotaTriggered] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [targetSubscriptionPlan, setTargetSubscriptionPlan] = useState<PlanType | undefined>(undefined);

  // --- App Logic ---
  useEffect(() => {
    // Ensure test users are created
    storageService.initializeTestUsers();
    
    const currentUser = storageService.getCurrentUser();
    if (currentUser) {
      setAuthState({
        user: currentUser,
        isAuthenticated: true,
        view: currentUser.isAdmin ? 'admin' : 'app'
      });
    }
  }, []);

  const handleLoginSuccess = () => {
    const currentUser = storageService.getCurrentUser();
    if (currentUser) {
      setAuthState({
        user: currentUser,
        isAuthenticated: true,
        view: currentUser.isAdmin ? 'admin' : 'app'
      });
    }
  };

  const handleLogout = () => {
    storageService.logout();
    setAuthState({
      user: null,
      isAuthenticated: false,
      view: 'landing'
    });
    setShowProfileModal(false);
  };

  const checkQuotaAndOpenModal = () => {
    if (!authState.user) return false;
    const quota = storageService.checkQuota(authState.user.id);
    
    if (!quota.allowed) {
      setIsQuotaTriggered(true);
      setShowSubscriptionModal(true);
      return false;
    }
    return true;
  };

  const openSubscriptionManagement = (plan?: PlanType) => {
    setIsQuotaTriggered(false);
    setTargetSubscriptionPlan(plan);
    setShowSubscriptionModal(true);
  };

  const openSupportWhatsApp = () => {
    const settings = storageService.getSettings();
    const number = settings.whatsappNumber || '5511999999999';
    const message = settings.whatsappMessage || 'Olá, preciso de ajuda com o PromoGen.';
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // --- Main App State ---
  const [offerData, setOfferData] = useState<OfferData>({
    offerText: 'Super Tênis Esportivo\nConforto total para corrida',
    highlightText: 'R$ 299,90',
    textColor: 'white',
    font: 'modern',
    fontSize: 'medium',
    layout: 'center',
    verticalAlignment: 'center',
    aspect: ImageAspect.SQUARE,
    customImagePrompt: '',
    offerStyle: 'custom',
    isolateProduct: false
  });

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: '',
    phone: '',
    logo: null,
    showOnImage: true
  });

  // Agency Mode States
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandInternalName, setBrandInternalName] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState('');

  const [mode, setMode] = useState<GenerationMode>('generate');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Updated state to handle array of images
  const [imageState, setImageState] = useState<GeneratedImageState>({
    isLoading: false,
    images: [],
    selectedIndex: 0,
    content: null,
    error: null
  });

  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const brandSectionRef = useRef<HTMLDivElement>(null); // Ref for brand section scrolling

  // Load Saved Company Info (Fallback) or Load Brands (Agency)
  useEffect(() => {
    if (authState.user?.plan === 'agency') {
        const userBrands = storageService.getBrands(authState.user.id);
        setBrands(userBrands);
    } else {
        const savedCompany = localStorage.getItem('promogen_company_info');
        if (savedCompany) {
            try {
                setCompanyInfo(JSON.parse(savedCompany));
            } catch (e) {
                console.error("Failed to load company info", e);
            }
        }
    }
  }, [authState.user]);

  useEffect(() => {
    if (authState.user?.plan !== 'agency') {
         localStorage.setItem('promogen_company_info', JSON.stringify(companyInfo));
    }
  }, [companyInfo, authState.user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOfferData(prev => ({ ...prev, [name]: value }));
  };

  const handleContentEdit = (field: keyof BannerContent, value: string) => {
    setImageState(prev => ({
      ...prev,
      content: prev.content ? { ...prev.content, [field]: value } : null
    }));
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanyInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyInfo(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setCompanyInfo(prev => ({ ...prev, logo: null }));
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  // --- Agency: Brand Management ---
  const saveBrand = () => {
      if (!authState.user) return;
      if (!brandInternalName) {
          alert("Dê um nome interno para identificar esta marca (Ex: Cliente Pizzaria)");
          return;
      }
      
      const newBrand = storageService.saveBrand(authState.user.id, {
          internalName: brandInternalName,
          companyName: companyInfo.name,
          phone: companyInfo.phone,
          logo: companyInfo.logo
      });
      
      setBrands(prev => [...prev, newBrand]);
      setBrandInternalName('');
      setSelectedBrandId(newBrand.id);
      alert("Marca salva com sucesso!");
  };

  const deleteBrand = () => {
      if (!selectedBrandId) return;
      if (confirm('Excluir esta marca salva?')) {
          storageService.deleteBrand(selectedBrandId);
          setBrands(prev => prev.filter(b => b.id !== selectedBrandId));
          setSelectedBrandId('');
          setCompanyInfo({ name: '', phone: '', logo: null, showOnImage: true }); // Reset fields
      }
  };

  const handleBrandSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const brandId = e.target.value;
      setSelectedBrandId(brandId);
      
      if (brandId) {
          const brand = brands.find(b => b.id === brandId);
          if (brand) {
              setCompanyInfo(prev => ({
                  ...prev,
                  name: brand.companyName,
                  phone: brand.phone,
                  logo: brand.logo
              }));
          }
      } else {
           // Reset to empty if "Nova Marca" selected
           setCompanyInfo(prev => ({ ...prev, name: '', phone: '', logo: null }));
      }
  };

  // --- Style Selection Logic ---
  const applyStyle = (style: string) => {
    let update = { offerStyle: style as any, fontSize: 'medium' as any };
    // Auto-configure props based on style
    switch (style) {
      case 'luxury':
        update = { ...update, font: 'classic', textColor: 'white' } as any;
        break;
      case 'gourmet':
        update = { ...update, font: 'handwritten', textColor: 'white' } as any;
        break;
      case 'tech':
        update = { ...update, font: 'modern', textColor: 'brand' } as any;
        break;
      case 'minimal':
        update = { ...update, font: 'modern', textColor: 'black' } as any;
        break;
      case 'organic':
        update = { ...update, font: 'modern', textColor: 'green' } as any;
        break;
    }
    setOfferData(prev => ({ ...prev, ...update }));
  };

  const handleGenerate = async () => {
    if (!authState.user) return;

    // Check Quota
    if (!checkQuotaAndOpenModal()) return;

    if (!offerData.offerText) {
      setImageState(prev => ({ ...prev, error: "Digite o texto da oferta primeiro." }));
      return;
    }

    if ((mode === 'upload' || mode === 'remix') && !uploadedImage) {
      setImageState(prev => ({ ...prev, error: "Envie uma imagem para continuar." }));
      return;
    }

    setImageState({ isLoading: true, images: [], selectedIndex: 0, content: null, error: null });
    
    try {
      const skipImageGeneration = mode === 'upload';
      const referenceImage = mode === 'remix' ? uploadedImage : null;
      const isPro = authState.user.plan === 'pro' || authState.user.plan === 'agency';
      
      const result = await generateBackgroundFromText(
        offerData.offerText, 
        offerData.highlightText,
        offerData.aspect,
        offerData.customImagePrompt,
        referenceImage,
        skipImageGeneration,
        isPro,
        offerData.offerStyle,
        offerData.isolateProduct
      );
      
      // Increment Usage Count upon success
      storageService.incrementUsage(authState.user.id);

      const finalImages = mode === 'upload' && uploadedImage ? [uploadedImage] : result.images;

      setImageState({
        isLoading: false,
        images: finalImages,
        selectedIndex: 0,
        content: result.content,
        error: null
      });
    } catch (err) {
      console.error(err);
      setImageState({
        isLoading: false,
        images: [],
        selectedIndex: 0,
        content: null,
        error: 'Falha ao processar. Tente novamente.'
      });
    }
  };

  const handleDownload = async () => {
    if (!previewRef.current) return;
    
    try {
      const canvas = await html2canvas(previewRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: null
      });
      
      const link = document.createElement('a');
      const baseName = imageState.content?.headline || offerData.offerText.split('\n')[0] || 'oferta';
      const filename = baseName.replace(/[^a-z0-9]/gi, '-').toLowerCase().substring(0, 30);
      
      link.download = `promogen-${filename}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error("Erro ao baixar:", err);
      alert("Erro ao processar o download da imagem.");
    }
  };

  const colorOptions = [
    { id: 'white', bg: '#ffffff', label: 'Branco' },
    { id: 'black', bg: '#1e293b', label: 'Preto' },
    { id: 'brand', bg: '#0ea5e9', label: 'Azul' },
    { id: 'navy', bg: '#0f172a', label: 'Marinho' },
    { id: 'teal', bg: '#14b8a6', label: 'Turquesa' },
    { id: 'green', bg: '#10b981', label: 'Verde' },
    { id: 'yellow', bg: '#facc15', label: 'Amarelo' },
    { id: 'orange', bg: '#f97316', label: 'Laranja' },
    { id: 'red', bg: '#dc2626', label: 'Vermelho' },
    { id: 'purple', bg: '#9333ea', label: 'Roxo' },
    { id: 'pink', bg: '#ec4899', label: 'Rosa' },
  ];

  // --- Render Views ---

  if (authState.view === 'landing') {
    return <LandingPage onStart={() => setAuthState(prev => ({ ...prev, view: 'auth' }))} onLogin={() => setAuthState(prev => ({ ...prev, view: 'auth' }))} />;
  }

  if (authState.view === 'auth') {
    return <AuthScreen onSuccess={handleLoginSuccess} onBack={() => setAuthState(prev => ({ ...prev, view: 'landing' }))} />;
  }

  if (authState.view === 'admin') {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  const isPro = authState.user?.plan === 'pro' || authState.user?.plan === 'agency';
  const isAgency = authState.user?.plan === 'agency';
  const quota = authState.user ? storageService.checkQuota(authState.user.id) : { allowed: false, remaining: 0, used: 0 };
  const currentDisplayImage = imageState.images.length > 0 ? imageState.images[imageState.selectedIndex] : (mode === 'upload' ? uploadedImage : null);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row relative">
      {/* Subscription Modal */}
      {authState.user && (
        <SubscriptionModal 
            isOpen={showSubscriptionModal} 
            onClose={() => {
                setShowSubscriptionModal(false);
                const updatedUser = storageService.getCurrentUser();
                setAuthState(prev => ({ ...prev, user: updatedUser }));
                setTargetSubscriptionPlan(undefined);
            }} 
            userId={authState.user.id}
            isUpgradeTriggered={isQuotaTriggered}
            initialPlan={targetSubscriptionPlan}
        />
      )}
      
      {/* User Profile Modal */}
      {authState.user && (
        <UserProfileModal 
            isOpen={showProfileModal}
            onClose={() => setShowProfileModal(false)}
            user={authState.user}
            onLogout={handleLogout}
            onPlanChange={(newPlan) => {
                // When user selects a new plan in profile, close profile and open payment modal
                setShowProfileModal(false);
                openSubscriptionManagement(newPlan);
            }}
        />
      )}
      
      {/* Left Panel: Controls */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-slate-200 h-auto md:h-screen overflow-y-auto p-6 shadow-xl z-10 flex flex-col">
        
        {/* Header with User Info & Profile Click */}
        <div className="mb-6 pb-6 border-b border-slate-100 relative">
          <div className="flex items-center justify-between mb-4">
             <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="text-brand-600 fill-brand-100 w-5 h-5" />
                PromoGen
             </h1>
             {isPro && <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${isAgency ? 'bg-purple-100 text-purple-700' : 'bg-brand-100 text-brand-700'}`}>
                {isAgency ? <Briefcase className="w-3 h-3 fill-current" /> : <Crown className="w-3 h-3 fill-current" />}
                {isAgency ? 'AGÊNCIA' : 'PRO'}
             </div>}
          </div>
          
          {/* User Profile Trigger */}
          <div 
            className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors group"
            onClick={() => setShowProfileModal(true)}
            title="Gerenciar Conta"
          >
            <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">
                    <UserIcon className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700 truncate max-w-[100px]">{authState.user?.name}</span>
                    <span className="text-[10px] text-slate-400 truncate">{isPro ? 'Ilimitado' : `${quota.used}/2 hoje`}</span>
                </div>
            </div>
            <Crown className="w-4 h-4 text-slate-300 group-hover:text-brand-500" />
          </div>

          {!isPro && (
             <button onClick={() => openSubscriptionManagement('pro')} className="w-full mt-3 py-2 bg-gradient-to-r from-slate-900 to-slate-800 text-white text-xs font-bold rounded-lg shadow-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                 <Crown className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                 Seja PRO - R$ 97/ano
             </button>
          )}

           {isAgency && (
                <button 
                    onClick={() => brandSectionRef.current?.scrollIntoView({ behavior: 'smooth' })} 
                    className="w-full mt-2 py-1.5 bg-purple-50 text-purple-700 text-xs font-medium rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors flex items-center justify-center gap-2"
                >
                    <Briefcase className="w-3 h-3" /> Clientes Salvos
                </button>
            )}
        </div>

        <div className="space-y-6 flex-1">
          
          {/* Company Identity Section */}
          <div ref={brandSectionRef} className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Building2 className="w-3 h-3" /> Identidade da Marca
              </h3>
              <input 
                type="checkbox" 
                checked={companyInfo.showOnImage} 
                onChange={(e) => setCompanyInfo(prev => ({...prev, showOnImage: e.target.checked}))}
                className="w-3 h-3 accent-brand-600 cursor-pointer" 
              />
            </div>

            {/* AGENCY: Multi-Brand Manager */}
            {isAgency && (
                <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <label className="block text-[10px] font-bold text-purple-700 mb-1 flex items-center gap-1"><Briefcase className="w-3 h-3"/> Gerenciar Clientes</label>
                    <select 
                        value={selectedBrandId} 
                        onChange={handleBrandSelection}
                        className="w-full text-xs p-1.5 border border-purple-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 mb-2"
                    >
                        <option value="">-- Nova Marca / Limpar --</option>
                        {brands.map(b => (
                            <option key={b.id} value={b.id}>{b.internalName}</option>
                        ))}
                    </select>
                    
                    {!selectedBrandId && (
                        <div className="flex gap-1">
                            <input 
                                type="text" 
                                placeholder="Nome interno (ex: Pizzaria X)" 
                                className="flex-1 text-xs px-2 py-1 border border-slate-300 rounded-md focus:outline-none"
                                value={brandInternalName}
                                onChange={(e) => setBrandInternalName(e.target.value)}
                            />
                            <button onClick={saveBrand} className="bg-purple-600 text-white p-1 rounded-md hover:bg-purple-700" title="Salvar Nova Marca"><Save className="w-4 h-4" /></button>
                        </div>
                    )}
                    
                    {selectedBrandId && (
                         <button onClick={deleteBrand} className="w-full text-xs text-red-500 hover:text-red-700 flex items-center justify-center gap-1 mt-1 bg-red-50 py-1 rounded">
                             <Trash2 className="w-3 h-3" /> Excluir Cliente Selecionado
                         </button>
                    )}
                </div>
            )}

            <div className="grid grid-cols-2 gap-2">
               <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Nome da Loja</label>
                  <input type="text" name="name" value={companyInfo.name} onChange={handleCompanyChange} className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-brand-500 outline-none" placeholder="Sua Loja" />
               </div>
               <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Telefone</label>
                  <input type="text" name="phone" value={companyInfo.phone} onChange={handleCompanyChange} className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-brand-500 outline-none" placeholder="(00) 0000-0000" />
               </div>
            </div>
            <div>
               <label className="block text-[10px] font-bold text-slate-600 mb-1">Logo (Miniatura)</label>
               <div className="flex items-center gap-2">
                  <div className="relative w-10 h-10 flex-shrink-0 bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden">
                     {companyInfo.logo ? <img src={companyInfo.logo} alt="Logo" className="w-full h-full object-contain p-0.5" /> : <ImageIcon className="w-4 h-4 text-slate-300" />}
                  </div>
                  <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                  <button onClick={() => logoInputRef.current?.click()} className="text-xs bg-white border border-slate-300 px-3 py-1.5 rounded-md hover:bg-slate-50 text-slate-600">{companyInfo.logo ? 'Trocar' : 'Enviar Logo'}</button>
                  {companyInfo.logo && <button onClick={removeLogo} className="text-slate-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>}
               </div>
            </div>
          </div>

          <hr className="border-slate-100" />
          
          {/* --- STYLE LIBRARY --- */}
          <div className="space-y-4">
             <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Wand2 className="w-3 h-3" /> Estilos Rápidos (1-Click)
             </h3>
             <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => applyStyle('minimal')}
                  className={`p-2 rounded-lg text-[10px] font-medium border flex items-center gap-2 transition-all ${offerData.offerStyle === 'minimal' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  <div className="w-4 h-4 bg-slate-100 rounded-full border border-slate-300" /> Minimalista
                </button>
                <button 
                  onClick={() => applyStyle('luxury')}
                  className={`p-2 rounded-lg text-[10px] font-medium border flex items-center gap-2 transition-all ${offerData.offerStyle === 'luxury' ? 'bg-yellow-900 text-yellow-50 border-yellow-900' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  <Diamond className="w-3 h-3 text-yellow-500" /> Luxo / Gold
                </button>
                <button 
                  onClick={() => applyStyle('gourmet')}
                  className={`p-2 rounded-lg text-[10px] font-medium border flex items-center gap-2 transition-all ${offerData.offerStyle === 'gourmet' ? 'bg-orange-600 text-white border-orange-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  <Utensils className="w-3 h-3 text-white" /> Gourmet
                </button>
                <button 
                  onClick={() => applyStyle('tech')}
                  className={`p-2 rounded-lg text-[10px] font-medium border flex items-center gap-2 transition-all ${offerData.offerStyle === 'tech' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  <Cpu className="w-3 h-3 text-cyan-300" /> Tech / Neon
                </button>
                <button 
                  onClick={() => applyStyle('organic')}
                  className={`p-2 rounded-lg text-[10px] font-medium border flex items-center gap-2 transition-all ${offerData.offerStyle === 'organic' ? 'bg-green-700 text-white border-green-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  <Leaf className="w-3 h-3 text-green-200" /> Orgânico
                </button>
             </div>
             
             {/* PRODUCT ISOLATION TOGGLE */}
             <div className="flex items-center justify-between bg-slate-100 p-3 rounded-lg border border-slate-200 cursor-pointer" onClick={() => setOfferData(prev => ({...prev, isolateProduct: !prev.isolateProduct}))}>
                <div className="flex items-center gap-2">
                   <div className="p-1 bg-white rounded-md shadow-sm text-slate-600">
                      <Eraser className="w-3 h-3" />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-700">Fundo Estúdio / Limpo</span>
                      <span className="text-[9px] text-slate-400">Tenta isolar o produto</span>
                   </div>
                </div>
                <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${offerData.isolateProduct ? 'bg-brand-500' : 'bg-slate-300'}`}>
                   <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform ${offerData.isolateProduct ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
             </div>
          </div>

          <hr className="border-slate-100" />
          
          {/* Product Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">1. Dados da Oferta</h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">O que você está vendendo?</label>
              <textarea name="offerText" value={offerData.offerText} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none resize-none text-base shadow-sm" placeholder={'Ex: Pizza Família + Refri\nEntregamos hoje!'} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 text-brand-600">Destaque / Preço</label>
              <input type="text" name="highlightText" value={offerData.highlightText} onChange={handleInputChange} className="w-full px-4 py-3 border border-brand-200 bg-brand-50/50 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-semibold text-brand-900 shadow-sm" placeholder='Ex: R$ 59,90' />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Visuals */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">2. Configuração de Imagem</h3>
            <div className="flex p-1 bg-slate-100 rounded-xl mb-4 overflow-x-auto">
              <button onClick={() => setMode('generate')} className={`flex-1 py-2 px-2 rounded-lg text-[10px] font-medium flex items-center justify-center gap-2 ${mode === 'generate' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500'}`}><Wand2 className="w-3 h-3" /> Criar (IA)</button>
              <button onClick={() => setMode('remix')} className={`flex-1 py-2 px-2 rounded-lg text-[10px] font-medium flex items-center justify-center gap-2 ${mode === 'remix' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500'}`}><RefreshCw className="w-3 h-3" /> Recriar (IA)</button>
              <button onClick={() => setMode('upload')} className={`flex-1 py-2 px-2 rounded-lg text-[10px] font-medium flex items-center justify-center gap-2 ${mode === 'upload' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500'}`}><Upload className="w-3 h-3" /> Upload</button>
            </div>

            {(mode === 'generate' || mode === 'remix') && (
              <div className="space-y-3 animate-in fade-in slide-in-from-left-2 duration-300">
                 <div className={`${mode === 'remix' ? 'bg-purple-50 border-purple-100' : 'bg-brand-50 border-brand-100'} border rounded-lg p-3`}>
                    <label className={`block text-xs font-bold mb-1 flex items-center gap-1 ${mode === 'remix' ? 'text-purple-800' : 'text-brand-800'}`}>
                      <MessageSquarePlus className="w-3 h-3" /> {mode === 'remix' ? 'Ajustes na recriação' : 'Descreva o cenário'}
                    </label>
                    <textarea name="customImagePrompt" value={offerData.customImagePrompt} onChange={handleInputChange} rows={2} className={`w-full bg-white px-3 py-2 border rounded-md text-sm focus:outline-none text-slate-700 ${mode === 'remix' ? 'border-purple-200 focus:border-purple-500' : 'border-brand-200 focus:border-brand-500'}`} placeholder={mode === 'remix' ? "Ex: Mude o fundo para azul neon..." : "Ex: Fundo de madeira rústica..."} />
                 </div>
              </div>
            )}

            {(mode === 'upload' || mode === 'remix') && (
              <div className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-300">
                <div onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all group ${uploadedImage ? mode === 'remix' ? 'border-purple-500 bg-purple-50' : 'border-brand-500 bg-brand-50' : 'border-slate-300 hover:border-brand-400'}`}>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                  {uploadedImage ? (
                    <div className="relative"><img src={uploadedImage} alt="Preview" className="h-24 mx-auto object-contain rounded-md shadow-sm" /></div>
                  ) : (
                    <div className="text-slate-500 group-hover:text-brand-600"><ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50 group-hover:opacity-100" /><p className="text-sm font-medium">Clique para enviar</p></div>
                  )}
                </div>
              </div>
            )}

            <div className="pt-2">
              <label className="block text-xs font-medium text-slate-700 mb-2 flex items-center gap-1"><ImagePlus className="w-3 h-3" /> Formato</label>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setOfferData(prev => ({ ...prev, aspect: ImageAspect.SQUARE }))} className={`flex-1 flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${offerData.aspect === ImageAspect.SQUARE ? 'bg-brand-50 border-brand-500 text-brand-700 ring-1 ring-brand-500' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}><Square className="w-5 h-5 mb-1" /><span className="text-[10px] font-medium">Feed</span></button>
                <button onClick={() => setOfferData(prev => ({ ...prev, aspect: ImageAspect.PORTRAIT }))} className={`flex-1 flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${offerData.aspect === ImageAspect.PORTRAIT ? 'bg-brand-50 border-brand-500 text-brand-700 ring-1 ring-brand-500' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}><Smartphone className="w-5 h-5 mb-1" /><span className="text-[10px] font-medium">Story</span></button>
                <button onClick={() => setOfferData(prev => ({ ...prev, aspect: ImageAspect.LANDSCAPE }))} className={`flex-1 flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${offerData.aspect === ImageAspect.LANDSCAPE ? 'bg-brand-50 border-brand-500 text-brand-700 ring-1 ring-brand-500' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}><RectangleHorizontal className="w-5 h-5 mb-1" /><span className="text-[10px] font-medium">Capa</span></button>
              </div>
            </div>

            <Button 
              onClick={handleGenerate} 
              isLoading={imageState.isLoading} 
              className={`w-full py-4 text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] ${mode === 'remix' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/30' : ''}`}
              icon={<Sparkles className="w-5 h-5 fill-current" />}
            >
              {imageState.isLoading ? 'Gerando 4 opções...' : mode === 'remix' ? 'Recriar com IA' : 'Gerar Oferta'}
            </Button>

            {imageState.error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">{imageState.error}</div>}

            {/* Layout Controls */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
               
               {/* Font Selection */}
               <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2 flex items-center gap-1"><Type className="w-3 h-3" /> Estilo da Fonte</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => setOfferData(prev => ({ ...prev, font: 'modern' }))} 
                      className={`py-2 px-1 rounded-lg border text-xs transition-all font-sans font-bold ${offerData.font === 'modern' ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-white border-slate-200 text-slate-600'}`}
                    >
                      Moderna
                    </button>
                    <button 
                      onClick={() => setOfferData(prev => ({ ...prev, font: 'classic' }))} 
                      className={`py-2 px-1 rounded-lg border text-xs transition-all font-serif font-bold ${offerData.font === 'classic' ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-white border-slate-200 text-slate-600'}`}
                    >
                      Clássica
                    </button>
                    <button 
                      onClick={() => setOfferData(prev => ({ ...prev, font: 'handwritten' }))} 
                      className={`py-2 px-1 rounded-lg border text-xs transition-all font-handwritten ${offerData.font === 'handwritten' ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-white border-slate-200 text-slate-600'}`}
                    >
                      Manual
                    </button>
                  </div>
               </div>

                {/* Font Size Selection */}
               <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2 flex items-center gap-1"><ALargeSmall className="w-3 h-3" /> Tamanho da Fonte</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => setOfferData(prev => ({ ...prev, fontSize: 'small' }))} 
                      className={`py-2 px-1 rounded-lg border text-xs transition-all font-bold ${offerData.fontSize === 'small' ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-white border-slate-200 text-slate-600'}`}
                    >
                      Pequeno
                    </button>
                    <button 
                      onClick={() => setOfferData(prev => ({ ...prev, fontSize: 'medium' }))} 
                      className={`py-2 px-1 rounded-lg border text-xs transition-all font-bold ${offerData.fontSize === 'medium' ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-white border-slate-200 text-slate-600'}`}
                    >
                      Médio
                    </button>
                    <button 
                      onClick={() => setOfferData(prev => ({ ...prev, fontSize: 'large' }))} 
                      className={`py-2 px-1 rounded-lg border text-xs transition-all font-bold ${offerData.fontSize === 'large' ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-white border-slate-200 text-slate-600'}`}
                    >
                      Grande
                    </button>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2 flex items-center gap-1"><LayoutTemplate className="w-3 h-3" /> Horizontal</label>
                    <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-200">
                       <button onClick={() => setOfferData(prev => ({ ...prev, layout: 'left' }))} className={`flex-1 p-2 rounded-md flex justify-center ${offerData.layout === 'left' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400'}`}><AlignLeft className="w-4 h-4" /></button>
                       <button onClick={() => setOfferData(prev => ({ ...prev, layout: 'center' }))} className={`flex-1 p-2 rounded-md flex justify-center ${offerData.layout === 'center' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400'}`}><AlignCenter className="w-4 h-4" /></button>
                       <button onClick={() => setOfferData(prev => ({ ...prev, layout: 'right' }))} className={`flex-1 p-2 rounded-md flex justify-center ${offerData.layout === 'right' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400'}`}><AlignRight className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2 flex items-center gap-1"><FoldVertical className="w-3 h-3" /> Vertical</label>
                    <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-200">
                       <button onClick={() => setOfferData(prev => ({ ...prev, verticalAlignment: 'top' }))} className={`flex-1 p-2 rounded-md flex justify-center ${offerData.verticalAlignment === 'top' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400'}`}><ArrowUpToLine className="w-4 h-4" /></button>
                       <button onClick={() => setOfferData(prev => ({ ...prev, verticalAlignment: 'center' }))} className={`flex-1 p-2 rounded-md flex justify-center ${offerData.verticalAlignment === 'center' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400'}`}><FoldVertical className="w-4 h-4 rotate-90" /></button>
                       <button onClick={() => setOfferData(prev => ({ ...prev, verticalAlignment: 'bottom' }))} className={`flex-1 p-2 rounded-md flex justify-center ${offerData.verticalAlignment === 'bottom' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400'}`}><ArrowDownToLine className="w-4 h-4" /></button>
                    </div>
                  </div>
               </div>
               <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2 flex items-center gap-1"><Palette className="w-3 h-3" /> Cor do Texto</label>
                  <div className="flex flex-wrap gap-2 bg-slate-50 p-2 rounded-md border border-slate-200 justify-start">
                    {colorOptions.map((color) => (
                      <button key={color.id} onClick={() => setOfferData(prev => ({ ...prev, textColor: color.id as any }))} className={`w-8 h-8 rounded-full border shadow-sm transition-all ${offerData.textColor === color.id ? 'ring-2 ring-brand-500 scale-110' : 'ring-0 opacity-80'}`} style={{ backgroundColor: color.bg }} />
                    ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Preview */}
      <div className="flex-1 bg-slate-100 p-4 md:p-12 flex flex-col items-center justify-center overflow-hidden relative overflow-y-auto">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#0ea5e9 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="relative w-full max-w-4xl z-10 flex flex-col items-center">
          <div className="w-full max-w-2xl mb-6 flex flex-col sm:flex-row justify-between items-end sm:items-end gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Resultado Visual</h2>
              <p className="text-slate-500 text-sm">{imageState.content ? "Texto otimizado em PT-BR" : "Pré-visualização"}</p>
            </div>
            <Button variant="secondary" onClick={handleDownload} icon={<Download className="w-4 h-4" />} disabled={imageState.isLoading || !currentDisplayImage} className={!currentDisplayImage ? 'opacity-50' : ''}>Baixar Imagem</Button>
          </div>

          {/* --- COPY EDITOR PANEL --- */}
          {imageState.content && (
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center gap-2 mb-3 text-brand-600">
                <PencilLine className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Editar Texto Gerado</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="col-span-1 md:col-span-2">
                   <label className="block text-[10px] font-bold text-slate-500 mb-1">Título (Headline)</label>
                   <input 
                      type="text" 
                      value={imageState.content.headline} 
                      onChange={(e) => handleContentEdit('headline', e.target.value)}
                      className="w-full text-sm font-semibold text-slate-800 px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-brand-500 outline-none bg-slate-50"
                   />
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-slate-500 mb-1">Corpo (Subtext)</label>
                   <textarea 
                      rows={3}
                      value={imageState.content.subtext} 
                      onChange={(e) => handleContentEdit('subtext', e.target.value)}
                      className="w-full text-sm text-slate-700 px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-brand-500 outline-none bg-slate-50 resize-none"
                   />
                </div>
                 <div>
                   <label className="block text-[10px] font-bold text-slate-500 mb-1">Destaque (Highlight)</label>
                   <input 
                      type="text" 
                      value={imageState.content.highlight} 
                      onChange={(e) => handleContentEdit('highlight', e.target.value)}
                      className="w-full text-sm font-bold text-brand-600 px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-brand-500 outline-none bg-slate-50"
                   />
                   <p className="text-[10px] text-slate-400 mt-2 italic">As alterações aparecem na imagem em tempo real.</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="w-full flex justify-center">
             <PreviewCanvas ref={previewRef} data={offerData} companyInfo={companyInfo} backgroundImage={currentDisplayImage} content={imageState.content} isLoading={imageState.isLoading} isPro={isPro} />
          </div>

          {/* Variants Grid */}
          {imageState.images.length > 1 && (
             <div className="mt-8 w-full max-w-2xl">
                 <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Variações Geradas</h3>
                 <div className="grid grid-cols-4 gap-3">
                    {imageState.images.map((img, index) => (
                        <div 
                           key={index}
                           onClick={() => setImageState(prev => ({...prev, selectedIndex: index}))}
                           className={`aspect-square rounded-xl cursor-pointer overflow-hidden border-2 transition-all hover:scale-105 shadow-sm ${imageState.selectedIndex === index ? 'border-brand-500 ring-2 ring-brand-200 scale-105' : 'border-white opacity-70 hover:opacity-100'}`}
                        >
                           <img src={img} alt={`Variante ${index + 1}`} className="w-full h-full object-cover" />
                           {imageState.selectedIndex === index && (
                             <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <CheckCircle2 className="w-6 h-6 text-white drop-shadow-md" />
                             </div>
                           )}
                        </div>
                    ))}
                 </div>
             </div>
          )}

        </div>
      </div>

      {/* Floating Support Button for App Users */}
      <button 
        onClick={openSupportWhatsApp}
        className="fixed bottom-6 right-6 bg-[#25D366] hover:bg-[#20bd5a] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 z-50 flex items-center justify-center group"
        title="Falar com Suporte"
      >
        <MessageCircle className="w-6 h-6 fill-current" />
        <span className="absolute right-full mr-3 bg-slate-900 text-white text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Suporte
        </span>
      </button>

    </div>
  );
};

export default App;
