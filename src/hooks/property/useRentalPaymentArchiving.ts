/**
 * Rental Payment Archiving Hook - أرشفة مستندات دفعات الإيجار
 * @version 2.8.51
 */

import { logger } from "@/lib/logger";
import { generateInvoicePDF } from "@/lib/generateInvoicePDF";
import { generateReceiptPDF } from "@/lib/generateReceiptPDF";
import { archiveDocument } from "@/lib/archiveDocument";
import { 
  RentalPaymentService, 
  type InvoiceWithLines, 
  type PaymentRecord, 
  type OrganizationSettingsRecord 
} from "@/services/rental-payment.service";

interface ArchiveParams {
  invoiceId: string;
  receiptId: string;
  tenantName?: string;
}

export const useRentalPaymentArchiving = () => {
  /**
   * أرشفة الفاتورة وسند القبض
   */
  const archiveInvoiceAndReceipt = async (params: ArchiveParams): Promise<void> => {
    try {
      const [invoiceData, receiptData, orgSettings] = await Promise.all([
        RentalPaymentService.getInvoiceWithLines(params.invoiceId),
        RentalPaymentService.getReceipt(params.receiptId),
        RentalPaymentService.getOrganizationSettings()
      ]);

      if (!invoiceData || !receiptData || !orgSettings) {
        logger.warn('Missing data for archiving', { 
          context: 'archive_rental_documents',
          metadata: { invoiceData: !!invoiceData, receiptData: !!receiptData, orgSettings: !!orgSettings }
        });
        return;
      }

      // توليد وأرشفة PDF الفاتورة
      await archiveInvoicePDF(invoiceData, orgSettings, params.tenantName);
      
      // توليد وأرشفة PDF سند القبض
      await archiveReceiptPDF(receiptData, orgSettings, params.tenantName);

      logger.info('تم أرشفة الفاتورة وسند القبض بنجاح', {
        context: 'archive_rental_documents',
        metadata: { invoice_id: params.invoiceId, receipt_id: params.receiptId }
      });
    } catch (error) {
      logger.error(error, { context: 'archive_rental_documents', severity: 'medium' });
    }
  };

  return { archiveInvoiceAndReceipt };
};

/**
 * أرشفة فاتورة PDF
 */
async function archiveInvoicePDF(
  invoiceData: InvoiceWithLines, 
  orgSettings: OrganizationSettingsRecord,
  tenantName?: string
): Promise<void> {
  const jsPDF = (await import('jspdf')).default;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  
  await generateInvoicePDF(invoiceData, invoiceData.invoice_lines || [], orgSettings);
  const invoiceBlob = doc.output('blob');

  await archiveDocument({
    fileBlob: invoiceBlob,
    fileName: `Invoice-${invoiceData.invoice_number}.pdf`,
    fileType: 'invoice',
    referenceId: invoiceData.id,
    referenceType: 'invoice',
    description: `فاتورة ${invoiceData.invoice_number} - ${tenantName || 'غير محدد'}`
  });
}

/**
 * أرشفة سند قبض PDF
 */
async function archiveReceiptPDF(
  receiptData: PaymentRecord,
  orgSettings: OrganizationSettingsRecord,
  tenantName?: string
): Promise<void> {
  const jsPDF = (await import('jspdf')).default;
  const receiptDoc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  
  await generateReceiptPDF(receiptData, orgSettings);
  const receiptBlob = receiptDoc.output('blob');

  await archiveDocument({
    fileBlob: receiptBlob,
    fileName: `Receipt-${receiptData.payment_number || receiptData.id}.pdf`,
    fileType: 'receipt',
    referenceId: receiptData.id,
    referenceType: 'payment',
    description: `سند قبض ${receiptData.payment_number || receiptData.id} - ${tenantName || 'غير محدد'}`
  });
}
