import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { logger } from '@/lib/logger';

interface EncryptFileOptions {
  file: File;
  category?: string;
  expiresInDays?: number;
}

interface DecryptFileOptions {
  fileId: string;
  accessReason?: string;
}

interface DeleteFileOptions {
  fileId: string;
  fileCategory?: string;
  deletionReason?: string;
  permanentDelete?: boolean;
  restoreDays?: number;
}

export function useEncryption() {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  /**
   * تشفير ملف قبل رفعه
   */
  const encryptFile = async ({
    file,
    category = 'general',
    expiresInDays = 0
  }: EncryptFileOptions) => {
    setIsEncrypting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      formData.append('expiresInDays', expiresInDays.toString());

      const { data, error } = await supabase.functions.invoke('encrypt-file', {
        body: formData
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'فشل تشفير الملف');
      }

      toast({
        title: "تم التشفير بنجاح",
        description: `تم تشفير الملف: ${file.name}`,
      });

      logger.info('File encrypted successfully', { 
        context: 'encryptFile',
        metadata: { fileId: data.file.id, fileName: file.name, category }
      });

      return data.file;
    } catch (error) {
      logger.error(error, { context: 'encryptFile', severity: 'high' });
      const message = error instanceof Error ? error.message : 'فشل تشفير الملف';
      
      toast({
        title: "خطأ في التشفير",
        description: message,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsEncrypting(false);
    }
  };

  /**
   * فك تشفير ملف وتنزيله
   */
  const decryptFile = async ({
    fileId,
    accessReason = 'طلب فك تشفير'
  }: DecryptFileOptions) => {
    setIsDecrypting(true);
    try {
      const { data, error } = await supabase.functions.invoke('decrypt-file', {
        body: { fileId, accessReason }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'فشل فك تشفير الملف');
      }

      // تحويل Base64 إلى Blob للتنزيل
      const binaryString = atob(data.file.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: data.file.mime_type });

      // إنشاء رابط تنزيل
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.file.original_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "تم فك التشفير بنجاح",
        description: `تم تنزيل الملف: ${data.file.original_name}`,
      });

      logger.info('File decrypted successfully', { 
        context: 'decryptFile',
        metadata: { fileId, fileName: data.file.original_name }
      });

      return data.file;
    } catch (error) {
      logger.error(error, { context: 'decryptFile', severity: 'high' });
      const message = error instanceof Error ? error.message : 'فشل فك تشفير الملف';
      
      toast({
        title: "خطأ في فك التشفير",
        description: message,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsDecrypting(false);
    }
  };

  /**
   * حذف ملف بشكل آمن
   */
  const deleteFileSafely = async ({
    fileId,
    fileCategory = 'general',
    deletionReason,
    permanentDelete = false,
    restoreDays = 30
  }: DeleteFileOptions) => {
    setIsDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('secure-delete-file', {
        body: {
          fileId,
          fileCategory,
          deletionReason,
          permanentDelete,
          restoreDays
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'فشل حذف الملف');
      }

      if (data.requiresApproval) {
        toast({
          title: "تم إنشاء طلب الحذف",
          description: "في انتظار موافقة المدير",
        });
      } else if (data.permanentDelete) {
        toast({
          title: "تم الحذف النهائي",
          description: "تم حذف الملف بشكل نهائي",
          variant: "destructive",
        });
      } else {
        toast({
          title: "تم الحذف المؤقت",
          description: data.message,
        });
      }

      logger.info('File deleted successfully', { 
        context: 'deleteFileSafely',
        metadata: { fileId, permanentDelete, requiresApproval: data.requiresApproval }
      });

      return data;
    } catch (error) {
      logger.error(error, { context: 'deleteFileSafely', severity: 'high' });
      const message = error instanceof Error ? error.message : 'فشل حذف الملف';
      
      toast({
        title: "خطأ في الحذف",
        description: message,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * الحصول على قائمة الملفات المشفرة
   */
  const getEncryptedFiles = async (category?: string) => {
    try {
      let query = supabase
        .from('encrypted_files')
        .select('*, encryption_keys(key_name, key_type)')
        .eq('is_deleted', false)
        .order('uploaded_at', { ascending: false });

      if (category) {
        query = query.eq('metadata->>category', category);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error(error, { context: 'getEncryptedFiles', severity: 'medium' });
      throw error;
    }
  };

  /**
   * الحصول على قائمة الملفات المحذوفة
   */
  const getDeletedFiles = async (canRestore = true) => {
    try {
      let query = supabase
        .from('deleted_files_audit')
        .select('id, original_file_id, file_name, file_path, file_size, file_category, deleted_by, deleted_at, deletion_reason, can_restore, restore_until, permanent_deletion_at, metadata')
        .order('deleted_at', { ascending: false });

      if (canRestore) {
        query = query.eq('can_restore', true);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error(error, { context: 'getDeletedFiles', severity: 'medium' });
      throw error;
    }
  };

  /**
   * الحصول على سجل الوصول للبيانات الحساسة
   */
  const getAccessLogs = async (fileId?: string) => {
    try {
      let query = supabase
        .from('sensitive_data_access_log')
        .select('id, user_id, user_email, table_name, record_id, column_name, access_type, ip_address, user_agent, access_reason, was_granted, denial_reason, accessed_at, session_id, metadata')
        .order('accessed_at', { ascending: false })
        .limit(100);

      if (fileId) {
        query = query.eq('record_id', fileId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error(error, { context: 'getAccessLogs', severity: 'medium' });
      throw error;
    }
  };

  return {
    encryptFile,
    decryptFile,
    deleteFileSafely,
    getEncryptedFiles,
    getDeletedFiles,
    getAccessLogs,
    isEncrypting,
    isDecrypting,
    isDeleting
  };
}
