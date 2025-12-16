import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
interface HelpTooltipProps {
  message: string;
  children?: React.ReactNode;
  className?: string;
}
export function HelpTooltip({ message, children, className }: HelpTooltipProps) {
  return (
    <TooltipProvider delayDuration={400}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex items-center text-muted-foreground/60 hover:text-spendscope-500 transition-all duration-200 outline-none hover:scale-110",
              className
            )}
          >
            {children || <HelpCircle className="h-5 w-5" />}
          </button>
        </TooltipTrigger>
        <TooltipContent 
          className="glass-dark text-white text-xs font-bold p-3 max-w-[220px] text-center border-white/20 rounded-2xl" 
          side="top"
          sideOffset={8}
        >
          <p className="leading-relaxed">{message}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}