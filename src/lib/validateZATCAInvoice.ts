import { validateVATNumber } from "./zatca";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface InvoiceValidationData {
  invoice_number: string;
  invoice_date: string;
  seller_vat_number: string;
  customer_name: string;
  lines: {
    description: string;
    quantity: number;
    unit_price: number;
    tax_rate: number;
  }[];
  subtotal: number;
  tax_amount: number;
  total_amount: number;
}

export const validateZATCAInvoice = (data: InvoiceValidationData): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // التحقق من رقم الفاتورة
  if (!data.invoice_number || data.invoice_number.trim() === "") {
    errors.push("رقم الفاتورة مطلوب");
  }

  // التحقق من التاريخ
  if (!data.invoice_date) {
    errors.push("تاريخ الفاتورة مطلوب");
  }

  // التحقق من الرقم الضريبي للبائع
  if (!data.seller_vat_number) {
    errors.push("الرقم الضريبي للبائع مطلوب");
  } else if (!validateVATNumber(data.seller_vat_number)) {
    errors.push("الرقم الضريبي للبائع غير صحيح (يجب أن يكون 15 رقم ويبدأ بـ 3)");
  }

  // التحقق من اسم العميل
  if (!data.customer_name || data.customer_name.trim() === "") {
    errors.push("اسم العميل مطلوب");
  }

  // التحقق من وجود بنود
  if (!data.lines || data.lines.length === 0) {
    errors.push("يجب إضافة بند واحد على الأقل");
  }

  // التحقق من صحة البنود
  data.lines.forEach((line, index) => {
    if (!line.description || line.description.trim() === "") {
      errors.push(`البند ${index + 1}: الوصف مطلوب`);
    }
    if (line.quantity <= 0) {
      errors.push(`البند ${index + 1}: الكمية يجب أن تكون أكبر من صفر`);
    }
    if (line.unit_price <= 0) {
      errors.push(`البند ${index + 1}: السعر يجب أن يكون أكبر من صفر`);
    }
    if (line.tax_rate < 0 || line.tax_rate > 100) {
      errors.push(`البند ${index + 1}: نسبة الضريبة يجب أن تكون بين 0 و 100`);
    }
  });

  // التحقق من صحة الحسابات
  const calculatedSubtotal = data.lines.reduce(
    (sum, line) => sum + line.quantity * line.unit_price,
    0
  );
  const calculatedTax = data.lines.reduce(
    (sum, line) => sum + (line.quantity * line.unit_price * line.tax_rate) / 100,
    0
  );
  const calculatedTotal = calculatedSubtotal + calculatedTax;

  // السماح بفارق صغير بسبب التقريب (0.01 ريال)
  const tolerance = 0.01;

  if (Math.abs(data.subtotal - calculatedSubtotal) > tolerance) {
    errors.push(
      `المجموع الفرعي غير صحيح. المتوقع: ${calculatedSubtotal.toFixed(
        2
      )}, الفعلي: ${data.subtotal.toFixed(2)}`
    );
  }

  if (Math.abs(data.tax_amount - calculatedTax) > tolerance) {
    errors.push(
      `مبلغ الضريبة غير صحيح. المتوقع: ${calculatedTax.toFixed(
        2
      )}, الفعلي: ${data.tax_amount.toFixed(2)}`
    );
  }

  if (Math.abs(data.total_amount - calculatedTotal) > tolerance) {
    errors.push(
      `المجموع الكلي غير صحيح. المتوقع: ${calculatedTotal.toFixed(
        2
      )}, الفعلي: ${data.total_amount.toFixed(2)}`
    );
  }

  // تحذيرات
  if (data.total_amount > 100000) {
    warnings.push("الفاتورة تحتوي على مبلغ كبير (أكثر من 100,000 ريال)");
  }

  data.lines.forEach((line, index) => {
    if (line.tax_rate !== 15) {
      warnings.push(
        `البند ${index + 1}: نسبة الضريبة ${line.tax_rate}% (المعدل القياسي 15%)`
      );
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

export const formatValidationErrors = (result: ValidationResult): string => {
  if (result.isValid) {
    return "الفاتورة صحيحة ومتوافقة مع متطلبات ZATCA ✅";
  }

  let message = "أخطاء التحقق:\n";
  result.errors.forEach((error, index) => {
    message += `${index + 1}. ${error}\n`;
  });

  if (result.warnings.length > 0) {
    message += "\nتحذيرات:\n";
    result.warnings.forEach((warning, index) => {
      message += `${index + 1}. ${warning}\n`;
    });
  }

  return message;
};

/**
 * التحقق السريع من البيانات المستخرجة بـ OCR
 * يستخدم للتحقق من جودة البيانات قبل حفظها
 */
export const validateOCRExtractedData = (data: Partial<InvoiceValidationData>): {
  isComplete: boolean;
  missingFields: string[];
  suggestions: string[];
} => {
  const missingFields: string[] = [];
  const suggestions: string[] = [];

  // التحقق من الحقول الأساسية
  if (!data.invoice_number?.trim()) missingFields.push("رقم الفاتورة");
  if (!data.invoice_date) missingFields.push("تاريخ الفاتورة");
  if (!data.customer_name?.trim()) missingFields.push("اسم العميل");
  if (!data.lines || data.lines.length === 0) missingFields.push("بنود الفاتورة");

  // اقتراحات للتحسين
  if (data.seller_vat_number && !validateVATNumber(data.seller_vat_number)) {
    suggestions.push("الرقم الضريبي للبائع قد يكون غير صحيح - يرجى المراجعة");
  }

  if (data.lines && data.lines.length > 0) {
    const hasZeroQuantity = data.lines.some(line => line.quantity === 0);
    if (hasZeroQuantity) {
      suggestions.push("بعض البنود بكمية صفر - يرجى المراجعة");
    }

    const hasZeroPrice = data.lines.some(line => line.unit_price === 0);
    if (hasZeroPrice) {
      suggestions.push("بعض البنود بسعر صفر - يرجى المراجعة");
    }
  }

  if (data.total_amount && data.total_amount < 0) {
    suggestions.push("المبلغ الإجمالي سالب - يرجى المراجعة");
  }

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    suggestions,
  };
};
