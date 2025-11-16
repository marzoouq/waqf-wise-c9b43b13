/**
 * تنظيف الـ filters من القيم الفارغة لتوحيد query keys
 * يزيل القيم null, undefined, string فارغة, والمصفوفات الفارغة
 */
export function cleanFilters<T extends Record<string, any>>(filters: T): Partial<T> | undefined {
  const cleaned: Partial<T> = {};
  
  Object.entries(filters).forEach(([key, value]) => {
    if (
      value !== undefined && 
      value !== null && 
      value !== '' && 
      (Array.isArray(value) ? value.length > 0 : true)
    ) {
      (cleaned as any)[key] = value;
    }
  });

  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}
