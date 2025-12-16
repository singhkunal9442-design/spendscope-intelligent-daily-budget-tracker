import React, { useMemo } from 'react';
import { useBudgetStore, useIsLoading } from '@/lib/store';
import { Transaction } from '@shared/types';
import { format, isToday, isYesterday, parseISO, subDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AnimatePresence, motion } from 'framer-motion';
import { generateCSV, downloadCSV } from '@/lib/csv-utils';
import { HistoryChart } from '@/components/charts/HistoryChart';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});
const groupTransactionsByDay = (transactions: Transaction[]) => {
  return transactions.reduce((acc, tx) => {
    const date = parseISO(tx.date);
    let dayLabel: string;
    if (isToday(date)) {
      dayLabel = 'Today';
    } else if (isYesterday(date)) {
      dayLabel = 'Yesterday';
    } else {
      dayLabel = format(date, 'MMMM d, yyyy');
    }
    if (!acc[dayLabel]) {
      acc[dayLabel] = [];
    }
    acc[dayLabel].push(tx);
    return acc;
  }, {} as Record<string, Transaction[]>);
};
const HistorySkeleton = () => (
  <div className="w-full max-w-3xl mx-auto space-y-2">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="border rounded-md p-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    ))}
  </div>
);
export function HistoryPage() {
  const transactions = useBudgetStore(state => state.transactions);
  const scopes = useBudgetStore(state => state.scopes);
  const isLoading = useIsLoading();
  const scopesMap = React.useMemo(() => new Map(scopes.map(s => [s.id, s])), [scopes]);
  const sortedTransactions = [...transactions].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  const groupedTransactions = groupTransactionsByDay(sortedTransactions);
  const dayGroups = Object.keys(groupedTransactions);
  const dailyTotalsData = useMemo(() => {
    const now = new Date();
    const daily: Record<string, number> = {};
    transactions.forEach(t => {
      const day = format(parseISO(t.date), 'yyyy-MM-dd');
      daily[day] = (daily[day] || 0) + t.amount;
    });
    return Array.from({ length: 30 }, (_, i) => {
      const date = subDays(now, 29 - i);
      const dayKey = format(date, 'yyyy-MM-dd');
      return { date: format(date, 'MMM d'), total: daily[dayKey] || 0 };
    });
  }, [transactions]);
  const handleExport = () => {
    const csv = generateCSV(transactions, scopes);
    downloadCSV(csv, `spendscope-export-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };
  return (
    <div className="py-8 md:py-10 lg:py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          Transaction History
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          A complete log of all your expenses.
        </p>
      </div>
      <div className="max-w-4xl mx-auto mb-12">
        <HistoryChart data={dailyTotalsData} isLoading={isLoading} />
      </div>
      <div className="flex justify-center mb-8">
        <Button onClick={handleExport} variant="outline" disabled={transactions.length === 0 || isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
          Export as CSV
        </Button>
      </div>
      {isLoading ? (
        <HistorySkeleton />
      ) : transactions.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
          <p className="text-muted-foreground text-lg">No transactions yet. Add one from the dashboard!</p>
        </motion.div>
      ) : (
        <Accordion type="multiple" defaultValue={['Today', 'Yesterday']} className="w-full max-w-3xl mx-auto">
          <AnimatePresence>
            {dayGroups.map((day, index) => {
              const dayTxs = groupedTransactions[day];
              const dayTotal = dayTxs.reduce((sum, tx) => sum + tx.amount, 0);
              return (
                <motion.div
                  key={day}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AccordionItem value={day}>
                    <AccordionTrigger>
                      <div className="flex justify-between w-full pr-4">
                        <span className="font-semibold text-lg">{day}</span>
                        <span className="font-mono text-muted-foreground">{currencyFormatter.format(dayTotal)}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        {dayTxs.map(tx => {
                          const scope = scopesMap.get(tx.scopeId);
                          const Icon = scope?.icon;
                          const color = scope?.color ?? 'gray';
                          return (
                            <div key={tx.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-center gap-4">
                                {Icon && <div className={cn('p-1.5 rounded-md', `bg-${color}-100 dark:bg-${color}-900/50`)}><Icon className={cn('w-5 h-5', `text-${color}-600 dark:text-${color}-400`)} /></div>}
                                <div>
                                  <p className="font-medium">{scope?.name || 'Uncategorized'}</p>
                                  <p className="text-sm text-muted-foreground">{tx.description || format(parseISO(tx.date), 'p')}</p>
                                </div>
                              </div>
                              <p className="font-mono font-semibold">{currencyFormatter.format(tx.amount)}</p>
                            </div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </Accordion>
      )}
    </div>
  );
}