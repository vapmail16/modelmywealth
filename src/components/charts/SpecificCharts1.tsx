import { ChartDataPoint, TooltipFormatterProps } from '@/types/common';
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

// Chart 1: Debt to EBITDA & DSCR (Dual-line chart)
export const DebtToEbitdaDscrChart = ({ data }: { data: ChartDataPoint[] }) => {
  return (
    <div className="bg-blue-50 p-4 rounded-lg" style={{ width: '6in', height: '2.5in' }}>
      <h3 className="text-sm font-semibold mb-2 text-gray-800">Debt to EBITDA & DSCR</h3>
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
            label={{ value: 'Debt/EBITDA', angle: -90, position: 'insideLeft', style: { fontSize: 8 } }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 8 }}
            axisLine={{ stroke: '#6b7280' }}
            label={{ value: 'DSCR', angle: 90, position: 'insideRight', style: { fontSize: 8 } }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '10px'
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '6px', paddingTop: '10px' }}
          />
          <Line
            yAxisId="left"
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
            dataKey="dscr"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 3, fill: '#f59e0b' }}
            name="DSCR"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

// Chart 2: LTV and Interest Coverage Ratio
export const LtvInterestCoverageChart = ({ data }: { data: ChartDataPoint[] }) => {
  return (
    <div className="bg-blue-50 p-4 rounded-lg" style={{ width: '6in', height: '2.5in' }}>
      <h3 className="text-sm font-semibold mb-2 text-gray-800">LTV and Interest Coverage Ratio</h3>
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
            label={{ value: 'Interest Coverage', angle: -90, position: 'insideLeft', style: { fontSize: 8 } }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 8 }}
            axisLine={{ stroke: '#6b7280' }}
            label={{ value: 'LTV Ratio', angle: 90, position: 'insideRight', style: { fontSize: 8 } }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '10px'
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '6px', paddingTop: '10px' }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="interestCoverage"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 3, fill: '#f59e0b' }}
            name="Interest Coverage"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="ltv"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 3, fill: '#3b82f6' }}
            name="LTV Ratio"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

// Chart 3: Debt to Equity Ratio & Operating Margin
export const DebtEquityOperatingMarginChart = ({ data }: { data: ChartDataPoint[] }) => {
  return (
    <div className="bg-blue-50 p-4 rounded-lg" style={{ width: '6in', height: '2.5in' }}>
      <h3 className="text-sm font-semibold mb-2 text-gray-800">Debt to Equity Ratio & Operating Margin</h3>
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
            label={{ value: 'Operating Margin %', angle: -90, position: 'insideLeft', style: { fontSize: 8 } }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 8 }}
            axisLine={{ stroke: '#6b7280' }}
            label={{ value: 'Debt/Equity', angle: 90, position: 'insideRight', style: { fontSize: 8 } }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '10px'
            }}
            formatter={(value: number, name: string) => [
              name === 'operatingMargin' ? `${(value * 100).toFixed(1)}%` : value.toFixed(2),
              name === 'operatingMargin' ? 'Operating Margin' : 'Debt/Equity'
            ]}
          />
          <Legend 
            wrapperStyle={{ fontSize: '6px', paddingTop: '10px' }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="operatingMargin"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 3, fill: '#f59e0b' }}
            name="Operating Margin %"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="debtToEquity"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 3, fill: '#3b82f6' }}
            name="Debt/Equity"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

// Chart 4: Revenue and EBITDA Bar Chart
export const RevenueEbitdaChart = ({ data }: { data: ChartDataPoint[] }) => {
  return (
    <div className="bg-blue-50 p-4 rounded-lg" style={{ width: '6in', height: '2.5in' }}>
      <h3 className="text-sm font-semibold mb-2 text-gray-800">Revenue and EBITDA</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
          <XAxis 
            dataKey="year" 
            tick={{ fontSize: 8 }}
            axisLine={{ stroke: '#6b7280' }}
          />
          <YAxis 
            tick={{ fontSize: 8 }}
            axisLine={{ stroke: '#6b7280' }}
            label={{ value: 'Amount ($M)', angle: -90, position: 'insideLeft', style: { fontSize: 8 } }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '10px'
            }}
            formatter={(value: number) => [`$${(value / 1000000).toFixed(1)}M`, '']}
          />
          <Legend 
            wrapperStyle={{ fontSize: '6px', paddingTop: '10px' }}
          />
          <Bar
            dataKey="revenue"
            fill="#3b82f6"
            name="Revenue"
            radius={[2, 2, 0, 0]}
          />
          <Bar
            dataKey="ebitda"
            fill="#f59e0b"
            name="EBITDA"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Chart 5: Outstanding Debt Balance and Interest Paid
export const DebtBalanceInterestChart = ({ data }: { data: ChartDataPoint[] }) => {
  return (
    <div className="bg-blue-50 p-4 rounded-lg" style={{ width: '6in', height: '2.5in' }}>
      <h3 className="text-sm font-semibold mb-2 text-gray-800">Outstanding Debt Balance and Interest Paid</h3>
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
            label={{ value: 'Debt Balance ($M)', angle: -90, position: 'insideLeft', style: { fontSize: 8 } }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 8 }}
            axisLine={{ stroke: '#6b7280' }}
            label={{ value: 'Interest Paid ($M)', angle: 90, position: 'insideRight', style: { fontSize: 8 } }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '10px'
            }}
            formatter={(value: number) => [`$${(value / 1000000).toFixed(1)}M`, '']}
          />
          <Legend 
            wrapperStyle={{ fontSize: '6px', paddingTop: '10px' }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="seniorSecuredDebt"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 3, fill: '#3b82f6' }}
            name="Senior Secured"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="debtTranche1"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 3, fill: '#f59e0b' }}
            name="Debt Tranche 1"
          />
          <Bar
            yAxisId="right"
            dataKey="interestPaid"
            fill="#10b981"
            name="Interest Paid"
            radius={[2, 2, 0, 0]}
            opacity={0.7}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

// Chart 6: Cash, PPE and Total Equity Balance
export const CashPpeEquityChart = ({ data }: { data: ChartDataPoint[] }) => {
  return (
    <div className="bg-blue-50 p-4 rounded-lg" style={{ width: '6in', height: '2.5in' }}>
      <h3 className="text-sm font-semibold mb-2 text-gray-800">Cash, PPE and Total Equity Balance</h3>
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
            label={{ value: 'Cash ($M)', angle: -90, position: 'insideLeft', style: { fontSize: 8 } }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 8 }}
            axisLine={{ stroke: '#6b7280' }}
            label={{ value: 'PPE & Equity ($M)', angle: 90, position: 'insideRight', style: { fontSize: 8 } }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '10px'
            }}
            formatter={(value: number) => [`$${(value / 1000000).toFixed(1)}M`, '']}
          />
          <Legend 
            wrapperStyle={{ fontSize: '6px', paddingTop: '10px' }}
          />
          <Bar
            yAxisId="left"
            dataKey="cash"
            fill="#3b82f6"
            name="Cash"
            radius={[2, 2, 0, 0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="totalEquity"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 3, fill: '#f59e0b' }}
            name="Total Equity"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="ppe"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ r: 3, fill: '#ef4444' }}
            name="PPE"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};