import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import { SettingsPage } from '@/pages/SettingsPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { AuthPage } from '@/pages/AuthPage';
import { BlogPage } from '@/pages/BlogPage';
import { AboutPage, ContactPage, HelpPage } from '@/pages/StaticPages';
import { AppLayout } from '@/components/layout/AppLayout';
import { useBudgetStore } from '@/lib/store';
const queryClient = new QueryClient();
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useBudgetStore(s => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};
const router = createBrowserRouter([
  {
    path: "/login",
    element: <AuthPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/",
    element: <ProtectedRoute><AppLayout container={false}><HomePage /></AppLayout></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/settings",
    element: <ProtectedRoute><AppLayout container={false}><SettingsPage /></AppLayout></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/history",
    element: <ProtectedRoute><AppLayout container><HistoryPage /></AppLayout></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/calendar",
    element: <ProtectedRoute><AppLayout container><CalendarPage /></AppLayout></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/blog",
    element: <AppLayout container><BlogPage /></AppLayout>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/about",
    element: <AppLayout container><AboutPage /></AppLayout>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/help",
    element: <AppLayout container><HelpPage /></AppLayout>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/contact",
    element: <AppLayout container><ContactPage /></AppLayout>,
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