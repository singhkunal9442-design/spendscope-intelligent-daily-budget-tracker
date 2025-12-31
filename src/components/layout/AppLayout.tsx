/*
Wraps children in a sidebar layout. Centralized source of truth for page gutters and padding.
*/
import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { cn } from "@/lib/utils";
type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
  className?: string;
  contentClassName?: string;
};
export function AppLayout({ children, container = false, className, contentClassName }: AppLayoutProps): JSX.Element {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset className={cn("bg-background relative transition-all duration-300", className)}>
        {/* Fixed trigger ensuring it's never obscured by headers */}
        <div className="fixed left-4 top-4 z-[60] md:left-6">
          <SidebarTrigger className="h-10 w-10 shadow-glass bg-background/50 backdrop-blur-lg border border-border/20 rounded-xl hover:bg-background/80" />
        </div>
        {container ? (
          <div className={cn(
            "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12 lg:py-16",
            contentClassName
          )}>
            {children}
          </div>
        ) : (
          <div className={cn("w-full", contentClassName)}>
            {children}
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}