import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './index.css'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastProvider'
import { ErrorBoundary } from './components/ui/ErrorBoundary'


// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Make queryClient globally accessible for logout cleanup
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).__reactQueryClient = queryClient;


import { HelmetProvider } from 'react-helmet-async';

// Initialize PostHog
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </ToastProvider>
          {import.meta.env.MODE === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
      </ErrorBoundary>
    </HelmetProvider>
  </StrictMode>,
)

