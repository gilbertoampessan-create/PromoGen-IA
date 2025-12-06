
import React, { useState, useEffect } from 'react';
import { User, AdminStats, SystemSettings, PlanType, Campaign, BUSINESS_SEGMENTS, BusinessSegment, FinancialTransaction } from '../types';
import { storageService } from '../services/storageService';
import { Button } from './Button';
import { Users, DollarSign, Activity, Trash2, Shield, LogOut, Search, CreditCard, Settings, Link, Save, Check, Key, Phone, MessageSquare, Calendar, Clock, X, Coffee, Crown, Edit, Briefcase, TrendingUp, Send, Target, FileText, ArrowUpRight, ArrowDownRight, Plus, Minus, User as UserIcon, AlertCircle } from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

type Tab = 'users' | 'financial' | 'campaigns' | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [financials, setFinancials] = useState<FinancialTransaction[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Date Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Settings State
  const [settings, setSettings] = useState<SystemSettings>({ proPlanLink: '', googleApiKey: '', whatsappNumber: '', whatsappMessage: '', termsOfService: '' });
  const [savedSuccess, setSavedSuccess] = useState(false);

  // User Edit Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedPlanForEdit, setSelectedPlanForEdit] = useState<PlanType>('free');

  // New Campaign State
  const [newCampaign, setNewCampaign] = useState<{name: string, segment: string, plan: string, message: string}>({
      name: '', segment: 'Todos', plan: 'all', message: ''
  });

  // New Transaction State
  const [showTxModal, setShowTxModal] = useState(false);
  const [newTx, setNewTx] = useState({
      type: 'income',
      category: 'Outros',
      description: '',
      amount: '',
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = () => {
    setUsers(storageService.getAllUsers());
    setStats(storageService.getDashboardStats());
    setSettings(storageService.getSettings());
    setFinancials(storageService.getFinancialTransactions());
    setCampaigns(storageService.getCampaigns());
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      storageService.deleteUser(id);
      loadData();
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setSelectedPlanForEdit(user.plan);
  };

  const closeEditModal = () => {
    setEditingUser(null);
  };

  const handleSavePlanChange = () => {
    if (editingUser) {
      storageService.updateUserPlan(editingUser.id, selectedPlanForEdit);
      loadData();
      closeEditModal();
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
      e.preventDefault();
      if(!newCampaign.name || !newCampaign.message) return;

      // Calculate reach based on filters
      const userCount = users.filter(u => {
          const matchSegment = newCampaign.segment === 'Todos' || u.businessSegment === newCampaign.segment;
          const matchPlan = newCampaign.plan === 'all' || u.plan === newCampaign.plan;
          return matchSegment && matchPlan;
      }).length;

      const campaign: Campaign = {
          id: crypto.randomUUID(),
          name: newCampaign.name,
          targetSegment: newCampaign.segment as any,
          targetPlan: newCampaign.plan as any,
          message: newCampaign.message,
          status: 'active',
          createdAt: new Date().toISOString(),
          reach: userCount
      };
      
      storageService.createCampaign(campaign);
      setNewCampaign({ name: '', segment: 'Todos', plan: 'all', message: '' });
      loadData();
      alert(`Campanha enviada para ${userCount} usuários!`);
  };

  const handleDeleteCampaign = (id: string) => {
      if(confirm("Excluir campanha?")) {
          storageService.deleteCampaign(id);
          loadData();
      }
  };

  const handleAddTransaction = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTx.amount || !newTx.description) return;

      const tx: FinancialTransaction = {
          id: crypto.randomUUID(),
          type: newTx.type as 'income' | 'expense',
          category: newTx.category,
          description: newTx.description,
          amount: parseFloat(newTx.amount),
          date: new Date().toISOString(),
          status: 'paid'
      };

      storageService.addFinancialTransaction(tx);
      setShowTxModal(false);
      setNewTx({ type: 'income', category: 'Outros', description: '', amount: '' });
      loadData();
  };

  const handleDeleteTransaction = (id: string) => {
      if(confirm("Remover este lançamento?")) {
          storageService.deleteFinancialTransaction(id);
          loadData();
      }
  };

  const handleApproveTransaction = (id: string) => {
      if(confirm("Aprovar pagamento e liberar plano PRO para o usuário?")) {
          storageService.approveTransaction(id);
          loadData();
      }
  };

  const handleRejectTransaction = (id: string) => {
      if(confirm("Rejeitar solicitação de pagamento?")) {
          storageService.rejectTransaction(id);
          loadData();
      }
  };

  // Filter Logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDate = true;
    if (startDate) {
        matchesDate = matchesDate && new Date(user.createdAt) >= new Date(startDate);
    }
    if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && new Date(user.createdAt) <= end;
    }

    return matchesSearch && matchesDate;
  });

  const pendingTransactions = financials.filter(tx => tx.status === 'pending');
  const historyTransactions = financials.filter(tx => tx.status !== 'pending');

  return (
    <div className="min-h-screen bg-slate-100 font-sans relative pb-20">
      {/* Navbar */}
      <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-brand-500 p-2 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Painel Administrativo</span>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg overflow-x-auto">
             <button onClick={() => setActiveTab('users')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'users' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>
               <Users className="w-4 h-4" /> Usuários
             </button>
             <button onClick={() => setActiveTab('financial')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'financial' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>
               <TrendingUp className="w-4 h-4" /> Financeiro
             </button>
             <button onClick={() => setActiveTab('campaigns')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'campaigns' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>
               <Target className="w-4 h-4" /> Campanhas
             </button>
             <button onClick={() => setActiveTab('settings')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'settings' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>
               <Settings className="w-4 h-4" /> Configurações
             </button>
          </div>

          <button onClick={onLogout} className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-medium">
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Grid - Always Visible */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-in fade-in slide-in-from-top-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Receita Mensal (MRR)</h3>
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">
              R$ {stats?.mrr.toFixed(2).replace('.', ',')}
            </p>
            <p className="text-xs text-slate-400 mt-1">Baseado em assinaturas ativas</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Usuários Totais</h3>
              <Users className="w-5 h-5 text-brand-500" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{stats?.totalUsers}</p>
            <div className="flex gap-2 mt-2 text-xs font-bold">
              <span className="text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">{stats?.totalPro} PRO</span>
              <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">{stats?.totalFree} Free</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Gerações (Tokens)</h3>
              <Activity className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{stats?.totalGenerations}</p>
            <p className="text-xs text-slate-400 mt-1">Imagens geradas no total</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Custo Estimado API</h3>
              <CreditCard className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">
              $ {stats?.estimatedCost.toFixed(2)}
            </p>
            <p className="text-xs text-slate-400 mt-1">Estimativa de uso da Google AI</p>
          </div>
        </div>

        {activeTab === 'users' && (
          /* User Management Tab */
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                 <h2 className="text-lg font-bold text-slate-900 mb-1">Gestão de Usuários</h2>
                 <p className="text-sm text-slate-500">Clique em um usuário para ver detalhes ou editar.</p>
              </div>
              
              <div className="flex flex-col md:flex-row gap-3">
                 {/* Search */}
                 <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input 
                    type="text" 
                    placeholder="Buscar usuário..." 
                    className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none w-full md:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold tracking-wider">
                    <th className="p-4">Usuário</th>
                    <th className="p-4">Segmento</th>
                    <th className="p-4">Plano</th>
                    <th className="p-4">Vencimento</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => openEditModal(user)}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{user.name} {user.isAdmin && <span className="text-[10px] bg-slate-800 text-white px-1.5 py-0.5 rounded ml-1">ADMIN</span>}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {user.businessSegment || '-'}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.plan === 'pro' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          {user.plan === 'pro' ? 'PROFISSIONAL' : 'GRATUITO'}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-600 font-medium">
                        {user.subscriptionExpiry ? (
                             <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2 py-1 rounded w-fit text-xs">
                                <Clock className="w-3 h-3" />
                                {new Date(user.subscriptionExpiry).toLocaleDateString('pt-BR')}
                             </div>
                        ) : (
                            <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                         <Button variant="outline" className="text-xs px-2 py-1 h-auto" onClick={(e) => { e.stopPropagation(); openEditModal(user); }}>
                            Editar
                         </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'financial' && (
             <div className="space-y-6 animate-in fade-in">
                {/* Cash Flow Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Entradas Totais</h3>
                            <ArrowUpRight className="w-5 h-5 text-green-500" />
                        </div>
                        <p className="text-2xl font-extrabold text-green-600">
                            R$ {stats?.cashFlow?.income.toFixed(2)}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Saídas Totais</h3>
                            <ArrowDownRight className="w-5 h-5 text-red-500" />
                        </div>
                        <p className="text-2xl font-extrabold text-red-600">
                            R$ {stats?.cashFlow?.expenses.toFixed(2)}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Saldo em Caixa</h3>
                            <DollarSign className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className={`text-2xl font-extrabold ${(stats?.cashFlow?.balance || 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            R$ {stats?.cashFlow?.balance.toFixed(2)}
                        </p>
                    </div>
                </div>

                {/* --- APPROVAL QUEUE --- */}
                {pendingTransactions.length > 0 && (
                    <div className="bg-yellow-50 rounded-xl shadow-sm border border-yellow-200 overflow-hidden">
                        <div className="p-4 border-b border-yellow-100 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                            <h2 className="text-sm font-bold text-yellow-800">Solicitações de Aprovação ({pendingTransactions.length})</h2>
                        </div>
                        <div className="divide-y divide-yellow-100">
                            {pendingTransactions.map(tx => (
                                <div key={tx.id} className="p-4 flex items-center justify-between flex-wrap gap-4">
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{tx.description}</p>
                                        <p className="text-xs text-slate-500">Usuário: {tx.userName || 'N/A'}</p>
                                        <p className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString()} • {new Date(tx.date).toLocaleTimeString()}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-900 mr-2">R$ {tx.amount.toFixed(2)}</span>
                                        <button 
                                            onClick={() => handleRejectTransaction(tx.id)}
                                            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 hover:text-red-600 transition-colors"
                                        >
                                            Rejeitar
                                        </button>
                                        <button 
                                            onClick={() => handleApproveTransaction(tx.id)}
                                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 shadow-sm transition-colors flex items-center gap-1"
                                        >
                                            <Check className="w-3 h-3" /> Aprovar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- MAIN LEDGER --- */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-slate-500" /> Livro Caixa
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">Lançamentos de receitas e despesas.</p>
                        </div>
                        <Button onClick={() => setShowTxModal(true)} icon={<Plus className="w-4 h-4" />}>
                            Novo Lançamento
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold tracking-wider">
                                    <th className="p-4">Descrição</th>
                                    <th className="p-4">Categoria</th>
                                    <th className="p-4">Data</th>
                                    <th className="p-4">Valor</th>
                                    <th className="p-4">Tipo</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {historyTransactions.map(tx => (
                                    <tr key={tx.id} className="hover:bg-slate-50">
                                        <td className="p-4 text-sm font-semibold text-slate-800">{tx.description}</td>
                                        <td className="p-4 text-sm text-slate-600">{tx.category}</td>
                                        <td className="p-4 text-sm text-slate-600">{new Date(tx.date).toLocaleDateString('pt-BR')}</td>
                                        <td className={`p-4 text-sm font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                            R$ {tx.amount.toFixed(2)}
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase ${
                                                tx.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {tx.type === 'income' ? 'Receita' : 'Despesa'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {tx.status === 'paid' && <span className="text-xs font-bold text-green-600">Pago</span>}
                                            {tx.status === 'rejected' && <span className="text-xs font-bold text-red-600">Rejeitado</span>}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => handleDeleteTransaction(tx.id)} className="text-slate-300 hover:text-red-500">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {historyTransactions.length === 0 && (
                                    <tr><td colSpan={7} className="p-8 text-center text-slate-500">Nenhum lançamento registrado.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
             </div>
        )}

        {/* Transaction Modal */}
        {showTxModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowTxModal(false)}></div>
                <div className="relative bg-white w-full max-w-md rounded-xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Novo Lançamento Financeiro</h3>
                    <form onSubmit={handleAddTransaction} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                type="button"
                                onClick={() => setNewTx({...newTx, type: 'income'})}
                                className={`p-3 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 ${newTx.type === 'income' ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 text-slate-500'}`}
                            >
                                <ArrowUpRight className="w-4 h-4" /> Receita
                            </button>
                            <button 
                                type="button"
                                onClick={() => setNewTx({...newTx, type: 'expense'})}
                                className={`p-3 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 ${newTx.type === 'expense' ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 text-slate-500'}`}
                            >
                                <ArrowDownRight className="w-4 h-4" /> Despesa
                            </button>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Valor (R$)</label>
                            <input 
                                type="number" 
                                step="0.01"
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                value={newTx.amount}
                                onChange={e => setNewTx({...newTx, amount: e.target.value})}
                                placeholder="0,00"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Categoria</label>
                            <select 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                                value={newTx.category}
                                onChange={e => setNewTx({...newTx, category: e.target.value})}
                            >
                                <option>Assinatura (Manual)</option>
                                <option>Venda Avulsa</option>
                                <option>Marketing / Ads</option>
                                <option>Servidores / API</option>
                                <option>Pessoal / Salários</option>
                                <option>Impostos</option>
                                <option>Outros</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Descrição</label>
                            <input 
                                type="text" 
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                value={newTx.description}
                                onChange={e => setNewTx({...newTx, description: e.target.value})}
                                placeholder="Ex: Pagamento Google Cloud"
                            />
                        </div>

                        <Button type="submit" className="w-full justify-center">Salvar Lançamento</Button>
                    </form>
                </div>
            </div>
        )}

        {activeTab === 'campaigns' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
                {/* Create Campaign */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-fit">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Send className="w-5 h-5 text-brand-500" /> Nova Campanha
                    </h2>
                    <form onSubmit={handleCreateCampaign} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Nome da Campanha</label>
                            <input 
                                type="text" 
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                value={newCampaign.name}
                                onChange={e => setNewCampaign({...newCampaign, name: e.target.value})}
                                placeholder="Ex: Promoção de Natal"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Segmento Alvo</label>
                            <select 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                                value={newCampaign.segment}
                                onChange={e => setNewCampaign({...newCampaign, segment: e.target.value})}
                            >
                                <option value="Todos">Todos os Segmentos</option>
                                {BUSINESS_SEGMENTS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Tipo de Assinante</label>
                            <select 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                                value={newCampaign.plan}
                                onChange={e => setNewCampaign({...newCampaign, plan: e.target.value})}
                            >
                                <option value="all">Todos os Usuários</option>
                                <option value="free">Apenas Grátis (Upsell)</option>
                                <option value="pro">Apenas PRO (Novidades)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Mensagem (Notificação)</label>
                            <textarea 
                                required
                                rows={4}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                                value={newCampaign.message}
                                onChange={e => setNewCampaign({...newCampaign, message: e.target.value})}
                                placeholder="Olá! Temos uma novidade para seu negócio..."
                            />
                        </div>
                        <Button type="submit" className="w-full justify-center">Enviar Campanha</Button>
                    </form>
                </div>

                {/* List Campaigns */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Target className="w-5 h-5 text-slate-400" /> Histórico de Envios
                    </h2>
                    {campaigns.length === 0 ? (
                        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
                            Nenhuma campanha criada ainda.
                        </div>
                    ) : (
                        campaigns.map(camp => (
                            <div key={camp.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative group">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-slate-800">{camp.name}</h3>
                                        <div className="flex gap-2 mt-1">
                                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full inline-block">
                                                {camp.targetSegment}
                                            </span>
                                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full inline-block uppercase">
                                                {camp.targetPlan === 'all' ? 'Todos' : camp.targetPlan}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded uppercase tracking-wider">
                                        Enviada
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4 italic">
                                    "{camp.message}"
                                </p>
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Alcance: {camp.reach}</span>
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(camp.createdAt).toLocaleDateString()}</span>
                                </div>
                                <button 
                                    onClick={() => handleDeleteCampaign(camp.id)}
                                    className="absolute top-4 right-4 text-slate-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )}

        {activeTab === 'settings' && (
          /* Settings Tab */
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 max-w-2xl mx-auto animate-in fade-in">
             <div className="p-6 border-b border-slate-200">
               <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-slate-400" /> Configurações do Sistema
               </h2>
               <p className="text-sm text-slate-500 mt-1">Configure links de pagamento e chaves de API.</p>
             </div>
             
             <form onSubmit={handleSaveSettings} className="p-6 space-y-6">
                
                {/* --- API KEY SECTION --- */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <label className="block text-sm font-bold text-amber-900 mb-2 flex items-center gap-2">
                      <Key className="w-4 h-4" /> Chave da API Google Gemini
                   </label>
                   <div className="relative">
                      <input 
                          type="password" 
                          placeholder="Cole sua API Key aqui (Começa com AIza...)" 
                          className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm font-mono bg-white text-slate-700"
                          value={settings.googleApiKey}
                          onChange={(e) => setSettings({...settings, googleApiKey: e.target.value})}
                      />
                   </div>
                   <p className="text-xs text-amber-700 mt-2">
                      Deixe em branco para usar a chave configurada no servidor (.env).
                      <br/><strong>Atenção:</strong> Esta chave ficará salva no navegador. Use com cautela em computadores públicos.
                   </p>
                </div>

                <hr className="border-slate-100" />

                {/* --- WHATSAPP SECTION --- */}
                <div>
                   <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                      <Phone className="w-4 h-4" /> Configuração do WhatsApp de Suporte
                   </h3>
                   <div className="grid gap-4">
                     <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1">Número (com DDD)</label>
                       <input 
                          type="text" 
                          placeholder="Ex: 5511999999999" 
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm text-slate-700 font-mono bg-slate-50"
                          value={settings.whatsappNumber}
                          onChange={(e) => setSettings({...settings, whatsappNumber: e.target.value})}
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Mensagem Padrão (Entrada URA)</label>
                       <input 
                          type="text" 
                          placeholder="Ex: Olá, preciso de ajuda." 
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm text-slate-700 bg-slate-50"
                          value={settings.whatsappMessage}
                          onChange={(e) => setSettings({...settings, whatsappMessage: e.target.value})}
                       />
                       <p className="text-xs text-slate-400 mt-1">Este texto será preenchido automaticamente quando o usuário clicar no botão de suporte.</p>
                     </div>
                   </div>
                </div>

                <hr className="border-slate-100" />

                {/* --- PAYMENT LINKS --- */}
                <div>
                   <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                      <Link className="w-4 h-4" /> Link de Pagamento (PRO)
                   </h3>
                   <div className="space-y-4">
                     <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Plano Profissional</label>
                        <input 
                            type="url" 
                            required
                            placeholder="https://www.mercadopago.com.br/checkout/..." 
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm text-slate-700 font-mono bg-slate-50"
                            value={settings.proPlanLink}
                            onChange={(e) => setSettings({...settings, proPlanLink: e.target.value})}
                        />
                     </div>
                   </div>
                </div>

                <hr className="border-slate-100" />
                
                {/* --- TERMS OF SERVICE --- */}
                <div>
                   <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Termos de Uso
                   </h3>
                   <textarea 
                        rows={6}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm text-slate-700 bg-slate-50"
                        value={settings.termsOfService}
                        onChange={(e) => setSettings({...settings, termsOfService: e.target.value})}
                        placeholder="Edite os termos de uso aqui..."
                   />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                   {savedSuccess && (
                      <span className="text-green-600 text-sm font-bold flex items-center gap-1 animate-in fade-in">
                         <Check className="w-4 h-4" /> Salvo com sucesso!
                      </span>
                   )}
                   <Button type="submit" className="px-6 py-2.5">
                      <Save className="w-4 h-4 mr-2" /> Salvar Configurações
                   </Button>
                </div>
             </form>
          </div>
        )}
      </div>

      {/* DETAILED USER EDIT MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeEditModal}></div>
          <div className="relative bg-white w-full max-w-lg rounded-xl shadow-2xl p-0 overflow-hidden animate-in fade-in zoom-in duration-200">
             
             {/* Modal Header */}
             <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-brand-400" /> Detalhes do Usuário
                </h3>
                <button onClick={closeEditModal} className="text-slate-400 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                </button>
             </div>
             
             <div className="p-6">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center font-bold text-2xl text-slate-600">
                        {editingUser.name.charAt(0)}
                    </div>
                    <div>
                        <h4 className="text-xl font-bold text-slate-900">{editingUser.name}</h4>
                        <p className="text-slate-500 text-sm flex items-center gap-1">
                            <Briefcase className="w-3 h-3" /> {editingUser.businessSegment || 'Não informado'}
                        </p>
                        <p className="text-slate-400 text-xs mt-1">{editingUser.email}</p>
                        <p className="text-slate-400 text-xs">ID: {editingUser.id}</p>
                    </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg mb-6 border border-slate-200">
                    <h5 className="text-xs font-bold text-slate-500 uppercase mb-3">Gerenciar Assinatura</h5>
                    <div className="space-y-3">
                        <label className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${selectedPlanForEdit === 'free' ? 'border-slate-500 bg-white ring-1 ring-slate-500' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                            <input type="radio" name="admin_plan" value="free" checked={selectedPlanForEdit === 'free'} onChange={() => setSelectedPlanForEdit('free')} className="sr-only" />
                            <Coffee className="w-5 h-5 text-slate-500 mr-3" />
                            <div className="flex-1">
                                <span className="block text-sm font-bold text-slate-700">Gratuito</span>
                                <span className="text-xs text-slate-500">Acesso básico limitado</span>
                            </div>
                        </label>

                        <label className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${selectedPlanForEdit === 'pro' ? 'border-brand-500 bg-white ring-1 ring-brand-500' : 'border-slate-200 hover:border-brand-200 bg-white'}`}>
                            <input type="radio" name="admin_plan" value="pro" checked={selectedPlanForEdit === 'pro'} onChange={() => setSelectedPlanForEdit('pro')} className="sr-only" />
                            <Crown className="w-5 h-5 text-brand-600 mr-3" />
                            <div className="flex-1">
                                <span className="block text-sm font-bold text-brand-800">Profissional</span>
                                <span className="text-xs text-brand-600">Acesso Ilimitado (1 Ano)</span>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button onClick={closeEditModal} className="flex-1 py-3 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                        Cancelar
                    </button>
                    <Button onClick={handleSavePlanChange} className="flex-1 py-3">
                        Salvar Alterações
                    </Button>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                    <button onClick={() => { 
                        if(confirm("Essa ação não pode ser desfeita. Continuar?")) {
                            handleDeleteUser(editingUser.id);
                            closeEditModal();
                        }
                    }} className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center justify-center gap-1 mx-auto">
                        <Trash2 className="w-3 h-3" /> Excluir permanentemente este usuário
                    </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
