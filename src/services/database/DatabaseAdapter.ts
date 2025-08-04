import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type DatabaseTable = string;
export type DatabaseFunction = string;

export interface DatabaseAdapter {
  select<T = any>(table: DatabaseTable, query?: any): Promise<{ data: T[] | null; error: any }>;
  insert<T = any>(table: DatabaseTable, data: any): Promise<{ data: T | null; error: any }>;
  update<T = any>(table: DatabaseTable, data: any, match?: any): Promise<{ data: T | null; error: any }>;
  delete(table: DatabaseTable, match: any): Promise<{ error: any }>;
  rpc<T = any>(fn: string, params?: any): Promise<{ data: T | null; error: any }>;
}

class SupabaseAdapter implements DatabaseAdapter {
  async select<T = any>(table: DatabaseTable, query?: any): Promise<{ data: T[] | null; error: any }> {
    try {
      let queryBuilder = (supabase as any).from(table).select(query?.select || '*');
      
      if (query?.where) {
        Object.entries(query.where).forEach(([key, value]) => {
          queryBuilder = queryBuilder.eq(key, value);
        });
      }
      
      if (query?.single) {
        queryBuilder = queryBuilder.maybeSingle();
      }
      
      if (query?.limit) {
        queryBuilder = queryBuilder.limit(query.limit);
      }
      
      if (query?.order) {
        queryBuilder = queryBuilder.order(query.order.column, { ascending: query.order.ascending });
      }
      
      const result = await queryBuilder;
      return { data: result.data as T[], error: result.error };
    } catch (error) {
      return { data: null, error };
    }
  }

  async insert<T = any>(table: DatabaseTable, data: any): Promise<{ data: T | null; error: any }> {
    try {
      const result = await (supabase as any).from(table).insert(data).select().single();
      return { data: result.data as T, error: result.error };
    } catch (error) {
      return { data: null, error };
    }
  }

  async update<T = any>(table: DatabaseTable, data: any, match?: any): Promise<{ data: T | null; error: any }> {
    try {
      let queryBuilder = (supabase as any).from(table).update(data);
      
      if (match) {
        Object.entries(match).forEach(([key, value]) => {
          queryBuilder = queryBuilder.eq(key, value);
        });
      }
      
      const result = await queryBuilder.select().single();
      return { data: result.data as T, error: result.error };
    } catch (error) {
      return { data: null, error };
    }
  }

  async delete(table: DatabaseTable, match: any): Promise<{ error: any }> {
    try {
      let queryBuilder = (supabase as any).from(table).delete();
      
      Object.entries(match).forEach(([key, value]) => {
        queryBuilder = queryBuilder.eq(key, value);
      });
      
      const result = await queryBuilder;
      return { error: result.error };
    } catch (error) {
      return { error };
    }
  }

  async rpc<T = any>(fn: string, params?: any): Promise<{ data: T | null; error: any }> {
    try {
      const result = await (supabase as any).rpc(fn, params);
      return { data: result.data as T, error: result.error };
    } catch (error) {
      return { data: null, error };
    }
  }
}

// Export singleton instance
export const databaseAdapter: DatabaseAdapter = new SupabaseAdapter();