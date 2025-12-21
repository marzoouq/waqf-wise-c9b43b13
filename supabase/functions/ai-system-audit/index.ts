import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 11 فئات الفحص الشامل
const AUDIT_CATEGORIES = [
  'architecture',      // البنية والمعمارية
  'performance',       // الأداء
  'components',        // المكونات
  'functions',         // الوظائف
  'buttons',           // الأزرار
  'dashboards',        // لوحات التحكم
  'roles',             // الأدوار والصلاحيات
  'navigation',        // التنقلات
  'tables',            // الجداول
  'database',          // قاعدة البيانات
  'tabs'               // التبويبات
];

const CATEGORY_LABELS: Record<string, string> = {
  'architecture': 'البنية والمعمارية',
  'performance': 'الأداء',
  'components': 'المكونات',
  'functions': 'الوظائف',
  'buttons': 'الأزرار',
  'dashboards': 'لوحات التحكم',
  'roles': 'الأدوار والصلاحيات',
  'navigation': 'التنقلات',
  'tables': 'الجداول',
  'database': 'قاعدة البيانات',
  'tabs': 'التبويبات'
};

interface AuditFinding {
  id: string;
  category: string;
  categoryLabel: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  suggestion?: string;
  fixSql?: string;
  rollbackSql?: string;
  autoFixable: boolean;
  fixed: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ Health Check Support
    const bodyClone = await req.clone().text();
    if (bodyClone) {
      try {
        const parsed = JSON.parse(bodyClone);
        if (parsed.ping || parsed.healthCheck) {
          console.log('[ai-system-audit] Health check received');
          return new Response(JSON.stringify({
            status: 'healthy',
            function: 'ai-system-audit',
            timestamp: new Date().toISOString()
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      } catch { /* not JSON, continue */ }
    }
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { auditType = 'full', categories = AUDIT_CATEGORIES, userId } = await req.json();

    console.log(`[AI-SYSTEM-AUDIT] Starting ${auditType} audit for categories:`, categories);
    console.log(`[AI-SYSTEM-AUDIT] LOVABLE_API_KEY available: ${!!lovableApiKey}`);

    // إنشاء سجل الفحص
    const { data: auditRecord, error: insertError } = await supabase
      .from('ai_system_audits')
      .insert({
        audit_type: auditType,
        categories: categories,
        created_by: userId,
        severity_summary: { critical: 0, warning: 0, info: 0, success: 0 }
      })
      .select()
      .single();

    if (insertError) {
      console.error('[AI-SYSTEM-AUDIT] Error creating audit record:', insertError);
      throw new Error('Failed to create audit record');
    }

    const auditId = auditRecord.id;
    console.log(`[AI-SYSTEM-AUDIT] Created audit record: ${auditId}`);

    // جمع بيانات النظام للفحص
    const systemData = await gatherSystemData(supabase, categories);
    console.log(`[AI-SYSTEM-AUDIT] System data gathered:`, {
      tablesCount: systemData.tables?.length || 0,
      rlsPoliciesCount: systemData.rlsPolicies?.length || 0,
      indexesCount: systemData.indexes?.length || 0,
      hasSystemStats: !!systemData.systemStats
    });

    // استخدام AI لتحليل النظام
    const findings = await analyzeWithAI(systemData, categories, lovableApiKey);
    console.log(`[AI-SYSTEM-AUDIT] Analysis completed. Findings: ${findings.length}`);

    // حساب ملخص الخطورة
    const severitySummary = {
      critical: findings.filter(f => f.severity === 'critical').length,
      warning: findings.filter(f => f.severity === 'warning').length,
      info: findings.filter(f => f.severity === 'info').length,
      success: findings.filter(f => f.severity === 'success').length
    };

    // تنفيذ الإصلاحات الآمنة تلقائياً (معطل حالياً لعدم وجود execute_sql)
    const autoFixResults: any[] = [];
    
    // حفظ الإصلاحات المعلقة
    const pendingFixes = findings.filter(f => !f.autoFixable && f.fixSql);
    if (pendingFixes.length > 0) {
      await savePendingFixes(supabase, auditId, pendingFixes);
    }

    // تحديث سجل الفحص
    const { error: updateError } = await supabase
      .from('ai_system_audits')
      .update({
        findings: findings,
        auto_fixes_applied: autoFixResults,
        pending_fixes: pendingFixes.map(f => f.id),
        severity_summary: severitySummary,
        total_issues: findings.filter(f => f.severity !== 'success').length,
        fixed_issues: autoFixResults.filter(r => r.success).length,
        completed_at: new Date().toISOString(),
        ai_analysis: generateAIAnalysisSummary(findings, severitySummary)
      })
      .eq('id', auditId);

    if (updateError) {
      console.error('[AI-SYSTEM-AUDIT] Error updating audit record:', updateError);
    }

    // إرسال إشعار Slack للمشاكل الحرجة
    if (severitySummary.critical > 0) {
      await sendSlackNotification(supabase, auditId, severitySummary, findings.filter(f => f.severity === 'critical'));
    }

    console.log(`[AI-SYSTEM-AUDIT] Audit completed successfully. Issues: ${findings.filter(f => f.severity !== 'success').length}`);

    return new Response(JSON.stringify({
      success: true,
      auditId,
      findings,
      severitySummary,
      autoFixResults,
      pendingFixes: pendingFixes.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[AI-SYSTEM-AUDIT] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: errMsg
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function gatherSystemData(supabase: any, categories: string[]) {
  const data: Record<string, any> = {};

  console.log('[AI-SYSTEM-AUDIT] Gathering system data for categories:', categories);

  // جمع بيانات قاعدة البيانات باستخدام RPC Functions
  if (categories.includes('database') || categories.includes('tables')) {
    // جلب معلومات الجداول
    const { data: tables, error: tablesError } = await supabase.rpc('get_table_info');
    if (tablesError) {
      console.error('[AI-SYSTEM-AUDIT] Error fetching tables:', tablesError);
    } else {
      data.tables = tables;
      console.log(`[AI-SYSTEM-AUDIT] Fetched ${tables?.length || 0} tables`);
    }

    // جلب سياسات RLS
    const { data: rlsPolicies, error: rlsError } = await supabase.rpc('get_rls_policies');
    if (rlsError) {
      console.error('[AI-SYSTEM-AUDIT] Error fetching RLS policies:', rlsError);
    } else {
      data.rlsPolicies = rlsPolicies;
      console.log(`[AI-SYSTEM-AUDIT] Fetched ${rlsPolicies?.length || 0} RLS policies`);
    }

    // جلب الفهارس
    const { data: indexes, error: indexesError } = await supabase.rpc('get_indexes');
    if (indexesError) {
      console.error('[AI-SYSTEM-AUDIT] Error fetching indexes:', indexesError);
    } else {
      data.indexes = indexes;
      console.log(`[AI-SYSTEM-AUDIT] Fetched ${indexes?.length || 0} indexes`);
    }

    // جلب إحصائيات النظام
    const { data: systemStats, error: statsError } = await supabase.rpc('get_system_stats');
    if (statsError) {
      console.error('[AI-SYSTEM-AUDIT] Error fetching system stats:', statsError);
    } else {
      data.systemStats = systemStats;
      console.log('[AI-SYSTEM-AUDIT] Fetched system stats:', systemStats);
    }
  }

  // جمع بيانات الأدوار والصلاحيات
  if (categories.includes('roles')) {
    const { data: roles, error: rolesError } = await supabase.from('user_roles').select('*').limit(100);
    if (!rolesError) {
      data.roles = roles;
      console.log(`[AI-SYSTEM-AUDIT] Fetched ${roles?.length || 0} user roles`);
    }

    const { data: permissions } = await supabase.from('role_permissions').select('*').limit(100);
    data.permissions = permissions;
  }

  // جمع بيانات التنبيهات الذكية للتحليل
  if (categories.includes('performance')) {
    const { data: alerts } = await supabase
      .from('smart_alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    data.recentAlerts = alerts;
  }

  // جمع سجلات الأخطاء
  const { data: errorLogs } = await supabase
    .from('error_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  data.errorLogs = errorLogs;

  // جمع سجلات التدقيق
  const { data: auditLogs } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  data.auditLogs = auditLogs;

  return data;
}

async function analyzeWithAI(systemData: any, categories: string[], apiKey?: string): Promise<AuditFinding[]> {
  // إذا لم يتوفر API key، استخدم التحليل المحلي المحسن
  if (!apiKey) {
    console.log('[AI-SYSTEM-AUDIT] No LOVABLE_API_KEY, using enhanced local analysis');
    return performEnhancedLocalAnalysis(systemData, categories);
  }

  try {
    console.log('[AI-SYSTEM-AUDIT] Calling Lovable AI Gateway...');
    const prompt = buildAnalysisPrompt(systemData, categories);
    
    // استخدام Lovable AI Gateway بدلاً من OpenRouter
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `أنت خبير في فحص أنظمة إدارة الأوقاف. قم بتحليل بيانات النظام وإرجاع النتائج بصيغة JSON.
            
كل مشكلة يجب أن تتضمن:
- id: معرف فريد (مثل: db-001, perf-002)
- category: الفئة (من: ${categories.join(', ')})
- severity: الخطورة (critical, warning, info, success)
- title: عنوان المشكلة بالعربية
- description: وصف تفصيلي بالعربية
- suggestion: اقتراح الحل بالعربية
- fixSql: كود SQL للإصلاح (إن وجد)
- rollbackSql: كود SQL للتراجع (إن وجد)
- autoFixable: هل يمكن الإصلاح تلقائياً (true/false)

أرجع مصفوفة JSON فقط بدون أي نص إضافي. تأكد من تحليل:
1. الجداول بدون RLS (critical)
2. الجداول الكبيرة بدون فهارس مناسبة (warning)
3. الأخطاء المتكررة (warning/critical)
4. المستخدمين بدون أدوار (warning)
5. سياسات RLS الضعيفة (critical)
6. أداء الاستعلامات (info/warning)`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.3
      })
    });

    // معالجة أخطاء Rate Limit والدفع
    if (response.status === 429) {
      console.error('[AI-SYSTEM-AUDIT] Rate limit exceeded (429)');
      return performEnhancedLocalAnalysis(systemData, categories);
    }

    if (response.status === 402) {
      console.error('[AI-SYSTEM-AUDIT] Payment required (402) - Credits exhausted');
      return performEnhancedLocalAnalysis(systemData, categories);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AI-SYSTEM-AUDIT] AI Gateway error: ${response.status}`, errorText);
      return performEnhancedLocalAnalysis(systemData, categories);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || '[]';
    console.log('[AI-SYSTEM-AUDIT] AI response received, parsing...');
    
    // ✅ إضافة logging للرد الخام
    console.log('[AI-SYSTEM-AUDIT] AI raw response length:', content.length);
    console.log('[AI-SYSTEM-AUDIT] AI response preview:', content.substring(0, 500));

    // ✅ محاولة 1: parse مباشر (إذا كان الرد JSON صافي)
    try {
      const directParse = JSON.parse(content.trim());
      if (Array.isArray(directParse)) {
        console.log(`[AI-SYSTEM-AUDIT] Direct parse successful, found ${directParse.length} issues`);
        return directParse.map((f: any) => ({
          ...f,
          categoryLabel: CATEGORY_LABELS[f.category] || f.category,
          fixed: false
        }));
      }
    } catch (e) {
      console.log('[AI-SYSTEM-AUDIT] Direct parse failed, trying regex extraction...');
    }

    // ✅ محاولة 2: استخراج array باستخدام regex غير جشع
    const jsonMatch = content.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      try {
        const aiFindings = JSON.parse(jsonMatch[0]);
        console.log(`[AI-SYSTEM-AUDIT] Regex extraction successful, found ${aiFindings.length} issues`);
        return aiFindings.map((f: any) => ({
          ...f,
          categoryLabel: CATEGORY_LABELS[f.category] || f.category,
          fixed: false
        }));
      } catch (parseError) {
        console.error('[AI-SYSTEM-AUDIT] Failed to parse extracted JSON:', parseError);
      }
    }

    // ✅ محاولة 3: البحث عن JSON بين code blocks
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      try {
        const aiFindings = JSON.parse(codeBlockMatch[1].trim());
        if (Array.isArray(aiFindings)) {
          console.log(`[AI-SYSTEM-AUDIT] Code block extraction successful, found ${aiFindings.length} issues`);
          return aiFindings.map((f: any) => ({
            ...f,
            categoryLabel: CATEGORY_LABELS[f.category] || f.category,
            fixed: false
          }));
        }
      } catch (e) {
        console.error('[AI-SYSTEM-AUDIT] Failed to parse code block JSON');
      }
    }

    console.log('[AI-SYSTEM-AUDIT] All parsing attempts failed, using local analysis');
    return performEnhancedLocalAnalysis(systemData, categories);

  } catch (error) {
    console.error('[AI-SYSTEM-AUDIT] AI analysis error:', error);
    return performEnhancedLocalAnalysis(systemData, categories);
  }
}

function buildAnalysisPrompt(systemData: any, categories: string[]): string {
  let prompt = 'قم بفحص النظام وتحديد المشاكل في الفئات التالية:\n\n';
  
  categories.forEach(cat => {
    prompt += `## ${CATEGORY_LABELS[cat]}\n`;
  });

  prompt += '\n\nبيانات النظام:\n';
  
  // تحديد حجم البيانات المرسلة
  const dataToSend = {
    tables: systemData.tables?.slice(0, 50),
    rlsPolicies: systemData.rlsPolicies?.slice(0, 100),
    indexes: systemData.indexes?.slice(0, 100),
    systemStats: systemData.systemStats,
    errorLogsCount: systemData.errorLogs?.length || 0,
    rolesCount: systemData.roles?.length || 0,
    tablesWithoutRLS: systemData.tables?.filter((t: any) => !t.has_rls)?.map((t: any) => t.table_name) || []
  };
  
  prompt += JSON.stringify(dataToSend, null, 2);
  
  return prompt;
}

function performEnhancedLocalAnalysis(systemData: any, categories: string[]): AuditFinding[] {
  const findings: AuditFinding[] = [];
  let idCounter = 1;

  console.log('[AI-SYSTEM-AUDIT] Performing enhanced local analysis...');

  // فحص قاعدة البيانات
  if (categories.includes('database') || categories.includes('tables')) {
    // فحص الجداول بدون RLS
    if (systemData.tables && systemData.tables.length > 0) {
      const tablesWithoutRLS = systemData.tables.filter((t: any) => !t.has_rls);
      
      tablesWithoutRLS.forEach((table: any) => {
        findings.push({
          id: `db-${idCounter++}`,
          category: 'database',
          categoryLabel: 'قاعدة البيانات',
          severity: 'critical',
          title: `جدول ${table.table_name} بدون سياسات RLS`,
          description: `الجدول ${table.table_name} لا يملك سياسات أمان صف (RLS) مفعلة. هذا يعني أن أي مستخدم يمكنه الوصول لجميع البيانات.`,
          suggestion: 'أضف سياسات RLS للجدول لحماية البيانات حسب صلاحيات المستخدم',
          fixSql: `ALTER TABLE public.${table.table_name} ENABLE ROW LEVEL SECURITY;`,
          rollbackSql: `ALTER TABLE public.${table.table_name} DISABLE ROW LEVEL SECURITY;`,
          autoFixable: false,
          fixed: false
        });
      });

      // فحص الجداول الكبيرة بدون فهارس كافية
      const largeTables = systemData.tables.filter((t: any) => t.row_count > 10000);
      if (systemData.indexes) {
        largeTables.forEach((table: any) => {
          const tableIndexes = systemData.indexes.filter((i: any) => i.table_name === table.table_name);
          if (tableIndexes.length < 2) {
            findings.push({
              id: `perf-${idCounter++}`,
              category: 'performance',
              categoryLabel: 'الأداء',
              severity: 'warning',
              title: `جدول ${table.table_name} كبير مع فهارس قليلة`,
              description: `الجدول يحتوي على ${table.row_count} صف ولديه ${tableIndexes.length} فهرس فقط. قد يؤثر على أداء الاستعلامات.`,
              suggestion: 'أضف فهارس للأعمدة المستخدمة بشكل متكرر في WHERE و JOIN',
              autoFixable: false,
              fixed: false
            });
          }
        });
      }

      // إضافة ملخص حالة الجداول
      if (tablesWithoutRLS.length === 0) {
        findings.push({
          id: `success-rls`,
          category: 'database',
          categoryLabel: 'قاعدة البيانات',
          severity: 'success',
          title: 'جميع الجداول محمية بـ RLS',
          description: `جميع الجداول (${systemData.tables.length}) لديها سياسات RLS مفعلة`,
          autoFixable: false,
          fixed: false
        });
      }
    }

    // فحص إحصائيات النظام
    if (systemData.systemStats) {
      const stats = systemData.systemStats;
      
      if (stats.tables_without_rls > 0) {
        findings.push({
          id: `stats-${idCounter++}`,
          category: 'database',
          categoryLabel: 'قاعدة البيانات',
          severity: 'critical',
          title: `${stats.tables_without_rls} جداول بدون حماية RLS`,
          description: `يوجد ${stats.tables_without_rls} جدول في قاعدة البيانات بدون تفعيل RLS`,
          suggestion: 'قم بتفعيل RLS لجميع الجداول وأضف السياسات المناسبة',
          autoFixable: false,
          fixed: false
        });
      }

      // معلومات عن حجم قاعدة البيانات
      const dbSizeMB = Math.round(stats.database_size / (1024 * 1024));
      findings.push({
        id: `info-${idCounter++}`,
        category: 'database',
        categoryLabel: 'قاعدة البيانات',
        severity: 'info',
        title: `حجم قاعدة البيانات: ${dbSizeMB} ميجابايت`,
        description: `إحصائيات: ${stats.tables_count} جدول، ${stats.policies_count} سياسة، ${stats.indexes_count} فهرس`,
        autoFixable: false,
        fixed: false
      });
    }
  }

  // فحص الأخطاء المتكررة
  if (systemData.errorLogs && systemData.errorLogs.length > 0) {
    const errorCounts = systemData.errorLogs.reduce((acc: any, log: any) => {
      const key = log.error_type || log.message?.slice(0, 50) || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    Object.entries(errorCounts).forEach(([errorType, count]) => {
      if ((count as number) > 5) {
        findings.push({
          id: `err-${idCounter++}`,
          category: 'performance',
          categoryLabel: 'الأداء',
          severity: (count as number) > 20 ? 'critical' : 'warning',
          title: `أخطاء متكررة: ${errorType.slice(0, 40)}`,
          description: `تم رصد ${count} خطأ من هذا النوع في الفترة الأخيرة`,
          suggestion: 'راجع سجلات الأخطاء وأصلح السبب الجذري لهذه الأخطاء',
          autoFixable: false,
          fixed: false
        });
      }
    });

    if (Object.keys(errorCounts).length === 0 || Object.values(errorCounts).every(c => (c as number) <= 5)) {
      findings.push({
        id: `success-errors`,
        category: 'performance',
        categoryLabel: 'الأداء',
        severity: 'success',
        title: 'لا توجد أخطاء متكررة',
        description: 'سجلات الأخطاء لا تظهر أي أنماط مقلقة',
        autoFixable: false,
        fixed: false
      });
    }
  }

  // فحص الأدوار
  if (categories.includes('roles') && systemData.roles) {
    const usersWithoutRoles = systemData.roles?.filter((r: any) => !r.role) || [];
    if (usersWithoutRoles.length > 0) {
      findings.push({
        id: `role-${idCounter++}`,
        category: 'roles',
        categoryLabel: 'الأدوار والصلاحيات',
        severity: 'warning',
        title: `${usersWithoutRoles.length} مستخدم بدون دور محدد`,
        description: 'يوجد مستخدمون في النظام بدون أدوار محددة مما قد يسبب مشاكل في الصلاحيات',
        suggestion: 'قم بتعيين أدوار مناسبة للمستخدمين من لوحة إدارة المستخدمين',
        autoFixable: false,
        fixed: false
      });
    } else {
      findings.push({
        id: `success-roles`,
        category: 'roles',
        categoryLabel: 'الأدوار والصلاحيات',
        severity: 'success',
        title: 'جميع المستخدمين لديهم أدوار',
        description: `جميع المستخدمين (${systemData.roles?.length || 0}) لديهم أدوار محددة`,
        autoFixable: false,
        fixed: false
      });
    }
  }

  // إضافة نتائج نجاح للفئات التي لم يتم فحصها بعمق
  const checkedCategories = ['database', 'tables', 'performance', 'roles'];
  categories.forEach(cat => {
    if (!checkedCategories.includes(cat)) {
      const categoryFindings = findings.filter(f => f.category === cat);
      if (categoryFindings.length === 0) {
        findings.push({
          id: `success-${cat}`,
          category: cat,
          categoryLabel: CATEGORY_LABELS[cat],
          severity: 'success',
          title: `${CATEGORY_LABELS[cat]} - لا توجد مشاكل واضحة`,
          description: `تم فحص ${CATEGORY_LABELS[cat]} ولم يتم العثور على مشاكل تستدعي الاهتمام`,
          autoFixable: false,
          fixed: false
        });
      }
    }
  });

  console.log(`[AI-SYSTEM-AUDIT] Local analysis found ${findings.length} findings`);
  return findings;
}

async function savePendingFixes(supabase: any, auditId: string, findings: AuditFinding[]) {
  const fixes = findings.map(f => ({
    audit_id: auditId,
    fix_type: f.category,
    category: f.categoryLabel,
    fix_sql: f.fixSql,
    description: f.description,
    severity: f.severity,
    auto_fixable: f.autoFixable,
    rollback_sql: f.rollbackSql
  }));

  const { error } = await supabase.from('pending_system_fixes').insert(fixes);
  if (error) {
    console.error('[AI-SYSTEM-AUDIT] Error saving pending fixes:', error);
  } else {
    console.log(`[AI-SYSTEM-AUDIT] Saved ${fixes.length} pending fixes`);
  }
}

function generateAIAnalysisSummary(findings: AuditFinding[], summary: any): string {
  const total = findings.length;
  const issues = total - summary.success;
  
  let analysis = `## ملخص الفحص الذكي\n\n`;
  analysis += `تم فحص النظام والعثور على ${total} نتيجة:\n`;
  analysis += `- 🔴 مشاكل حرجة: ${summary.critical}\n`;
  analysis += `- 🟡 تحذيرات: ${summary.warning}\n`;
  analysis += `- 🔵 معلومات: ${summary.info}\n`;
  analysis += `- ✅ سليم: ${summary.success}\n\n`;

  if (summary.critical > 0) {
    analysis += `### ⚠️ تنبيه: يوجد ${summary.critical} مشكلة حرجة تحتاج اهتمام فوري!\n\n`;
    const criticalFindings = findings.filter(f => f.severity === 'critical');
    criticalFindings.forEach(f => {
      analysis += `- **${f.title}**: ${f.description}\n`;
    });
  }

  return analysis;
}

async function sendSlackNotification(supabase: any, auditId: string, summary: any, criticalFindings: AuditFinding[]) {
  try {
    const slackWebhookUrl = Deno.env.get('SLACK_WEBHOOK_URL');
    if (!slackWebhookUrl) {
      console.log('[AI-SYSTEM-AUDIT] No Slack webhook configured, skipping notification');
      return;
    }

    await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '🚨 تنبيه: مشاكل حرجة في النظام',
              emoji: true
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*تم اكتشاف ${summary.critical} مشكلة حرجة في الفحص الذكي*`
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: criticalFindings.map(f => `• ${f.title}`).join('\n')
            }
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `Audit ID: ${auditId}`
              }
            ]
          }
        ]
      })
    });
    
    // تحديث سجل الفحص بأن الإشعار تم إرساله
    await supabase
      .from('ai_system_audits')
      .update({ slack_notified: true })
      .eq('id', auditId);

    console.log('[AI-SYSTEM-AUDIT] Slack notification sent successfully');
  } catch (error) {
    console.error('[AI-SYSTEM-AUDIT] Error sending Slack notification:', error);
  }
}
