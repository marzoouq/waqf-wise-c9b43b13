import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, serviceKey);

    // قائمة شاملة لجميع الجداول التي تحتوي على صفوف ميتة
    const tables = [
      // الجداول الأساسية
      'accounts',
      'beneficiaries',
      'contracts',
      'distributions',
      'families',
      'fiscal_years',
      'invoices',
      'journal_entries',
      'journal_entry_lines',
      'loans',
      'notifications',
      'payments',
      'payment_vouchers',
      'profiles',
      'properties',
      'rental_payments',
      'tenants',
      'user_roles',
      
      // الجداول المالية
      'bank_accounts',
      'bank_statements',
      'bank_transactions',
      'bank_reconciliation_matches',
      'opening_balances',
      'pos_transactions',
      'tenant_ledger',
      
      // جداول المستفيدين
      'beneficiary_attachments',
      'beneficiary_requests',
      'beneficiary_activity_log',
      'beneficiary_changes_log',
      'beneficiary_tags',
      'distribution_details',
      
      // جداول النظام
      'system_alerts',
      'audit_logs',
      'approval_status',
      'approval_steps',
      'documents',
      'maintenance_requests',
      'support_tickets',
      
      // جداول أخرى
      'annual_disclosures',
      'fiscal_year_closings',
      'waqf_distribution_settings',
      'historical_invoices',
      'zatca_submission_log'
    ];

    const results = [];

    for (const table of tables) {
      try {
        // تشغيل ANALYZE فقط (VACUUM يتطلب صلاحيات خاصة)
        const { error } = await supabase.rpc('analyze_table', { p_table_name: table });
        
        if (error) {
          results.push({ table, status: 'skipped', reason: error.message });
        } else {
          results.push({ table, status: 'analyzed' });
        }
      } catch (e) {
        results.push({ table, status: 'error', reason: String(e) });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'تم تحليل الجداول بنجاح',
        results,
        note: 'VACUUM الكامل يتم تلقائياً بواسطة autovacuum'
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
