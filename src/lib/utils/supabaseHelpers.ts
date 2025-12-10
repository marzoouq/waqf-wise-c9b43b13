/**
 * مساعدات Supabase - نسخة محسّنة
 * @version 2.8.51
 * 
 * ملاحظة: استخدام type assertions ضروري هنا لتجنب مشاكل TypeScript العميقة
 * مع Supabase client. هذا نمط موصى به في وثائق Supabase.
 * @see https://supabase.com/docs/reference/javascript/typescript-support
 */

import { supabase } from "@/integrations/supabase/client";
import type { AppError } from "@/types/errors";

interface FetchOptions {
  select?: string;
  filters?: Array<{ 
    column: string; 
    operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'neq' | 'like' | 'ilike'; 
    value: unknown 
  }>;
  order?: { column: string; ascending?: boolean };
  limit?: number;
  single?: boolean;
}

interface FetchResult<T> {
  data: T | T[] | null;
  error: AppError | null;
}

interface MutationResult<T> {
  data: T | null;
  error: AppError | null;
}

/**
 * Type assertion helper للتعامل مع dynamic table names
 * @note Required for dynamic table queries - Supabase types don't support string table names
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getTableQuery = (tableName: string): any => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).from(tableName);
};

/**
 * جلب البيانات من جدول Supabase
 */
export async function fetchFromTable<T>(
  tableName: string,
  options: FetchOptions = {}
): Promise<FetchResult<T>> {
  try {
    let query = getTableQuery(tableName).select(options.select || '*');

    // تطبيق الفلاتر
    if (options.filters) {
      for (const filter of options.filters) {
        const { column, operator, value } = filter;
        switch (operator) {
          case 'eq':
            query = query.eq(column, value);
            break;
          case 'neq':
            query = query.neq(column, value);
            break;
          case 'gt':
            query = query.gt(column, value);
            break;
          case 'lt':
            query = query.lt(column, value);
            break;
          case 'gte':
            query = query.gte(column, value);
            break;
          case 'lte':
            query = query.lte(column, value);
            break;
          case 'like':
            query = query.like(column, value as string);
            break;
          case 'ilike':
            query = query.ilike(column, value as string);
            break;
        }
      }
    }

    // الترتيب
    if (options.order) {
      query = query.order(options.order.column, { 
        ascending: options.order.ascending ?? true 
      });
    }

    // الحد
    if (options.limit) {
      query = query.limit(options.limit);
    }

    // سجل واحد
    if (options.single) {
      const { data, error } = await query.maybeSingle();
      return { data: data as T | null, error: error as AppError | null };
    }

    const { data, error } = await query;
    return { data: data as T[] | null, error: error as AppError | null };
  } catch (error) {
    return { data: null, error: error as AppError };
  }
}

/**
 * إدراج بيانات في جدول
 */
export async function insertIntoTable<T>(
  tableName: string,
  data: Record<string, unknown>
): Promise<MutationResult<T>> {
  try {
    const { data: result, error } = await getTableQuery(tableName)
      .insert([data])
      .select()
      .maybeSingle();

    return { data: result as T | null, error: error as AppError | null };
  } catch (error) {
    return { data: null, error: error as AppError };
  }
}

/**
 * تحديث بيانات في جدول
 */
export async function updateInTable<T>(
  tableName: string,
  id: string,
  updates: Record<string, unknown>
): Promise<MutationResult<T>> {
  try {
    const { data: result, error } = await getTableQuery(tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    return { data: result as T | null, error: error as AppError | null };
  } catch (error) {
    return { data: null, error: error as AppError };
  }
}

/**
 * حذف بيانات من جدول
 */
export async function deleteFromTable(
  tableName: string,
  id: string
): Promise<{ error: AppError | null }> {
  try {
    const { error } = await getTableQuery(tableName)
      .delete()
      .eq('id', id);

    return { error: error as AppError | null };
  } catch (error) {
    return { error: error as AppError };
  }
}
