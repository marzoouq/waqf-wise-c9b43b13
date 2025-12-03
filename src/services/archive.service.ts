/**
 * Archive Service - خدمة الأرشيف
 * 
 * إدارة المستندات والمجلدات في الأرشيف الإلكتروني
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Document = Database['public']['Tables']['documents']['Row'];
type DocumentInsert = Database['public']['Tables']['documents']['Insert'];
type Folder = Database['public']['Tables']['folders']['Row'];
type FolderInsert = Database['public']['Tables']['folders']['Insert'];

export interface ArchiveStats {
  totalDocuments: number;
  totalFolders: number;
  totalSize: string;
  recentUploads: number;
}

export class ArchiveService {
  /**
   * جلب جميع المستندات
   */
  static async getDocuments(folderId?: string): Promise<Document[]> {
    let query = supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (folderId) {
      query = query.eq('folder_id', folderId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  /**
   * جلب مستند واحد
   */
  static async getDocumentById(id: string): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  /**
   * إنشاء مستند جديد
   */
  static async createDocument(document: DocumentInsert): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .insert(document)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  /**
   * تحديث مستند
   */
  static async updateDocument(id: string, updates: Partial<DocumentInsert>): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  /**
   * حذف مستند
   */
  static async deleteDocument(id: string): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  /**
   * جلب جميع المجلدات
   */
  static async getFolders(): Promise<Folder[]> {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  /**
   * إنشاء مجلد جديد
   */
  static async createFolder(folder: FolderInsert): Promise<Folder> {
    const { data, error } = await supabase
      .from('folders')
      .insert(folder)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  /**
   * البحث في المستندات
   */
  static async searchDocuments(query: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  /**
   * جلب إحصائيات الأرشيف
   */
  static async getStats(): Promise<ArchiveStats> {
    const [documentsRes, foldersRes] = await Promise.all([
      supabase.from('documents').select('id, file_size, created_at'),
      supabase.from('folders').select('id'),
    ]);

    const documents = documentsRes.data || [];
    const folders = foldersRes.data || [];
    
    // Count recent uploads (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentUploads = documents.filter(d => 
      new Date(d.created_at) > weekAgo
    ).length;

    return {
      totalDocuments: documents.length,
      totalFolders: folders.length,
      totalSize: '0 MB', // Would need to calculate from file_size
      recentUploads,
    };
  }
}
