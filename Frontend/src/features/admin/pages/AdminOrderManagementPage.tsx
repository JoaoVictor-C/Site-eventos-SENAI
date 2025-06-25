import { useState, useMemo } from 'react';
import { adminConfirmOrderPayment } from '../api/adminService';
import { Order, Ticket, TicketStatus } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { useAuth } from '@/providers/AuthProvider';
import { useOrdersByEvent } from '@/queries/tickets.queries';

const STATUS_OPTIONS = [
  { label: 'Todos', value: 'all' },
  { label: 'Pendente', value: 'pending' },
  { label: 'Pago', value: 'paid' },
  { label: 'Cancelado', value: 'canceled' },
];

export default function AdminOrderManagementPage() {
  const { selectedEvent } = useAuth();
  if (!selectedEvent) {
    return (
      <div className="p-4 text-red-800 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-200">
        Selecione um evento para gerenciar os pedidos.
      </div>
    );
  }
  const { data: orders = [], isLoading, error } = useOrdersByEvent(selectedEvent.id);
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'all' | string>('all');
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({ start: null, end: null });
  const [sortBy, setSortBy] = useState<'orderDate' | 'total' | 'status' | 'quantity'>('orderDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const handleConfirmPayment = async (id: string) => {
    if (!window.confirm('Confirmar o pagamento deste pedido?')) return;
    try {
      setProcessingIds(prev => [...prev, id]);
      await adminConfirmOrderPayment(id);
    } catch (err) {
      console.error('Failed to confirm payment:', err);
    } finally {
      setProcessingIds(prev => prev.filter(pid => pid !== id));
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case TicketStatus.PAID.toLowerCase():
        return 'text-green-600 dark:text-green-400';
      case TicketStatus.PENDING.toLowerCase():
        return 'text-yellow-600 dark:text-yellow-400';
      case TicketStatus.USED.toLowerCase():
        return 'text-blue-600 dark:text-blue-400';
      case TicketStatus.EXPIRED.toLowerCase():
        return 'text-gray-600 dark:text-gray-400';
      case TicketStatus.CANCELED.toLowerCase():
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const handleSort = (newSortBy: 'orderDate' | 'total' | 'status' | 'quantity') => {
    if (sortBy === newSortBy) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const clearFilters = () => {
    setSelectedStatus('all');
    setDateRange({ start: null, end: null });
    setSearchQuery('');
    setSortBy('orderDate');
    setSortOrder('desc');
  };

  // Only show orders for the selected event
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders
      // Filter by selectedEvent
      .filter(order => !selectedEvent || order.eventId === selectedEvent.id)
      .filter((order: Order) => {
        const matchesSearch = searchQuery === '' ||
          (order.id && order.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
          order.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.eventName.toLowerCase().includes(searchQuery.toLowerCase());
        // Status filter
        const matchesStatus = selectedStatus === 'all' || (order.status ?? '').toLowerCase() === selectedStatus;
        // Date range filter
        const orderDate = new Date(order.orderDate);
        const matchesDate = (!dateRange.start || orderDate >= new Date(dateRange.start)) &&
          (!dateRange.end || orderDate <= new Date(dateRange.end));
        return matchesSearch && matchesStatus && matchesDate;
      });
    // Sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];
      if (sortBy === 'orderDate') {
        aValue = new Date(a.orderDate);
        bValue = new Date(b.orderDate);
      }
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [orders, searchQuery, selectedStatus, dateRange, sortBy, sortOrder, selectedEvent]);

  // --- UI ---
  if (isLoading) return <LoadingSpinner message="Carregando pedidos..." />;

  return (
    <div className="space-y-6 px-4 py-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold text-senai-gray dark:text-gray-100">
          Gerenciamento de Pedidos
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
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
              placeholder="Buscar por usuário, evento ou pedido..."
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
            {(selectedStatus !== 'all' || dateRange.start || dateRange.end) && (
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
                  {STATUS_OPTIONS.map(opt => (
                    <label key={opt.value} className="flex items-center">
                      <input
                        type="radio"
                        checked={selectedStatus === opt.value}
                        onChange={() => setSelectedStatus(opt.value as any)}
                        className="border-gray-300 text-senai-red focus:ring-senai-red"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data do Pedido
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateRange.start || ''}
                    onChange={e => setDateRange(r => ({ ...r, start: e.target.value || null }))}
                    className="border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <span className="self-center">até</span>
                  <input
                    type="date"
                    value={dateRange.end || ''}
                    onChange={e => setDateRange(r => ({ ...r, end: e.target.value || null }))}
                    className="border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
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

      {/* Orders List/Grid */}
      {viewMode === 'list' ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th onClick={() => handleSort('orderDate')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">Data {sortBy === 'orderDate' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pedido</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Usuário</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Evento</th>
                <th onClick={() => handleSort('total')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">Total {sortBy === 'total' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                <th onClick={() => handleSort('quantity')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">Ingressos {sortBy === 'quantity' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                <th onClick={() => handleSort('status')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAndSortedOrders.map(order => {
                // Accept both English and Portuguese for 'pending'
                const statusStr = (order.status ?? '').toLowerCase();
                const isPending = ['pending', 'pendente'].includes(statusStr);
                return (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">{
                      order.orderDate && !isNaN(new Date(order.orderDate).getTime())
                        ? format(new Date(order.orderDate), 'dd/MM/yyyy')
                        : '-'
                    }</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.userName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.eventName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">R$ {typeof order.total === 'number' && !isNaN(order.total) ? order.total.toFixed(2) : '0.00'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className={`font-medium ${getStatusColor(order.status ?? '')}`}>{order.status ?? '-'}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {isPending && (
                        <button
                          onClick={() => handleConfirmPayment(order.id)}
                          disabled={processingIds.includes(order.id)}
                          className="bg-senai-red hover:bg-red-700 text-white font-medium py-1 px-3 rounded disabled:opacity-50"
                        >
                          {processingIds.includes(order.id) ? 'Confirmando...' : 'Confirmar Pagamento'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedOrders.map(order => {
            const tickets: Ticket[] = (order.tickets && (order.tickets as any).$values) ? (order.tickets as any).$values : Array.isArray(order.tickets) ? order.tickets : [];
            return (
              <div key={order.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Pedido #{order.id}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Usuário: {order.userName}</p>
                    </div>
                    <span className={`font-medium ${getStatusColor(order.status)}`}>{order.status}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Evento: </span>
                      <span className="font-medium">{order.eventName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Data do Pedido: </span>
                      <span className="font-medium">{format(new Date(order.orderDate), 'dd/MM/yyyy')}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Total: </span>
                      <span className="font-medium">R$ {order.total.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Ingressos: </span>
                      <span className="font-medium">{order.quantity}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Ingressos</h4>
                    <div className="grid gap-2">
                      {order.quantity === 0 && (
                        <span className="text-gray-500">Nenhum ingresso neste pedido.</span>
                      )}
                      {tickets.map((ticket: Ticket) => (
                        <div key={ticket.id} className="flex justify-between items-center text-sm border-t border-gray-200 dark:border-gray-700 py-2">
                          <span>{ticket.batch?.name || ticket.batchId}</span>
                          <div className="flex gap-4">
                            <span>R$ {typeof ticket.price === 'number' && !isNaN(ticket.price) ? ticket.price.toFixed(2) : '0.00'}</span>
                            <span className={getStatusColor(ticket.status)}>{ticket.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {order.status.toLowerCase() === TicketStatus.PENDING.toLowerCase() && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleConfirmPayment(order.id)}
                        disabled={processingIds.includes(order.id)}
                        className="bg-senai-red hover:bg-red-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
                      >
                        {processingIds.includes(order.id) ? 'Confirmando...' : 'Confirmar Pagamento'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredAndSortedOrders.length === 0 && !error && (
        <div className="text-center py-8 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg shadow">
          {searchQuery || selectedStatus !== 'all' || dateRange.start || dateRange.end
            ? 'Nenhum pedido encontrado com os filtros atuais.'
            : 'Nenhum pedido encontrado.'}
        </div>
      )}
    </div>
  );
}
