/**
 * Hook لتسجيل الأخطاء العامة
 * Global Error Logging Hook
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface ErrorInfo {
  componentStack?: string;
}

export async function logErrorToSupport(
  error: Error, 
  errorInfo: ErrorInfo,
  errorCount: number
) {
  try {
    await supabase.functions.invoke('log-error', {
      body: {
        error_type: 'react_component_error',
        error_message: error.message,
        error_stack: error.stack,
        severity: 'critical',
        url: window.location.href,
        user_agent: navigator.userAgent,
        additional_data: {
          component_stack: errorInfo.componentStack,
          error_count: errorCount,
        },
      },
    });
    
    logger.info('✅ Error logged to support team successfully');
  } catch (notifyError) {
    logger.error(notifyError, { 
      context: 'notify_support_team_failed', 
      severity: 'low'
    });
  }
}
