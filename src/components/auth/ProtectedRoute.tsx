import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBudgetStore } from '@/lib/store';
interface ProtectedRouteProps {
  children: React.ReactNode;
}
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const token = useBudgetStore(s => s.token);

  useEffect(() => {
    if (!token) {
      navigate('/login', { state: { from: location }, replace: true });
    }
  }, [token, navigate, location]);

  return <>{children}</>;
}
export default ProtectedRoute;