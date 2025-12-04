// تحميل الخطوط العربية من المجلد المحلي
// يتم التخزين المؤقت لتحسين الأداء

import { logger } from '@/lib/logger';

interface FontCache {
  regular: string | null;
  bold: string | null;
}

const fontCache: FontCache = {
  regular: null,
  bold: null,
};

/**
 * تحميل خط من رابط وتحويله إلى Base64
 */
async function fetchFontAsBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    
    if (arrayBuffer.byteLength < 1000) {
      throw new Error('Font file too small, might be corrupted');
    }
    
    const bytes = new Uint8Array(arrayBuffer);
    
    // تحويل إلى Base64 باستخدام طريقة أكثر موثوقية
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    const base64 = btoa(binary);
    
    logger.info(`Font loaded: ${url}, size: ${len} bytes, base64 length: ${base64.length}`, {
      context: 'font_load_success'
    });
    
    return base64;
  } catch (error) {
    logger.error(`Failed to load font from ${url}`, { 
      context: 'font_load_error',
      metadata: { error: String(error) }
    });
    throw error;
  }
}

/**
 * تحميل خط Amiri Regular
 */
export async function loadAmiriRegular(): Promise<string> {
  if (fontCache.regular) {
    return fontCache.regular;
  }

  // تحميل من المجلد المحلي
  fontCache.regular = await fetchFontAsBase64('/fonts/Amiri-Regular.ttf');
  return fontCache.regular;
}

/**
 * تحميل خط Amiri Bold (يستخدم Regular كـ fallback)
 */
export async function loadAmiriBold(): Promise<string> {
  if (fontCache.bold) {
    return fontCache.bold;
  }

  // استخدام Regular لـ Bold أيضاً (لأن Bold غير متوفر حالياً)
  fontCache.bold = await loadAmiriRegular();
  return fontCache.bold;
}

/**
 * تحميل كلا الخطين مرة واحدة
 */
export async function loadAmiriFonts(): Promise<{ regular: string; bold: string }> {
  const regular = await loadAmiriRegular();
  return { regular, bold: regular }; // استخدام نفس الخط للعادي والعريض
}

/**
 * مسح الذاكرة المؤقتة للخطوط
 */
export function clearFontCache(): void {
  fontCache.regular = null;
  fontCache.bold = null;
}
