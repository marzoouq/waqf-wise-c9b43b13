import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  handleCors, 
  jsonResponse, 
  errorResponse 
} from '../_shared/cors.ts';

/**
 * Unified Backup System - دمج النسخ الاحتياطي الموحد
 * 
 * يدعم 3 أنواع من النسخ:
 * - manual: النسخ اليدوي (جداول أساسية)
 * - full: النسخ الكامل (جميع الجداول الحرجة)
 * - automated: النسخ التلقائي المجدول
 */
serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // استخراج نوع النسخ والجداول المطلوبة
    const { backupType = 'manual', tablesIncluded = [] } = await req.json().catch(() => ({}));
    
    console.log('🔄 بدء النسخ الاحتياطي:', { backupType, tablesIncluded });

    // تحديد قوائم الجداول حسب نوع النسخ
    const tablesByType = {
      manual: [
        'beneficiaries',
        'families',
        'properties',
        'funds',
        'distributions',
        'journal_entries',
        'accounts',
        'payment_vouchers',
        'bank_accounts',
        'beneficiary_requests',
        'beneficiary_attachments',
        'contracts',
        'loans',
        'user_roles'
      ],
      full: [
        'beneficiaries',
        'families',
        'beneficiary_requests',
        'beneficiary_attachments',
        'funds',
        'distributions',
        'properties',
        'contracts',
        'rental_payments',
        'loans',
        'loan_installments',
        'accounts',
        'journal_entries',
        'journal_entry_lines',
        'invoices',
        'payments',
        'documents',
        'folders',
        'waqf_units',
        'audit_logs',
        'notifications'
      ],
      automated: [
        'beneficiaries',
        'families',
        'properties',
        'contracts',
        'funds',
        'distributions',
        'loans',
        'payments',
        'journal_entries',
        'accounts',
        'documents',
        'notifications',
        'audit_logs'
      ]
    };

    const tablesToBackup = tablesIncluded.length > 0 
      ? tablesIncluded 
      : tablesByType[backupType as keyof typeof tablesByType] || tablesByType.manual;

    const backupStart = Date.now();

    // إنشاء سجل النسخ الاحتياطي
    const { data: backupLog, error: backupLogError } = await supabaseClient
      .from('backup_logs')
      .insert({
        backup_type: backupType,
        status: 'running',
        started_at: new Date().toISOString(),
        tables_included: tablesToBackup
      })
      .select()
      .single();

    if (backupLogError) {
      console.error('❌ خطأ في إنشاء سجل النسخ:', backupLogError);
      throw backupLogError;
    }

    console.log('📋 سجل النسخ الاحتياطي:', backupLog.id);

    try {
      // جلب البيانات من جميع الجداول
      const backupData: Record<string, any[]> = {};
      const errors: string[] = [];
      let totalRecords = 0;

      for (const table of tablesToBackup) {
        try {
          const { data, error } = await supabaseClient
            .from(table)
            .select('*');

          if (error) {
            console.error(`❌ خطأ في نسخ جدول ${table}:`, error);
            errors.push(`${table}: ${error.message}`);
            continue;
          }

          if (data) {
            backupData[table] = data;
            totalRecords += data.length;
            console.log(`✅ تم نسخ ${data.length} سجل من ${table}`);
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Unknown error';
          console.error(`❌ فشل نسخ جدول ${table}:`, err);
          errors.push(`${table}: ${errorMsg}`);
        }
      }

      // إنشاء ملف النسخة الاحتياطية
      const backupContent = JSON.stringify({
        version: '2.0',
        backupType: backupType,
        timestamp: new Date().toISOString(),
        tables: tablesToBackup,
        data: backupData,
        metadata: {
          totalTables: tablesToBackup.length,
          successfulTables: tablesToBackup.length - errors.length,
          totalRecords: totalRecords,
          errors: errors.length
        }
      }, null, 2);

      const backupFileName = `backup_${backupType}_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;
      const fileSize = new Blob([backupContent]).size;
      const backupTime = Date.now() - backupStart;

      // تحديث سجل النسخ الاحتياطي
      await supabaseClient
        .from('backup_logs')
        .update({
          status: errors.length > 0 ? 'partial' : 'completed',
          completed_at: new Date().toISOString(),
          file_path: backupFileName,
          file_size: fileSize,
          error_message: errors.length > 0 ? errors.join('; ') : null
        })
        .eq('id', backupLog.id);

      console.log(`🎉 اكتمل النسخ الاحتياطي: ${backupFileName} في ${(backupTime / 1000).toFixed(2)}s`);

      return jsonResponse({
        success: errors.length === 0,
        message: errors.length === 0 
          ? 'تم النسخ الاحتياطي بنجاح' 
          : 'تم النسخ الاحتياطي مع بعض الأخطاء',
        backupId: backupLog.id,
        fileName: backupFileName,
        statistics: {
          totalTables: tablesToBackup.length,
          successfulTables: tablesToBackup.length - errors.length,
          totalRecords: totalRecords,
          fileSize: `${(fileSize / 1024 / 1024).toFixed(2)} MB`,
          duration: `${(backupTime / 1000).toFixed(2)}s`
        },
        errors: errors.length > 0 ? errors : undefined,
        content: backupContent
      });

    } catch (error) {
      // تسجيل الخطأ في قاعدة البيانات
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await supabaseClient
        .from('backup_logs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: errorMessage
        })
        .eq('id', backupLog.id);

      throw error;
    }

  } catch (error) {
    console.error('💥 خطأ عام في النسخ الاحتياطي:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
});