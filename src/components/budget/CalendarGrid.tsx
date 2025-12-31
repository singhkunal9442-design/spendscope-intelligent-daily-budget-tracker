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
    const spentDaysInMonth = Array.from(dailyTotals.entries())
      .filter(([dateStr]) => isSameMonth(parseISO(dateStr), currentMonth))
      .map(([, total]) => total);
    const averageDailySpend = spentDaysInMonth.length > 0 
      ? spentDaysInMonth.reduce((a, b) => a + b, 0) / spentDaysInMonth.length 
      : 0;
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
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-10 w-10 rounded-xl hover:bg-muted/50">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h3 className="text-2xl font-black text-foreground tracking-tighter">{format(currentMonth, 'MMMM yyyy')}</h3>
        <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-10 w-10 rounded-xl hover:bg-muted/50">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-black uppercase tracking-widest text-muted-foreground/60 mb-3 px-1">
        {weekdays.map(day => <div key={day}>{day}</div>)}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={format(currentMonth, 'yyyy-MM')}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
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
              spendPercentage > 150 ? 'bg-red-500/90 text-white' :
              spendPercentage > 75 ? 'bg-spendscope-500/90 text-white' :
              totalSpent > 0 ? 'bg-emerald-500/90 text-white' :
              '';
            return (
              <motion.div
                key={dayKey}
                className={cn(
                  "relative rounded-2xl p-2 min-h-[90px] md:min-h-[110px] transition-all duration-300 group border",
                  isCurrentMonth ? "bg-card/50 backdrop-blur-sm border-border/20" : "bg-muted/20 border-transparent opacity-40",
                  isCurrentDay && "ring-2 ring-spendscope-500 ring-offset-2 ring-offset-background"
                )}
              >
                <div className={cn("font-black text-sm", isCurrentMonth ? "text-foreground" : "text-muted-foreground/50")}>
                  {format(day, 'd')}
                </div>
                {totalSpent > 0 && (
                  <div className={cn("text-[10px] font-black rounded-lg px-2 py-0.5 mt-1 inline-block shadow-sm", badgeColor)}>
                    {formatAmount(totalSpent)}
                  </div>
                )}
                {dayTransactions.length > 0 && (
                  <Accordion type="single" collapsible className="w-full mt-2">
                    <AccordionItem value="transactions" className="border-none">
                      <AccordionTrigger className="text-[10px] p-1 font-black uppercase tracking-tighter hover:no-underline justify-center gap-1">
                        {dayTransactions.length} tx
                      </AccordionTrigger>
                      <AccordionContent className="absolute bottom-[100%] left-1/2 -translate-x-1/2 mb-2 w-[280px] max-w-[90vw] bg-popover/95 backdrop-blur-2xl p-4 rounded-3xl shadow-2xl z-[100] border border-border/40 max-h-60 overflow-y-auto">
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2 border-b border-border/10 pb-2">
                            {format(day, 'MMMM d')}
                          </p>
                          {dayTransactions.map(tx => {
                            const scope = scopesMap.get(tx.scopeId);
                            return (
                              <div key={tx.id} className="group flex items-center justify-between p-2.5 text-left bg-muted/40 hover:bg-muted/60 rounded-xl transition-colors border border-border/5">
                                <div className="flex-1 min-w-0 pr-2">
                                  <p className="text-xs font-black truncate text-foreground">{scope?.name || 'Uncategorized'}</p>
                                  <p className="text-[10px] font-bold text-muted-foreground truncate">{tx.description || formatAmount(tx.amount)}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setEditingTransaction(tx)}>
                                    <Edit className="w-3.5 h-3.5" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <motion.div variants={shakeVariants} whileHover="hover">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-red-500/10 rounded-lg">
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                      </motion.div>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="rounded-3xl border-border/40">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="font-black tracking-tighter">Delete transaction?</AlertDialogTitle>
                                        <AlertDialogDescription className="font-medium">
                                          Remove {formatAmount(tx.amount)} for {scope?.name}? This cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter className="gap-2">
                                        <AlertDialogCancel className="rounded-2xl">Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => deleteTransaction(tx.id)} className="bg-destructive hover:bg-destructive/90 rounded-2xl">Delete</AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            );
                          })}
                        </div>
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