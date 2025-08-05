import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

/**
 * Test Supabase connection and basic operations
 */
export class SupabaseTest {
  
  /**
   * Test basic connection to Supabase
   */
  static async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Test basic connection by trying to fetch a single row
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .limit(1);
      
      if (error) {
        return { success: false, message: `Connection failed: ${error.message}` };
      }
      
      return { success: true, message: 'Supabase connection successful!' };
    } catch (error) {
      return { success: false, message: `Connection error: ${error}` };
    }
  }

  /**
   * Test authentication
   */
  static async testAuth(): Promise<{ success: boolean; message: string }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        return { success: false, message: `Auth error: ${error.message}` };
      }
      
      if (user) {
        return { success: true, message: `Authenticated as: ${user.email}` };
      } else {
        return { success: false, message: 'Not authenticated' };
      }
    } catch (error) {
      return { success: false, message: `Auth test error: ${error}` };
    }
  }

  /**
   * Test database operations
   */
  static async testDatabaseOperations(): Promise<{ success: boolean; message: string }> {
    try {
      // Test reading from different tables
      const tables = ['companies', 'projects', 'profit_loss_data', 'balance_sheet_data'];
      const results = [];
      
      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          results.push(`${table}: Error - ${error.message}`);
        } else {
          results.push(`${table}: OK (${data?.length || 0} rows)`);
        }
      }
      
      return { 
        success: true, 
        message: `Database operations test:\n${results.join('\n')}` 
      };
    } catch (error) {
      return { success: false, message: `Database test error: ${error}` };
    }
  }

  /**
   * Test inserting test data
   */
  static async testInsertData(): Promise<{ success: boolean; message: string }> {
    try {
      // Test inserting a company
      const testCompany = {
        name: 'Test Company',
        description: 'Test company for connection testing',
        industry: 'Technology',
        headquarters: 'Test City',
        user_id: 'test-user-id'
      };

      const { data, error } = await supabase
        .from('companies')
        .insert(testCompany)
        .select();

      if (error) {
        return { success: false, message: `Insert error: ${error.message}` };
      }

      return { 
        success: true, 
        message: `Test data inserted successfully! Company ID: ${data?.[0]?.id}` 
      };
    } catch (error) {
      return { success: false, message: `Insert test error: ${error}` };
    }
  }

  /**
   * Run all tests
   */
  static async runAllTests(): Promise<{
    connection: { success: boolean; message: string };
    auth: { success: boolean; message: string };
    database: { success: boolean; message: string };
    insert: { success: boolean; message: string };
  }> {
    const connection = await this.testConnection();
    const auth = await this.testAuth();
    const database = await this.testDatabaseOperations();
    const insert = await this.testInsertData();

    return { connection, auth, database, insert };
  }
}

/**
 * React hook to test Supabase connection
 */
export const useSupabaseTest = () => {
  const [testResults, setTestResults] = useState<{
    connection: { success: boolean; message: string };
    auth: { success: boolean; message: string };
    database: { success: boolean; message: string };
    insert: { success: boolean; message: string };
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const runTests = async () => {
    setIsTesting(true);
    try {
      const results = await SupabaseTest.runAllTests();
      setTestResults(results);
    } catch (error) {
      console.error('Test error:', error);
    } finally {
      setIsTesting(false);
    }
  };

  return { testResults, isTesting, runTests };
}; 