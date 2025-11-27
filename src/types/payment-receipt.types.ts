/**
 * أنواع سند القبض/الدفع
 * Payment Receipt types
 */

/**
 * واجهة سند القبض للطباعة
 */
export interface PaymentReceipt {
  payment_number: string;
  payment_date: string;
  amount_paid: number;
  payment_method?: string;
  receipt_number?: string;
  contracts?: {
    contract_number: string;
    tenant_name: string;
    properties: {
      name: string;
    };
  };
}

/**
 * تحويل Payment إلى PaymentReceipt
 */
export function toPaymentReceipt(payment: {
  payment_number: string;
  payment_date: string;
  amount: number;
  payment_method?: string | null;
  receipt_number?: string | null;
  contract_number?: string;
  tenant_name?: string;
  property_name?: string;
}): PaymentReceipt {
  return {
    payment_number: payment.payment_number,
    payment_date: payment.payment_date,
    amount_paid: payment.amount,
    payment_method: payment.payment_method || undefined,
    receipt_number: payment.receipt_number || undefined,
    contracts: payment.contract_number ? {
      contract_number: payment.contract_number,
      tenant_name: payment.tenant_name || '',
      properties: {
        name: payment.property_name || '',
      },
    } : undefined,
  };
}
