

import { User, UsageLog, PlanType, AdminStats, Brand, SystemSettings } from '../types';

const USERS_KEY = 'promogen_users';
const CURRENT_USER_KEY = 'promogen_current_session';
const USAGE_KEY = 'promogen_usage_logs';
const BRANDS_KEY = 'promogen_brands';
const SETTINGS_KEY = 'promogen_settings';

// Helper to get today's date string YYYY-MM-DD
const getTodayString = () => new Date().toISOString().split('T')[0];

export const storageService = {
  // --- Initialization ---
  initializeTestUsers: () => {
    let users = [];
    try {
      users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    } catch (e) {
      users = [];
    }

    const admin = users.find((u: any) => u.email === 'admin@promogen.com');
    const agency = users.find((u: any) => u.email === 'agency@promogen.com');

    // Se o admin não existe, OU se a senha for a antiga ('admin'), recria tudo.
    if (!admin || admin.password === 'admin' || admin.password === '123' || !agency) {
      
      // Datas calculadas para teste
      const nextMonth = new Date();
      nextMonth.setDate(nextMonth.getDate() + 31);
      
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);

      const testUsers = [
        {
          id: 'admin-id',
          name: 'Administrador',
          email: 'admin@promogen.com',
          password: 'admin123',
          plan: 'pro',
          createdAt: new Date().toISOString(),
          isAdmin: true
        },
        {
          id: 'agency-user-id',
          name: 'Agência Criativa',
          email: 'agency@promogen.com',
          password: '123456',
          plan: 'agency', // Plano Agency
          createdAt: new Date().toISOString(),
          subscriptionExpiry: nextMonth.toISOString()
        },
        {
          id: 'free-user-id',
          name: 'Usuário Grátis',
          email: 'free@promogen.com',
          password: '123456',
          plan: 'free',
          createdAt: new Date().toISOString()
        },
        {
          id: 'pro-user-id',
          name: 'Usuário Pro',
          email: 'pro@promogen.com',
          password: '123456',
          plan: 'pro',
          createdAt: new Date().toISOString(),
          subscriptionExpiry: nextYear.toISOString()
        }
      ];
      // Merge existing users with test users to avoid overwriting real registrations completely if logic changes,
      // but for this "reset" logic, we overwrite to ensure consistency.
      localStorage.setItem(USERS_KEY, JSON.stringify(testUsers));
      console.log('Test users initialized/updated (including Agency)');
    }
  },

  // --- Auth ---
  register: (email: string, password: string, name: string): User => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    if (users.find((u: any) => u.email === email)) {
      throw new Error('E-mail já cadastrado.');
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      name,
      plan: 'free', // Default plan
      createdAt: new Date().toISOString()
    };

    // Save user data (simulating DB with password - in real app, hash password)
    const userWithPass = { ...newUser, password };
    users.push(userWithPass);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Auto login
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return newUser;
  },

  login: (email: string, password: string): User => {
    // Ensure users exist and are up to date
    storageService.initializeTestUsers();

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    // Simple matching (in real apps, compare hashes)
    const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (!user) {
      throw new Error('E-mail ou senha inválidos.');
    }

    const { password: _, ...safeUser } = user;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
    return safeUser;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  // --- Quota Management ---
  checkQuota: (userId: string): { allowed: boolean; remaining: number; used: number } => {
    const user = storageService.getCurrentUser();
    
    // Admin always allowed
    if (user?.isAdmin) return { allowed: true, remaining: 9999, used: 0 };
    
    // Must verify against DB to get latest plan status (in case admin changed it)
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const dbUser = users.find((u: any) => u.id === userId);
    
    if (!dbUser) return { allowed: false, remaining: 0, used: 0 };

    if (dbUser.plan === 'pro' || dbUser.plan === 'agency') return { allowed: true, remaining: 9999, used: 0 };

    const logs = JSON.parse(localStorage.getItem(USAGE_KEY) || '{}');
    const today = getTodayString();
    const userLogKey = `${userId}_${today}`;
    const usedToday = logs[userLogKey] || 0;
    const limit = 2; // Free limit

    return {
      allowed: usedToday < limit,
      remaining: limit - usedToday,
      used: usedToday
    };
  },

  incrementUsage: (userId: string) => {
    const logs = JSON.parse(localStorage.getItem(USAGE_KEY) || '{}');
    const today = getTodayString();
    const userLogKey = `${userId}_${today}`;
    const usedToday = logs[userLogKey] || 0;
    
    logs[userLogKey] = usedToday + 1;
    
    // Also track total lifetime usage for admin stats (format: user_total_ID)
    const totalKey = `total_${userId}`;
    logs[totalKey] = (logs[totalKey] || 0) + 1;

    localStorage.setItem(USAGE_KEY, JSON.stringify(logs));
  },

  // --- Subscription ---
  upgradeToPro: (userId: string, plan: PlanType = 'pro') => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    // Calculate Expiry Date
    const expiryDate = new Date();
    if (plan === 'pro') {
        // Pro = Annual
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    } else if (plan === 'agency') {
        // Agency = Monthly (31 days)
        expiryDate.setDate(expiryDate.getDate() + 31);
    }

    const updatedUsers = users.map((u: any) => {
      if (u.id === userId) {
        return { 
            ...u, 
            plan,
            subscriptionExpiry: expiryDate.toISOString() 
        };
      }
      return u;
    });

    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    
    // Update session
    const currentUser = storageService.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      currentUser.plan = plan;
      currentUser.subscriptionExpiry = expiryDate.toISOString();
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    }
  },

  // Simula a validação de um pagamento no "backend"
  validatePayment: async (userId: string): Promise<boolean> => {
      // Em um app real, aqui você chamaria sua API para ver se o webhook do Mercado Pago chegou
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simula delay de rede
      return true; // Sempre retorna true para teste
  },

  // --- Brand Management (Agency Only) ---
  saveBrand: (userId: string, brand: Omit<Brand, 'id' | 'userId'>) => {
    const brands = JSON.parse(localStorage.getItem(BRANDS_KEY) || '[]');
    const newBrand: Brand = {
      id: crypto.randomUUID(),
      userId,
      ...brand
    };
    brands.push(newBrand);
    localStorage.setItem(BRANDS_KEY, JSON.stringify(brands));
    return newBrand;
  },

  getBrands: (userId: string): Brand[] => {
    const brands = JSON.parse(localStorage.getItem(BRANDS_KEY) || '[]');
    return brands.filter((b: Brand) => b.userId === userId);
  },

  deleteBrand: (brandId: string) => {
    const brands = JSON.parse(localStorage.getItem(BRANDS_KEY) || '[]');
    const filteredBrands = brands.filter((b: Brand) => b.id !== brandId);
    localStorage.setItem(BRANDS_KEY, JSON.stringify(filteredBrands));
  },

  // --- Settings (Payment Links & API Keys) ---
  getSettings: (): SystemSettings => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure new fields exist even in old saved data
      return {
        proPlanLink: parsed.proPlanLink || "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=placeholder-pro",
        agencyPlanLink: parsed.agencyPlanLink || "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=placeholder-agency",
        googleApiKey: parsed.googleApiKey || "",
        whatsappNumber: parsed.whatsappNumber || "5511999999999",
        whatsappMessage: parsed.whatsappMessage || "Olá, preciso de ajuda com o PromoGen."
      };
    }
    // Default placeholders
    return {
      proPlanLink: "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=placeholder-pro",
      agencyPlanLink: "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=placeholder-agency",
      googleApiKey: "", 
      whatsappNumber: "5511999999999",
      whatsappMessage: "Olá, preciso de ajuda com o PromoGen."
    };
  },

  saveSettings: (settings: SystemSettings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  // --- Admin Functions ---
  getAllUsers: (): User[] => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    return users.map(({ password, ...u }: any) => u);
  },

  deleteUser: (userId: string) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const filteredUsers = users.filter((u: any) => u.id !== userId);
    localStorage.setItem(USERS_KEY, JSON.stringify(filteredUsers));
  },

  updateUserPlan: (userId: string, plan: PlanType) => {
    // Re-uses logic to ensure date calculation is consistent
    storageService.upgradeToPro(userId, plan);
  },

  getDashboardStats: (): AdminStats => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const logs = JSON.parse(localStorage.getItem(USAGE_KEY) || '{}');
    
    const totalUsers = users.length;
    const totalPro = users.filter((u: any) => (u.plan === 'pro' || u.plan === 'agency') && !u.isAdmin).length;
    const totalFree = users.filter((u: any) => u.plan === 'free').length;
    
    let totalGenerations = 0;
    Object.keys(logs).forEach(key => {
        if (typeof logs[key] === 'number') {
             if (key.includes('_') && !key.startsWith('total_')) {
                 totalGenerations += logs[key];
             }
        }
    });

    // Calculations
    const totalProUsers = users.filter((u: any) => u.plan === 'pro').length;
    const totalAgencyUsers = users.filter((u: any) => u.plan === 'agency').length;
    
    const mrr = (totalProUsers * 8.08) + (totalAgencyUsers * 197);
    const estimatedCost = totalGenerations * 0.02;

    return {
      totalUsers,
      totalPro,
      totalFree,
      mrr,
      totalGenerations,
      estimatedCost
    };
  }
};
