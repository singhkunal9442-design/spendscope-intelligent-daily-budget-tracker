import React from 'react';
import { LandingPage } from './LandingPage';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
export function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-grow">
        <LandingPage />
      </main>
    </div>
  );
}