import React, { useState, useEffect } from 'react';
import { User, AdminStats } from '../types';
import { storageService } from '../services/storageService';
import { Button } from './Button';
import { Users, DollarSign, Activity, Trash2, Shield, LogOut, Search, CreditCard } from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setUsers(storageService.getAllUsers());
    setStats(storageService.getDashboardStats());
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      storageService.deleteUser(id);
      loadData();
    }
  };

  const handleTogglePlan = (id: string, currentPlan: string) => {
    const newPlan = currentPlan === 'free' ? 'pro' : 'free';
    storageService.updateUserPlan(id, newPlan);
    loadData();
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      {/* Navbar */}
      <nav className="bg-slate-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-brand-500 p-2 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Painel Administrativo</span>
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
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

        {/* User Management */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-900">Gestão de Usuários</h2>
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

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold tracking-wider">
                  <th className="p-4">Usuário</th>
                  <th className="p-4">Plano Atual</th>
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
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {user.plan === 'pro' ? 'PROFISSIONAL' : 'GRATUITO'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4 text-right">
                      {!user.isAdmin && (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleTogglePlan(user.id, user.plan)}
                            className="text-xs font-medium text-brand-600 hover:text-brand-800 px-3 py-1.5 border border-brand-200 rounded-lg hover:bg-brand-50 transition-colors"
                          >
                            Mudar para {user.plan === 'free' ? 'PRO' : 'Free'}
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
                    <td colSpan={4} className="p-8 text-center text-slate-500 text-sm">
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};