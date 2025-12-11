/**
 * Beneficiary Documents Service - خدمة مستندات المستفيدين
 * @version 2.8.82
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import type { Database } from '@/integrations/supabase/types';

export class BeneficiaryDocumentsService {
  /**
   * جلب مستندات المستفيد
   */
  static async getDocuments(beneficiaryId: string): Promise<Database['public']['Tables']['beneficiary_attachments']['Row'][]> {
    try {
      const { data, error } = await supabase
        .from('beneficiary_attachments')
        .select('*')
        .eq('beneficiary_id', beneficiaryId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching beneficiary documents', error);
      throw error;
    }
  }

  /**
   * رفع مستند للمستفيد
   */
  static async uploadDocument(
    beneficiaryId: string, 
    file: File, 
    fileType: string, 
    description?: string
  ): Promise<Database['public']['Tables']['beneficiary_attachments']['Row']> {
    try {
      const filePath = `beneficiaries/${beneficiaryId}/${Date.now()}_${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('beneficiary-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data, error } = await supabase
        .from('beneficiary_attachments')
        .insert([{
          beneficiary_id: beneficiaryId,
          file_name: file.name,
          file_path: filePath,
          file_type: fileType,
          file_size: file.size,
          mime_type: file.type,
          description,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error uploading document', error);
      throw error;
    }
  }

  /**
   * حذف مستند
   */
  static async deleteDocument(documentId: string): Promise<void> {
    try {
      const { data: doc } = await supabase
        .from('beneficiary_attachments')
        .select('file_path')
        .eq('id', documentId)
        .single();

      if (doc?.file_path) {
        await supabase.storage
          .from('beneficiary-documents')
          .remove([doc.file_path]);
      }

      const { error } = await supabase
        .from('beneficiary_attachments')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
    } catch (error) {
      productionLogger.error('Error deleting document', error);
      throw error;
    }
  }

  /**
   * جلب سجل نشاط المستفيد
   */
  static async getActivity(beneficiaryId: string): Promise<Database['public']['Tables']['beneficiary_activity_log']['Row'][]> {
    try {
      const { data, error } = await supabase
        .from('beneficiary_activity_log')
        .select('*')
        .eq('beneficiary_id', beneficiaryId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching beneficiary activity', error);
      throw error;
    }
  }

  /**
   * جلب الحسابات البنكية للمستفيد
   */
  static async getBankAccounts(beneficiaryId: string): Promise<{ iban: string; bank_name: string; account_number: string }[]> {
    try {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('iban, bank_name, bank_account_number')
        .eq('id', beneficiaryId)
        .single();

      if (error) throw error;
      
      if (!data?.iban) return [];
      
      return [{
        iban: data.iban,
        bank_name: data.bank_name || '',
        account_number: data.bank_account_number || '',
      }];
    } catch (error) {
      productionLogger.error('Error fetching bank accounts', error);
      throw error;
    }
  }
}
