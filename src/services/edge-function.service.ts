/**
 * Edge Function Service - خدمة الدوال السحابية
 * @version 2.8.59
 * 
 * استدعاء Edge Functions المختلفة
 */

import { supabase } from "@/integrations/supabase/client";

export interface EdgeFunctionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PropertyAIContext {
  propertyId?: string;
  tenantId?: string;
  contractId?: string;
}

export interface PDFReportData {
  title: string;
  content: Record<string, unknown>;
  filters?: Record<string, unknown>;
}

export interface ChatbotContext {
  conversationId?: string;
  previousMessages?: string[];
}

export interface BeneficiaryAccountResult {
  beneficiary_id: string;
  national_id: string;
  status: string;
  user_id: string;
  success: boolean;
  message?: string;
}

export interface BeneficiaryAccountError {
  beneficiary_id: string;
  national_id: string;
  error: string;
}

export interface FiscalYearClosingResult {
  success: boolean;
  closing_date?: string;
  total_revenue?: number;
  total_expenses?: number;
  net_income?: number;
  waqf_corpus?: number;
  error?: string;
}

export interface DistributionSimulationResult {
  success: boolean;
  summary: {
    total_revenues: number;
    deductions: {
      nazer_share: number;
      reserve: number;
      waqf_corpus: number;
      maintenance: number;
      development: number;
      total: number;
    };
    distributable_amount: number;
    beneficiaries_count: number;
    total_distributed: number;
  };
  details: Array<{
    beneficiary_id: string;
    beneficiary_name: string;
    beneficiary_number: string;
    priority_level: number;
    category: string;
    allocated_amount: number;
    iban: string | null;
    bank_name: string | null;
  }>;
  metadata?: {
    simulation_date: string;
    priority_levels: number[];
    loan_deductions_count: number;
  };
  error?: string;
}

export interface PublishFiscalYearResult {
  success: boolean;
  message?: string;
  error?: string;
}

export class EdgeFunctionService {
  /**
   * استدعاء OCR للمستندات
   */
  static async invokeOCR(
    file: File
  ): Promise<EdgeFunctionResult<{ text: string; confidence: number }>> {
    const formData = new FormData();
    formData.append('file', file);

    const { data, error } = await supabase.functions.invoke('ocr-document', {
      body: formData,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  }

  /**
   * استدعاء مساعد العقارات الذكي
   */
  static async invokePropertyAI(params: {
    query: string;
    context?: PropertyAIContext;
  }): Promise<EdgeFunctionResult<{ response: string; suggestions?: string[] }>> {
    const { data, error } = await supabase.functions.invoke('property-ai-assistant', {
      body: params,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  }

  /**
   * إغلاق السنة المالية تلقائياً
   */
  static async invokeAutoCloseFiscalYear(params: {
    fiscalYearId: string;
    preview?: boolean;
  }): Promise<EdgeFunctionResult<FiscalYearClosingResult>> {
    const { data, error } = await supabase.functions.invoke('auto-close-fiscal-year', {
      body: params,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  }

  /**
   * محاكاة التوزيع
   */
  static async invokeSimulateDistribution(params: {
    totalAmount: number;
  }): Promise<EdgeFunctionResult<DistributionSimulationResult>> {
    const { data, error } = await supabase.functions.invoke('simulate-distribution', {
      body: params,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  }

  /**
   * نشر السنة المالية
   */
  static async invokePublishFiscalYear(params: {
    fiscalYearId: string;
    notifyHeirs: boolean;
  }): Promise<EdgeFunctionResult<PublishFiscalYearResult>> {
    const { data, error } = await supabase.functions.invoke('publish-fiscal-year', {
      body: params,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  }

  /**
   * استدعاء AI للاستعلامات
   */
  static async invokeAI(params: {
    prompt: string;
    model?: string;
    context?: Record<string, unknown>;
  }): Promise<EdgeFunctionResult<{ response: string; tokens_used?: number }>> {
    const { data, error } = await supabase.functions.invoke('ai-query', {
      body: params,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  }

  /**
   * إرسال إشعارات
   */
  static async invokeSendNotification(params: {
    userId: string;
    title: string;
    message: string;
    type?: 'email' | 'sms' | 'push';
  }): Promise<EdgeFunctionResult<{ sent: boolean; messageId?: string }>> {
    const { data, error } = await supabase.functions.invoke('send-notification', {
      body: params,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  }

  /**
   * توليد تقرير PDF
   */
  static async invokeGeneratePDF(params: {
    reportType: string;
    data: PDFReportData;
    options?: {
      orientation?: 'portrait' | 'landscape';
      includeCharts?: boolean;
    };
  }): Promise<EdgeFunctionResult<{ url: string }>> {
    const { data, error } = await supabase.functions.invoke('generate-pdf-report', {
      body: params,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  }

  /**
   * تصنيف المستندات بالذكاء الاصطناعي
   */
  static async invokeDocumentClassifier(params: {
    fileUrl: string;
    fileName: string;
  }): Promise<EdgeFunctionResult<{ category: string; confidence: number; tags: string[] }>> {
    const { data, error } = await supabase.functions.invoke('classify-document', {
      body: params,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  }

  /**
   * المحادثة مع الروبوت
   */
  static async invokeChatbot(params: {
    message: string;
    userId?: string;
    context?: ChatbotContext;
  }): Promise<EdgeFunctionResult<{ response: string; quickReplies?: string[] }>> {
    const { data, error } = await supabase.functions.invoke('chatbot', {
      body: params,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  }

  /**
   * استدعاء دالة عامة
   */
  static async invoke<T = unknown>(
    functionName: string,
    params: Record<string, unknown>
  ): Promise<EdgeFunctionResult<T>> {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: params,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  }

  /**
   * إنشاء حسابات المستفيدين
   */
  static async invokeCreateBeneficiaryAccounts(params: {
    beneficiary_ids: string[];
  }): Promise<EdgeFunctionResult<{
    total: number;
    created: number;
    failed: number;
    results: BeneficiaryAccountResult[];
    errors: BeneficiaryAccountError[];
  }>> {
    const { data, error } = await supabase.functions.invoke('create-beneficiary-accounts', {
      body: params,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  }
}
