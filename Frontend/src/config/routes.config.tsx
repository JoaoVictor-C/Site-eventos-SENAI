import { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router-dom';
import { ROUTES } from './routes';
import ProtectedRoute from '@/components/routing/ProtectedRoute';
import { UserRole } from '@/types';
import { LoadingSpinner } from '@/components/ui';

// Wrap lazy components with Suspense
const withSuspense = (Component: React.ComponentType) => 
  function SuspenseWrapper(props: any) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Component {...props} />
      </Suspense>
    );
  };

// Lazy load components
const HomePage = withSuspense(lazy(() => import('@/features/home/pages/HomePage')));
const LoginPage = withSuspense(lazy(() => import('@/features/auth/pages/LoginPage')));
const RegisterPage = withSuspense(lazy(() => import('@/features/auth/pages/RegisterPage')));
const EventDetailPage = withSuspense(lazy(() => import('@/features/events/pages/EventDetailPage')));
const NotFoundPage = withSuspense(lazy(() => import('@/features/error/pages/NotFoundPage')));
const MyTicketsPage = withSuspense(lazy(() => import('@/features/tickets/pages/MyTicketsPage')));
const SupportPage = withSuspense(lazy(() => import('@/features/support/pages/SupportPage')));
const PaymentPage = withSuspense(lazy(() => import('@/features/payment/page/PaymentPage')));

// Admin routes components
const AdminDashboardPage = withSuspense(lazy(() => import('@/features/admin/pages/AdminDashboardPage')));
const AdminAnalyticsPage = withSuspense(lazy(() => import('@/features/admin/pages/AdminAnalyticsPage')));
const AdminEventManagementPage = withSuspense(lazy(() => import('@/features/admin/pages/AdminEventManagementPage')));
const AdminOrderManagementPage = withSuspense(lazy(() => import('@/features/admin/pages/AdminOrderManagementPage')));
const AdminUserManagementPage = withSuspense(lazy(() => import('@/features/admin/pages/AdminUserManagementPage')));
const AdminLayout = lazy(() => import('@/features/admin/components/AdminLayout')); // No withSuspense here!
const AdminEventFormPage = withSuspense(lazy(() => import('@/features/admin/pages/AdminEventFormPage')));

export const publicRoutes: RouteObject[] = [
  { 
    path: ROUTES.HOME,
    element: <HomePage />,
  },
  {
    path: ROUTES.AUTH.LOGIN,
    element: <LoginPage />,
  },
  {
    path: ROUTES.AUTH.REGISTER,
    element: <RegisterPage />,
  },
  {
    path: ROUTES.EVENTS.DETAIL(':id'),
    element: <EventDetailPage />,
  },
  {
    path: ROUTES.SUPPORT,
    element: <SupportPage />,
  },
  {
    path: ROUTES.NOT_FOUND,
    element: <NotFoundPage />,
  },
];

export const protectedRoutes: RouteObject[] = [
  {
    path: ROUTES.TICKETS.LIST,
    element: (
      <ProtectedRoute roles={[UserRole.USER, UserRole.ADMIN]}>
        <MyTicketsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.ORDERS.PAYMENT,
    element: (
      <ProtectedRoute roles={[UserRole.USER, UserRole.ADMIN]}>
        <PaymentPage />
      </ProtectedRoute>
    ),
  },
  // Admin routes
  {
    path: ROUTES.ADMIN.ROOT, // e.g. "/admin"
    element: (
      <ProtectedRoute roles={[UserRole.ADMIN]}>
          <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboardPage />,
      },
      {
        path: ROUTES.ADMIN.ANALYTICS.replace(`${ROUTES.ADMIN.ROOT}/`, ''), // "analytics"
        element: <AdminAnalyticsPage />,
      },
      {
        path: ROUTES.ADMIN.EVENTS.ROOT.replace(`${ROUTES.ADMIN.ROOT}/`, ''), // "events"
        children: [
          {
            index: true,
            element: <AdminEventManagementPage />,
          },
          {
            path: 'new',
            element: <AdminEventFormPage />,
          },
          {
            path: 'edit/:id',
            element: <AdminEventFormPage />,
          },
        ],
      },
      {
        path: ROUTES.ADMIN.ORDERS.replace(`${ROUTES.ADMIN.ROOT}/`, ''), // "orders"
        element: <AdminOrderManagementPage />,
      },
      {
        path: ROUTES.ADMIN.USERS.replace(`${ROUTES.ADMIN.ROOT}/`, ''), // "users"
        element: <AdminUserManagementPage />,
      },
    ],
  },
];
