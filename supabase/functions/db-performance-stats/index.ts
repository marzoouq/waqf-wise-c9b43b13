import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TableStats {
  table_name: string;
  seq_scan: number;
  idx_scan: number;
  seq_pct: number;
  dead_rows: number;
  live_rows: number;
}

interface ConnectionStats {
  state: string;
  count: number;
  max_idle_seconds: number;
}

interface DBPerformanceStats {
  sequentialScans: TableStats[];
  cacheHitRatio: number;
  connections: ConnectionStats[];
  totalDeadRows: number;
  dbSizeMb: number;
  timestamp: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get sequential scans stats
    const { data: tableStats, error: tableError } = await supabase.rpc('get_table_scan_stats');
    
    // Get cache hit ratio
    const { data: cacheData, error: cacheError } = await supabase.rpc('get_cache_hit_ratio');
    
    // Get connection stats  
    const { data: connData, error: connError } = await supabase.rpc('get_connection_stats');
    
    // Get database size
    const { data: sizeData, error: sizeError } = await supabase.rpc('get_database_size');

    const stats: DBPerformanceStats = {
      sequentialScans: tableStats || [],
      cacheHitRatio: cacheData?.[0]?.cache_hit_ratio || 0,
      connections: connData || [],
      totalDeadRows: tableStats?.reduce((sum: number, t: TableStats) => sum + (t.dead_rows || 0), 0) || 0,
      dbSizeMb: sizeData?.[0]?.size_mb || 0,
      timestamp: new Date().toISOString(),
    };

    console.log('[db-performance-stats] Stats fetched successfully:', {
      tables: stats.sequentialScans.length,
      cacheHit: stats.cacheHitRatio,
      connections: stats.connections.length,
      deadRows: stats.totalDeadRows,
    });

    return new Response(JSON.stringify({ success: true, data: stats }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[db-performance-stats] Error:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
