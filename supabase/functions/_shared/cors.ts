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

// ✅ CORS عام (لأن الاستدعاءات تعتمد على Authorization header وليست cookies)
// هذا يحل مشكلة فشل الاستدعاء في بيئات المعاينة (CORS mismatch)
export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  // رؤوس أمان إضافية
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
};

/**
 * ✅ (اختياري) حافظنا على الدالة لتوافق الواجهات، لكنها الآن تُرجع نفس الرؤوس العامة
 */
export function getCorsHeaders(_req: Request): Record<string, string> {
  return corsHeaders;
}

/**
 * إنشاء Response للـ OPTIONS requests (CORS preflight)
 */
export function createCorsResponse(_req?: Request): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
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
