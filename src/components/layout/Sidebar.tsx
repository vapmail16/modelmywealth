import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  Calculator,
  FileText,
  Home,
  TrendingUp,
  DollarSign,
  PieChart,
  Shield,
  Settings,
  HelpCircle,
  User,
} from "lucide-react";
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const mainNavigation = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Data Entry", url: "/data-entry", icon: Calculator },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Reports", url: "/reports", icon: FileText },
];

const financialTools = [
  { title: "Debt Analysis", url: "/debt-analysis", icon: DollarSign },
  { title: "Cash Flow", url: "/cash-flow", icon: TrendingUp },
  { title: "KPI Dashboard", url: "/kpi", icon: PieChart },
  { title: "Governance", url: "/governance", icon: Shield },
];

const utilityNav = [
  { title: "Profile", url: "/profile", icon: User },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Help", url: "/help", icon: HelpCircle },
];

export function Sidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavClasses = (path: string) =>
    cn(
      "transition-colors",
      isActive(path)
        ? "bg-primary text-primary-foreground shadow-md font-medium"
        : "hover:bg-secondary/80 text-foreground"
    );

  return (
    <SidebarPrimitive className="border-r border-border bg-card shadow-elegant">
      <SidebarContent className="p-4">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground font-medium mb-2">
            Main Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Financial Tools */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground font-medium mb-2">
            Financial Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {/* Performance Section */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-sm text-muted-foreground/80 font-medium mb-1 ml-2">
                Performance
              </SidebarGroupLabel>
            </SidebarGroup>

            {/* Financial Position Section */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-sm text-muted-foreground/80 font-medium mb-1 ml-2">
                Financial Position
              </SidebarGroupLabel>
            </SidebarGroup>

            {/* Main Financial Tools */}
            <SidebarMenu className="mt-2">
              {financialTools.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Utility Navigation */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {utilityNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarPrimitive>
  );
}