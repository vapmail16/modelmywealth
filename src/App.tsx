import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { Home } from "./pages/Home";
import { Auth } from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Pricing from "./pages/Pricing";
import PaymentSuccess from "./pages/PaymentSuccess";
import DataEntry from "./pages/DataEntry";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import SpecificCharts from "./pages/SpecificCharts";
import DebtAnalysis from "./pages/DebtAnalysis";
import CashFlow from "./pages/CashFlow";
import KpiDashboard from "./pages/KpiDashboard";
import Governance from "./pages/Governance";
import CovenantTesting from "./pages/CovenantTesting";
import Introduction from "./pages/Introduction";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";
import TeamCollaboration from "./pages/TeamCollaboration";
import InviteMembers from "./pages/InviteMembers";
import PeerBenchmarking from "./pages/PeerBenchmarking";
import IndustryAnalysis from "./pages/IndustryAnalysis";
import CompanyProjectSelection from "./pages/CompanyProjectSelection";
import { SecurityDashboard } from "./components/security/SecurityDashboard";
import SupabaseConnectionTest from "./components/SupabaseConnectionTest";
import CalculationEngine from "./pages/CalculationEngine";
import CalculationEngineNew from "./pages/CalculationEngineNew";
import Charts from "./pages/Charts";

const queryClient = new QueryClient();

const App = () => {
  const { initialize } = useAuthStore();

  // Use the activity tracker to monitor user activity
  useActivityTracker();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/companies" element={<CompanyProjectSelection />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="data-entry" element={<DataEntry />} />
              <Route path="analytics" element={<SpecificCharts />} />
              <Route path="reports" element={<Reports />} />
              <Route path="debt-analysis" element={<DebtAnalysis />} />
              <Route path="cash-flow" element={<CashFlow />} />
              <Route path="kpi" element={<KpiDashboard />} />
              <Route path="covenant-testing" element={<CovenantTesting />} />
              <Route path="governance" element={<Governance />} />
              <Route path="introduction" element={<Introduction />} />
              <Route path="charts" element={<Charts />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              <Route path="help" element={<Help />} />
              <Route path="collaboration" element={<TeamCollaboration />} />
              <Route path="collaboration/invite" element={<InviteMembers />} />
              <Route path="benchmarking" element={<PeerBenchmarking />} />
              <Route path="benchmarking/industry" element={<IndustryAnalysis />} />
              <Route path="security" element={<SecurityDashboard />} />
              <Route path="test-supabase" element={<SupabaseConnectionTest />} />
              <Route path="calculation-engine" element={<CalculationEngine />} />
              <Route path="calculation-engine-new" element={<CalculationEngineNew />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;