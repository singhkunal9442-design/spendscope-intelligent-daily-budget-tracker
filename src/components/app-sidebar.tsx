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
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <Wallet className="w-6 h-6 text-emerald-500" />
          <span className="text-lg font-semibold">SpendScope</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={location.pathname === item.href}>
                <Link to={item.href}>
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      {user && (
        <SidebarFooter className="p-4 border-t border-border/50">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-2 text-sm text-muted-foreground hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}