
export interface OfferData {
  offerText: string;
  highlightText: string;
  textColor: 'white' | 'black' | 'brand' | 'red' | 'yellow' | 'green' | 'purple' | 'pink' | 'orange' | 'teal' | 'navy';
  font: 'modern' | 'classic' | 'handwritten';
  fontSize: 'small' | 'medium' | 'large'; // Novo campo
  layout: 'center' | 'left' | 'right';
  verticalAlignment: 'top' | 'center' | 'bottom';
  aspect: ImageAspect;
  customImagePrompt?: string;
  offerStyle?: 'custom' | 'minimal' | 'luxury' | 'gourmet' | 'tech' | 'organic';
  isolateProduct?: boolean;
}

export interface CompanyInfo {
  name: string;
  phone: string;
  logo: string | null; // Base64
  showOnImage: boolean;
}

export interface Brand {
  id: string;
  userId: string;
  internalName: string; // Nome para identificar no dropdown (ex: "Cliente Pizzaria")
  companyName: string;
  phone: string;
  logo: string | null;
}

export interface BannerContent {
  headline: string;
  subtext: string;
  highlight: string;
}

export interface GeneratedImageState {
  isLoading: boolean;
  images: string[];
  selectedIndex: number;
  content: BannerContent | null;
  error: string | null;
}

export enum ImageAspect {
  SQUARE = '1:1',
  PORTRAIT = '9:16',
  LANDSCAPE = '16:9'
}

export type GenerationMode = 'generate' | 'remix' | 'upload';

// --- Auth & Subscription Types ---

export type PlanType = 'free' | 'pro' | 'agency';

export interface User {
  id: string;
  email: string;
  name: string;
  plan: PlanType;
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

export interface AdminStats {
  totalUsers: number;
  totalPro: number;
  totalFree: number;
  mrr: number;
  totalGenerations: number;
  estimatedCost: number;
}

export interface SystemSettings {
  proPlanLink: string;
  agencyPlanLink: string;
  googleApiKey: string;
  whatsappNumber: string;
  whatsappMessage: string; // Mensagem padrão para a URA
}