import { httpClient } from '../http/client';
import { ApiResponse } from '@/types/api';
import { 
  ReportTemplate,
  ReportGenerationRequest,
  ReportGenerationProgress,
  GeneratedReport,
  ReportHistory,
  ReportShareConfig,
  ReportComment,
  AIInsight,
  AIRecommendation,
  ReportAnalytics
} from '@/types/reports';

export interface ReportFilters {
  dateRange: {
    start: string;
    end: string;
  };
  categories: string[];
  status: string[];
  createdBy?: string;
}

class ReportService {
  private baseUrl = '/reports';

  /**
   * Get available report templates
   */
  async getReportTemplates(): Promise<ReportTemplate[]> {
    const response = await httpClient.get<ReportTemplate[]>(
      `${this.baseUrl}/templates`
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get report templates');
    }
    
    return response.data!;
  }

  /**
   * Get specific report template
   */
  async getReportTemplate(templateId: string): Promise<ReportTemplate> {
    const response = await httpClient.get<ReportTemplate>(
      `${this.baseUrl}/templates/${templateId}`
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get report template');
    }
    
    return response.data!;
  }

  /**
   * Generate report using AI
   */
  async generateReport(request: ReportGenerationRequest): Promise<{ generationId: string }> {
    const response = await httpClient.post<{ generationId: string }>(
      `${this.baseUrl}/generate`,
      request,
      { timeout: 120000 } // 2 minutes timeout for generation start
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to start report generation');
    }
    
    return response.data!;
  }

  /**
   * Get report generation progress
   */
  async getGenerationProgress(generationId: string): Promise<ReportGenerationProgress> {
    const response = await httpClient.get<ReportGenerationProgress>(
      `${this.baseUrl}/generation/${generationId}/progress`
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get generation progress');
    }
    
    return response.data!;
  }

  /**
   * Get generated report
   */
  async getGeneratedReport(generationId: string): Promise<GeneratedReport> {
    const response = await httpClient.get<GeneratedReport>(
      `${this.baseUrl}/generation/${generationId}/result`
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get generated report');
    }
    
    return response.data!;
  }

  /**
   * Save generated report
   */
  async saveReport(report: GeneratedReport): Promise<{ reportId: string }> {
    const response = await httpClient.post<{ reportId: string }>(
      `${this.baseUrl}/save`,
      report
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to save report');
    }
    
    return response.data!;
  }

  /**
   * Get report history
   */
  async getReportHistory(filters?: ReportFilters): Promise<ReportHistory[]> {
    const url = filters 
      ? `${this.baseUrl}/history?${new URLSearchParams(filters as any).toString()}`
      : `${this.baseUrl}/history`;
      
    const response = await httpClient.get<ReportHistory[]>(url);
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get report history');
    }
    
    return response.data!;
  }

  /**
   * Get specific report
   */
  async getReport(reportId: string): Promise<GeneratedReport> {
    const response = await httpClient.get<GeneratedReport>(
      `${this.baseUrl}/${reportId}`
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get report');
    }
    
    return response.data!;
  }

  /**
   * Export report to different formats
   */
  async exportReport(
    reportId: string, 
    format: 'pdf' | 'docx' | 'pptx' | 'html'
  ): Promise<{ url: string; filename: string }> {
    const response = await httpClient.post<{ url: string; filename: string }>(
      `${this.baseUrl}/${reportId}/export`,
      { format },
      { timeout: 60000 }
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export report');
    }
    
    return response.data!;
  }

  /**
   * Share report
   */
  async shareReport(reportId: string, config: ReportShareConfig): Promise<{ shareUrl: string }> {
    const response = await httpClient.post<{ shareUrl: string }>(
      `${this.baseUrl}/${reportId}/share`,
      config
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to share report');
    }
    
    return response.data!;
  }

  /**
   * Add comment to report
   */
  async addComment(
    reportId: string,
    content: string,
    pageNumber?: number,
    sectionId?: string
  ): Promise<ReportComment> {
    const response = await httpClient.post<ReportComment>(
      `${this.baseUrl}/${reportId}/comments`,
      { content, pageNumber, sectionId }
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to add comment');
    }
    
    return response.data!;
  }

  /**
   * Get report comments
   */
  async getReportComments(reportId: string): Promise<ReportComment[]> {
    const response = await httpClient.get<ReportComment[]>(
      `${this.baseUrl}/${reportId}/comments`
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get comments');
    }
    
    return response.data!;
  }

  /**
   * Get AI insights for financial data
   */
  async getAIInsights(projectId: string): Promise<AIInsight[]> {
    const response = await httpClient.get<AIInsight[]>(
      `${this.baseUrl}/ai/insights/${projectId}`
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get AI insights');
    }
    
    return response.data!;
  }

  /**
   * Get AI recommendations
   */
  async getAIRecommendations(projectId: string): Promise<AIRecommendation[]> {
    const response = await httpClient.get<AIRecommendation[]>(
      `${this.baseUrl}/ai/recommendations/${projectId}`
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get AI recommendations');
    }
    
    return response.data!;
  }

  /**
   * Delete report
   */
  async deleteReport(reportId: string): Promise<void> {
    const response = await httpClient.delete(
      `${this.baseUrl}/${reportId}`
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete report');
    }
  }

  /**
   * Clone/duplicate report
   */
  async cloneReport(reportId: string, newTitle: string): Promise<{ reportId: string }> {
    const response = await httpClient.post<{ reportId: string }>(
      `${this.baseUrl}/${reportId}/clone`,
      { title: newTitle }
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to clone report');
    }
    
    return response.data!;
  }

  /**
   * Get report analytics
   */
  async getReportAnalytics(reportId: string): Promise<ReportAnalytics> {
    const response = await httpClient.get<ReportAnalytics>(
      `${this.baseUrl}/${reportId}/analytics`
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get report analytics');
    }
    
    return response.data!;
  }

  /**
   * Update report template
   */
  async updateReportTemplate(
    templateId: string, 
    template: Partial<ReportTemplate>
  ): Promise<ReportTemplate> {
    const response = await httpClient.patch<ReportTemplate>(
      `${this.baseUrl}/templates/${templateId}`,
      template
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update report template');
    }
    
    return response.data!;
  }

  /**
   * Create custom report template
   */
  async createReportTemplate(template: Omit<ReportTemplate, 'id'>): Promise<ReportTemplate> {
    const response = await httpClient.post<ReportTemplate>(
      `${this.baseUrl}/templates`,
      template
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create report template');
    }
    
    return response.data!;
  }

  /**
   * Subscribe to report generation updates
   */
  subscribeToGenerationUpdates(
    generationId: string,
    callback: (progress: ReportGenerationProgress) => void
  ): () => void {
    const interval = setInterval(async () => {
      try {
        const progress = await this.getGenerationProgress(generationId);
        callback(progress);
        
        if (progress.status === 'completed' || progress.status === 'failed') {
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Failed to get generation progress:', error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }

  /**
   * Cancel report generation
   */
  async cancelGeneration(generationId: string): Promise<void> {
    const response = await httpClient.post(
      `${this.baseUrl}/generation/${generationId}/cancel`
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to cancel generation');
    }
  }
}

// Create and export the service instance
export const reportService = new ReportService();

// Export the class for testing or custom instances
export { ReportService };