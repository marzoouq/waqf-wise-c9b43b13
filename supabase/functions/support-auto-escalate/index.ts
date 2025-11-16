import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
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

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: overdueTickets?.length || 0 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in auto-escalate:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
