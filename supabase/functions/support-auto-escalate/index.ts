import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { 
  handleCors, 
  jsonResponse, 
  errorResponse 
} from '../_shared/cors.ts';

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // ✅ Health Check / Test Mode Support
    const bodyText = await req.clone().text();
    if (bodyText) {
      try {
        const parsed = JSON.parse(bodyText);
        if (parsed.ping || parsed.healthCheck || parsed.testMode) {
          console.log('[support-auto-escalate] Health check / test mode received');
          return jsonResponse({
            status: 'healthy',
            function: 'support-auto-escalate',
            timestamp: new Date().toISOString(),
            testMode: parsed.testMode || false
          });
        }
      } catch { /* not JSON, continue */ }
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Running auto-escalation for overdue tickets...');

    // استدعاء function التصعيد التلقائي
    const { error: escalationError } = await supabaseClient.rpc('auto_escalate_overdue_tickets');

    if (escalationError) {
      throw escalationError;
    }

    // إرسال إشعارات للتذاكر المتأخرة
    const { data: overdueTickets } = await supabaseClient
      .from('support_tickets')
      .select('id, ticket_number, assigned_to, subject, sla_due_at')
      .eq('is_overdue', true)
      .in('status', ['open', 'in_progress']);

    if (overdueTickets && overdueTickets.length > 0) {
      for (const ticket of overdueTickets) {
        // إنشاء إشعار للموظف المسؤول
        if (ticket.assigned_to) {
          await supabaseClient.rpc('create_notification', {
            p_user_id: ticket.assigned_to,
            p_title: 'تذكرة متأخرة',
            p_message: `التذكرة #${ticket.ticket_number} متأخرة عن موعد SLA`,
            p_type: 'error',
            p_reference_type: 'support_ticket',
            p_reference_id: ticket.id,
            p_action_url: '/support-management'
          });
        }
      }
    }

    console.log(`Processed ${overdueTickets?.length || 0} overdue tickets`);

    return jsonResponse({ 
      success: true, 
      processed: overdueTickets?.length || 0 
    });
  } catch (error) {
    console.error('Error in auto-escalate:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
});
