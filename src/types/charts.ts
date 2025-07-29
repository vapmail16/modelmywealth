// Chart Configuration Types
export interface ChartConfig {
  id: string;
  type: ChartType;
  title: string;
  description?: string;
  dataSource: string;
  filters: ChartFilters;
  style: ChartStyle;
  interactions: ChartInteractions;
  isVisible: boolean;
  position: ChartPosition;
}

export type ChartType = 
  | 'line' 
  | 'bar' 
  | 'area' 
  | 'pie' 
  | 'doughnut' 
  | 'scatter' 
  | 'combo' 
  | 'waterfall' 
  | 'gauge' 
  | 'heatmap'
  | 'treemap'
  | 'sankey';

export interface ChartFilters {
  dateRange: DateRange;
  metrics: string[];
  dimensions: string[];
  scenarios: string[];
  groupBy?: string;
  sortBy?: SortConfig;
}

export interface DateRange {
  start: string;
  end: string;
  period: 'monthly' | 'quarterly' | 'annually';
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface ChartStyle {
  colors: string[];
  theme: 'light' | 'dark';
  showLegend: boolean;
  showGrid: boolean;
  showTooltip: boolean;
  showDataLabels: boolean;
  animation: boolean;
  height: number;
  aspectRatio?: number;
}

export interface ChartInteractions {
  zoom: boolean;
  pan: boolean;
  brush: boolean;
  crossfilter: boolean;
  drill: boolean;
  export: boolean;
}

export interface ChartPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

// Chart Data Types
export interface ChartData {
  datasets: ChartDataset[];
  labels: string[];
  metadata: ChartMetadata;
}

export interface ChartDataset {
  id: string;
  label: string;
  data: DataPoint[];
  type?: ChartType;
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
  yAxisID?: string;
  xAxisID?: string;
}

export interface DataPoint {
  x: string | number;
  y: number;
  label?: string;
  metadata?: Record<string, any>;
  formatted?: string;
}

export interface ChartMetadata {
  generatedAt: string;
  dataSource: string;
  totalRows: number;
  currency: string;
  unit: string;
  precision: number;
  lastUpdated: string;
}

// Specific Chart Types
export interface DebtAnalysisChart {
  debtTrend: TimeSeriesData;
  maturityProfile: BarChartData;
  compositionBreakdown: PieChartData;
  covenantCompliance: GaugeChartData[];
}

export interface TimeSeriesData {
  periods: string[];
  series: TimeSeries[];
}

export interface TimeSeries {
  name: string;
  values: number[];
  color: string;
  type: 'line' | 'area' | 'bar';
}

export interface BarChartData {
  categories: string[];
  series: BarSeries[];
}

export interface BarSeries {
  name: string;
  data: number[];
  color: string;
  stack?: string;
}

export interface PieChartData {
  segments: PieSegment[];
  total: number;
}

export interface PieSegment {
  name: string;
  value: number;
  percentage: number;
  color: string;
  description?: string;
}

export interface GaugeChartData {
  name: string;
  value: number;
  min: number;
  max: number;
  threshold: number;
  color: string;
  unit: string;
  status: 'safe' | 'warning' | 'danger';
}

export interface WaterfallChartData {
  categories: string[];
  values: WaterfallValue[];
  total: number;
}

export interface WaterfallValue {
  name: string;
  value: number;
  isTotal: boolean;
  cumulative: number;
  color: string;
}

export interface HeatmapData {
  xLabels: string[];
  yLabels: string[];
  data: number[][];
  colorScale: ColorScale;
}

export interface ColorScale {
  min: string;
  max: string;
  steps: number;
}

// Chart Export Types
export interface ChartExportConfig {
  format: ExportFormat;
  filename: string;
  quality: number;
  width: number;
  height: number;
  includeData: boolean;
}

export type ExportFormat = 'png' | 'jpg' | 'pdf' | 'svg' | 'csv' | 'xlsx';

export interface ChartExportResult {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
  size?: number;
}

// Dashboard Configuration
export interface DashboardConfig {
  id: string;
  name: string;
  description: string;
  layout: DashboardLayout;
  charts: ChartConfig[];
  filters: GlobalFilters;
  refreshInterval: number;
  isPublic: boolean;
  tags: string[];
}

export interface DashboardLayout {
  type: 'grid' | 'freeform';
  columns: number;
  rowHeight: number;
  margin: number;
  responsive: boolean;
}

export interface GlobalFilters {
  dateRange: DateRange;
  company: string[];
  scenario: string[];
  currency: string;
}

// Real-time Updates
export interface ChartUpdateEvent {
  chartId: string;
  type: 'data' | 'config' | 'style';
  data: any;
  timestamp: string;
}

export interface ChartSubscription {
  chartId: string;
  callback: (event: ChartUpdateEvent) => void;
  isActive: boolean;
}