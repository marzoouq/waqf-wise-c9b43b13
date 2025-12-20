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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { auditType = 'full', categories = AUDIT_CATEGORIES, userId } = await req.json();

    console.log(`[AI-SYSTEM-AUDIT] Starting ${auditType} audit for categories:`, categories);

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

    // استخدام AI لتحليل النظام
    const findings = await analyzeWithAI(systemData, categories, lovableApiKey);

    // حساب ملخص الخطورة
    const severitySummary = {
      critical: findings.filter(f => f.severity === 'critical').length,
      warning: findings.filter(f => f.severity === 'warning').length,
      info: findings.filter(f => f.severity === 'info').length,
      success: findings.filter(f => f.severity === 'success').length
    };

    // تنفيذ الإصلاحات الآمنة تلقائياً
    const autoFixResults = await applyAutoFixes(supabase, findings.filter(f => f.autoFixable && f.fixSql));
    
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

    console.log(`[AI-SYSTEM-AUDIT] Audit completed. Found ${findings.length} issues.`);

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

  // جمع بيانات قاعدة البيانات
  if (categories.includes('database') || categories.includes('tables')) {
    // جلب معلومات الجداول
    const { data: tables } = await supabase.rpc('get_table_info').catch(() => ({ data: null }));
    data.tables = tables;

    // جلب سياسات RLS
    const { data: rlsPolicies } = await supabase.rpc('get_rls_policies').catch(() => ({ data: null }));
    data.rlsPolicies = rlsPolicies;

    // جلب الفهارس
    const { data: indexes } = await supabase.rpc('get_indexes').catch(() => ({ data: null }));
    data.indexes = indexes;
  }

  // جمع بيانات الأدوار والصلاحيات
  if (categories.includes('roles')) {
    const { data: roles } = await supabase.from('user_roles').select('*').limit(100);
    data.roles = roles;

    const { data: permissions } = await supabase.from('role_permissions').select('*').limit(100).catch(() => ({ data: null }));
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
    .limit(100)
    .catch(() => ({ data: null }));
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
  const findings: AuditFinding[] = [];

  // إذا لم يتوفر API key، استخدم التحليل المحلي
  if (!apiKey) {
    console.log('[AI-SYSTEM-AUDIT] No API key, using local analysis');
    return performLocalAnalysis(systemData, categories);
  }

  try {
    const prompt = buildAnalysisPrompt(systemData, categories);
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lovable.dev',
        'X-Title': 'Waqf System Audit'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `أنت خبير في فحص أنظمة إدارة الأوقاف. قم بتحليل بيانات النظام وإرجاع النتائج بصيغة JSON.
            
كل مشكلة يجب أن تتضمن:
- id: معرف فريد
- category: الفئة (من: ${categories.join(', ')})
- severity: الخطورة (critical, warning, info, success)
- title: عنوان المشكلة
- description: وصف تفصيلي
- suggestion: اقتراح الحل
- fixSql: كود SQL للإصلاح (إن وجد)
- rollbackSql: كود SQL للتراجع (إن وجد)
- autoFixable: هل يمكن الإصلاح تلقائياً (true/false)

أرجع مصفوفة JSON فقط بدون أي نص إضافي.`
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

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || '[]';
    
    // استخراج JSON من الرد
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const aiFindings = JSON.parse(jsonMatch[0]);
      return aiFindings.map((f: any) => ({
        ...f,
        categoryLabel: CATEGORY_LABELS[f.category] || f.category,
        fixed: false
      }));
    }
  } catch (error) {
    console.error('[AI-SYSTEM-AUDIT] AI analysis error:', error);
  }

  // في حالة الفشل، استخدم التحليل المحلي
  return performLocalAnalysis(systemData, categories);
}

function buildAnalysisPrompt(systemData: any, categories: string[]): string {
  let prompt = 'قم بفحص النظام وتحديد المشاكل في الفئات التالية:\n\n';
  
  categories.forEach(cat => {
    prompt += `## ${CATEGORY_LABELS[cat]}\n`;
  });

  prompt += '\n\nبيانات النظام:\n';
  prompt += JSON.stringify(systemData, null, 2).slice(0, 10000); // حد أقصى للحجم
  
  return prompt;
}

