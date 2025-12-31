import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import React, { StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
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
import { CalendarPage } from '@/pages/CalendarPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { AuthPage } from '@/pages/AuthPage';
import { BlogPage } from '@/pages/BlogPage';
import { AboutPage, ContactPage, HelpPage } from '@/pages/StaticPages';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
declare global {
  interface Window {
    __reactRoot?: Root;
  }
}
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
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
const container = document.getElementById('root');
if (container) {
  if (!window.__reactRoot) {
    window.__reactRoot = createRoot(container);
  }
  window.__reactRoot.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <RouterProvider router={router} />
        </ErrorBoundary>
      </QueryClientProvider>
    </StrictMode>
  );
}