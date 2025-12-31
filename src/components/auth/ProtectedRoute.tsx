import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBudgetStore } from '@/lib/store';
interface ProtectedRouteProps {
  children: React.ReactNode;
}
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [authorized, setAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = useBudgetStore.getState().token;
      if (!token) {
        navigate('/login', { state: { from: location.pathname }, replace: true });
        setAuthorized(false);
        setIsLoading(false);
        return;
      }
      setAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();

    // Subscribe to store changes
    const unsubscribe = useBudgetStore.subscribe(checkAuth);
    return unsubscribe;
  }, [navigate, location.pathname]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return authorized ? <>{children}</> : null;
}
export default ProtectedRoute;