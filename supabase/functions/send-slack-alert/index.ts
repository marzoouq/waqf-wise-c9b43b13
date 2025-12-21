import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SlackMessage {
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  fields?: { label: string; value: string }[];
  actionUrl?: string;
  actionLabel?: string;
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
          console.log('[send-slack-alert] Health check received');
          return new Response(JSON.stringify({
            status: 'healthy',
            function: 'send-slack-alert',
            timestamp: new Date().toISOString()
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      } catch { /* not JSON, continue */ }
    }
    const slackWebhookUrl = Deno.env.get('SLACK_WEBHOOK_URL');
    
    if (!slackWebhookUrl) {
      console.log('[SLACK-ALERT] No webhook URL configured');
      return new Response(JSON.stringify({
        success: false,
        error: 'Slack webhook URL not configured'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { title, message, severity, fields, actionUrl, actionLabel }: SlackMessage = await req.json();

    // تحديد اللون حسب الخطورة
    const colorMap: Record<string, string> = {
      critical: '#FF0000',
      warning: '#FFA500',
      info: '#0000FF',
      success: '#00FF00'
    };

    const emojiMap: Record<string, string> = {
      critical: '🚨',
      warning: '⚠️',
      info: 'ℹ️',
      success: '✅'
    };

    // بناء رسالة Slack
    const blocks: any[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${emojiMap[severity]} ${title}`,
          emoji: true
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: message
        }
      }
    ];

    // إضافة الحقول إن وجدت
    if (fields && fields.length > 0) {
      blocks.push({
        type: 'section',
        fields: fields.map(f => ({
          type: 'mrkdwn',
          text: `*${f.label}:*\n${f.value}`
        }))
      });
    }

    // إضافة زر العمل إن وجد
    if (actionUrl) {
      blocks.push({
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: actionLabel || 'عرض التفاصيل',
              emoji: true
            },
            url: actionUrl,
            style: severity === 'critical' ? 'danger' : 'primary'
          }
        ]
      });
    }

    // إضافة الفاصل والوقت
    blocks.push(
      { type: 'divider' },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `📅 ${new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })} | نظام إدارة الوقف`
          }
        ]
      }
    );

    // إرسال الرسالة
    const response = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attachments: [
          {
            color: colorMap[severity],
            blocks
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status}`);
    }

    console.log('[SLACK-ALERT] Message sent successfully');

    return new Response(JSON.stringify({
      success: true,
      message: 'Slack notification sent'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[SLACK-ALERT] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: errMsg
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
