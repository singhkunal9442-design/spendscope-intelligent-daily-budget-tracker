import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import { SettingsPage } from '@/pages/SettingsPage';
import { AppLayout } from '@/components/layout/AppLayout';
const queryClient = new QueryClient();
// Placeholder for History page
function HistoryPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        <h1 className="text-4xl font-bold">History</h1>
        <p className="text-muted-foreground mt-2">This page is under construction.</p>
      </div>
    </div>
  );
}
const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout container={false}><HomePage /></AppLayout>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/settings",
    element: <AppLayout container={false}><SettingsPage /></AppLayout>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/history",
    element: <AppLayout container><HistoryPage /></AppLayout>,
    errorElement: <RouteErrorBoundary />,
  },
]);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </QueryClientProvider>
  </StrictMode>,
)