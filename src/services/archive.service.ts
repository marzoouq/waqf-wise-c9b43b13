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
      totalSize: '0 MB',
      recentUploads,
    };
  }

  /**
   * جلب إحصائيات الأرشيفي للوحة التحكم
   */
  static async getArchivistStats(): Promise<{
    totalFolders: number;
    totalDocuments: number;
    todayUploads: number;
    totalSize: string;
  }> {
    const today = new Date().toISOString().split('T')[0];

    const [foldersRes, documentsRes, allDocsRes] = await Promise.all([
      supabase.from('folders').select('*', { count: 'exact', head: true }),
      supabase.from('documents').select('*', { count: 'exact', head: true }),
      supabase.from('documents').select('uploaded_at, file_size')
    ]);

    const todayUploads = allDocsRes.data?.filter((doc) => 
      doc.uploaded_at?.startsWith(today)
    ).length || 0;

    let totalMB = 0;
    allDocsRes.data?.forEach((doc) => {
      if (doc.file_size) {
        const match = doc.file_size.match(/(\d+\.?\d*)/);
        if (match) {
          totalMB += parseFloat(match[1]);
        }
      }
    });

    return {
      totalFolders: foldersRes.count || 0,
      totalDocuments: documentsRes.count || 0,
      todayUploads,
      totalSize: `${totalMB.toFixed(1)} MB`
    };
  }

  /**
   * جلب المستندات الأخيرة مع الفلاتر
   */
  static async getRecentDocuments(category: string, searchTerm: string): Promise<{
    id: string;
    name: string;
    category: string;
    uploaded_at: string;
    file_size: string;
    folders: { name: string } | null;
  }[]> {
    let query = supabase
      .from('documents')
      .select('id, name, category, uploaded_at, file_size, folders(name)')
      .order('uploaded_at', { ascending: false })
      .limit(10);

    if (category !== 'all') {
      query = query.eq('category', category);
    }

    if (searchTerm) {
      query = query.ilike('name', `%${searchTerm}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as {
      id: string;
      name: string;
      category: string;
      uploaded_at: string;
      file_size: string;
      folders: { name: string } | null;
    }[];
  }

  /**
   * جلب وسوم المستند
   */
  static async getDocumentTags(documentId?: string) {
    let query = supabase.from('document_tags').select('id, document_id, tag_name, tag_type, confidence_score, created_at, created_by');
    
    if (documentId) {
      query = query.eq('document_id', documentId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  /**
   * إضافة وسم لمستند
   */
  static async addDocumentTag(tag: { document_id: string; tag_name: string; tag_type: 'manual' | 'auto' | 'ai'; confidence_score?: number }) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('document_tags')
      .insert({
        ...tag,
        created_by: user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * حذف وسم
   */
  static async deleteDocumentTag(tagId: string): Promise<void> {
    const { error } = await supabase
      .from('document_tags')
      .delete()
      .eq('id', tagId);

    if (error) throw error;
  }

  /**
   * البحث الذكي
   */
  static async smartSearch(query: string, searchType: 'text' | 'tags' | 'ocr') {
    if (searchType === 'ocr') {
      const { data, error } = await supabase
        .from('document_ocr_content')
        .select('*, documents(*)')
        .textSearch('extracted_text', query, {
          type: 'websearch',
          config: 'arabic'
        });

      if (error) throw error;
      return data;
    } else if (searchType === 'tags') {
      const { data, error } = await supabase
        .from('document_tags')
        .select('*, documents(*)')
        .ilike('tag_name', `%${query}%`);

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('documents')
        .select('id, name, description, file_type, file_path, file_size, folder_id, created_at, updated_at')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`);

      if (error) throw error;
      return data;
    }
  }

  /**
   * تحميل ملف من التخزين
   */
  static async downloadFile(bucketName: string, fileName: string): Promise<Blob> {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(fileName);

    if (error) throw error;
    return data;
  }

  /**
   * استدعاء دالة OCR
   */
  static async invokeOCR(action: string): Promise<void> {
    const { error } = await supabase.functions.invoke('ocr-document', {
      body: { action }
    });

    if (error) throw error;
  }
}
