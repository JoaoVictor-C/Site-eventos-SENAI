import { useAuth } from '@/providers/AuthProvider';
import { EventRoleType } from '@/types/enums';
import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import {
  ChartBarIcon,
  UsersIcon,
  TicketIcon,
  CalendarIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { useUserRolesEvents } from '@/queries/users.queries';
import { LoadingSpinner } from '@/components/ui';

const navSections = [
  {
    title: 'Visão Geral',
    items: [
      {
        name: 'Painel',
        path: ROUTES.ADMIN.DASHBOARD,
        icon: ChartBarIcon,
        description: 'Ver estatísticas gerais'
      },
      {
        name: 'Análises',
        path: ROUTES.ADMIN.ANALYTICS,
        icon: ChartBarIcon,
        description: 'Análise de dados detalhada'
      }
    ]
  },
  {
    title: 'Gerenciamento',
    items: [
      {
        name: 'Eventos',
        path: ROUTES.ADMIN.EVENTS.LIST,
        icon: CalendarIcon,
        description: 'Gerenciar eventos e agendas'
      },
      {
        name: 'Pedidos',
        path: ROUTES.ADMIN.ORDERS,
        icon: TicketIcon,
        description: 'Acompanhar e gerenciar pedidos'
      },
      {
        name: 'Usuários',
        path: ROUTES.ADMIN.USERS,
        icon: UsersIcon,
        description: 'Administração de usuários'
      }
    ]
  }
];

export default function AdminLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const { selectedEvent, isAdmin } = useAuth();
  const eventId = selectedEvent?.id;
  const { data: userRoles, isLoading: isRolesLoading } = useUserRolesEvents(eventId || '');

  // Get cached roles if available
  const cachedRoles = eventId
    ? JSON.parse(localStorage.getItem(`userRoles_${eventId}`) || '[]')
    : [];
  const effectiveUserRoles = Array.isArray(userRoles) && userRoles.every(r => r)
    ? userRoles
    : cachedRoles;

  // Save roles to cache when valid
  useEffect(() => {
    if (Array.isArray(userRoles) && userRoles.every(r => r)) {
      localStorage.setItem(
        `userRoles_${eventId}`,
        JSON.stringify(userRoles)
      );
    }
  }, [userRoles, eventId]);

  // Convert roles to enum, filter out null/undefined
  const userRoleEnums = Array.isArray(effectiveUserRoles)
    ? effectiveUserRoles
        .filter((roleStr): roleStr is keyof typeof EventRoleType => !!roleStr)
        .map(roleStr => EventRoleType[roleStr as keyof typeof EventRoleType])
    : [];

  // Map nav item to required EventRoleType
  const navRoleMap: Record<string, EventRoleType | undefined> = {
    [ROUTES.ADMIN.DASHBOARD]: undefined,
    [ROUTES.ADMIN.ANALYTICS]: EventRoleType.ViewReports,
    [ROUTES.ADMIN.EVENTS.LIST]: EventRoleType.ManageEvent,
    [ROUTES.ADMIN.ORDERS]: EventRoleType.ManageTickets,
    [ROUTES.ADMIN.USERS]: EventRoleType.ManageRoles,
  };

  // Permission check
  const hasPermission = (path: string) => {
    if (isAdmin) return true;
    const requiredRole = navRoleMap[path];
    if (requiredRole === undefined) return true;
    return userRoleEnums.includes(requiredRole);
  };

  // Filter navSections based on permissions
  const filteredNavSections = navSections
    .map(section => ({
      ...section,
      items: section.items.filter(item => hasPermission(item.path)),
    }))
    .filter(section => section.items.length > 0);

  // Effects
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get current page title
  const getCurrentPageTitle = () => {
    for (const section of navSections) {
      const item = section.items.find(item => item.path === location.pathname);
      if (item) return item.name;
    }
    return 'Dashboard';
  };
  const currentPage = getCurrentPageTitle();

  // Now you can safely return conditionally
  if (!eventId || isRolesLoading || !userRoles) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (filteredNavSections.length === 0) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <nav className="w-[280px] border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
            <span className="text-xl font-semibold text-gray-800 dark:text-white">SENAI Admin</span>
          </div>
        </nav>
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 pt-16 lg:pt-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              Você não tem permissão para acessar nenhuma área administrativa deste evento.
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-gray-900/50 lg:hidden transition-opacity"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-20 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 lg:hidden">
        <div className="flex items-center justify-between px-4 h-full">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 -ml-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-lg"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded bg-senai-red flex items-center justify-center">
                <span className="text-white font-semibold text-lg">S</span>
              </div>
              <span className="text-lg font-semibold text-gray-800 dark:text-white">
                {currentPage}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white relative">
              <BellIcon className="w-6 h-6" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">JD</span>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <nav
        className={`fixed top-0 left-0 z-30 h-full w-[280px] transform bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out lg:translate-x-0 lg:static ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } ${isMobileSidebarOpen ? 'shadow-2xl' : ''}`}
      >
        {/* Sidebar Header - Hidden on mobile */}
        <div className="h-16 hidden lg:flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-senai-red flex items-center justify-center">
              <span className="text-white font-semibold text-lg">S</span>
            </div>
            <span className="text-xl font-semibold text-gray-800 dark:text-white">
              SENAI Admin
            </span>
          </div>
        </div>

        {/* Mobile Sidebar Header */}
        <div className="h-16 flex lg:hidden items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-senai-red flex items-center justify-center">
              <span className="text-white font-semibold text-lg">S</span>
            </div>
            <span className="text-xl font-semibold text-gray-800 dark:text-white">Menu</span>
          </div>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-lg"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)]">
          {/* Search Bar - Mobile Only */}
          <div className="p-4 lg:hidden">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="search"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 text-sm text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-senai-red"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredNavSections.map((section) => (
              <div key={section.title} className="px-3 mb-6">
                <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {section.title}
                </h2>
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li key={item.path} className="relative">
                      <NavLink
                        to={item.path}
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className={({ isActive }) =>
                          isActive
                            ? 'group flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all text-senai-red bg-red-50 dark:bg-red-900/20 dark:text-red-400'
                            : 'group flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700/50'
                        }
                      >
                        <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                        <div className="flex flex-col flex-1">
                          <span>{item.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                            {item.description}
                          </span>
                        </div>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 pt-16 lg:pt-0">
          <div className="container mx-auto p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
