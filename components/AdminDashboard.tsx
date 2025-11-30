

import React, { useState, useEffect } from 'react';
import { User, AdminStats, SystemSettings, PlanType } from '../types';
import { storageService } from '../services/storageService';
import { Button } from './Button';
import { Users, DollarSign, Activity, Trash2, Shield, LogOut, Search, CreditCard, Settings, Link, Save, Check, Key, Phone, MessageSquare, Calendar, Clock, X, Coffee, Crown, Briefcase, Edit } from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

type Tab = 'users' | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Date Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Settings State
  const [settings, setSettings] = useState<SystemSettings>({ proPlanLink: '', agencyPlanLink: '', googleApiKey: '', whatsappNumber: '', whatsappMessage: '' });
  const [savedSuccess, setSavedSuccess] = useState(false);

  // User Edit Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedPlanForEdit, setSelectedPlanForEdit] = useState<PlanType>('free');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setUsers(storageService.getAllUsers());
    setStats(storageService.getDashboardStats());
    setSettings(storageService.getSettings());
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

  // Filter Logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDate = true;
    if (startDate) {
        matchesDate = matchesDate && new Date(user.createdAt) >= new Date(startDate);
    }
    if (endDate) {
        // Adjust end date to end of day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && new Date(user.createdAt) <= end;
    }

    return matchesSearch && matchesDate;
  });

  return (
    <div className="min-h-screen bg-slate-100 font-sans relative">
      {/* Navbar */}
      <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-brand-500 p-2 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Painel Administrativo</span>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg">
             <button 
               onClick={() => setActiveTab('users')} 
               className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'users' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
             >
               <Users className="w-4 h-4" /> Usuários
             </button>
             <button 
               onClick={() => setActiveTab('settings')} 
               className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'settings' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
             >
               <Settings className="w-4 h-4" /> Configurações
             </button>
          </div>

          <button 
            onClick={onLogout} 
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-medium"
          >
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

        {activeTab === 'users' ? (
          /* User Management Tab */
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                 <h2 className="text-lg font-bold text-slate-900 mb-1">Gestão de Usuários</h2>
                 <p className="text-sm text-slate-500">Gerencie planos e acesse o histórico.</p>
              </div>
              
              <div className="flex flex-col md:flex-row gap-3">
                 {/* Date Filter */}
                 <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
                    <div className="flex items-center px-2 text-slate-400">
                        <Calendar className="w-4 h-4" />
                    </div>
                    <input 
                        type="date" 
                        className="bg-transparent text-sm text-slate-600 outline-none w-32"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        title="Data Início"
                    />
                    <span className="text-slate-400">-</span>
                    <input 
                        type="date" 
                        className="bg-transparent text-sm text-slate-600 outline-none w-32"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        title="Data Fim"
                    />
                 </div>

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
                    <th className="p-4">Plano Atual</th>
                    <th className="p-4">Vencimento</th>
                    <th className="p-4">Cadastro</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
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
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.plan === 'pro' 
                            ? 'bg-green-100 text-green-800' 
                            : user.plan === 'agency' 
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-slate-100 text-slate-800'
                        }`}>
                          {user.plan === 'pro' ? 'PROFISSIONAL' : user.plan === 'agency' ? 'AGÊNCIA' : 'GRATUITO'}
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
                      <td className="p-4 text-sm text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-4 text-right">
                        {!user.isAdmin && (
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => openEditModal(user)}
                              className="text-xs font-medium text-brand-600 hover:text-brand-800 px-3 py-1.5 border border-brand-200 rounded-lg hover:bg-brand-50 transition-colors flex items-center gap-1"
                            >
                              <Edit className="w-3 h-3" /> Alterar Plano
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Excluir Usuário"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 text-sm">
                        Nenhum usuário encontrado com os filtros selecionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
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
                      <Link className="w-4 h-4" /> Links de Pagamento
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

                     <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Plano Agência</label>
                        <input 
                            type="url" 
                            required
                            placeholder="https://www.mercadopago.com.br/checkout/..." 
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm text-slate-700 font-mono bg-slate-50"
                            value={settings.agencyPlanLink}
                            onChange={(e) => setSettings({...settings, agencyPlanLink: e.target.value})}
                        />
                     </div>
                   </div>
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

      {/* EDIT USER PLAN MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeEditModal}></div>
          <div className="relative bg-white w-full max-w-md rounded-xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-lg font-bold text-slate-900">Alterar Plano do Usuário</h3>
               <button onClick={closeEditModal} className="text-slate-400 hover:text-slate-600">
                 <X className="w-5 h-5" />
               </button>
             </div>
             
             <div className="bg-slate-50 p-3 rounded-lg mb-6 flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600">
                     {editingUser.name.charAt(0)}
                 </div>
                 <div>
                     <p className="text-sm font-bold text-slate-800">{editingUser.name}</p>
                     <p className="text-xs text-slate-500">{editingUser.email}</p>
                 </div>
             </div>

             <div className="space-y-3 mb-6">
                <label className={`flex items-center p-3 rounded-lg border cursor-pointer ${selectedPlanForEdit === 'free' ? 'border-slate-500 bg-slate-50 ring-1 ring-slate-500' : 'border-slate-200 hover:border-slate-300'}`}>
                    <input type="radio" name="admin_plan" value="free" checked={selectedPlanForEdit === 'free'} onChange={() => setSelectedPlanForEdit('free')} className="sr-only" />
                    <Coffee className="w-5 h-5 text-slate-500 mr-3" />
                    <div className="flex-1">
                        <span className="block text-sm font-bold text-slate-700">Gratuito</span>
                        <span className="text-xs text-slate-500">Acesso básico</span>
                    </div>
                </label>

                <label className={`flex items-center p-3 rounded-lg border cursor-pointer ${selectedPlanForEdit === 'pro' ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' : 'border-slate-200 hover:border-brand-200'}`}>
                    <input type="radio" name="admin_plan" value="pro" checked={selectedPlanForEdit === 'pro'} onChange={() => setSelectedPlanForEdit('pro')} className="sr-only" />
                    <Crown className="w-5 h-5 text-brand-600 mr-3" />
                    <div className="flex-1">
                        <span className="block text-sm font-bold text-brand-800">Profissional</span>
                        <span className="text-xs text-brand-600">Ilimitado (Validade +1 ano)</span>
                    </div>
                </label>

                <label className={`flex items-center p-3 rounded-lg border cursor-pointer ${selectedPlanForEdit === 'agency' ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500' : 'border-slate-200 hover:border-purple-200'}`}>
                    <input type="radio" name="admin_plan" value="agency" checked={selectedPlanForEdit === 'agency'} onChange={() => setSelectedPlanForEdit('agency')} className="sr-only" />
                    <Briefcase className="w-5 h-5 text-purple-600 mr-3" />
                    <div className="flex-1">
                        <span className="block text-sm font-bold text-purple-800">Agência</span>
                        <span className="text-xs text-purple-600">Multi-marcas (Validade +31 dias)</span>
                    </div>
                </label>
             </div>

             <div className="flex gap-2">
                 <button onClick={closeEditModal} className="flex-1 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">
                    Cancelar
                 </button>
                 <Button onClick={handleSavePlanChange} className="flex-1">
                    Salvar Alteração
                 </Button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
