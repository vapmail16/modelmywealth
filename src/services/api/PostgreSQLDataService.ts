import { httpClient } from "@/services/http/client";
import { DATABASE_CONFIG } from "@/config/database";

export class PostgreSQLDataService {
  private static getApiUrl(endpoint: string): string {
    return `${DATABASE_CONFIG.API_BASE_URL}${endpoint}`;
  }

  static async loadProjectData(projectId: string) {
    try {
      console.log("PostgreSQLDataService: Loading project data for projectId:", projectId);
      const response = await httpClient.get(this.getApiUrl(`/projects/${projectId}/data`));
      console.log("PostgreSQLDataService: Project data loaded successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("PostgreSQLDataService: Error loading project data:", error);
      throw error;
    }
  }

  static async loadProfitLossData(projectId: string) {
    try {
      const response = await httpClient.get(this.getApiUrl(`/projects/${projectId}/data`));
      return response.data?.profitLossData || null;
    } catch (error) {
      console.error("PostgreSQLDataService: Error loading profit loss data:", error);
      throw error;
    }
  }

  static async loadBalanceSheetData(projectId: string) {
    try {
      const response = await httpClient.get(this.getApiUrl(`/projects/${projectId}/data`));
      return response.data?.balanceSheetData || null;
    } catch (error) {
      console.error("PostgreSQLDataService: Error loading balance sheet data:", error);
      throw error;
    }
  }

  static async loadDebtStructureData(projectId: string) {
    try {
      const response = await httpClient.get(this.getApiUrl(`/projects/${projectId}/data`));
      return response.data?.debtStructureData || null;
    } catch (error) {
      console.error("PostgreSQLDataService: Error loading debt structure data:", error);
      throw error;
    }
  }

  static async loadWorkingCapitalData(projectId: string) {
    try {
      const response = await httpClient.get(this.getApiUrl(`/projects/${projectId}/data`));
      return response.data?.workingCapitalData || null;
    } catch (error) {
      console.error("PostgreSQLDataService: Error loading working capital data:", error);
      throw error;
    }
  }

  static async loadGrowthAssumptionsData(projectId: string) {
    try {
      const response = await httpClient.get(this.getApiUrl(`/projects/${projectId}/data`));
      return response.data?.growthAssumptionsData || null;
    } catch (error) {
      console.error("PostgreSQLDataService: Error loading growth assumptions data:", error);
      throw error;
    }
  }

  static async loadSeasonalityData(projectId: string) {
    try {
      const response = await httpClient.get(this.getApiUrl(`/projects/${projectId}/data`));
      return response.data?.seasonalityData || null;
    } catch (error) {
      console.error("PostgreSQLDataService: Error loading seasonality data:", error);
      throw error;
    }
  }

  static async loadCompanyDetailsData(projectId: string) {
    try {
      const response = await httpClient.get(this.getApiUrl(`/projects/${projectId}/data`));
      return response.data?.companyDetailsData || null;
    } catch (error) {
      console.error("PostgreSQLDataService: Error loading company details data:", error);
      throw error;
    }
  }

  static async loadCashFlowData(projectId: string) {
    try {
      const response = await httpClient.get(this.getApiUrl(`/projects/${projectId}/data`));
      return response.data?.cashFlowData || null;
    } catch (error) {
      console.error("PostgreSQLDataService: Error loading cash flow data:", error);
      throw error;
    }
  }

  static async healthCheck() {
    try {
      const response = await httpClient.get(this.getApiUrl("/health"));
      return response.data;
    } catch (error) {
      console.error("PostgreSQLDataService: Health check failed:", error);
      throw error;
    }
  }
}
