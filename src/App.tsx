import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import DataEntry from "./pages/DataEntry";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import SpecificCharts from "./pages/SpecificCharts";
import DebtAnalysis from "./pages/DebtAnalysis";
import CashFlow from "./pages/CashFlow";
import KpiDashboard from "./pages/KpiDashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="data-entry" element={<DataEntry />} />
            <Route path="analytics" element={<SpecificCharts />} />
            <Route path="reports" element={<Reports />} />
            <Route path="debt-analysis" element={<DebtAnalysis />} />
            <Route path="cash-flow" element={<CashFlow />} />
            <Route path="kpi" element={<KpiDashboard />} />
            <Route path="charts" element={<SpecificCharts />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="help" element={<Help />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
