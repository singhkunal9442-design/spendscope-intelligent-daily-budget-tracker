import React from "react";
import { Home, History, Settings, Wallet, Calendar, Newspaper, Info, HelpCircle, Mail, LogOut } from "lucide-react";
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
    <Sidebar className="bg-background/60 backdrop-blur-xl border-r border-border/40 shadow-xl">
      <SidebarHeader className="border-b border-border/10">
        <div className="flex items-center gap-3 px-4 py-6">
          <div className="p-2 rounded-xl bg-spendscope-500 shadow-glow">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter">SpendScope</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-3">
        <SidebarMenu className="gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive}
                  className={cn(
                    "transition-all duration-200 py-6 rounded-xl",
                    isActive 
                      ? "bg-spendscope-500/10 text-spendscope-600 dark:text-spendscope-400 font-bold border-l-4 border-spendscope-500" 
                      : "hover:bg-muted/50"
                  )}
                >
                  <Link to={item.href} className="flex items-center gap-3">
                    <item.icon className={cn("w-5 h-5", isActive ? "text-spendscope-500" : "text-muted-foreground")} />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      {user && (
        <SidebarFooter className="p-4 border-t border-border/10 bg-muted/20">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 text-sm font-semibold text-muted-foreground hover:text-red-500 transition-all p-3 rounded-xl hover:bg-red-500/10"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}