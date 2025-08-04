import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type DatabaseTable = string;
export type DatabaseFunction = string;

export interface DatabaseQueryOptions {
  select?: string;
  where?: Record<string, unknown>;
  orderBy?: { column: string; ascending: boolean };
  limit?: number;
  single?: boolean;
}

export interface DatabaseError {
  code?: string;
  message: string;
  details?: unknown;
}

export interface DatabaseAdapter {
  select<T = unknown>(table: DatabaseTable, query?: DatabaseQueryOptions): Promise<{ data: T[] | null; error: DatabaseError | null }>;
  insert<T = unknown>(table: DatabaseTable, data: Record<string, unknown>): Promise<{ data: T | null; error: DatabaseError | null }>;
  update<T = unknown>(table: DatabaseTable, data: Record<string, unknown>, match?: Record<string, unknown>): Promise<{ data: T | null; error: DatabaseError | null }>;
  delete(table: DatabaseTable, match: Record<string, unknown>): Promise<{ error: DatabaseError | null }>;
  rpc<T = unknown>(fn: string, params?: Record<string, unknown>): Promise<{ data: T | null; error: DatabaseError | null }>;
}

class SupabaseAdapter implements DatabaseAdapter {
  async select<T = unknown>(table: DatabaseTable, query?: DatabaseQueryOptions): Promise<{ data: T[] | null; error: DatabaseError | null }> {
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
      
      if (query?.orderBy) {
        queryBuilder = queryBuilder.order(query.orderBy.column, { ascending: query.orderBy.ascending });
      }
      
      const result = await queryBuilder;
      return { 
        data: result.data as T[], 
        error: result.error ? { message: result.error.message, code: result.error.code, details: result.error } : null 
      };
    } catch (error) {
      return { 
        data: null, 
        error: { message: error instanceof Error ? error.message : 'Unknown error', details: error } 
      };
    }
  }

  async insert<T = unknown>(table: DatabaseTable, data: Record<string, unknown>): Promise<{ data: T | null; error: DatabaseError | null }> {
    try {
      const result = await (supabase as any).from(table).insert(data).select().single();
      return { 
        data: result.data as T, 
        error: result.error ? { message: result.error.message, code: result.error.code, details: result.error } : null 
      };
    } catch (error) {
      return { 
        data: null, 
        error: { message: error instanceof Error ? error.message : 'Unknown error', details: error } 
      };
    }
  }

  async update<T = unknown>(table: DatabaseTable, data: Record<string, unknown>, match?: Record<string, unknown>): Promise<{ data: T | null; error: DatabaseError | null }> {
    try {
      let queryBuilder = (supabase as any).from(table).update(data);
      
      if (match) {
        Object.entries(match).forEach(([key, value]) => {
          queryBuilder = queryBuilder.eq(key, value);
        });
      }
      
      const result = await queryBuilder.select().single();
      return { 
        data: result.data as T, 
        error: result.error ? { message: result.error.message, code: result.error.code, details: result.error } : null 
      };
    } catch (error) {
      return { 
        data: null, 
        error: { message: error instanceof Error ? error.message : 'Unknown error', details: error } 
      };
    }
  }

  async delete(table: DatabaseTable, match: Record<string, unknown>): Promise<{ error: DatabaseError | null }> {
    try {
      let queryBuilder = (supabase as any).from(table).delete();
      
      Object.entries(match).forEach(([key, value]) => {
        queryBuilder = queryBuilder.eq(key, value);
      });
      
      const result = await queryBuilder;
      return { 
        error: result.error ? { message: result.error.message, code: result.error.code, details: result.error } : null 
      };
    } catch (error) {
      return { 
        error: { message: error instanceof Error ? error.message : 'Unknown error', details: error } 
      };
    }
  }

  async rpc<T = unknown>(fn: string, params?: Record<string, unknown>): Promise<{ data: T | null; error: DatabaseError | null }> {
    try {
      const result = await (supabase as any).rpc(fn, params);
      return { 
        data: result.data as T, 
        error: result.error ? { message: result.error.message, code: result.error.code, details: result.error } : null 
      };
    } catch (error) {
      return { 
        data: null, 
        error: { message: error instanceof Error ? error.message : 'Unknown error', details: error } 
      };
    }
  }
}

// Export singleton instance
export const databaseAdapter: DatabaseAdapter = new SupabaseAdapter();