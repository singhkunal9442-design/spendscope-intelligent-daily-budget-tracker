import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIsLoggedIn } from '@/lib/store';
interface ProtectedRouteProps {
  children: React.ReactNode;
}
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isLoggedIn = useIsLoggedIn();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    // If not logged in, redirect to login page with state to return after auth
    if (!isLoggedIn) {
      navigate('/login', { 
        state: { from: location.pathname }, 
        replace: true 
      });
    }
  }, [isLoggedIn, navigate, location.pathname]);
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-spendscope-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-label">Verifying Session...</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
export default ProtectedRoute;