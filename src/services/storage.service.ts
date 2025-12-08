/**
 * Storage Service - خدمة التخزين
 * @version 2.7.0
 * 
 * إدارة رفع وتحميل الملفات
 */

import { supabase } from "@/integrations/supabase/client";

export interface UploadResult {
  success: boolean;
  path?: string;
  url?: string;
  error?: string;
}

export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: Date;
  path: string;
}

export class StorageService {
  /**
   * رفع ملف
   */
  static async uploadFile(
    bucket: string,
    path: string,
    file: File
  ): Promise<UploadResult> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    const url = this.getPublicUrl(bucket, data.path);
    return { success: true, path: data.path, url };
  }

  /**
   * رفع ملف مع استبدال
   */
  static async uploadFileWithReplace(
    bucket: string,
    path: string,
    file: File
  ): Promise<UploadResult> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    const url = this.getPublicUrl(bucket, data.path);
    return { success: true, path: data.path, url };
  }

  /**
   * تحميل ملف
   */
  static async downloadFile(bucket: string, path: string): Promise<Blob | null> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);

    if (error) throw error;
    return data;
  }

  /**
   * جلب رابط عام
   */
  static getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  /**
   * جلب رابط موقع مؤقت
   */
  static async getSignedUrl(
    bucket: string,
    path: string,
    expiresIn: number = 3600
  ): Promise<string | null> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  }

  /**
   * حذف ملف
   */
  static async deleteFile(bucket: string, path: string): Promise<boolean> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
    return true;
  }

  /**
   * حذف ملفات متعددة
   */
  static async deleteFiles(bucket: string, paths: string[]): Promise<boolean> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove(paths);

    if (error) throw error;
    return true;
  }

  /**
   * قائمة الملفات
   */
  static async listFiles(bucket: string, prefix?: string): Promise<FileInfo[]> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(prefix || '', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) throw error;

    return (data || []).map(file => ({
      name: file.name,
      size: file.metadata?.size || 0,
      type: file.metadata?.mimetype || '',
      lastModified: new Date(file.created_at),
      path: prefix ? `${prefix}/${file.name}` : file.name,
    }));
  }

  /**
   * نقل ملف
   */
  static async moveFile(
    bucket: string,
    fromPath: string,
    toPath: string
  ): Promise<boolean> {
    const { error } = await supabase.storage
      .from(bucket)
      .move(fromPath, toPath);

    if (error) throw error;
    return true;
  }

  /**
   * نسخ ملف
   */
  static async copyFile(
    bucket: string,
    fromPath: string,
    toPath: string
  ): Promise<boolean> {
    const { error } = await supabase.storage
      .from(bucket)
      .copy(fromPath, toPath);

    if (error) throw error;
    return true;
  }

  /**
   * جلب حجم الملفات في مجلد
   */
  static async getFolderSize(bucket: string, prefix: string): Promise<number> {
    const files = await this.listFiles(bucket, prefix);
    return files.reduce((total, file) => total + file.size, 0);
  }

  /**
   * التحقق من وجود ملف
   */
  static async fileExists(bucket: string, path: string): Promise<boolean> {
    try {
      const { data } = await supabase.storage
        .from(bucket)
        .list(path.split('/').slice(0, -1).join('/'), {
          search: path.split('/').pop(),
        });
      
      return (data || []).length > 0;
    } catch {
      return false;
    }
  }
}
