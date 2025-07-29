// Report Generation Types
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: ReportCategory;
  sections: ReportSection[];
  estimatedTime: string;
  outputFormats: ReportFormat[];
  requiredData: string[];
  isActive: boolean;
  version: string;
}

export type ReportCategory = 
  | 'executive_summary' 
  | 'detailed_analysis' 
  | 'lender_package' 
  | 'board_presentation'
  | 'regulatory_filing'
  | 'investor_update'
  | 'custom';

export type ReportFormat = 'pdf' | 'docx' | 'pptx' | 'html' | 'xlsx';

export interface ReportSection {
  id: string;
  name: string;
  type: SectionType;
  order: number;
  isRequired: boolean;
  isCustomizable: boolean;
  template: string;
  dataRequirements: string[];
  chartConfigs: string[];
}

export type SectionType = 
  | 'executive_summary'
  | 'company_overview' 
  | 'financial_analysis'
  | 'debt_analysis'
  | 'projections'
  | 'risk_assessment'
  | 'recommendations'
  | 'appendix'
  | 'charts'
  | 'tables'
  | 'custom_text';

export interface ReportGenerationRequest {
  templateId: string;
  title: string;
  companyName: string;
  dataSourceId: string;
  customInstructions?: string;
  sectionOverrides: SectionOverride[];
  outputFormat: ReportFormat;
  includeCharts: boolean;
  includeAppendix: boolean;
  aiEnhancements: AIEnhancementConfig;
  branding: ReportBranding;
}

export interface SectionOverride {
  sectionId: string;
  include: boolean;
  customContent?: string;
  additionalCharts?: string[];
}

export interface AIEnhancementConfig {
  generateInsights: boolean;
  includeRecommendations: boolean;
  analysisDepth: 'basic' | 'detailed' | 'comprehensive';
  focusAreas: string[];
  compareToIndustry: boolean;
  generateExecutiveSummary: boolean;
}

export interface ReportBranding {
  logoUrl?: string;
  companyColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fontFamily: string;
  headerStyle: 'corporate' | 'modern' | 'minimal';
  includeWatermark: boolean;
}

export interface ReportGenerationProgress {
  id: string;
  status: GenerationStatus;
  progress: number;
  currentStep: string;
  estimatedCompletion: string;
  error?: string;
  startedAt: string;
  completedAt?: string;
}

export type GenerationStatus = 
  | 'queued'
  | 'initializing'
  | 'analyzing_data'
  | 'generating_content'
  | 'creating_charts'
  | 'formatting'
  | 'finalizing'
  | 'completed'
  | 'failed';

export interface GeneratedReport {
  id: string;
  title: string;
  templateId: string;
  format: ReportFormat;
  content: ReportContent;
  metadata: ReportMetadata;
  downloadUrl: string;
  shareUrl?: string;
  previewUrl: string;
}

export interface ReportContent {
  sections: GeneratedSection[];
  charts: EmbeddedChart[];
  tables: EmbeddedTable[];
  appendix: AppendixItem[];
  executiveSummary: string;
  tableOfContents: TOCItem[];
}

export interface GeneratedSection {
  id: string;
  title: string;
  content: string;
  type: SectionType;
  order: number;
  pageNumber: number;
  wordCount: number;
  charts: string[];
  tables: string[];
}

export interface EmbeddedChart {
  id: string;
  title: string;
  type: string;
  imageUrl: string;
  dataUrl?: string;
  caption: string;
  pageNumber: number;
  size: ChartSize;
}

export interface ChartSize {
  width: number;
  height: number;
  aspectRatio: number;
}

export interface EmbeddedTable {
  id: string;
  title: string;
  headers: string[];
  rows: TableRow[];
  caption: string;
  pageNumber: number;
  formatting: TableFormatting;
}

export interface TableRow {
  cells: TableCell[];
  isHeader: boolean;
  isTotal: boolean;
}

export interface TableCell {
  value: string | number;
  formatted: string;
  type: 'text' | 'number' | 'currency' | 'percentage' | 'date';
  alignment: 'left' | 'center' | 'right';
  style?: CellStyle;
}

export interface CellStyle {
  backgroundColor: string;
  textColor: string;
  fontWeight: 'normal' | 'bold';
  fontSize: number;
}

export interface TableFormatting {
  alternateRowColors: boolean;
  borderStyle: 'none' | 'light' | 'medium' | 'heavy';
  headerStyle: 'default' | 'corporate' | 'minimal';
  numberFormat: string;
}

export interface AppendixItem {
  id: string;
  title: string;
  type: 'table' | 'chart' | 'document' | 'calculation';
  content: any;
  description: string;
}

export interface TOCItem {
  title: string;
  pageNumber: number;
  level: number;
  sectionId: string;
}

export interface ReportMetadata {
  generatedAt: string;
  generatedBy: string;
  version: string;
  pageCount: number;
  wordCount: number;
  chartCount: number;
  tableCount: number;
  fileSize: number;
  processingTime: number;
  aiModel: string;
  dataAsOfDate: string;
}

// Report History and Management
export interface ReportHistory {
  id: string;
  title: string;
  templateName: string;
  format: ReportFormat;
  status: 'completed' | 'failed' | 'deleted';
  createdAt: string;
  fileSize: number;
  downloadCount: number;
  sharedWith: string[];
  tags: string[];
}

export interface ReportShareConfig {
  reportId: string;
  isPublic: boolean;
  expirationDate?: string;
  password?: string;
  allowDownload: boolean;
  allowComments: boolean;
  recipientEmails: string[];
  customMessage?: string;
}

export interface ReportComment {
  id: string;
  reportId: string;
  userId: string;
  userName: string;
  content: string;
  pageNumber: number;
  sectionId?: string;
  createdAt: string;
  isResolved: boolean;
  replies: ReportComment[];
}

// AI-Specific Types
export interface AIInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'risk' | 'opportunity' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  supportingData: any[];
  actionItems: string[];
}

export interface AIRecommendation {
  id: string;
  category: 'operational' | 'financial' | 'strategic' | 'risk_management';
  title: string;
  description: string;
  rationale: string;
  expectedBenefit: string;
  implementation: {
    difficulty: 'low' | 'medium' | 'high';
    timeframe: string;
    resources: string[];
    risks: string[];
  };
  priority: number;
  confidence: number;
}

export interface ReportAnalytics {
  reportId: string;
  views: number;
  downloads: number;
  shares: number;
  averageReadTime: number;
  popularSections: string[];
  userFeedback: UserFeedback[];
  generatedAt: string;
}

export interface UserFeedback {
  userId: string;
  rating: number;
  comment: string;
  aspects: {
    accuracy: number;
    clarity: number;
    completeness: number;
    usefulness: number;
  };
  createdAt: string;
}