import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useProjectStore } from "@/stores/projectStore";

export function DashboardLayout() {
  const { 
    loadUserProjects, 
    loadUserCompanies, 
    userProjects, 
    userCompanies,
    setSelectedProject, 
    setSelectedCompany 
  } = useProjectStore();

  useEffect(() => {
    // Load user data when dashboard is accessed
    const initializeProjectData = async () => {
      await loadUserProjects();
      await loadUserCompanies();
    };
    
    initializeProjectData();
  }, [loadUserProjects, loadUserCompanies]);

  // Auto-select the first project if none selected
  useEffect(() => {
    if (userProjects.length > 0 && userCompanies.length > 0) {
      const firstProject = userProjects[0];
      setSelectedProject(firstProject);
      
      // Find and set the company for this project
      const projectCompany = userCompanies.find(company => 
        company.id === firstProject.company_id
      );
      if (projectCompany) {
        setSelectedCompany(projectCompany);
      }
    }
  }, [userProjects, userCompanies, setSelectedProject, setSelectedCompany]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6 bg-gradient-subtle animate-fade-in">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}