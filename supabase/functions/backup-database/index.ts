import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  handleCors, 
  jsonResponse, 
  errorResponse,
  forbiddenResponse 
} from '../_shared/cors.ts';

// الأدوار المسموح لها بالنسخ الاحتياطي
const ALLOWED_ROLES = ['admin', 'nazer'];

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // ============ التحقق من المصادقة والصلاحيات ============
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Backup attempt without authorization header');
      return forbiddenResponse('مطلوب تسجيل الدخول للنسخ الاحتياطي');
    }

    const token = authHeader.replace('Bearer ', '');
    
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Invalid token for backup:', authError?.message);
      return forbiddenResponse('جلسة غير صالحة');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // التحقق من صلاحيات المستخدم
    const { data: userRoles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const hasPermission = userRoles?.some(r => ALLOWED_ROLES.includes(r.role));
    
    if (!hasPermission) {
      await supabaseClient.from('audit_logs').insert({
        user_id: user.id,
        user_email: user.email,
        action_type: 'UNAUTHORIZED_BACKUP_ATTEMPT',
        table_name: 'system',
        description: `محاولة نسخ احتياطي غير مصرح بها من ${user.email}`,
        severity: 'error'
      });
      return forbiddenResponse('ليس لديك صلاحية للنسخ الاحتياطي. مطلوب دور مدير أو ناظر.');
    }

    // ============ تنفيذ النسخ الاحتياطي ============
    console.log(`Authorized backup by user: ${user.id}`);

    const { backupType = 'manual', tablesIncluded = [] } = await req.json().catch(() => ({}));
    
    const tablesByType = {
      manual: ['beneficiaries', 'families', 'properties', 'funds', 'distributions', 'journal_entries', 'accounts', 'contracts', 'loans', 'user_roles'],
      full: ['beneficiaries', 'families', 'beneficiary_requests', 'funds', 'distributions', 'properties', 'contracts', 'rental_payments', 'loans', 'accounts', 'journal_entries', 'journal_entry_lines', 'invoices', 'payments', 'documents', 'audit_logs', 'notifications'],
      automated: ['beneficiaries', 'families', 'properties', 'contracts', 'funds', 'distributions', 'loans', 'payments', 'journal_entries', 'accounts', 'documents']
    };

    const tablesToBackup = tablesIncluded.length > 0 ? tablesIncluded : tablesByType[backupType as keyof typeof tablesByType] || tablesByType.manual;

    const { data: backupLog } = await supabaseClient
      .from('backup_logs')
      .insert({ backup_type: backupType, status: 'running', started_at: new Date().toISOString(), tables_included: tablesToBackup })
      .select()
      .single();

    const backupData: Record<string, unknown[]> = {};
    let totalRecords = 0;

    for (const table of tablesToBackup) {
      try {
        const { data } = await supabaseClient.from(table).select('*');
        if (data) {
          backupData[table] = data;
          totalRecords += data.length;
        }
      } catch (err) {
        console.error(`Error backing up ${table}:`, err);
      }
    }

    const backupContent = JSON.stringify({
      version: '2.6.15',
      backupType,
      timestamp: new Date().toISOString(),
      created_by: user.email,
      data: backupData,
      metadata: { totalTables: Object.keys(backupData).length, totalRecords }
    }, null, 2);

    if (backupLog?.id) {
      await supabaseClient.from('backup_logs').update({ status: 'completed', completed_at: new Date().toISOString(), file_size: new Blob([backupContent]).size }).eq('id', backupLog.id);
    }

    await supabaseClient.from('audit_logs').insert({
      user_id: user.id,
      user_email: user.email,
      action_type: 'BACKUP_CREATED',
      table_name: 'system',
      description: `تم إنشاء نسخة احتياطية بواسطة ${user.email}`,
      severity: 'info'
    });

    return jsonResponse({ success: true, message: 'تم النسخ الاحتياطي بنجاح', statistics: { totalTables: Object.keys(backupData).length, totalRecords }, content: backupContent });

  } catch (error) {
    console.error('Backup error:', error);
    return errorResponse(error instanceof Error ? error.message : 'Unknown error', 500);
  }
});
