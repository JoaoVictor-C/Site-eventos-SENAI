import React from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './providers/AuthProvider';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import { QueryErrorHandler } from './components/QueryErrorHandler';
import { publicRoutes, protectedRoutes } from './config/routes.config';
import { LoadingSpinner } from '@/components/ui';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

// Combine public and protected routes
const allRoutes = [...publicRoutes, ...protectedRoutes];

function AppRoutes() {
  return useRoutes(allRoutes);
}

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <QueryErrorHandler>
        <BrowserRouter>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">
                <React.Suspense
                  fallback={
                    <LoadingSpinner />
                  }
                >
                  <AppRoutes />
                </React.Suspense>
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </BrowserRouter>
      </QueryErrorHandler>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;