import { useState } from 'react';
import { logger } from '@/lib/logger';
import { checkRateLimit, logLoginAttempt as logLoginAttemptWrapper } from '@/lib/supabase-wrappers';

interface RateLimitResult {
  allowed: boolean;
  remainingAttempts?: number;
  resetTime?: Date;
}

/**
 * Hook للتحقق من Rate Limiting
 */
export function useRateLimit() {
  const [isChecking, setIsChecking] = useState(false);

  /**
   * التحقق من إمكانية تسجيل الدخول
   */
  const checkLoginRateLimit = async (
    userId: string,
    maxAttempts: number = 5,
    timeWindowMinutes: number = 15
  ): Promise<RateLimitResult> => {
    setIsChecking(true);
    
    try {
      const result = await checkRateLimit({
        userId,
        actionType: 'login',
        limit: maxAttempts,
        windowMinutes: timeWindowMinutes,
      });

      if (result.error) {
        logger.error(result.error, { context: 'rate_limit_check', severity: 'medium' });
        return { allowed: true }; // في حالة الخطأ، نسمح بالمحاولة
      }

      return {
        allowed: result.data || false,
        remainingAttempts: result.data ? undefined : 0,
        resetTime: result.data ? undefined : new Date(Date.now() + timeWindowMinutes * 60000),
      };
    } catch (error) {
      logger.error(error, { context: 'rate_limit_general', severity: 'medium' });
      return { allowed: true };
    } finally {
      setIsChecking(false);
    }
  };

  /**
   * تسجيل محاولة تسجيل دخول
   */
  const logLoginAttempt = async (userId: string, success: boolean): Promise<void> => {
    try {
      const ipAddress = await getClientIP();
      
      await logLoginAttemptWrapper({
        userId,
        success,
        ipAddress,
        userAgent: navigator.userAgent,
      });
    } catch (error) {
      logger.error(error, { context: 'log_login_attempt', severity: 'low' });
    }
  };

  return {
    checkLoginRateLimit,
    logLoginAttempt,
    isChecking,
  };
}

/**
 * الحصول على IP العميل
 */
async function getClientIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'unknown';
  } catch {
    return 'unknown';
  }
}
