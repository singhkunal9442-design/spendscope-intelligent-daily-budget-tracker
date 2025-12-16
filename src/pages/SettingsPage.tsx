import React from 'react';
import { CategoryManager } from '@/components/budget/CategoryManager';
import { ThemeToggle } from '@/components/ThemeToggle';
export function SettingsPage() {
  return (
    <div className="min-h-screen w-full bg-background text-foreground relative">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff20_1px,transparent_1px)] [background-size:16px_16px]"></div>
      <ThemeToggle className="fixed top-4 right-4" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 md:py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Settings
            </h1>
            <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
              Manage your daily spending categories and limits.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <CategoryManager />
          </div>
        </div>
      </main>
      <footer className="text-center py-8 w-full text-muted-foreground/80">
        <p>Built with ❤️ at Cloudflare</p>
      </footer>
    </div>
  );
}