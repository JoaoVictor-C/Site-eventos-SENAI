import { useState, useMemo } from 'react';
import { adminUpdateUserPassword } from '../api/adminService';
import { UserRole } from '@/types/enums';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { useUsers } from '@/queries/users.queries';
import { useAuth } from '@/providers/AuthProvider';


export default function AdminUserManagementPage() {
  const { data: users = [], isLoading, error } = useUsers();
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<Set<UserRole>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'role'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isActive, setIsActive] = useState<boolean | null>(null);

  const handleResetPassword = async (id: string) => {
    if (!window.confirm('Resetar a senha deste usuário?')) return;

    try {
      setProcessingIds(prev => [...prev, id]);
      await adminUpdateUserPassword(id);
      alert('Senha resetada com sucesso! O usuário receberá um email com as instruções.');
    } catch (err) {
      console.error('Failed to reset password:', err);
    } finally {
      setProcessingIds(prev => prev.filter(pid => pid !== id));
    }
  };

  const getRoleBadgeColor = (role: UserRole): string => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case UserRole.GATEKEEPER:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const handleSort = (newSortBy: 'name' | 'email' | 'role') => {
    if (sortBy === newSortBy) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const handleRoleToggle = (role: UserRole) => {
    const newRoles = new Set(selectedRoles);
    if (newRoles.has(role)) {
      newRoles.delete(role);
    } else {
      newRoles.add(role);
    }
    setSelectedRoles(newRoles);
  };

  const clearFilters = () => {
    setSelectedRoles(new Set());
    setIsActive(null);
    setSearchQuery('');
  };

  const filteredAndSortedUsers = useMemo(() => {
    return users
      .filter(user => {
        const matchesSearch = searchQuery === '' || 
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesRoles = selectedRoles.size === 0 || selectedRoles.has(user.role as UserRole);
        
        const matchesStatus = isActive === null || user.isActive === isActive;

        return matchesSearch && matchesRoles && matchesStatus;
      })
      .sort((a, b) => {
        const modifier = sortOrder === 'asc' ? 1 : -1;
        switch (sortBy) {
          case 'name':
            return modifier * a.name.localeCompare(b.name);
          case 'email':
            return modifier * a.email.localeCompare(b.email);
          case 'role':
            return modifier * String(a.role).localeCompare(String(b.role));
          default:
            return 0;
        }
      });
  }, [users, searchQuery, selectedRoles, sortBy, sortOrder, isActive]);

  if (isLoading) return <LoadingSpinner message="Carregando usuários..." />;

  return (
    <div className="space-y-6 px-4 py-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold text-senai-gray dark:text-gray-100">
          Gerenciamento de Usuários
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' 
              ? 'bg-gray-200 dark:bg-gray-700' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' 
              ? 'bg-gray-200 dark:bg-gray-700' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-senai-red focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-senai-red dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
          >
            <FunnelIcon className="h-5 w-5" />
            Filtros
            {(selectedRoles.size > 0 || isActive !== null) && (
              <span className="ml-1.5 py-0.5 px-2 text-xs font-normal text-white bg-senai-red rounded-full">
                {selectedRoles.size + (isActive !== null ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Filter Menu */}
        {isFilterMenuOpen && (
          <div className="mt-4 p-4 border-t dark:border-gray-700">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Role Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Papéis
                </label>
                <div className="space-y-2">
                  <label key={UserRole.USER} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedRoles.has(UserRole.USER)}
                      onChange={() => handleRoleToggle(UserRole.USER)}
                      className="rounded border-gray-300 text-senai-red focus:ring-senai-red"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">USER</span>
                  </label>
                  <label key={UserRole.ADMIN} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedRoles.has(UserRole.ADMIN)}
                      onChange={() => handleRoleToggle(UserRole.ADMIN)}
                      className="rounded border-gray-300 text-senai-red focus:ring-senai-red"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">ADMIN</span>
                  </label>
                  <label key={UserRole.GATEKEEPER} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedRoles.has(UserRole.GATEKEEPER)}
                      onChange={() => handleRoleToggle(UserRole.GATEKEEPER)}
                      className="rounded border-gray-300 text-senai-red focus:ring-senai-red"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">GATEKEEPER</span>
                  </label>
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={isActive === null}
                      onChange={() => setIsActive(null)}
                      className="border-gray-300 text-senai-red focus:ring-senai-red"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Todos</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={isActive === true}
                      onChange={() => setIsActive(true)}
                      className="border-gray-300 text-senai-red focus:ring-senai-red"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Ativos</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={isActive === false}
                      onChange={() => setIsActive(false)}
                      className="border-gray-300 text-senai-red focus:ring-senai-red"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Inativos</span>
                  </label>
                </div>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-senai-red dark:text-gray-400 dark:hover:text-senai-red"
                >
                  Limpar filtros
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 text-red-800 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-200">
          {error.message}
        </div>
      )}

      {/* Users List/Grid */}
      {viewMode === 'list' ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th 
                  onClick={() => handleSort('name')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Nome {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  onClick={() => handleSort('email')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Email {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  onClick={() => handleSort('role')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Papel {sortBy === 'role' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAndSortedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleResetPassword(user.id)}
                      disabled={processingIds.includes(user.id)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
                    >
                      {processingIds.includes(user.id) ? 'Resetando...' : 'Resetar Senha'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {user.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {user.email}
                  </p>
                  <p className="mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Criado em: {format(new Date(user.createdAt), 'dd/MM/yyyy')}
                  </p>
                </div>
                <div>
                  <button
                    onClick={() => handleResetPassword(user.id)}
                    disabled={processingIds.includes(user.id)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
                  >
                    {processingIds.includes(user.id) 
                      ? 'Resetando...' 
                      : 'Resetar Senha'
                    }
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredAndSortedUsers.length === 0 && !error && (
        <div className="text-center py-8 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg shadow">
          {searchQuery || selectedRoles.size > 0 
            ? 'Nenhum usuário encontrado com os filtros atuais.'
            : 'Nenhum usuário encontrado.'}
        </div>
      )}
    </div>
  );
}
