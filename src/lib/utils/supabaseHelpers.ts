/**
 * مساعدات Supabase لتجنب Type instantiation issues
 * ملاحظة: استخدام any هنا مقصود لتجنب مشاكل TypeScript العميقة
 */

import { supabase } from "@/integrations/supabase/client";
import type { AppError } from "@/types/errors";

/**
 * Helper function to fetch data from Supabase without type complexity
 */
export async function fetchFromTable<T>(
  tableName: string,
  options: {
    select?: string;
    filters?: Array<{ column: string; operator: string; value: unknown }>;
    order?: { column: string; ascending?: boolean };
    limit?: number;
    single?: boolean;
  } = {}
): Promise<{ data: T | T[] | null; error: AppError | null }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client: any = supabase;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = client.from(tableName);

    // Select
    if (options.select) {
      query = query.select(options.select);
    } else {
      query = query.select('*');
    }

    // Filters
    if (options.filters) {
      for (const filter of options.filters) {
        if (filter.operator === 'eq') {
          query = query.eq(filter.column, filter.value);
        } else if (filter.operator === 'gt') {
          query = query.gt(filter.column, filter.value);
        } else if (filter.operator === 'lt') {
          query = query.lt(filter.column, filter.value);
        } else if (filter.operator === 'gte') {
          query = query.gte(filter.column, filter.value);
        } else if (filter.operator === 'lte') {
          query = query.lte(filter.column, filter.value);
        }
      }
    }

    // Order
    if (options.order) {
      query = query.order(options.order.column, { 
        ascending: options.order.ascending ?? true 
      });
    }

    // Limit
    if (options.limit) {
      query = query.limit(options.limit);
    }

    // Single
    if (options.single) {
      query = query.maybeSingle();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await query;
    return { data: result.data, error: result.error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Helper to insert data
 */
export async function insertIntoTable<T>(
  tableName: string,
  data: Record<string, unknown>
): Promise<{ data: T | null; error: AppError | null }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client: any = supabase;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = client.from(tableName).insert([data]).select().maybeSingle();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await query;
    return { data: result.data, error: result.error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Helper to update data
 */
export async function updateInTable<T>(
  tableName: string,
  id: string,
  updates: Record<string, unknown>
): Promise<{ data: T | null; error: AppError | null }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client: any = supabase;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = client
      .from(tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await query;
    return { data: result.data, error: result.error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Helper to delete data
 */
export async function deleteFromTable(
  tableName: string,
  id: string
): Promise<{ error: AppError | null }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client: any = supabase;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = client.from(tableName).delete().eq('id', id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await query;
    return { error: result.error };
  } catch (error) {
    return { error };
  }
}
