import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Chart 7: Profitability Ratios as % of Revenue
export const ProfitabilityRatiosChart = ({ data }: { data: any[] }) => {
  return (
    <div className="bg-blue-50 p-4 rounded-lg" style={{ width: '6in', height: '2.5in' }}>
      <h3 className="text-sm font-semibold mb-2 text-gray-800">Profitability Ratios as % of Revenue</h3>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
          <XAxis 
            dataKey="year" 
            tick={{ fontSize: 8 }}
            axisLine={{ stroke: '#6b7280' }}
          />
          <YAxis 
            tick={{ fontSize: 8 }}
            axisLine={{ stroke: '#6b7280' }}
            domain={[0, 100]}
            label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', style: { fontSize: 8 } }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '10px'
            }}
            formatter={(value: any, name: string) => [`${(value * 100).toFixed(1)}%`, name]}
          />
          <Legend 
            wrapperStyle={{ fontSize: '6px', paddingTop: '10px' }}
          />
          <Line
            type="monotone"
            dataKey="grossProfitMargin"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 3, fill: '#3b82f6' }}
            name="Gross Profit %"
          />
          <Line
            type="monotone"
            dataKey="ebitdaMargin"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 3, fill: '#f59e0b' }}
            name="EBITDA %"
          />
          <Line
            type="monotone"
            dataKey="netIncomeMargin"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 3, fill: '#10b981' }}
            name="Net Income %"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Chart 8: AR and Inventory Cycle Days
export const ArInventoryCycleChart = ({ data }: { data: any[] }) => {
  return (
    <div className="bg-blue-50 p-4 rounded-lg" style={{ width: '6in', height: '2.5in' }}>
      <h3 className="text-sm font-semibold mb-2 text-gray-800">AR and Inventory Cycle Days</h3>
      <ResponsiveContainer width="100%" height="85%">
        <ComposedChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
          <XAxis 
            dataKey="year" 
            tick={{ fontSize: 8 }}
            axisLine={{ stroke: '#6b7280' }}
          />
          <YAxis 
            yAxisId="left"
            tick={{ fontSize: 8 }}
            axisLine={{ stroke: '#6b7280' }}
            label={{ value: 'Cycle Days', angle: -90, position: 'insideLeft', style: { fontSize: 8 } }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 8 }}
            axisLine={{ stroke: '#6b7280' }}
            label={{ value: 'Amount ($M)', angle: 90, position: 'insideRight', style: { fontSize: 8 } }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '10px'
            }}
            formatter={(value: any, name: string) => [
              name.includes('Days') ? `${value.toFixed(0)} days` : `$${(value / 1000000).toFixed(1)}M`,
              name
            ]}
          />
          <Legend 
            wrapperStyle={{ fontSize: '6px', paddingTop: '10px' }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="arCycleDays"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 3, fill: '#3b82f6' }}
            name="AR Cycle Days"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="inventoryCycleDays"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 3, fill: '#f59e0b' }}
            name="Inventory Cycle Days"
          />
          <Bar
            yAxisId="right"
            dataKey="revenue"
            fill="#10b981"
            name="Revenue"
            radius={[2, 2, 0, 0]}
            opacity={0.6}
          />
          <Bar
            yAxisId="right"
            dataKey="cogs"
            fill="#3b82f6"
            name="COGS"
            radius={[2, 2, 0, 0]}
            opacity={0.6}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

// Chart 9: Key Ratios Overview
export const KeyRatiosOverviewChart = ({ data }: { data: any[] }) => {
  return (
    <div className="bg-blue-50 p-4 rounded-lg" style={{ width: '6in', height: '2.5in' }}>
      <h3 className="text-sm font-semibold mb-2 text-gray-800">Key Ratios Overview</h3>
      <ResponsiveContainer width="100%" height="85%">
        <ComposedChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
          <XAxis 
            dataKey="year" 
            tick={{ fontSize: 8 }}
            axisLine={{ stroke: '#6b7280' }}
          />
          <YAxis 
            yAxisId="left"
            tick={{ fontSize: 8 }}
            axisLine={{ stroke: '#6b7280' }}
            label={{ value: 'DSCR', angle: -90, position: 'insideLeft', style: { fontSize: 8 } }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 8 }}
            axisLine={{ stroke: '#6b7280' }}
            label={{ value: 'Debt Ratios', angle: 90, position: 'insideRight', style: { fontSize: 8 } }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '10px'
            }}
            formatter={(value: any) => [value.toFixed(2), '']}
          />
          <Legend 
            wrapperStyle={{ fontSize: '6px', paddingTop: '10px' }}
          />
          <Bar
            yAxisId="left"
            dataKey="dscr"
            fill="#f59e0b"
            name="DSCR"
            radius={[2, 2, 0, 0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="debtToEbitda"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 3, fill: '#3b82f6' }}
            name="Debt/EBITDA"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="debtToEquity"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 3, fill: '#10b981' }}
            name="Debt/Equity"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

// All charts are already exported above