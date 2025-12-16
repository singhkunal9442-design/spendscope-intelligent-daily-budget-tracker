import React from 'react';
import { Link } from 'react-router-dom';
import { useIsLoggedIn } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
export function PublicNavbar() {
  const isLoggedIn = useIsLoggedIn();
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-white/70 dark:bg-black/70 border-b border-zinc-200 dark:border-zinc-800"
    >
      <Link to="/" className="flex items-center gap-2 group">
        <div className="p-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 transition-transform group-hover:scale-110">
          <Wallet className="w-5 h-5 text-zinc-100 dark:text-zinc-900" />
        </div>
        <span className="text-lg font-bold tracking-tighter text-zinc-900 dark:text-zinc-100">SpendScope</span>
      </Link>
      <div className="flex items-center gap-4">
        <Link to="/blog" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Blog</Link>
        <Link to="/about" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">About</Link>
        {isLoggedIn ? (
          <Button asChild variant="default" className="rounded-full px-6 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 hover:opacity-90">
            <Link to="/dashboard">Dashboard</Link>
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="rounded-full font-medium">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild className="rounded-full px-6 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 hover:opacity-90">
              <Link to="/login?tab=signup">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>
    </motion.nav>
  );
}