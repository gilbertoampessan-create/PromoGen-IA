
export interface OfferData {
  offerText: string;
  highlightText: string;
  textColor: 'white' | 'black' | 'brand' | 'red' | 'yellow' | 'green' | 'purple' | 'pink' | 'orange' | 'teal' | 'navy' | 'custom';
  customColor?: string; // Hex code for extracted logo color
  font: 'modern' | 'classic' | 'handwritten';
  fontSize: 'small' | 'medium' | 'large';
  layout: 'center' | 'left' | 'right';
  verticalAlignment: 'top' | 'center' | 'bottom';
  aspect: ImageAspect;
  customImagePrompt?: string;
  offerStyle?: 'custom' | 'minimal' | 'luxury' | 'gourmet' | 'tech' | 'organic' | 'rustic' | 'pop' | 'corporate' | 'fitness' | 'kids';
  isolateProduct?: boolean;
  salesStrategy?: 'benefit' | 'urgency' | 'exclusive' | 'social_proof'; // Nova estratégia
}

export interface CompanyInfo {
  name: string;
  phone: string;
  logo: string | null; // Base64
  dominantColor?: string; // Deprecated in favor of palette, but kept for compatibility
  brandPalette?: string[]; // Array of extracted hex colors
  showOnImage: boolean;
}

export interface BannerContent {
  headline: string;
  subtext: string;
  highlight: string;
}

export interface OfferAudit {
  score: number; // 0 to 100
  strengths: string[];
  improvements: string[];
  verdict: string;
}

export interface SocialPost {
  caption: string;
  hashtags: string[];
}

// --- NOVOS TIPOS DE VALOR AGREGADO ---
export interface DayPlan {
  day: string; // "Dia 1", "Dia 2"...
  theme: string; // "Educativo", "Prova Social"...
  idea: string; // A ideia do conteúdo
}

export interface SalesScripts {
  approach: string; // Script de abordagem
  objection: string; // Quebra de objeção de preço
  closing: string; // Script de fechamento/escassez
}

export interface GeneratedImageState {
  isLoading: boolean;
  images: string[];
  selectedIndex: number;
  content: BannerContent | null;
  audit: OfferAudit | null;
  socialPost: SocialPost | null;
  calendar: DayPlan[] | null; // Planejamento semanal
  salesScripts: SalesScripts | null; // Scripts de venda
  videoUrl: string | null; // URL do vídeo gerado pelo Veo
  isVideoLoading?: boolean;
  error: string | null;
}

export enum ImageAspect {
  SQUARE = '1:1',
  PORTRAIT = '9:16',
  LANDSCAPE = '16:9'
}

export type GenerationMode = 'generate' | 'remix' | 'upload';

// --- Auth & Subscription Types ---

export type PlanType = 'free' | 'pro';

export const BUSINESS_SEGMENTS = [
  'Varejo / Loja de Roupas',
  'Alimentação / Restaurante',
  'Tecnologia / Eletrônicos',
  'Saúde / Clínica',
  'Beleza / Estética',
  'Imobiliária / Corretor',
  'Automotivo / Oficina',
  'Educação / Cursos',
  'Entretenimento / Eventos',
  'Viagens / Turismo',
  'Financeiro / Consultoria',
  'Jurídico / Advocacia',
  'Arte / Design',
  'Esportes / Academia',
  'Pet Shop / Veterinária',
  'Casa e Decoração',
  'Construção / Reformas',
  'Marketing / Agência',
  'Logística / Transporte',
  'Outros'
] as const;

export type BusinessSegment = typeof BUSINESS_SEGMENTS[number];

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string; // New field
  plan: PlanType;
  businessSegment: BusinessSegment;
  createdAt: string;
  isAdmin?: boolean;
  lifetimeGenerations?: number;
  subscriptionExpiry?: string; // Data de validade da assinatura (ISO String)
}

export interface UsageLog {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  view: 'landing' | 'auth' | 'app' | 'admin';
}

export interface FinancialTransaction {
  id: string;
  userId?: string; // Optional for manual entries, required for subscriptions
  userName?: string; // Snapshot of user name
  type: 'income' | 'expense';
  category: string; // Ex: Assinatura, Servidor, Marketing
  description: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'rejected';
  planType?: 'monthly' | 'annual';
}

export interface Campaign {
  id: string;
  name: string;
  targetSegment: BusinessSegment | 'Todos';
  targetPlan: PlanType | 'all'; // Novo filtro
  status: 'active' | 'draft' | 'completed';
  message: string;
  createdAt: string;
  reach: number; // Estimated users reached
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'campaign' | 'system';
}

export interface AdminStats {
  totalUsers: number;
  totalPro: number;
  totalFree: number;
  mrr: number;
  totalGenerations: number;
  estimatedCost: number;
  cashFlow?: {
    income: number;
    expenses: number;
    balance: number;
  }
}

export interface SystemSettings {
  proPlanLink: string;
  whatsappNumber: string;
  whatsappMessage: string;
  termsOfService: string;
}
