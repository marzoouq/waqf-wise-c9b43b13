import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { backupData, mode = 'replace' } = await req.json();
    
    if (!backupData || !backupData.data) {
      throw new Error('Invalid backup data format');
    }

    console.log('Starting restore:', { 
      version: backupData.version, 
      mode,
      totalTables: backupData.metadata?.totalTables 
    });

    const restoredTables: string[] = [];
    const errors: Array<{ table: string; error: string }> = [];
    let totalRestored = 0;

    // استعادة البيانات لكل جدول
    for (const [tableName, tableData] of Object.entries(backupData.data)) {
      try {
        console.log(`Restoring table: ${tableName} (${(tableData as any[]).length} records)`);

        // في وضع replace، حذف البيانات الحالية أولاً
        if (mode === 'replace') {
          const { error: deleteError } = await supabaseClient
            .from(tableName)
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // حذف جميع السجلات

          if (deleteError) {
            console.error(`Error deleting from ${tableName}:`, deleteError);
            // نواصل حتى لو فشل الحذف
          }
        }

        // إدراج البيانات المستعادة
        if ((tableData as any[]).length > 0) {
          // تقسيم البيانات إلى دفعات (batch inserts)
          const batchSize = 100;
          const dataArray = tableData as any[];
          
          for (let i = 0; i < dataArray.length; i += batchSize) {
            const batch = dataArray.slice(i, i + batchSize);
            
            const { error: insertError } = await supabaseClient
              .from(tableName)
              .insert(batch);

            if (insertError) {
              console.error(`Error inserting batch into ${tableName}:`, insertError);
              errors.push({ 
                table: tableName, 
                error: insertError.message 
              });
            } else {
              totalRestored += batch.length;
            }
          }
        }

        restoredTables.push(tableName);
        console.log(`Successfully restored ${tableName}`);

      } catch (err) {
        console.error(`Failed to restore table ${tableName}:`, err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        errors.push({ 
          table: tableName, 
          error: errorMessage
        });
      }
    }

    console.log('Restore completed:', {
      restoredTables: restoredTables.length,
      totalRestored,
      errors: errors.length
    });

    return new Response(
      JSON.stringify({
        success: true,
        restoredTables,
        totalRestored,
        errors: errors.length > 0 ? errors : undefined,
        message: errors.length > 0 
          ? `تمت الاستعادة مع بعض الأخطاء (${errors.length} جداول فشلت)`
          : 'تمت استعادة جميع البيانات بنجاح'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Restore error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
