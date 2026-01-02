import React from 'react';
import { Navigate } from 'react-router-dom';
import { useIsLoggedIn } from '@/lib/store';
export function HomePage() {
  const isLoggedIn = useIsLoggedIn();
  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  return <Navigate to="/login" replace />;
}