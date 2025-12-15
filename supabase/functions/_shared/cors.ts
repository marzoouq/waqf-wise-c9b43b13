/**
 * CORS Headers المشتركة لجميع Edge Functions
 * Shared CORS Headers for all Edge Functions
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

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  // رؤوس أمان إضافية
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
};

/**
 * إنشاء Response للـ OPTIONS requests (CORS preflight)
 */
export function createCorsResponse(): Response {
  return new Response(null, { 
    status: 204,
    headers: corsHeaders 
  });
}

/**
 * معالجة CORS preflight request
 * استخدمه في بداية كل Edge Function
 * @returns Response if OPTIONS request, null otherwise
 */
export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return createCorsResponse();
  }
  return null;
}

/**
 * إنشاء JSON Response مع CORS headers
 */
export function jsonResponse<T>(
  data: T, 
  status: number = 200
): Response {
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
  message?: string
): Response {
  return jsonResponse({
    success: true,
    message,
    ...data,
  });
}

/**
 * إنشاء Error Response مع CORS headers
 */
export function errorResponse(
  message: string, 
  status: number = 400,
  details?: unknown
): Response {
  return new Response(JSON.stringify({ 
    success: false,
    error: message,
    details 
  }), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

/**
 * إنشاء Unauthorized Response
 */
export function unauthorizedResponse(message: string = 'غير مصرح'): Response {
  return errorResponse(message, 401);
}

/**
 * إنشاء Forbidden Response
 */
export function forbiddenResponse(message: string = 'ليس لديك صلاحية'): Response {
  return errorResponse(message, 403);
}

/**
 * إنشاء Not Found Response
 */
export function notFoundResponse(message: string = 'غير موجود'): Response {
  return errorResponse(message, 404);
}

/**
 * إنشاء Rate Limit Response
 */
export function rateLimitResponse(message: string = 'تجاوزت الحد المسموح'): Response {
  return errorResponse(message, 429);
}

/**
 * إنشاء Server Error Response
 */
export function serverErrorResponse(message: string = 'حدث خطأ في الخادم'): Response {
  return errorResponse(message, 500);
}
