import React from 'react';
import { useBudgetStore } from '@/lib/store';
import { Transaction } from '@shared/types';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AnimatePresence, motion } from 'framer-motion';
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
export function HistoryPage() {
  const transactions = useBudgetStore(state => state.transactions);
  const scopes = useBudgetStore(state => state.scopes);
  const scopesMap = React.useMemo(() => new Map(scopes.map(s => [s.id, s])), [scopes]);
  const sortedTransactions = [...transactions].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  const groupedTransactions = groupTransactionsByDay(sortedTransactions);
  const dayGroups = Object.keys(groupedTransactions);
  return (
    <div className="py-8 md:py-10 lg:py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          Transaction History
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          A complete log of all your expenses.
        </p>
      </div>
      {transactions.length === 0 ? (
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
                          return (
                            <div key={tx.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-center gap-4">
                                {Icon && <Icon className="w-6 h-6 text-muted-foreground" />}
                                <div>
                                  <p className="font-medium">{scope?.name || 'Uncategorized'}</p>
                                  <p className="text-sm text-muted-foreground">{format(parseISO(tx.date), 'p')}</p>
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