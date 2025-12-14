/**
 * useCreateInvoice Hook
 * إنشاء فاتورة جديدة
 * @version 2.8.65
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "@/lib/date";
import { generateZATCAQRData, formatZATCACurrency } from "@/lib/zatca";
import { validateZATCAInvoice, formatValidationErrors } from "@/lib/validateZATCAInvoice";
import { InvoiceService } from "@/services";
import { QUERY_KEYS } from "@/lib/query-keys";

interface InvoiceLine {
  id: string;
  account_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  subtotal: number;
  tax_amount: number;
  line_total: number;
}

interface InvoiceFormData {
  invoice_date: string;
  invoice_time?: string;
  due_date?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_city?: string;
  customer_vat_number?: string;
  customer_commercial_registration?: string;
  notes?: string;
}

interface CreateInvoiceParams {
  formData: InvoiceFormData;
  lines: InvoiceLine[];
  nextInvoiceNumber: string;
  orgSettings: {
    organization_name_ar: string;
    vat_registration_number: string;
  } | null;
  ocrImageUrl: string | null;
}

export function useCreateInvoice(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({ formData, lines, nextInvoiceNumber, orgSettings, ocrImageUrl }: CreateInvoiceParams) => {
      if (lines.length === 0) {
        throw new Error("يجب إضافة بند واحد على الأقل");
      }

      const subtotal = lines.reduce((sum, line) => sum + line.subtotal, 0);
      const taxAmount = lines.reduce((sum, line) => sum + line.tax_amount, 0);
      const totalAmount = subtotal + taxAmount;

      // التحقق من صحة البيانات
      const validationResult = validateZATCAInvoice({
        invoice_number: nextInvoiceNumber,
        invoice_date: formData.invoice_date,
        seller_vat_number: orgSettings?.vat_registration_number || "",
        customer_name: formData.customer_name,
        lines: lines.map(line => ({
          description: line.description,
          quantity: line.quantity,
          unit_price: line.unit_price,
          tax_rate: line.tax_rate,
        })),
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
      });

      if (!validationResult.isValid) {
        throw new Error(formatValidationErrors(validationResult));
      }

      // توليد QR Code
      let qrCodeData = null;
      if (orgSettings) {
        const invoiceDate = new Date(formData.invoice_date);
        if (formData.invoice_time) {
          const [hours, minutes] = formData.invoice_time.split(':');
          invoiceDate.setHours(parseInt(hours), parseInt(minutes));
        }
        
        qrCodeData = generateZATCAQRData({
          sellerName: orgSettings.organization_name_ar,
          sellerVatNumber: orgSettings.vat_registration_number,
          invoiceDate: invoiceDate.toISOString(),
          invoiceTotal: formatZATCACurrency(totalAmount),
          vatTotal: formatZATCACurrency(taxAmount),
        });
      }

      const invoice = await InvoiceService.create(
        {
          invoice_number: nextInvoiceNumber,
          invoice_date: formData.invoice_date,
          invoice_time: formData.invoice_time || format(new Date(), "HH:mm"),
          due_date: formData.due_date || null,
          customer_name: formData.customer_name,
          customer_email: formData.customer_email || null,
          customer_phone: formData.customer_phone || null,
          customer_address: formData.customer_address || null,
          customer_city: formData.customer_city || null,
          customer_vat_number: formData.customer_vat_number || null,
          customer_commercial_registration: formData.customer_commercial_registration || null,
          subtotal,
          tax_amount: taxAmount,
          tax_rate: 15,
          total_amount: totalAmount,
          notes: formData.notes || null,
          qr_code_data: qrCodeData,
          status: "draft",
          source_image_url: ocrImageUrl,
          ocr_extracted: !!ocrImageUrl,
          ocr_confidence_score: ocrImageUrl ? 85 : null,
          ocr_processed_at: ocrImageUrl ? new Date().toISOString() : null,
        }
      );

      // إضافة أسطر الفاتورة بعد إنشائها
      const invoiceLines = lines.map((line, index) => ({
        invoice_id: invoice.id,
        line_number: index + 1,
        account_id: line.account_id,
        description: line.description,
        quantity: line.quantity,
        unit_price: line.unit_price,
        subtotal: line.subtotal,
        tax_rate: line.tax_rate,
        tax_amount: line.tax_amount,
        line_total: line.line_total,
      }));

      if (invoiceLines.length > 0) {
        await InvoiceService.update(invoice.id, {}, invoiceLines);
      }

      return invoice;
    },
    onSuccess: () => {
      toast.success("تم إنشاء الفاتورة بنجاح");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INVOICES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NEXT_INVOICE_NUMBER });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(`خطأ في إنشاء الفاتورة: ${error.message}`);
    },
  });

  return {
    createInvoice: createMutation.mutate,
    isCreating: createMutation.isPending,
    error: createMutation.error,
  };
}
