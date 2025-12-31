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
      className={cn(className)}
    >
      <Select onValueChange={setCurrency} value={currentCurrency}>
        <SelectTrigger className="w-[80px] h-9 glass shadow-sm border-border/30 rounded-xl text-xs font-bold">
          <SelectValue placeholder="USD" />
        </SelectTrigger>
        <SelectContent className="glass rounded-xl">
          {CURRENCY_PRESETS.map(currency => (
            <SelectItem key={currency} value={currency} className="text-xs font-bold">
              {currency}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </motion.div>
  );
}