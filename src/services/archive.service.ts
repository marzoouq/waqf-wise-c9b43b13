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
  thisMonthAdditions: number;
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
      .maybeSingle();
    
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
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error("فشل في إنشاء المستند");
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
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error("المستند غير موجود");
    return data;
  }

  /**
   * حذف مستند
   */
  static async deleteDocument(id: string, storagePath?: string | null): Promise<void> {
    if (storagePath) {
      await supabase.storage.from('archive-documents').remove([storagePath]);
    }
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
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error("فشل في إنشاء المجلد");
    return data;
  }

  /**
   * تحديث مجلد
   */
  static async updateFolder(id: string, updates: Partial<FolderInsert>): Promise<Folder> {
    const { data, error } = await supabase
      .from('folders')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error("المجلد غير موجود");
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
      supabase.from('documents').select('id, file_size, file_size_bytes, created_at'),
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

    // Count this month additions
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const thisMonthAdditions = documents.filter(d => 
      new Date(d.created_at) >= startOfMonth
    ).length;

    // Calculate total size
    const totalBytes = documents.reduce((s, d) => s + (d.file_size_bytes || 0), 0);
    const formatBytes = (b: number) => b === 0 ? "0 B" : `${(b / Math.pow(1024, Math.floor(Math.log(b) / Math.log(1024)))).toFixed(1)} ${["B","KB","MB","GB"][Math.floor(Math.log(b) / Math.log(1024))]}`;

    return {
      totalDocuments: documents.length,
      totalFolders: folders.length,
      totalSize: formatBytes(totalBytes),
      recentUploads,
      thisMonthAdditions,
    };
  }

  /**
   * رفع مستند جديد
   */
  static async uploadDocument(
    file: File,
    name: string,
    category: string,
    description?: string,
    folder_id?: string
  ): Promise<Document> {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'pdf';

    // ملاحظة: تجنب إدخال اسم المستند داخل مسار التخزين لتفادي أخطاء "Invalid key"
    // (قد تنتج عن محارف خاصة/طويلة/غير مدعومة في بعض البيئات)
    const uniquePart = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(16).slice(2)}`;

    const storagePath = `${category}/${uniquePart}.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from('archive-documents').upload(storagePath, file);
    if (uploadError) throw new Error(`فشل في رفع الملف: ${uploadError.message}`);
    const { data: urlData } = supabase.storage.from('archive-documents').getPublicUrl(storagePath);
    const formatSize = (b: number) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(1)} MB`;

    const { data, error } = await supabase.from('documents').insert({
      name, 
      category, 
      description, 
      file_type: fileExt.toUpperCase(), 
      file_size: formatSize(file.size),
      file_size_bytes: file.size, 
      folder_id, 
      storage_path: storagePath, 
      file_path: urlData.publicUrl,
    }).select().maybeSingle();

    if (error) { 
      await supabase.storage.from('archive-documents').remove([storagePath]); 
      throw error; 
    }
    if (!data) throw new Error("فشل في رفع المستند");
    return data;
  }

  /**
   * حذف مستند مع الملف
   */
  static async deleteDocumentWithFile(id: string, storagePath?: string | null): Promise<void> {
    if (storagePath) {
      await supabase.storage.from('archive-documents').remove([storagePath]);
    }
    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (error) throw error;
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
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("فشل في إضافة الوسم");
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
    // للمسح الشامل، نستخدم وضع ping/healthCheck
    const { error } = await supabase.functions.invoke('ocr-document', {
      body: action === 'scan_all' ? { ping: true } : { action }
    });

    if (error) throw error;
  }

  /**
   * جلب إصدارات المستند
   */
  static async getDocumentVersions(documentId: string) {
    if (!documentId) return [];
    
    const { data, error } = await supabase
      .from('document_versions')
      .select('id, document_id, version_number, file_path, file_size, change_description, created_by, created_at, is_current, metadata')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * إنشاء إصدار جديد
   */
  static async createDocumentVersion(data: {
    documentId: string;
    filePath: string;
    fileSize?: number;
    changeDescription?: string;
  }) {
    // إلغاء الإصدار الحالي
    await supabase
      .from('document_versions')
      .update({ is_current: false })
      .eq('document_id', data.documentId)
      .eq('is_current', true);

    // حساب رقم الإصدار الجديد
    const { data: maxVersion } = await supabase
      .from('document_versions')
      .select('version_number')
      .eq('document_id', data.documentId)
      .order('version_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    const newVersionNumber = (maxVersion?.version_number || 0) + 1;

    // إنشاء الإصدار الجديد
    const { data: result, error } = await supabase
      .from('document_versions')
      .insert({
        document_id: data.documentId,
        version_number: newVersionNumber,
        file_path: data.filePath,
        file_size: data.fileSize,
        change_description: data.changeDescription || `الإصدار ${newVersionNumber}`,
        is_current: true,
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return result;
  }

  /**
   * استعادة إصدار سابق
   */
  static async restoreDocumentVersion(versionId: string) {
    // جلب الإصدار المطلوب
    const { data: version, error: versionError } = await supabase
      .from('document_versions')
      .select('id, document_id, version_number, file_path')
      .eq('id', versionId)
      .maybeSingle();

    if (versionError || !version) throw new Error('الإصدار غير موجود');

    // تعيين هذا الإصدار كالإصدار الحالي
    await supabase
      .from('document_versions')
      .update({ is_current: false })
      .eq('document_id', version.document_id);

    const { error: updateError } = await supabase
      .from('document_versions')
      .update({ is_current: true })
      .eq('id', versionId);

    if (updateError) throw updateError;

    return version;
  }

  /**
   * جلب استخدام المساحة حسب التصنيف
   */
  static async getStorageUsageByCategory(): Promise<{
    name: string;
    value: number;
    rawValue: number;
  }[]> {
    const { data, error } = await supabase
      .from("documents")
      .select("category, file_size");

    if (error) throw error;

    // تجميع حسب التصنيف
    const categoryUsage: Record<string, number> = {};
    const documents = data || [];

    documents.forEach((doc) => {
      const category = doc.category || "أخرى";
      const size = Number(doc.file_size) || 0;
      categoryUsage[category] = (categoryUsage[category] || 0) + size;
    });

    // تحويل لمصفوفة
    return Object.entries(categoryUsage).map(([name, value]) => ({
      name,
      value: Math.round(Number(value) / 1024 / 1024 * 100) / 100, // MB
      rawValue: Number(value),
    })).sort((a, b) => b.value - a.value);
  }

  /**
   * جلب نمو المستندات بمرور الوقت
   */
  static async getDocumentsGrowth(): Promise<{
    month: string;
    count: number;
    cumulative: number;
  }[]> {
    const { data, error } = await supabase
      .from("documents")
      .select("uploaded_at")
      .order("uploaded_at", { ascending: true });

    if (error) throw error;

    // تجميع حسب الشهر
    const monthlyData: Record<string, number> = {};
    const documents = data || [];

    documents.forEach((doc) => {
      const date = new Date(doc.uploaded_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });

    // تحويل لمصفوفة مرتبة
    const sortedMonths = Object.keys(monthlyData).sort();
    let cumulative = 0;
    const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

    return sortedMonths.map((month) => {
      cumulative += monthlyData[month];
      const [year, m] = month.split("-");
      return {
        month: `${monthNames[parseInt(m) - 1]} ${year}`,
        count: monthlyData[month],
        cumulative,
      };
    }).slice(-12); // آخر 12 شهر
  }
}
