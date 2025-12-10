/**
 * Invoice OCR Hook
 * @version 2.8.68
 */
import { useState } from 'react';
import { toast } from 'sonner';
import { StorageService, EdgeFunctionService } from '@/services';

export interface ExtractedInvoiceData {
  invoice_number?: string;
  invoice_date?: string;
  vendor_name?: string;
  vendor_vat_number?: string;
  vendor_address?: string;
  customer_name?: string;
  customer_vat_number?: string;
  customer_address?: string;
  items: {
    description: string;
    quantity: number;
    unit_price: number;
    tax_rate: number;
    total: number;
  }[];
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  confidence_scores: {
    [key: string]: number;
  };
  overall_confidence: number;
}

export interface OCRResult {
  success: boolean;
  data?: ExtractedInvoiceData;
  imageUrl?: string;
  error?: string;
}

export const useInvoiceOCR = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedInvoiceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const uploadImageToStorage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `invoice-images/${fileName}`;

    await StorageService.uploadFile('documents', filePath, file);
    return StorageService.getPublicUrl('documents', filePath);
  };

  const extractInvoiceData = async (file: File): Promise<OCRResult> => {
    setIsProcessing(true);
    setError(null);

    try {
      // 1. رفع الصورة إلى Storage
      toast.info('جاري رفع الصورة...');
      const uploadedImageUrl = await uploadImageToStorage(file);
      setImageUrl(uploadedImageUrl);

      // 2. تحويل الصورة إلى Base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = reader.result as string;
          const base64Data = base64.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      // 3. استدعاء Edge Function للاستخراج
      toast.info('جاري تحليل الفاتورة بالذكاء الاصطناعي...');
      
      const result = await EdgeFunctionService.invoke<{ success: boolean; data: ExtractedInvoiceData; error?: string }>(
        'extract-invoice-data',
        { image_base64: base64Data }
      );

      if (!result.success || !result.data) {
        throw new Error(result.error || 'فشل استخراج البيانات');
      }

      const extractedDataFromAPI = result.data.data;
      setExtractedData(extractedDataFromAPI);
      toast.success(`تم استخراج البيانات بنجاح! (نسبة الثقة: ${extractedDataFromAPI.overall_confidence}%)`);

      return {
        success: true,
        data: extractedDataFromAPI,
        imageUrl: uploadedImageUrl,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء معالجة الصورة';
      setError(errorMessage);
      toast.error(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setExtractedData(null);
    setError(null);
    setImageUrl(null);
    setIsProcessing(false);
  };

  return {
    extractInvoiceData,
    isProcessing,
    extractedData,
    error,
    imageUrl,
    reset,
  };
};
