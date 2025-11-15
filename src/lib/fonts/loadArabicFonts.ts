// تحميل الخطوط العربية من CDN وتحويلها إلى Base64
// يتم التخزين المؤقت لتحسين الأداء

interface FontCache {
  regular: string | null;
  bold: string | null;
}

const fontCache: FontCache = {
  regular: null,
  bold: null,
};

/**
 * تحميل خط من رابط مباشر وتحويله إلى Base64
 * ملاحظة: jsPDF يدعم فقط ملفات TTF
 */
async function fetchFontAsBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch font: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    // تحويل إلى Base64
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    return btoa(binary);
  } catch (error) {
    console.error('Error loading font:', error);
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

  // رابط مباشر لخط Amiri Regular (TTF) من jsDelivr CDN
  const fontUrl = 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/amiri/Amiri-Regular.ttf';
  
  fontCache.regular = await fetchFontAsBase64(fontUrl);
  return fontCache.regular;
}

/**
 * تحميل خط Amiri Bold
 */
export async function loadAmiriBold(): Promise<string> {
  if (fontCache.bold) {
    return fontCache.bold;
  }

  // رابط مباشر لخط Amiri Bold (TTF) من jsDelivr CDN
  const fontUrl = 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/amiri/Amiri-Bold.ttf';
  
  fontCache.bold = await fetchFontAsBase64(fontUrl);
  return fontCache.bold;
}

/**
 * تحميل كلا الخطين مرة واحدة
 */
export async function loadAmiriFonts(): Promise<{ regular: string; bold: string }> {
  const [regular, bold] = await Promise.all([
    loadAmiriRegular(),
    loadAmiriBold(),
  ]);

  return { regular, bold };
}

/**
 * مسح الذاكرة المؤقتة للخطوط
 */
export function clearFontCache(): void {
  fontCache.regular = null;
  fontCache.bold = null;
}
