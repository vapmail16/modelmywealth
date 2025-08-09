import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DebtCalculationForm } from "@/components/forms/DebtCalculationForm";
import { DepreciationScheduleForm } from "@/components/forms/DepreciationScheduleForm";
import { ConsolidatedForm } from "@/components/forms/ConsolidatedForm";
import { KpiDashboardForm } from "@/components/forms/KpiDashboardForm";

interface CalculationEngineNewProps {
  projectId?: string;
}

export default function CalculationEngineNew({ projectId = "05632bb7-b506-453d-9ca1-253344e04b6b" }: CalculationEngineNewProps) {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Calculation Engine</h1>
        <p className="text-gray-600">Perform financial calculations based on your data entry using the modular approach</p>
      </div>

      <Tabs defaultValue="debt" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="debt">Debt Calculations</TabsTrigger>
          <TabsTrigger value="depreciation">Depreciation Schedule</TabsTrigger>
          <TabsTrigger value="consolidated">Consolidated</TabsTrigger>
          <TabsTrigger value="kpi">KPI Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="debt" className="space-y-6">
          <DebtCalculationForm projectId={projectId} />
        </TabsContent>

        <TabsContent value="depreciation" className="space-y-6">
          <DepreciationScheduleForm projectId={projectId} />
        </TabsContent>

        <TabsContent value="consolidated" className="space-y-6">
          <ConsolidatedForm projectId={projectId} />
        </TabsContent>

        <TabsContent value="kpi" className="space-y-6">
          <KpiDashboardForm projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 