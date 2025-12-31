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
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            type="button" 
            className={cn("inline-flex items-center text-muted-foreground hover:text-foreground transition-colors outline-none", className)}
          >
            {children || <HelpCircle className="h-4 w-4" />}
          </button>
        </TooltipTrigger>
        <TooltipContent className="glass text-xs p-2 max-w-[200px] text-center" side="top">
          <p>{message}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}