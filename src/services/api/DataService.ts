import { PostgreSQLDataService } from "./PostgreSQLDataService";
import { isPostgreSQL } from "@/config/database";

export class DataService {
  static async loadProjectData(projectId: string) {
    console.log("DataService: Loading project data with database:", isPostgreSQL() ? "PostgreSQL" : "Supabase");
    if (isPostgreSQL()) {
      return PostgreSQLDataService.loadProjectData(projectId);
    } else {
      throw new Error("Supabase is not available. Please use PostgreSQL.");
    }
  }

  static async loadProfitLossData(projectId: string) {
    if (isPostgreSQL()) {
      return PostgreSQLDataService.loadProfitLossData(projectId);
    } else {
      throw new Error("Supabase is not available. Please use PostgreSQL.");
    }
  }

  static async loadBalanceSheetData(projectId: string) {
    if (isPostgreSQL()) {
      return PostgreSQLDataService.loadBalanceSheetData(projectId);
    } else {
      throw new Error("Supabase is not available. Please use PostgreSQL.");
    }
  }

  static async loadDebtStructureData(projectId: string) {
    if (isPostgreSQL()) {
      return PostgreSQLDataService.loadDebtStructureData(projectId);
    } else {
      throw new Error("Supabase is not available. Please use PostgreSQL.");
    }
  }

  static async loadWorkingCapitalData(projectId: string) {
    if (isPostgreSQL()) {
      return PostgreSQLDataService.loadWorkingCapitalData(projectId);
    } else {
      throw new Error("Supabase is not available. Please use PostgreSQL.");
    }
  }

  static async loadGrowthAssumptionsData(projectId: string) {
    if (isPostgreSQL()) {
      return PostgreSQLDataService.loadGrowthAssumptionsData(projectId);
    } else {
      throw new Error("Supabase is not available. Please use PostgreSQL.");
    }
  }

  static async loadSeasonalityData(projectId: string) {
    if (isPostgreSQL()) {
      return PostgreSQLDataService.loadSeasonalityData(projectId);
    } else {
      throw new Error("Supabase is not available. Please use PostgreSQL.");
    }
  }

  static async loadCompanyDetailsData(projectId: string) {
    if (isPostgreSQL()) {
      return PostgreSQLDataService.loadCompanyDetailsData(projectId);
    } else {
      throw new Error("Supabase is not available. Please use PostgreSQL.");
    }
  }

  static async loadCashFlowData(projectId: string) {
    if (isPostgreSQL()) {
      return PostgreSQLDataService.loadCashFlowData(projectId);
    } else {
      throw new Error("Supabase is not available. Please use PostgreSQL.");
    }
  }

  static getCurrentDatabase() {
    return isPostgreSQL() ? "PostgreSQL" : "Supabase";
  }
}
