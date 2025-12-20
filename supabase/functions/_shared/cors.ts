/**
 * CORS Headers المحسنة لجميع Edge Functions
 * Enhanced CORS Headers for all Edge Functions
 * 
 * @example
 * import { corsHeaders, handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
 * 
 * Deno.serve(async (req) => {
 *   const corsResponse = handleCors(req);
 *   if (corsResponse) return corsResponse;
 *   
 *   try {
 *     // ... your logic
 *     return jsonResponse({ success: true });
 *   } catch (error) {
 *     return errorResponse('Something went wrong', 500);
 *   }
 * });
 */

// النطاقات المسموح بها
const ALLOWED_ORIGINS = [
  // Production
  'https://waqf-platform.lovable.app',
  'https://zsacuvrcohmraoldilph.lovable.app',
  // Development
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8080',
  // Lovable preview domains
  /^https:\/\/[a-z0-9-]+\.lovableproject\.com$/,
  /^https:\/\/[a-z0-9-]+\.lovable\.app$/,
  /^https:\/\/preview--[a-z0-9-]+\.lovable\.app$/,
];

/**
 * التحقق من أن Origin مسموح به
 */
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  
  return ALLOWED_ORIGINS.some(allowed => {
    if (typeof allowed === 'string') {
      return origin === allowed;
    }
    // RegExp
    return allowed.test(origin);
  });
}

/**
 * الحصول على Origin المسموح به للاستجابة
 */
function getAllowedOrigin(req: Request): string {
  const origin = req.headers.get('Origin');
  
  if (origin && isOriginAllowed(origin)) {
    return origin;
  }
  
  // في حالة عدم وجود Origin أو غير مسموح، نستخدم أول نطاق إنتاجي
  return 'https://waqf-platform.lovable.app';
}

/**
 * إنشاء CORS Headers ديناميكية
 */
export function getCorsHeaders(req: Request): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': getAllowedOrigin(req),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    // رؤوس أمان إضافية
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
  };
}

// ⚠️ DEPRECATED: استخدم getCorsHeaders(req) بدلاً من corsHeaders
// الحفاظ على التوافق مع الكود الحالي - لكن مع تحذير
/** @deprecated Use getCorsHeaders(req) instead for better security */
export const corsHeaders = getCorsHeaders(new Request('https://waqf-platform.lovable.app'));

/**
 * إنشاء Response للـ OPTIONS requests (CORS preflight)
 */
export function createCorsResponse(req?: Request): Response {
  const headers = req ? getCorsHeaders(req) : corsHeaders;
  return new Response(null, { 
    status: 204,
    headers 
  });
}

/**
 * معالجة CORS preflight request
 * استخدمه في بداية كل Edge Function
 * @returns Response if OPTIONS request, null otherwise
 */
export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return createCorsResponse(req);
  }
  return null;
}

/**
 * إنشاء JSON Response مع CORS headers
 */
export function jsonResponse<T>(
  data: T, 
  status: number = 200,
  req?: Request
): Response {
  const headers = req ? getCorsHeaders(req) : corsHeaders;
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
}

/**
 * إنشاء Success Response مع CORS headers
 */
export function successResponse<T>(
  data: T,
  message?: string,
  req?: Request
): Response {
  return jsonResponse({
    success: true,
    message,
    ...data,
  }, 200, req);
}

/**
 * إنشاء Error Response مع CORS headers
 */
export function errorResponse(
  message: string, 
  status: number = 400,
  details?: unknown,
  req?: Request
): Response {
  const headers = req ? getCorsHeaders(req) : corsHeaders;
  return new Response(JSON.stringify({ 
    success: false,
    error: message,
    details 
  }), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
}

/**
 * إنشاء Unauthorized Response
 */
export function unauthorizedResponse(message: string = 'غير مصرح', req?: Request): Response {
  return errorResponse(message, 401, undefined, req);
}

/**
 * إنشاء Forbidden Response
 */
export function forbiddenResponse(message: string = 'ليس لديك صلاحية', req?: Request): Response {
  return errorResponse(message, 403, undefined, req);
}

/**
 * إنشاء Not Found Response
 */
export function notFoundResponse(message: string = 'غير موجود', req?: Request): Response {
  return errorResponse(message, 404, undefined, req);
}

/**
 * إنشاء Rate Limit Response
 */
export function rateLimitResponse(message: string = 'تجاوزت الحد المسموح', req?: Request): Response {
  return errorResponse(message, 429, undefined, req);
}

/**
 * إنشاء Server Error Response
 */
export function serverErrorResponse(message: string = 'حدث خطأ في الخادم', req?: Request): Response {
  return errorResponse(message, 500, undefined, req);
}
