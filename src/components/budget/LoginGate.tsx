import React from 'react';
import { LoginModal } from './LoginModal';
import { ThemeToggle } from '@/components/ThemeToggle';
export function LoginGate() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background/95 backdrop-blur-sm relative">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff20_1px,transparent_1px)] [background-size:16px_16px]"></div>
      <ThemeToggle className="fixed top-4 right-4 z-50" />
      <LoginModal open={true} onOpenChange={() => {}} />
    </div>
  );
}