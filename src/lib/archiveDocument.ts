import { supabase } from "@/integrations/supabase/client";
import { logger } from "./logger";
import type jsPDF from "jspdf";

/**
 * أرشفة مستند في Supabase Storage وتسجيله في جدول documents
 */
export async function archiveDocument(params: {
  fileBlob: Blob;
  fileName: string;
  fileType: 'invoice' | 'receipt';
  referenceId: string;
  referenceType: 'rental_payment' | 'invoice' | 'payment';
  description?: string;
}): Promise<{ success: boolean; documentId?: string; error?: string }> {
  try {
    const { fileBlob, fileName, fileType, referenceId, referenceType, description } = params;

    // 1. رفع الملف إلى Supabase Storage
    const storagePath = `${fileType}s/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${fileName}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, fileBlob, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      logger.error(uploadError, { 
        context: 'archive_document_upload', 
        severity: 'high',
        metadata: { fileName, fileType }
      });
      return { success: false, error: 'فشل رفع الملف' };
    }

    // 2. حساب حجم الملف بالتنسيق المطلوب
    const fileSizeKB = (fileBlob.size / 1024).toFixed(2);
    const fileSizeMB = (fileBlob.size / (1024 * 1024)).toFixed(2);
    const fileSizeDisplay = fileBlob.size < 1024 * 1024 
      ? `${fileSizeKB} KB` 
      : `${fileSizeMB} MB`;

    // 3. تسجيل المستند في جدول documents
    const { data: documentData, error: documentError } = await supabase
      .from('documents')
      .insert({
        name: fileName,
        category: fileType === 'invoice' ? 'فواتير' : 'سندات قبض',
        file_type: 'pdf',
        file_size: fileSizeDisplay,
        file_size_bytes: fileBlob.size,
        description: description || `${fileType === 'invoice' ? 'فاتورة' : 'سند قبض'} تلقائي - مرجع: ${referenceId}`,
      })
      .select('id')
      .single();

    if (documentError) {
      logger.error(documentError, { 
        context: 'archive_document_db', 
        severity: 'high',
        metadata: { fileName, fileType }
      });
      return { success: false, error: 'فشل حفظ بيانات المستند' };
    }

    logger.info('تم أرشفة المستند بنجاح', {
      context: 'archive_document_success',
      metadata: {
        documentId: documentData.id,
        fileName,
        fileType
      }
    });

    return { success: true, documentId: documentData.id };
  } catch (error) {
    logger.error(error, { 
      context: 'archive_document_general', 
      severity: 'high' 
    });
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'خطأ غير معروف' 
    };
  }
}

/**
 * تحويل PDF إلى Blob للأرشفة
 */
export function pdfToBlob(pdfDoc: jsPDF): Blob {
  const pdfOutput = pdfDoc.output('blob');
  return pdfOutput;
}