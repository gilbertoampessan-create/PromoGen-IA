
import { User, UsageLog, PlanType, AdminStats, SystemSettings, BusinessSegment, Campaign, FinancialTransaction, AppNotification } from '../types';

const USERS_KEY = 'promogen_users';
const CURRENT_USER_KEY = 'promogen_current_session';
const USAGE_KEY = 'promogen_usage_logs';
const SETTINGS_KEY = 'promogen_settings';
const CAMPAIGNS_KEY = 'promogen_campaigns';
const TRANSACTIONS_KEY = 'promogen_transactions';
const NOTIFICATIONS_KEY = 'promogen_notifications';

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

    // Se o admin não existe, recria tudo.
    if (!admin || admin.password === 'admin' || admin.password === '123') {
      
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);

      const testUsers = [
        {
          id: 'admin-id',
          name: 'Administrador',
          email: 'admin@promogen.com',
          password: 'admin123',
          plan: 'pro',
          businessSegment: 'Tecnologia / Eletrônicos',
          createdAt: new Date().toISOString(),
          isAdmin: true
        },
        {
          id: 'free-user-id',
          name: 'Usuário Grátis',
          email: 'free@promogen.com',
          password: '123456',
          plan: 'free',
          businessSegment: 'Alimentação / Restaurante',
          createdAt: new Date().toISOString()
        },
        {
          id: 'pro-user-id',
          name: 'Usuário Pro',
          email: 'pro@promogen.com',
          password: '123456',
          plan: 'pro',
          businessSegment: 'Varejo / Loja de Roupas',
          createdAt: new Date().toISOString(),
          subscriptionExpiry: nextYear.toISOString()
        }
      ];
      localStorage.setItem(USERS_KEY, JSON.stringify(testUsers));
    }
  },

  // --- Auth ---
  register: (email: string, password: string, name: string, businessSegment: BusinessSegment, initialPlan: PlanType = 'free'): User => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    if (users.find((u: any) => u.email === email)) {
      throw new Error('E-mail já cadastrado.');
    }

    // Define expiry if PRO
    let subscriptionExpiry: string | undefined = undefined;
    if (initialPlan === 'pro') {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        subscriptionExpiry = date.toISOString();
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      name,
      plan: initialPlan, 
      businessSegment,
      createdAt: new Date().toISOString(),
      subscriptionExpiry
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

  updateUser: (userId: string, data: Partial<User>): User => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    let updatedUser: User | null = null;

    const newUsersList = users.map((u: any) => {
        if (u.id === userId) {
            updatedUser = { ...u, ...data };
            return updatedUser;
        }
        return u;
    });

    if (!updatedUser) throw new Error("Usuário não encontrado");

    localStorage.setItem(USERS_KEY, JSON.stringify(newUsersList));

    // Update current session if applicable
    const current = storageService.getCurrentUser();
    if (current && current.id === userId) {
        // Remove password from object before saving to session storage if it exists in data
        const { password, ...safeUser } = updatedUser as any;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
        return safeUser;
    }

    const { password, ...safeReturn } = updatedUser as any;
    return safeReturn;
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

    if (dbUser.plan === 'pro') return { allowed: true, remaining: 9999, used: 0 };

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
  
  // Creates a pending transaction when user clicks payment link
  createSubscriptionTransaction: (userId: string, userName: string) => {
      const tx: FinancialTransaction = {
          id: crypto.randomUUID(),
          userId,
          userName,
          type: 'income',
          category: 'Assinatura',
          description: `Assinatura PRO - ${userName}`,
          amount: 97.00,
          date: new Date().toISOString(),
          status: 'pending',
          planType: 'annual'
      };
      storageService.addFinancialTransaction(tx);
  },

  // Admin approves transaction -> Upgrades user
  approveTransaction: (txId: string) => {
      const transactions = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
      const txIndex = transactions.findIndex((t: any) => t.id === txId);
      
      if (txIndex === -1) return;
      
      const tx = transactions[txIndex];
      
      // Update TX Status
      transactions[txIndex].status = 'paid';
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));

      // Upgrade User if userId is present
      if (tx.userId) {
          storageService.upgradeToPro(tx.userId, 'pro');
      }
  },

  // Admin rejects transaction
  rejectTransaction: (txId: string) => {
      const transactions = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
      const updated = transactions.map((t: any) => t.id === txId ? { ...t, status: 'rejected' } : t);
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updated));
  },

  upgradeToPro: (userId: string, plan: PlanType = 'pro') => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    // Calculate Expiry Date (Pro = Annual)
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

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

  // --- Settings (Payment Links & API Keys) ---
  getSettings: (): SystemSettings => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    // Link padrão fornecido pelo usuário
    const DEFAULT_MP_LINK = "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=a0d6af83b59247fa8b845fc7f3a67a7d";
    
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        proPlanLink: parsed.proPlanLink || DEFAULT_MP_LINK,
        whatsappNumber: parsed.whatsappNumber || "5511999999999",
        whatsappMessage: parsed.whatsappMessage || "Olá, preciso de ajuda com o PromoGen.",
        termsOfService: parsed.termsOfService || "Termos de uso padrão..."
      };
    }
    // Default placeholders
    return {
      proPlanLink: DEFAULT_MP_LINK,
      whatsappNumber: "5511999999999",
      whatsappMessage: "Olá, preciso de ajuda com o PromoGen.",
      termsOfService: "1. O uso deste software é pessoal e intransferível.\n2. Não nos responsabilizamos pelo conteúdo gerado.\n3. O plano PRO tem validade de 1 ano."
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
    if (plan === 'free') {
        const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
        const updatedUsers = users.map((u: any) => {
            if (u.id === userId) {
                return { ...u, plan: 'free', subscriptionExpiry: undefined };
            }
            return u;
        });
        localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
        
        const currentUser = storageService.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            currentUser.plan = 'free';
            currentUser.subscriptionExpiry = undefined;
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
        }
    } else {
        storageService.upgradeToPro(userId, plan);
    }
  },

  getDashboardStats: (): AdminStats => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const logs = JSON.parse(localStorage.getItem(USAGE_KEY) || '{}');
    const transactions = storageService.getFinancialTransactions();
    
    const totalUsers = users.length;
    const totalPro = users.filter((u: any) => u.plan === 'pro' && !u.isAdmin).length;
    const totalFree = users.filter((u: any) => u.plan === 'free').length;
    
    let totalGenerations = 0;
    Object.keys(logs).forEach(key => {
        if (typeof logs[key] === 'number') {
             if (key.includes('_') && !key.startsWith('total_')) {
                 totalGenerations += logs[key];
             }
        }
    });

    const mrr = totalPro * 8.08; 
    const estimatedCost = totalGenerations * 0.02;

    // Financial Calculation
    let income = 0;
    let expenses = 0;
    transactions.forEach(tx => {
        if (tx.status === 'paid') {
            if (tx.type === 'income') income += tx.amount;
            if (tx.type === 'expense') expenses += tx.amount;
        }
    });

    return {
      totalUsers,
      totalPro,
      totalFree,
      mrr,
      totalGenerations,
      estimatedCost,
      cashFlow: {
          income,
          expenses,
          balance: income - expenses
      }
    };
  },

  // --- Financial Transactions (Enhanced) ---
  getFinancialTransactions: (userId?: string): FinancialTransaction[] => {
      const stored = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
      let result = stored;

      // Migrate mock if needed
      if (stored.length === 0) {
          const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
          const proUsers = users.filter((u: any) => u.plan === 'pro' && !u.isAdmin);
          const initialData = proUsers.map((u: User) => ({
              id: `tx_${u.id.substring(0,8)}`,
              userId: u.id,
              userName: u.name,
              type: 'income',
              category: 'Assinatura',
              description: `Upgrade Plano Pro - ${u.name}`,
              amount: 97.00,
              date: u.createdAt,
              status: 'paid'
          }));
          localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(initialData));
          result = initialData;
      }

      if (userId) {
          result = result.filter((tx: any) => tx.userId === userId);
      }

      return result.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  addFinancialTransaction: (tx: FinancialTransaction) => {
      const transactions = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
      transactions.push(tx);
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  },

  deleteFinancialTransaction: (id: string) => {
      const transactions = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
      const filtered = transactions.filter((t: any) => t.id !== id);
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(filtered));
  },

  // --- Campaigns & Notifications ---
  getCampaigns: (): Campaign[] => {
      return JSON.parse(localStorage.getItem(CAMPAIGNS_KEY) || '[]');
  },

  createCampaign: (campaign: Campaign) => {
      const campaigns = JSON.parse(localStorage.getItem(CAMPAIGNS_KEY) || '[]');
      campaigns.push(campaign);
      localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(campaigns));

      // GENERATE NOTIFICATIONS FOR TARGET USERS
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      const notifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');

      users.forEach((user: User) => {
          // Check Segment
          const segmentMatch = campaign.targetSegment === 'Todos' || user.businessSegment === campaign.targetSegment;
          // Check Plan
          const planMatch = campaign.targetPlan === 'all' || user.plan === campaign.targetPlan;

          if (segmentMatch && planMatch) {
              const notification: AppNotification = {
                  id: crypto.randomUUID(),
                  userId: user.id,
                  title: campaign.name,
                  message: campaign.message,
                  date: new Date().toISOString(),
                  read: false,
                  type: 'campaign'
              };
              notifications.push(notification);
          }
      });

      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  },

  deleteCampaign: (id: string) => {
      const campaigns = JSON.parse(localStorage.getItem(CAMPAIGNS_KEY) || '[]');
      const filtered = campaigns.filter((c: any) => c.id !== id);
      localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(filtered));
  },

  // --- Notification System ---
  getUserNotifications: (userId: string): AppNotification[] => {
      const all = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
      return all
        .filter((n: AppNotification) => n.userId === userId)
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  markNotificationAsRead: (notificationId: string) => {
      const all = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
      const updated = all.map((n: AppNotification) => {
          if (n.id === notificationId) return { ...n, read: true };
          return n;
      });
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  }
};