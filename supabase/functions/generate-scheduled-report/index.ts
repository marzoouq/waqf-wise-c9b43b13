import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
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

    console.log('Starting scheduled report generation...');

    // الحصول على التقارير المجدولة النشطة التي حان وقت تشغيلها
    const { data: jobs, error: jobsError } = await supabaseClient
      .from('scheduled_report_jobs')
      .select(`
        *,
        report_template:report_template_id(*)
      `)
      .eq('is_active', true)
      .lte('next_run_at', new Date().toISOString());

    if (jobsError) {
      throw new Error(`Error fetching jobs: ${jobsError.message}`);
    }

    console.log(`Found ${jobs?.length || 0} jobs to process`);

    const results = [];

    for (const job of jobs || []) {
      try {
        console.log(`Processing job: ${job.id}`);

        // تنفيذ التقرير بناءً على نوعه
        interface ReportData {
          transactions?: unknown[] | null;
          beneficiaries?: unknown[] | null;
          properties?: unknown[] | null;
          summary: {
            count?: number;
            total?: number;
          };
        }
        
        let reportData: ReportData = { summary: {} };
        const template = job.report_template;

        if (template.report_type === 'financial') {
          // تقرير مالي
          const { data: transactions } = await supabaseClient
            .from('journal_entries')
            .select('*')
            .gte('entry_date', template.configuration.date_from)
            .lte('entry_date', template.configuration.date_to);
          
          reportData = { transactions, summary: { count: transactions?.length || 0 } };
        } else if (template.report_type === 'beneficiary') {
          // تقرير مستفيدين
          const { data: beneficiaries } = await supabaseClient
            .from('beneficiaries')
            .select('*');
          
          reportData = { beneficiaries, summary: { total: beneficiaries?.length || 0 } };
        } else if (template.report_type === 'property') {
          // تقرير عقارات
          const { data: properties } = await supabaseClient
            .from('properties')
            .select('*, contracts(*)');
          
          reportData = { properties, summary: { total: properties?.length || 0 } };
        }

        // حفظ التقرير في الأرشيف
        const reportFile = {
          name: `${template.name}_${new Date().toISOString()}.json`,
          content: JSON.stringify(reportData, null, 2)
        };

        // إرسال التقرير للمستلمين
        interface Recipient {
          user_id: string;
          email: string;
          name?: string;
        }
        
        const recipients = (job.recipients || []) as Recipient[];
        for (const recipient of recipients) {
          if (job.delivery_method === 'email' || job.delivery_method === 'both') {
            // إرسال بريد إلكتروني
            console.log(`Sending report to email: ${recipient.email}`);
          }

          // إنشاء إشعار
          await supabaseClient.from('notifications').insert({
            user_id: recipient.user_id,
            title: 'تقرير مجدول جاهز',
            message: `تم إنشاء التقرير: ${template.name}`,
            type: 'info',
            reference_type: 'report',
            reference_id: job.id
          });
        }

        // تحديث Job
        const nextRun = calculateNextRun(job.schedule_type, job.cron_expression);
        await supabaseClient
          .from('scheduled_report_jobs')
          .update({
            last_run_at: new Date().toISOString(),
            next_run_at: nextRun
          })
          .eq('id', job.id);

        results.push({ job_id: job.id, success: true });

      } catch (error) {
        console.error(`Error processing job ${job.id}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({ job_id: job.id, success: false, error: errorMessage });
      }
    }

    return jsonResponse({
      success: true,
      message: `Processed ${results.length} jobs`,
      results
    });

  } catch (error) {
    console.error('Error in generate-scheduled-report:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
});

function calculateNextRun(scheduleType: string, cronExpression?: string): string {
  const now = new Date();
  
  switch (scheduleType) {
    case 'daily':
      now.setDate(now.getDate() + 1);
      break;
    case 'weekly':
      now.setDate(now.getDate() + 7);
      break;
    case 'monthly':
      now.setMonth(now.getMonth() + 1);
      break;
    default:
      now.setDate(now.getDate() + 1);
  }
  
  return now.toISOString();
}
