/**
 * Utility formatters
 */

export function formatCurrency(amount: number, currency: string = 'ريال'): string {
  return `${amount.toLocaleString('ar-SA')} ${currency}`;
}

export function formatNumber(num: number): string {
  return num.toLocaleString('ar-SA');
}
