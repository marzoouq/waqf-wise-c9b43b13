/**
 * Edge Function لفحص صحة قاعدة البيانات الشامل
 * Comprehensive Database Health Check Edge Function
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DuplicateIndex {
  table_name: string;
  index1: string;
  index2: string;
  column_definition: string;
  index1_size: string;
  index2_size: string;
}

interface DuplicatePolicy {
  table_name: string;
  policy1: string;
  policy2: string;
  command: string;
  policy1_qual: string;
  policy2_qual: string;
}

interface DeadRowsInfo {
  table_name: string;
  live_rows: number;
  dead_rows: number;
  dead_pct: number;
  last_vacuum: string | null;
  last_autovacuum: string | null;
}

interface QueryError {
  id: string;
  error_type: string;
  error_message: string;
  severity: string;
  created_at: string;
  error_stack: string | null;
}

interface HealthSummary {
  total_tables: number;
  total_indexes: number;
  duplicate_indexes: number;
  duplicate_policies: number;
  tables_with_dead_rows: number;
  total_dead_rows: number;
  db_size_mb: number;
  cache_hit_ratio: number;
}

interface DatabaseHealthReport {
  summary: HealthSummary;
  duplicateIndexes: DuplicateIndex[];
  duplicatePolicies: DuplicatePolicy[];
  deadRowsInfo: DeadRowsInfo[];
  queryErrors: QueryError[];
  timestamp: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[db-health-check] Starting health check...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all health data in parallel
    const [
      summaryResult,
      duplicateIndexesResult,
      duplicatePoliciesResult,
      deadRowsResult,
      queryErrorsResult,
    ] = await Promise.all([
      supabase.rpc('get_database_health_summary'),
      supabase.rpc('get_duplicate_indexes'),
      supabase.rpc('get_duplicate_rls_policies'),
      supabase.rpc('get_dead_rows_percentage'),
      supabase.rpc('get_recent_query_errors', { p_limit: 50 }),
    ]);

    // Log any errors
    if (summaryResult.error) {
      console.error('[db-health-check] Summary error:', summaryResult.error);
    }
    if (duplicateIndexesResult.error) {
      console.error('[db-health-check] Duplicate indexes error:', duplicateIndexesResult.error);
    }
    if (duplicatePoliciesResult.error) {
      console.error('[db-health-check] Duplicate policies error:', duplicatePoliciesResult.error);
    }
    if (deadRowsResult.error) {
      console.error('[db-health-check] Dead rows error:', deadRowsResult.error);
    }
    if (queryErrorsResult.error) {
      console.error('[db-health-check] Query errors error:', queryErrorsResult.error);
    }

    const summary = summaryResult.data?.[0] || {
      total_tables: 0,
      total_indexes: 0,
      duplicate_indexes: 0,
      duplicate_policies: 0,
      tables_with_dead_rows: 0,
      total_dead_rows: 0,
      db_size_mb: 0,
      cache_hit_ratio: 0,
    };

    const report: DatabaseHealthReport = {
      summary: summary as HealthSummary,
      duplicateIndexes: (duplicateIndexesResult.data || []) as DuplicateIndex[],
      duplicatePolicies: (duplicatePoliciesResult.data || []) as DuplicatePolicy[],
      deadRowsInfo: (deadRowsResult.data || []) as DeadRowsInfo[],
      queryErrors: (queryErrorsResult.data || []) as QueryError[],
      timestamp: new Date().toISOString(),
    };

    console.log('[db-health-check] Health check completed successfully');
    console.log('[db-health-check] Summary:', JSON.stringify(summary));

    return new Response(
      JSON.stringify({ success: true, data: report }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('[db-health-check] Error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
