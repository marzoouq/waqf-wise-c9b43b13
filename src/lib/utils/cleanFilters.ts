/**
 * تنظيف الـ filters من القيم الفارغة لتوحيد query keys
 * يزيل القيم null, undefined, string فارغة, والمصفوفات الفارغة
 */
export function cleanFilters<T extends Record<string, unknown>>(filters: T): Record<string, unknown> | undefined {
  const cleaned: Record<string, unknown> = {};
  
  Object.entries(filters).forEach(([key, value]) => {
    if (
      value !== undefined && 
      value !== null && 
      value !== '' && 
      (Array.isArray(value) ? value.length > 0 : true)
    ) {
      cleaned[key] = value;
    }
  });

  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}
