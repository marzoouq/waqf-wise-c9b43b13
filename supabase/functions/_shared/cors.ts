/**
 * CORS Headers المشتركة لجميع Edge Functions
 * Shared CORS Headers for all Edge Functions
 */

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
 * إنشاء JSON Response مع CORS headers
 */
export function jsonResponse(
  data: unknown, 
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
 * إنشاء Error Response مع CORS headers
 */
export function errorResponse(
  message: string, 
  status: number = 400
): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

/**
 * معالجة CORS preflight request
 * استخدمه في بداية كل Edge Function
 */
export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return createCorsResponse();
  }
  return null;
}
