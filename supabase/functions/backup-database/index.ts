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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { backupType = 'manual', tablesIncluded = [] } = await req.json();
    
    console.log('Starting backup:', { backupType, tablesIncluded });

    // تحديد الجداول المطلوب نسخها
    const defaultTables = [
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
    ];

    const tablesToBackup = tablesIncluded.length > 0 ? tablesIncluded : defaultTables;

    // إنشاء سجل النسخ الاحتياطي
    const { data: backupLog, error: backupLogError } = await supabaseClient
      .from('backup_logs')
      .insert({
        backup_type: backupType,
        status: 'in_progress',
        started_at: new Date().toISOString(),
        tables_included: tablesToBackup
      })
      .select()
      .single();

    if (backupLogError) {
      console.error('Error creating backup log:', backupLogError);
      throw backupLogError;
    }

    console.log('Backup log created:', backupLog.id);

    // جلب البيانات من جميع الجداول
    const backupData: Record<string, any[]> = {};
    let totalRecords = 0;

    for (const table of tablesToBackup) {
      try {
        const { data, error } = await supabaseClient
          .from(table)
          .select('*');

        if (error) {
          console.error(`Error backing up table ${table}:`, error);
          continue;
        }

        if (data) {
          backupData[table] = data;
          totalRecords += data.length;
          console.log(`Backed up ${data.length} records from ${table}`);
        }
      } catch (err) {
        console.error(`Failed to backup table ${table}:`, err);
      }
    }

    // إنشاء ملف النسخة الاحتياطية
    const backupContent = JSON.stringify({
      version: '1.0',
      timestamp: new Date().toISOString(),
      tables: tablesToBackup,
      data: backupData,
      metadata: {
        totalTables: tablesToBackup.length,
        totalRecords: totalRecords
      }
    }, null, 2);

    const backupFileName = `backup_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;
    const fileSize = new Blob([backupContent]).size;

    // تحديث سجل النسخ الاحتياطي
    await supabaseClient
      .from('backup_logs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        file_path: backupFileName,
        file_size: fileSize
      })
      .eq('id', backupLog.id);

    console.log('Backup completed successfully:', backupFileName);

    return jsonResponse({
      success: true,
      backupId: backupLog.id,
      fileName: backupFileName,
      fileSize: fileSize,
      totalRecords: totalRecords,
      totalTables: tablesToBackup.length,
      content: backupContent
    });

  } catch (error) {
    console.error('Backup error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
});
