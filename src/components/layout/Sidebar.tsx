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
  CheckSquare,
  Users,
  LineChart,
  UserPlus,
  Target,
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
  { title: "Covenant Testing", url: "/covenant-testing", icon: CheckSquare },
  { title: "Governance", url: "/governance", icon: Shield },
];

const collaborationTools = [
  { title: "Team Collaboration", url: "/collaboration", icon: Users },
  { title: "Invite Members", url: "/collaboration/invite", icon: UserPlus },
];

const benchmarkingTools = [
  { title: "Peer Benchmarking", url: "/benchmarking", icon: Target },
  { title: "Industry Analysis", url: "/benchmarking/industry", icon: LineChart },
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
            <SidebarMenu>
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

        {/* Collaboration Tools */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground font-medium mb-2">
            Collaboration
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {collaborationTools.map((item) => (
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

        {/* Benchmarking Tools */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground font-medium mb-2">
            Benchmarking
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {benchmarkingTools.map((item) => (
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