import React from 'react';
import { motion } from 'framer-motion';
import { useBudgetStore, CURRENCY_PRESETS } from '@/lib/store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
interface CurrencySelectorProps {
  className?: string;
}
export function CurrencySelector({ className }: CurrencySelectorProps) {
  const currentCurrency = useBudgetStore(state => state.currentCurrency);
  const setCurrency = useBudgetStore(state => state.setCurrency);
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={cn("fixed top-4 right-20 z-50", className)}
    >
      <Select onValueChange={setCurrency} value={currentCurrency}>
        <SelectTrigger className="w-[80px] glass shadow-md border-border/30">
          <SelectValue placeholder="Currency" />
        </SelectTrigger>
        <SelectContent className="glass">
          {CURRENCY_PRESETS.map(currency => (
            <SelectItem key={currency} value={currency}>
              {currency}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </motion.div>
  );
}