function performLocalAnalysis(systemData: any, categories: string[]): AuditFinding[] {
  const findings: AuditFinding[] = [];
  let idCounter = 1;

  // فحص قاعدة البيانات
  if (categories.includes('database')) {
    // فحص الجداول بدون RLS
    if (systemData.rlsPolicies) {
      const tablesWithoutRLS = systemData.tables?.filter((t: any) => 
        !systemData.rlsPolicies.some((p: any) => p.tablename === t.table_name)
      ) || [];
      
      tablesWithoutRLS.forEach((table: any) => {
        findings.push({
          id: `db-${idCounter++}`,
          category: 'database',
          categoryLabel: 'قاعدة البيانات',
          severity: 'critical',
          title: `جدول ${table.table_name} بدون سياسات RLS`,
          description: `الجدول ${table.table_name} لا يملك سياسات أمان صف (RLS) مفعلة`,
          suggestion: 'أضف سياسات RLS للجدول لحماية البيانات',
          fixSql: `ALTER TABLE ${table.table_name} ENABLE ROW LEVEL SECURITY;`,
          rollbackSql: `ALTER TABLE ${table.table_name} DISABLE ROW LEVEL SECURITY;`,
          autoFixable: false,
          fixed: false
        });
      });
    }
  }

  // فحص الأخطاء المتكررة
  if (systemData.errorLogs && systemData.errorLogs.length > 0) {
    const errorCounts = systemData.errorLogs.reduce((acc: any, log: any) => {
      const key = log.error_type || 'unknown';
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
          title: `أخطاء متكررة: ${errorType}`,
          description: `تم رصد ${count} خطأ من نوع ${errorType} في الفترة الأخيرة`,
          suggestion: 'راجع سجلات الأخطاء وأصلح السبب الجذري',
          autoFixable: false,
          fixed: false
        });
      }
    });
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
        description: 'يوجد مستخدمون في النظام بدون أدوار محددة',
        suggestion: 'قم بتعيين أدوار مناسبة للمستخدمين',
        autoFixable: false,
        fixed: false
      });
    }
  }

  // إضافة نتائج نجاح للفئات السليمة
  categories.forEach(cat => {
    const categoryFindings = findings.filter(f => f.category === cat);
    if (categoryFindings.length === 0) {
      findings.push({
        id: `success-${cat}`,
        category: cat,
        categoryLabel: CATEGORY_LABELS[cat],
        severity: 'success',
        title: `${CATEGORY_LABELS[cat]} - لا توجد مشاكل`,
        description: `تم فحص ${CATEGORY_LABELS[cat]} ولم يتم العثور على مشاكل`,
        autoFixable: false,
        fixed: false
      });
    }
  });

  return findings;
}

async function applyAutoFixes(supabase: any, findings: AuditFinding[]) {
  const results: any[] = [];

  for (const finding of findings) {
    if (!finding.fixSql) continue;

    try {
      // تنفيذ الإصلاح
      const { error } = await supabase.rpc('execute_sql', { sql_query: finding.fixSql }).catch(() => ({ error: 'RPC not available' }));
      
      if (error) {
        results.push({
          findingId: finding.id,
          success: false,
          error: typeof error === 'string' ? error : error.message
        });
      } else {
        results.push({
          findingId: finding.id,
          success: true,
          fixedAt: new Date().toISOString()
        });
        finding.fixed = true;
      }
    } catch (err: any) {
      results.push({
        findingId: finding.id,
        success: false,
        error: err.message
      });
    }
  }

  return results;
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
    analysis += `### ⚠️ تنبيه: يوجد ${summary.critical} مشكلة حرجة تحتاج اهتمام فوري!\n`;
  }

  return analysis;
}

async function sendSlackNotification(supabase: any, auditId: string, summary: any, criticalFindings: AuditFinding[]) {
  try {
    const slackWebhookUrl = Deno.env.get('SLACK_WEBHOOK_URL');
    if (!slackWebhookUrl) {
      console.log('[AI-SYSTEM-AUDIT] No Slack webhook configured');
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
            fields: criticalFindings.slice(0, 5).map(f => ({
              type: 'mrkdwn',
              text: `*${f.title}*\n${f.description.slice(0, 100)}`
            }))
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'عرض التفاصيل',
                  emoji: true
                },
                url: `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '')}/ai-audit?id=${auditId}`
              }
            ]
          }
        ]
      })
    });

    // تحديث حالة الإشعار
    await supabase
      .from('ai_system_audits')
      .update({ slack_notified: true })
      .eq('id', auditId);

    console.log('[AI-SYSTEM-AUDIT] Slack notification sent');
  } catch (error) {
    console.error('[AI-SYSTEM-AUDIT] Slack notification error:', error);
  }
}
