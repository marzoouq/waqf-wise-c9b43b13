/**
 * Edge Function Service - خدمة الدوال السحابية
 * @version 2.7.0
 * 
 * استدعاء Edge Functions المختلفة
 */

import { supabase } from "@/integrations/supabase/client";

export interface EdgeFunctionResult<T = any> {
  success: boolean;
  data?: T;
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
    context?: any;
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
  }): Promise<EdgeFunctionResult<any>> {
    const { data, error } = await supabase.functions.invoke('auto-close-fiscal-year', {
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
    notifyHeirs?: boolean;
  }): Promise<EdgeFunctionResult<any>> {
    const { data, error } = await supabase.functions.invoke('publish-fiscal-year', {
      body: params,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  }

  /**
   * إرسال بريد إلكتروني
   */
  static async invokeSendEmail(params: {
    to: string;
    subject: string;
    body: string;
    template?: string;
    templateData?: Record<string, any>;
  }): Promise<EdgeFunctionResult<{ messageId: string }>> {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: params,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  }

  /**
   * إرسال SMS
   */
  static async invokeSendSMS(params: {
    to: string;
    message: string;
  }): Promise<EdgeFunctionResult<{ messageId: string }>> {
    const { data, error } = await supabase.functions.invoke('send-sms', {
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
    fiscalYearId?: string;
    distributionMethod?: 'islamic' | 'equal';
  }): Promise<EdgeFunctionResult<any>> {
    const { data, error } = await supabase.functions.invoke('simulate-distribution', {
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
    data: any;
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
    context?: any;
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
  static async invoke<T = any>(
    functionName: string,
    params: any
  ): Promise<EdgeFunctionResult<T>> {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: params,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  }
}
