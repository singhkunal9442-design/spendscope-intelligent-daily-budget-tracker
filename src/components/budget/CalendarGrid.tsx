import React, { useMemo, useState } from 'react';
import { useBudgetStore, useDailyTotals, useFormatAmount } from '@/lib/store';
import { Transaction } from '@shared/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday, parseISO, addMonths, subMonths } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { TransactionEditDialog } from '@/components/budget/TransactionEditDialog';
import { Skeleton } from '@/components/ui/skeleton';
const shakeVariants = {
  hover: {
    scale: [1, 1.1, 0.9, 1.05, 1],
    rotate: [0, 2, -2, 1, -1, 0],
    transition: { duration: 0.4 }
  }
};
export function CalendarGridSkeleton() {
  return (
    <div className="grid grid-cols-7 gap-2">
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-full mb-2" />
      ))}
      {Array.from({ length: 35 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-lg" />
      ))}
    </div>
  );
}
export function CalendarGrid() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const transactions = useBudgetStore(state => state.transactions);
  const scopes = useBudgetStore(state => state.scopes);
  const deleteTransaction = useBudgetStore(state => state.deleteTransaction);
  const dailyTotals = useDailyTotals();
  const formatAmount = useFormatAmount();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const scopesMap = useMemo(() => new Map(scopes.map(s => [s.id, s])), [scopes]);
  const { days, transactionsByDay, averageDailySpend } = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    const days = eachDayOfInterval({ start, end });
    const transactionsByDay = new Map<string, Transaction[]>();
    const monthTransactions = transactions.filter(t => isSameMonth(parseISO(t.date), currentMonth));
    monthTransactions.forEach(t => {
      const dayKey = format(parseISO(t.date), 'yyyy-MM-dd');
      if (!transactionsByDay.has(dayKey)) {
        transactionsByDay.set(dayKey, []);
      }
      transactionsByDay.get(dayKey)?.push(t);
    });
    const spentDays = Array.from(dailyTotals.entries())
      .filter(([dateStr]) => isSameMonth(parseISO(dateStr), currentMonth))
      .map(([, total]) => total);
    const averageDailySpend = spentDays.length > 0 ? spentDays.reduce((a, b) => a + b, 0) / spentDays.length : 0;
    return { days, transactionsByDay, averageDailySpend };
  }, [currentMonth, transactions, dailyTotals]);
  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return (
    <div className="w-full">
      <TransactionEditDialog
        transaction={editingTransaction}
        open={!!editingTransaction}
        onOpenChange={(isOpen) => !isOpen && setEditingTransaction(null)}
      />
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="sm" onClick={handlePrevMonth}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Prev
        </Button>
        <h3 className="text-xl font-bold text-foreground">{format(currentMonth, 'MMMM yyyy')}</h3>
        <Button variant="outline" size="sm" onClick={handleNextMonth}>
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-sm font-semibold text-muted-foreground mb-2">
        {weekdays.map(day => <div key={day}>{day}</div>)}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={format(currentMonth, 'yyyy-MM')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-7 gap-2"
        >
          {days.map((day, index) => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const totalSpent = dailyTotals.get(dayKey) || 0;
            const dayTransactions = transactionsByDay.get(dayKey) || [];
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isCurrentDay = isToday(day);
            const spendPercentage = averageDailySpend > 0 ? (totalSpent / averageDailySpend) * 100 : 0;
            const badgeColor =
              spendPercentage > 150 ? 'bg-red-500/80 text-red-50' :
              spendPercentage > 75 ? 'bg-amber-500/80 text-amber-50' :
              totalSpent > 0 ? 'bg-emerald-500/80 text-emerald-50' :
              '';
            return (
              <motion.div
                key={dayKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className={cn(
                  "relative rounded-lg p-2 min-h-[100px] transition-all duration-300",
                  isCurrentMonth ? "bg-card/50 backdrop-blur-sm border border-border/20" : "bg-muted/30",
                  isCurrentDay && "ring-2 ring-primary"
                )}
              >
                <div className={cn("font-semibold", isCurrentMonth ? "text-foreground" : "text-muted-foreground/50")}>
                  {format(day, 'd')}
                </div>
                {totalSpent > 0 && (
                  <div className={cn("text-xs font-bold rounded-full px-2 py-0.5 mt-1 inline-block", badgeColor)}>
                    {formatAmount(totalSpent)}
                  </div>
                )}
                {dayTransactions.length > 0 && (
                  <Accordion type="single" collapsible className="w-full mt-2">
                    <AccordionItem value="transactions" className="border-none">
                      <AccordionTrigger className="text-xs p-1 hover:no-underline justify-center [&[data-state=open]>svg]:rotate-180">
                        {dayTransactions.length} transaction{dayTransactions.length > 1 ? 's' : ''}
                      </AccordionTrigger>
                      <AccordionContent className="absolute top-full left-0 w-[250px] bg-popover p-2 rounded-lg shadow-lg z-10 border max-h-60 overflow-y-auto">
                        {dayTransactions.map(tx => {
                          const scope = scopesMap.get(tx.scopeId);
                          return (
                            <div key={tx.id} className="group flex items-center justify-between p-1.5 text-left hover:bg-muted/50 rounded-md">
                              <div>
                                <p className="text-xs font-medium">{scope?.name || 'Uncategorized'}</p>
                                <p className="text-xs text-muted-foreground">{tx.description || formatAmount(tx.amount)}</p>
                              </div>
                              <div className="flex items-center gap-1 opacity-100">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingTransaction(tx)}><Edit className="w-3.5 h-3.5" /></Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <motion.div variants={shakeVariants} whileHover="hover">
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive/80"><Trash2 className="w-3.5 h-3.5" /></Button>
                                    </motion.div>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>Delete this transaction of {formatAmount(tx.amount)}?</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteTransaction(tx.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          );
                        })}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}