import React from "react";
import { Home, History, Settings, Wallet, Calendar, Newspaper, Info, HelpCircle, Mail, LogOut, Globe, Moon } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useBudgetStore } from "@/lib/store";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CurrencySelector } from "@/components/CurrencySelector";
const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/history", label: "History", icon: History },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/blog", label: "Blog", icon: Newspaper },
  { href: "/help", label: "Help", icon: HelpCircle },
  { href: "/about", label: "About", icon: Info },
  { href: "/contact", label: "Contact", icon: Mail },
  { href: "/settings", label: "Settings", icon: Settings },
];
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useBudgetStore(s => s.logout);
  const user = useBudgetStore(s => s.user);
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <Sidebar className="bg-background/80 backdrop-blur-2xl border-r border-border/40 shadow-glass">
      <SidebarHeader className="border-b border-border/5">
        <div className="flex items-center gap-3 px-6 py-8">
          <div className="p-2.5 rounded-2xl bg-spendscope-500 shadow-xl shadow-spendscope-500/30">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter">SpendScope</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-4">
        <SidebarMenu className="gap-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className={cn(
                    "transition-all duration-300 py-7 rounded-2xl px-4",
                    isActive
                      ? "bg-spendscope-500/10 text-spendscope-600 dark:text-spendscope-400 font-black shadow-inner shadow-spendscope-500/5"
                      : "hover:bg-muted/50 text-muted-foreground/80 hover:text-foreground"
                  )}
                >
                  <Link to={item.href} className="flex items-center gap-4">
                    <item.icon className={cn("w-5 h-5 transition-transform", isActive ? "text-spendscope-500 scale-110" : "text-muted-foreground/60 group-hover:scale-110")} />
                    <span className="text-sm tracking-tight">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-6 border-t border-border/5 space-y-4">
        <div className="bg-muted/30 p-4 rounded-3xl space-y-4 border border-border/10">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Region</span>
            </div>
            <CurrencySelector className="relative top-0 right-0 z-0" />
          </div>
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-muted-foreground" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Dark Mode</span>
            </div>
            <ThemeToggle className="relative top-0 right-0" />
          </div>
        </div>
        {user && (
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-4 text-sm font-black text-muted-foreground/60 hover:text-red-500 transition-all p-4 rounded-2xl hover:bg-red-500/10"
          >
            <LogOut className="h-5 w-5" />
            <span className="tracking-tight">Sign Out</span>
          </button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}