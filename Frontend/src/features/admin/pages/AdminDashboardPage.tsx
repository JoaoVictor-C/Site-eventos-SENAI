import { useNavigate } from 'react-router-dom';
import { useAnalytics } from '@/queries/analytics.queries';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ROUTES } from '@/config/routes';

export default function AdminDashboardPage() {
  const { data: analyticsData, isLoading, error } = useAnalytics();
  const navigate = useNavigate();

  if (isLoading) return <LoadingSpinner message="Carregando dashboard..." />;

  if (error) {
    return (
      <div className="p-4 text-red-800 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-200">
        {`Error loading dashboard data: ${error}`}
      </div>
    );
  }

  if (!analyticsData) {
    return <div>Nenhum dado disponível.</div>;
  }

  return (
    <div className="space-y-8 space-x-4 p-6 dark:bg-gray-900">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-senai-gray dark:text-gray-100">
          Dashboard Administrativo
        </h2>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <QuickStatCard
          title="Total de Vendas"
          value={`R$ ${analyticsData.totalSales.toFixed(2)}`}
          description="Receita total de vendas"
          icon="💰"
          onClick={() => navigate(ROUTES.ADMIN.ANALYTICS)}
        />
        <QuickStatCard
          title="Ingressos Vendidos"
          value={analyticsData.ticketsSold.toString()}
          description="Total de ingressos vendidos"
          icon="🎟️"
          onClick={() => navigate(ROUTES.ADMIN.ORDERS)}
        />
        <QuickStatCard
          title="Eventos Ativos"
          value={analyticsData.activeEventsCount.toString()}
          description="Eventos em andamento"
          icon="📅"
          onClick={() => navigate(ROUTES.ADMIN.EVENTS.LIST)}
        />
        <QuickStatCard
          title="Usuários"
          value={analyticsData.registeredUsersCount.toString()}
          description="Total de usuários registrados"
          icon="👥"
          onClick={() => navigate(ROUTES.ADMIN.USERS)}
        />
      </div>

      {/* Top Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Top Eventos por Vendas
            </h3>
            <button
              onClick={() => navigate(ROUTES.ADMIN.EVENTS.LIST)}
              className="text-sm text-senai-red hover:text-red-700 dark:hover:text-red-400"
            >
              Ver Todos
            </button>
          </div>
          <div className="space-y-4">
            {analyticsData.salesByEvent.slice(0, 5).map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">{label}</span>
                <span className="font-medium">R$ {value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Top Eventos por Ingressos
            </h3>
            <button
              onClick={() => navigate(ROUTES.ADMIN.ANALYTICS)}
              className="text-sm text-senai-red hover:text-red-700 dark:hover:text-red-400"
            >
              Ver Análise
            </button>
          </div>
          <div className="space-y-4">
            {analyticsData.ticketsSoldByEvent.slice(0, 5).map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">{label}</span>
                <span className="font-medium">{value} ingressos</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ActionButton
          title="Novo Evento"
          description="Criar um novo evento"
          icon="➕"
          onClick={() => navigate(ROUTES.ADMIN.EVENTS.CREATE)}
        />
        <ActionButton
          title="Análise Detalhada"
          description="Ver análise completa"
          icon="📊"
          onClick={() => navigate(ROUTES.ADMIN.ANALYTICS)}
        />
        <ActionButton
          title="Pedidos"
          description="Gerenciar pedidos"
          icon="📦"
          onClick={() => navigate(ROUTES.ADMIN.ORDERS)}
        />
        <ActionButton
          title="Usuários"
          description="Gerenciar usuários"
          icon="👤"
          onClick={() => navigate(ROUTES.ADMIN.USERS)}
        />
      </div>
    </div>
  );
}

interface QuickStatCardProps {
  title: string;
  value: string;
  description: string;
  icon: string;
  onClick: () => void;
}

function QuickStatCard({ title, value, description, icon, onClick }: QuickStatCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-senai-red dark:hover:border-senai-red transition-colors"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{value}</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}

interface ActionButtonProps {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}

function ActionButton({ title, description, icon, onClick }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-left w-full hover:border-senai-red dark:hover:border-senai-red transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="text-2xl">{icon}</div>
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
    </button>
  );
}
