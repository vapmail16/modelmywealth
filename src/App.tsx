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
            <Route path="debt-analysis" element={<SpecificCharts />} />
            <Route path="cash-flow" element={<SpecificCharts />} />
            <Route path="kpi" element={<SpecificCharts />} />
            <Route path="charts" element={<SpecificCharts />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
