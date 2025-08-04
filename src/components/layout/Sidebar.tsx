import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
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
  Building,
  FolderOpen,
  Plus,
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
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useProjectStore } from "@/stores/projectStore";
import { useToast } from "@/hooks/use-toast";

const mainNavigation = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Data Entry", url: "/dashboard/data-entry", icon: Calculator },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
  { title: "Reports", url: "/dashboard/reports", icon: FileText },
];

const financialTools = [
  { title: "Debt Analysis", url: "/dashboard/debt-analysis", icon: DollarSign },
  { title: "Cash Flow", url: "/dashboard/cash-flow", icon: TrendingUp },
  { title: "KPI Dashboard", url: "/dashboard/kpi", icon: PieChart },
  { title: "Covenant Testing", url: "/dashboard/covenant-testing", icon: CheckSquare },
  { title: "Governance", url: "/dashboard/governance", icon: Shield },
];

const collaborationTools = [
  { title: "Team Collaboration", url: "/dashboard/collaboration", icon: Users },
  { title: "Invite Members", url: "/dashboard/collaboration/invite", icon: UserPlus },
];

const benchmarkingTools = [
  { title: "Peer Benchmarking", url: "/dashboard/benchmarking", icon: Target },
  { title: "Industry Analysis", url: "/dashboard/benchmarking/industry", icon: LineChart },
];

const utilityNav = [
  { title: "Profile", url: "/dashboard/profile", icon: User },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
  { title: "Security", url: "/dashboard/security", icon: Shield },
  { title: "Help", url: "/dashboard/help", icon: HelpCircle },
];

export function Sidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { 
    selectedProject, 
    selectedCompany, 
    userProjects, 
    userCompanies,
    loadUserProjects,
    loadUserCompanies,
    setSelectedProject,
    setSelectedCompany,
    createProject
  } = useProjectStore();
  const { toast } = useToast();
  
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectType, setProjectType] = useState("analysis");

  useEffect(() => {
    loadUserProjects();
    loadUserCompanies();
  }, []);

  const isActive = (path: string) => currentPath === path;
  const getNavClasses = (path: string) =>
    cn(
      "transition-colors",
      isActive(path)
        ? "bg-primary text-primary-foreground shadow-md font-medium"
        : "hover:bg-secondary/80 text-foreground"
    );

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      toast({
        title: "Error",
        description: "Project name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await createProject(projectName, projectDescription, projectType);
      setShowProjectDialog(false);
      setProjectName("");
      setProjectDescription("");
      setProjectType("analysis");
      toast({
        title: "Success",
        description: "Project created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    }
  };

  return (
    <SidebarPrimitive className="border-r border-border bg-card shadow-elegant">
      <SidebarContent className="p-4">
        {/* Project/Company Selector */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground font-medium mb-2">
            Current Context
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-2">
              {selectedCompany && (
                <div className="text-xs text-muted-foreground">
                  <Building className="h-3 w-3 inline mr-1" />
                  {selectedCompany.name}
                </div>
              )}
              
              <Select 
                value={selectedProject?.id || ""} 
                onValueChange={(value) => {
                  const project = userProjects.find(p => p.id === value);
                  if (project) setSelectedProject(project);
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder={state === "collapsed" ? "..." : "Select Project"}>
                    {selectedProject && (
                      <div className="flex items-center gap-1">
                        <FolderOpen className="h-3 w-3" />
                        {state !== "collapsed" && selectedProject.name}
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {userProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full h-7 text-xs">
                    <Plus className="h-3 w-3 mr-1" />
                    {state !== "collapsed" && "New Project"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="project-name">Project Name</Label>
                      <Input
                        id="project-name"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="Enter project name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="project-description">Description</Label>
                      <Textarea
                        id="project-description"
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        placeholder="Enter project description"
                      />
                    </div>
                    <div>
                      <Label htmlFor="project-type">Project Type</Label>
                      <Select value={projectType} onValueChange={setProjectType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="analysis">Financial Analysis</SelectItem>
                          <SelectItem value="refinancing">Refinancing</SelectItem>
                          <SelectItem value="acquisition">Acquisition</SelectItem>
                          <SelectItem value="expansion">Expansion</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleCreateProject} className="w-full">
                      Create Project
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
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