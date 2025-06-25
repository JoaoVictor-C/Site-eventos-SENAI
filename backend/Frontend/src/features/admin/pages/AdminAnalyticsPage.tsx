import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
} from 'chart.js';
import { useAnalytics } from '@/queries/analytics.queries';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
);


export default function AdminAnalyticsPage() {
  const { data: analyticsData, isLoading, error } = useAnalytics();


  if (isLoading) return <LoadingSpinner message="Carregando dados analíticos..." />;

  if (error) {
    return (
      <div className="p-4 text-red-800 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-200">
        {error}
      </div>
    );
  }

  if (!analyticsData) {
    return <div>Nenhum dado analítico disponível.</div>;
  }


  return (
    <div className="space-y-8">

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Vendas"
          value={`R$ ${analyticsData.totalSales.toFixed(2)}`}
          icon="💰"
        />
        <StatCard
          title="Ingressos Vendidos"
          value={analyticsData.ticketsSold.toString()}
          icon="🎟️"
        />
        <StatCard
          title="Eventos Ativos"
          value={analyticsData.activeEventsCount.toString()}
          icon="📅"
        />
        <StatCard
          title="Usuários Registrados"
          value={analyticsData.registeredUsersCount.toString()}
          icon="👥"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Vendas por Evento"
          data={analyticsData.salesByEvent}
          type="bar"
        />
        <ChartCard
          title="Ingressos Vendidos por Evento"
          data={analyticsData.ticketsSoldByEvent}
          type="doughnut"
        />
      </div>

      {/* Event Specific Analytics */}
      {analyticsData.eventSpecific && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">
            Análise Detalhada do Evento
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <StatCard
              title="Vendas do Evento"
              value={`R$ ${analyticsData.eventSpecific.totalSales.toFixed(2)}`}
              icon="💰"
            />
            <StatCard
              title="Ingressos Vendidos"
              value={analyticsData.eventSpecific.ticketsSold.toString()}
              icon="🎟️"
            />
            <StatCard
              title="% Vendido"
              value={`${analyticsData.eventSpecific.keyStats.percentageSold.toFixed(1)}%`}
              icon="📊"
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Vendas por Lote"
              data={analyticsData.eventSpecific.revenueByBatchChartData}
              type="bar"
            />
            <ChartCard
              title="Ingressos por Lote"
              data={analyticsData.eventSpecific.ticketsByBatchChartData}
              type="pie"
            />
          </div>
          <div className="mt-6">
            <ChartCard
              title="Vendas ao Longo do Tempo"
              data={analyticsData.eventSpecific.salesOverTime}
              type="line"
            />
          </div>
          {/* Batch Breakdown Table */}
          <div className="mt-8">
            <h4 className="text-lg font-semibold mb-2">Detalhes dos Lotes</h4>
            <BatchBreakdownTable
              revenueData={analyticsData.eventSpecific.revenueByBatchChartData}
              ticketsData={analyticsData.eventSpecific.ticketsByBatchChartData}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}

interface ChartCardProps {
  title: string;
  data: { label: string; value: number }[];
  type: 'bar' | 'line' | 'pie' | 'doughnut';
}

function ChartCard({ title, data, type }: ChartCardProps) {
  // Prepare chart data
  const labels = data.map((d) => d.label);
  const values = data.map((d) => d.value);
  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data: values,
        backgroundColor: [
          '#ef4444', '#f59e42', '#3b82f6', '#10b981', '#6366f1', '#fbbf24', '#a21caf', '#14b8a6', '#f472b6', '#64748b',
        ],
        borderColor: '#fff',
        borderWidth: 1,
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { display: type === 'pie' || type === 'doughnut' },
      title: { display: false },
    },
  };
  let ChartComponent = null;
  switch (type) {
    case 'bar':
      ChartComponent = <Bar data={chartData} options={options} />;
      break;
    case 'line':
      ChartComponent = <Line data={chartData} options={options} />;
      break;
    case 'pie':
      ChartComponent = <Pie data={chartData} options={options} />;
      break;
    case 'doughnut':
      ChartComponent = <Doughnut data={chartData} options={options} />;
      break;
    default:
      ChartComponent = <div>Tipo de gráfico não suportado.</div>;
  }
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{title}</h4>
      <div className="h-64 flex items-center justify-center">
        <div className="w-full h-full">{ChartComponent}</div>
      </div>
    </div>
  );
}

function BatchBreakdownTable({ revenueData, ticketsData }: { revenueData: { label: string; value: number }[]; ticketsData: { label: string; value: number }[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Lote</th>
            <th className="px-4 py-2 text-left">Vendas (R$)</th>
            <th className="px-4 py-2 text-left">Ingressos Vendidos</th>
          </tr>
        </thead>
        <tbody>
          {revenueData.map((batch, idx) => (
            <tr key={batch.label} className="border-t border-gray-100 dark:border-gray-700">
              <td className="px-4 py-2">{batch.label}</td>
              <td className="px-4 py-2">R$ {batch.value.toFixed(2)}</td>
              <td className="px-4 py-2">{ticketsData[idx]?.value ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
