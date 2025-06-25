import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminDeleteEvent } from '../api/adminService';
import { useEvents } from '@/queries/events.queries';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ROUTES } from '@/config/routes';
import { MagnifyingGlassIcon, FunnelIcon} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { Event } from '@/types';
import { useAuth } from '@/providers/AuthProvider';

export default function AdminEventManagementPage() {
  const { data: events = [], isLoading, error } = useEvents();
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(events);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<boolean | null>(null);
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null
  });
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'location'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const navigate = useNavigate();
  const { selectedEvent } = useAuth();

  useEffect(() => { 
    const eventSelected = selectedEvent
      ? events.filter(event => event.id === selectedEvent.id)
      : events;
    setFilteredEvents(eventSelected);
  }, [events]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este evento?')) return;

    try {
      await adminDeleteEvent(id);
      setFilteredEvents(filteredEvents.filter(event => event.id !== id));
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };

  const filteredAndSearchedEvents = useMemo(() => {
    return filteredEvents.filter(event => {
      const matchesSearch = searchQuery === '' || 
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = selectedStatus === null || 
        (selectedStatus === true ? event.isActive : !event.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [filteredEvents, searchQuery, selectedStatus]);

  const sortedEvents = useMemo(() => {
    return [...filteredAndSearchedEvents].sort((a, b) => {
      const aValue = sortBy === 'date' ? new Date(a.eventDate) : a[sortBy];
      const bValue = sortBy === 'date' ? new Date(b.eventDate) : b[sortBy];

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredAndSearchedEvents, sortBy, sortOrder]);

  const clearFilters = () => {
    setSelectedStatus(null);
    setSearchQuery('');
    setDateRange({ start: null, end: null });
    setSortBy('date');
    setSortOrder('asc');
  };

  if (isLoading) return <LoadingSpinner message="Carregando eventos..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold text-senai-gray dark:text-gray-100">
          Gerenciamento de Eventos
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
          <button
            onClick={() => navigate(ROUTES.ADMIN.EVENTS.CREATE)}
            className="bg-senai-red hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
          >
            Novo Evento
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou local..."
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
            {selectedStatus !== null && (
              <span className="ml-1.5 py-0.5 px-2 text-xs font-normal text-white bg-senai-red rounded-full">
                1
              </span>
            )}
          </button>
        </div>

        {/* Filter Menu */}
        {isFilterMenuOpen && (
          <div className="mt-4 p-4 border-t dark:border-gray-700">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={selectedStatus === null}
                      onChange={() => setSelectedStatus(null)}
                      className="border-gray-300 text-senai-red focus:ring-senai-red"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Todos</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={selectedStatus === true}
                      onChange={() => setSelectedStatus(true)}
                      className="border-gray-300 text-senai-red focus:ring-senai-red"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Ativos</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={selectedStatus === false}
                      onChange={() => setSelectedStatus(false)}
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

      {/* Events List/Grid */}
      {viewMode === 'list' ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Local
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sortedEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {event.imageUrl && (
                          <img
                            src={event.imageUrl}
                            alt={event.name}
                            className="w-10 h-10 rounded object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {event.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {event.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(event.eventDate), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {event.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        event.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {event.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigate(ROUTES.ADMIN.EVENTS.EDIT(event.id))}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mx-2"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sortedEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="space-y-4">
                {event.imageUrl && (
                  <img
                    src={event.imageUrl}
                    alt={event.name}
                    className="w-full h-48 object-cover rounded"
                  />
                )}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {event.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {event.description}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    event.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {event.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Data: </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {format(new Date(event.eventDate), 'dd/MM/yyyy')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Local: </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {event.location}
                    </span>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => navigate(ROUTES.ADMIN.EVENTS.EDIT(event.id))}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {sortedEvents.length === 0 && !error && (
        <div className="text-center py-8 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg shadow">
          {searchQuery || selectedStatus !== null
            ? 'Nenhum evento encontrado com os filtros atuais.'
            : 'Nenhum evento encontrado.'}
        </div>
      )}
    </div>
  );
}
