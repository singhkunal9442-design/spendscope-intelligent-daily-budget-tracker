import React from 'react';
import { useBudgetStore, useIsLoading } from '@/lib/store';
import { CalendarGrid, CalendarGridSkeleton } from '@/components/budget/CalendarGrid';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CurrencySelector } from '@/components/CurrencySelector';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon } from 'lucide-react';
export function CalendarPage() {
  const isLoading = useIsLoading();
  const transactions = useBudgetStore(state => state.transactions);
  const hasTransactions = transactions.length > 0;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        <ThemeToggle className="fixed top-4 right-4" />
        <CurrencySelector />
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold tracking-tight text-foreground"
          >
            Monthly Calendar
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-3 text-lg text-muted-foreground"
          >
            Visualize your spending habits day by day.
          </motion.p>
        </div>
        <div className="w-full">
          {isLoading ? (
            <CalendarGridSkeleton />
          ) : !hasTransactions ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 px-4 border-2 border-dashed rounded-lg mt-8 bg-card/30 backdrop-blur-sm"
            >
              <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">No Transactions Yet</h3>
              <p className="mt-2 text-muted-foreground">Your calendar will populate as you add expenses.</p>
            </motion.div>
          ) : (
            <CalendarGrid />
          )}
        </div>
      </div>
    </div>
  );
}