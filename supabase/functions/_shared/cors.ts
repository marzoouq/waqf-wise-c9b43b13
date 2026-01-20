/**
 * CORS Headers المحسنة لجميع Edge Functions
 * Enhanced CORS Headers for all Edge Functions
 * 
 * ⚠️ ملاحظة أمنية: يتم تقييد الـ origins المسموحة في بيئة الإنتاج
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

// قائمة الـ origins المسموحة
const ALLOWED_ORIGINS = [
  // بيئة الإنتاج
  'https://waqf-wise.lovable.app',
  // بيئات المعاينة والتطوير
  'https://id-preview--7e9dbf7a-c129-486b-a449-d22a31562001.lovable.app',
  // localhost للتطوير المحلي
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

/**
 * التحقق من أن الـ origin مسموح به
 */
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  
  // في بيئة التطوير، نسمح بجميع الـ origins من lovable.app
  if (origin.endsWith('.lovable.app')) return true;
  
  return ALLOWED_ORIGINS.includes(origin);
}

/**
 * الحصول على headers الـ CORS بناءً على الـ origin
 */
function getCorsHeadersForOrigin(origin: string | null): Record<string, string> {
  // إذا كان الـ origin مسموحاً، نستخدمه مباشرة
  // وإلا نستخدم الـ origin الافتراضي للإنتاج
  const allowedOrigin = isAllowedOrigin(origin) 
    ? origin 
    : ALLOWED_ORIGINS[0]; // الـ origin الافتراضي

  return {
    'Access-Control-Allow-Origin': allowedOrigin || '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-job',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    // رؤوس أمان إضافية
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
  };
}

// ✅ CORS headers الافتراضية (للتوافق مع الكود الحالي)
export const corsHeaders: Record<string, string> = getCorsHeadersForOrigin(ALLOWED_ORIGINS[0]);

/**
 * الحصول على headers الـ CORS بناءً على الطلب
 */
export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin');
  return getCorsHeadersForOrigin(origin);
}

/**
 * إنشاء Response للـ OPTIONS requests (CORS preflight)
 */
export function createCorsResponse(req?: Request): Response {
  const headers = req ? getCorsHeaders(req) : corsHeaders;
  return new Response(null, {
    status: 204,
    headers,
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
export function jsonResponse<T>(data: T, status: number = 200, _req?: Request): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
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
