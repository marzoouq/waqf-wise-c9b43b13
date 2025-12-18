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

    // قائمة الجداول التي تحتاج تنظيف
    const tables = [
      'system_alerts',
      'contracts',
      'journal_entries',
      'rental_payments',
      'beneficiaries',
      'notifications',
      'accounts',
      'user_roles',
      'fiscal_years',
      'families',
      'payments',
      'profiles',
      'journal_entry_lines'
    ];

    const results = [];

    for (const table of tables) {
      try {
        // تشغيل ANALYZE فقط (VACUUM يتطلب صلاحيات خاصة)
        const { error } = await supabase.rpc('analyze_table', { table_name: table });
        
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
