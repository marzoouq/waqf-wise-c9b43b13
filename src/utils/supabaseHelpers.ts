// مساعدات Supabase لتجنب Type instantiation issues

import { supabase } from "@/integrations/supabase/client";

/**
 * Helper function to fetch data from Supabase without type complexity
 */
export async function fetchFromTable<T>(
  tableName: string,
  options: {
    select?: string;
    filters?: Array<{ column: string; operator: string; value: any }>;
    order?: { column: string; ascending?: boolean };
    limit?: number;
    single?: boolean;
  } = {}
): Promise<{ data: T | T[] | null; error: any }> {
  try {
    // استخدام any لتجنب "Type instantiation is excessively deep"
    const client: any = supabase;
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
  data: any
): Promise<{ data: T | null; error: any }> {
  try {
    const client: any = supabase;
    const query: any = client.from(tableName).insert([data]).select().single();
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
  updates: any
): Promise<{ data: T | null; error: any }> {
  try {
    const client: any = supabase;
    const query: any = client
      .from(tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
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
): Promise<{ error: any }> {
  try {
    const client: any = supabase;
    const query: any = client.from(tableName).delete().eq('id', id);
    const result: any = await query;
    return { error: result.error };
  } catch (error) {
    return { error };
  }
}
