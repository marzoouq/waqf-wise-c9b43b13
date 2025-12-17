/**
 * نوع موحد لبنود الفواتير
 * @version 2.9.43
 * 
 * هذا الملف هو المصدر الوحيد لتعريف InvoiceLine
 * يجب استيراده في جميع الملفات التي تستخدم بنود الفواتير
 */

/**
 * بند الفاتورة الموحد
 * يتضمن جميع الحقول المطلوبة للعرض والتصدير وقاعدة البيانات
 */
export interface InvoiceLine {
  /** معرف البند */
  id: string;
  /** معرف الفاتورة */
  invoice_id: string;
  /** رقم البند التسلسلي */
  line_number: number;
  /** وصف البند */
  description: string;
  /** الكمية */
  quantity: number;
  /** سعر الوحدة */
  unit_price: number;
  /** المجموع الفرعي (الكمية × السعر) */
  subtotal: number;
  /** نسبة الضريبة */
  tax_rate: number;
  /** قيمة الضريبة */
  tax_amount: number;
  /** الإجمالي النهائي (المجموع + الضريبة) */
  line_total: number;
  /** معرف الحساب المحاسبي (اختياري) */
  account_id?: string | null;
  /** تاريخ الإنشاء (اختياري) */
  created_at?: string;
}

/**
 * بند الفاتورة لعرض PDF (بدون معرفات)
 */
export type InvoiceLinePDF = Omit<InvoiceLine, 'id' | 'invoice_id' | 'account_id' | 'created_at'>;

/**
 * بند الفاتورة من قاعدة البيانات (بعض الحقول قد تكون null)
 */
export interface InvoiceLineDB {
  id: string;
  invoice_id?: string;
  line_number: number;
  description: string | null;
  quantity: number;
  unit_price: number;
  tax_rate: number | null;
  tax_amount: number | null;
  line_total: number;
  subtotal?: number | null;
  account_id?: string | null;
  created_at?: string;
}

/**
 * تحويل بند قاعدة البيانات إلى البند الموحد
 */
export function normalizeInvoiceLine(dbLine: InvoiceLineDB, invoiceId?: string): InvoiceLine {
  return {
    id: dbLine.id,
    invoice_id: dbLine.invoice_id || invoiceId || '',
    line_number: dbLine.line_number,
    description: dbLine.description || '',
    quantity: dbLine.quantity,
    unit_price: dbLine.unit_price,
    subtotal: dbLine.subtotal ?? (dbLine.quantity * dbLine.unit_price),
    tax_rate: dbLine.tax_rate ?? 15,
    tax_amount: dbLine.tax_amount ?? 0,
    line_total: dbLine.line_total,
    account_id: dbLine.account_id,
    created_at: dbLine.created_at,
  };
}
