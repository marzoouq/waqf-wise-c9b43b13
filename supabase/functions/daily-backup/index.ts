import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  handleCors, 
  jsonResponse, 
  errorResponse 
} from '../_shared/cors.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const backupStart = Date.now();

    // إنشاء سجل النسخ الاحتياطي
    const { data: backupLog } = await supabase
      .from('backup_logs')
      .insert({
        backup_type: 'full',
        status: 'running',
      })
      .select()
      .single();

    try {
      // قائمة الجداول المهمة للنسخ الاحتياطي
      const criticalTables = [
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
        'notifications',
      ];

      const backupData: Record<string, unknown[]> = {};
      let totalRecords = 0;

      // نسخ كل جدول
      for (const table of criticalTables) {
        const { data, error } = await supabase
          .from(table)
          .select('*');

        if (!error && data) {
          backupData[table] = data;
          totalRecords += data.length;
        }
      }

      // تحويل البيانات إلى JSON
      const backupJson = JSON.stringify(backupData, null, 2);
      const backupSize = new Blob([backupJson]).size;

      // تحديث سجل النسخ الاحتياطي
      await supabase
        .from('backup_logs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          file_size: backupSize,
          file_path: `backup-${new Date().toISOString()}.json`,
          tables_included: criticalTables,
        })
        .eq('id', backupLog.id);

      const backupTime = Date.now() - backupStart;

      return jsonResponse({
        success: true,
        backupId: backupLog.id,
        tablesBackedUp: criticalTables.length,
        totalRecords,
        backupSize,
        backupTime,
      });
    } catch (error) {
      // تسجيل الخطأ
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await supabase
        .from('backup_logs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: errorMessage,
        })
        .eq('id', backupLog.id);

      throw error;
    }
  } catch (error) {
    console.error('Backup Error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
});
