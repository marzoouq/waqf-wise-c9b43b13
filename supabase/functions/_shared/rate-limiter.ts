/**
 * Rate Limiter للـ Edge Functions
 * يمنع الهجمات من خلال تحديد عدد الطلبات المسموحة
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// تخزين مؤقت في الذاكرة (يُعاد تهيئته مع كل cold start)
const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  maxRequests: number;      // الحد الأقصى للطلبات
  windowMs: number;         // النافذة الزمنية بالميلي ثانية
  keyPrefix?: string;       // بادئة المفتاح
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

/**
 * فحص Rate Limit
 */
export function checkRateLimit(
  identifier: string, 
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = config.keyPrefix ? `${config.keyPrefix}:${identifier}` : identifier;
  
  // تنظيف الإدخالات المنتهية
  cleanupExpiredEntries(now);
  
  const entry = rateLimitStore.get(key);
  
  if (!entry || entry.resetAt < now) {
    // إدخال جديد أو منتهي الصلاحية
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + config.windowMs
    };
    rateLimitStore.set(key, newEntry);
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: newEntry.resetAt
    };
  }
  
  // تحديث الإدخال الموجود
  entry.count++;
  
  if (entry.count > config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000)
    };
  }
  
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt
  };
}

/**
 * تنظيف الإدخالات المنتهية
 */
function cleanupExpiredEntries(now: number): void {
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * إنشاء استجابة Rate Limit
 */
export function createRateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'تجاوزت الحد المسموح من الطلبات',
      message: `يرجى الانتظار ${result.retryAfter} ثانية قبل المحاولة مرة أخرى`,
      retryAfter: result.retryAfter
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': result.resetAt.toString(),
        'Retry-After': (result.retryAfter || 60).toString(),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    }
  );
}

/**
 * استخراج معرف العميل من الطلب
 */
export function getClientIdentifier(req: Request): string {
  // أولوية: IP Address -> Authorization Token -> User-Agent
  const forwarded = req.headers.get('X-Forwarded-For');
  const realIp = req.headers.get('X-Real-IP');
  const authHeader = req.headers.get('Authorization');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  if (authHeader) {
    // استخدام hash من التوكن بدلاً من التوكن نفسه
    return `auth:${authHeader.slice(-16)}`;
  }
  
  return `ua:${req.headers.get('User-Agent')?.slice(0, 50) || 'unknown'}`;
}

// تكوينات Rate Limit المحددة مسبقاً
export const RATE_LIMITS = {
  // العمليات الحساسة: 5 طلبات كل 15 دقيقة
  SENSITIVE: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000 // 15 دقيقة
  },
  // العمليات العادية: 30 طلب في الدقيقة
  NORMAL: {
    maxRequests: 30,
    windowMs: 60 * 1000 // دقيقة واحدة
  },
  // العمليات المتكررة: 100 طلب في الدقيقة
  HIGH: {
    maxRequests: 100,
    windowMs: 60 * 1000 // دقيقة واحدة
  }
} as const;
