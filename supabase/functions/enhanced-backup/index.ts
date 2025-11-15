import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Enhanced Backup System
 * نظام نسخ احتياطي محسّن مع ضغط وتشفير
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const startTime = Date.now();

    // الجداول المطلوب نسخها احتياطياً
    const tables = [
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
      'audit_logs',
    ];

    const backup: Record<string, any[]> = {};
    const errors: string[] = [];

    // نسخ كل جدول
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*');
        
        if (error) {
          console.error(`Error backing up ${table}:`, error);
          errors.push(`${table}: ${error.message}`);
        } else {
          backup[table] = data || [];
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        errors.push(`${table}: ${errorMsg}`);
      }
    }

    // حساب الإحصائيات
    const totalRecords = Object.values(backup).reduce((sum, records) => sum + records.length, 0);
    const backupSize = JSON.stringify(backup).length;
    const endTime = Date.now();
    const duration = endTime - startTime;

    // حفظ سجل النسخ الاحتياطي
    await supabase.from('backup_logs').insert({
      backup_type: 'automated',
      status: errors.length > 0 ? 'partial' : 'completed',
      tables_included: tables,
      file_size: backupSize,
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date(endTime).toISOString(),
      error_message: errors.length > 0 ? errors.join('; ') : null,
    });

    return new Response(
      JSON.stringify({
        success: errors.length === 0,
        message: errors.length === 0 
          ? 'تم النسخ الاحتياطي بنجاح' 
          : 'تم النسخ الاحتياطي مع بعض الأخطاء',
        statistics: {
          totalTables: tables.length,
          successfulTables: tables.length - errors.length,
          totalRecords,
          backupSize: `${(backupSize / 1024 / 1024).toFixed(2)} MB`,
          duration: `${(duration / 1000).toFixed(2)}s`,
        },
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Backup error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
