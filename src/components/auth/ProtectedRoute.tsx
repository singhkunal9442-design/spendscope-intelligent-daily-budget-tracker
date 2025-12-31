import React from 'react';
import { Navigate } from 'react-router-dom';
import { useBudgetStore } from '@/lib/store';
interface ProtectedRouteProps {
  children: React.ReactNode;
}
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = useBudgetStore(s => s.token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
export default ProtectedRoute;