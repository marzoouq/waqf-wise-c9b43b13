/**
 * اختبارات أداء الخطوط والموارد
 * Performance Tests: Fonts & Resource Loading
 * 
 * هذه الاختبارات تمنع حدوث مشاكل الخطوط الفاشلة مرة أخرى (Regression Testing)
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

describe('Performance: Fonts & Resource Loading', () => {
  
  describe('Preload Links Validation', () => {
    it('should not have node_modules paths in preload links', () => {
      const indexHtmlPath = resolve(process.cwd(), 'index.html');
      
      if (existsSync(indexHtmlPath)) {
        const htmlContent = readFileSync(indexHtmlPath, 'utf-8');
        
        // استخراج جميع روابط preload
        const preloadMatches = htmlContent.match(/<link[^>]*rel=["']preload["'][^>]*>/gi) || [];
        
        preloadMatches.forEach(link => {
          // التأكد من عدم وجود node_modules في href
          expect(link).not.toContain('node_modules');
          expect(link).not.toContain('/node_modules/');
        });
      }
    });

    it('should not preload fonts from invalid paths', () => {
      const indexHtmlPath = resolve(process.cwd(), 'index.html');
      
      if (existsSync(indexHtmlPath)) {
        const htmlContent = readFileSync(indexHtmlPath, 'utf-8');
        
        // استخراج روابط preload للخطوط
        const fontPreloads = htmlContent.match(/<link[^>]*rel=["']preload["'][^>]*as=["']font["'][^>]*>/gi) || [];
        
        fontPreloads.forEach(link => {
          // التأكد من أن المسارات صحيحة (تبدأ بـ /assets/ أو https://)
          const hrefMatch = link.match(/href=["']([^"']+)["']/);
          if (hrefMatch) {
            const href = hrefMatch[1];
            const isValidPath = href.startsWith('/assets/') || 
                               href.startsWith('https://fonts.') ||
                               href.startsWith('https://cdn.');
            expect(isValidPath).toBe(true);
          }
        });
      }
    });
  });

  describe('Font Loading Configuration', () => {
    it('should use font-display: swap for Cairo font in CSS', () => {
      const indexCssPath = resolve(process.cwd(), 'src/index.css');
      
      if (existsSync(indexCssPath)) {
        const cssContent = readFileSync(indexCssPath, 'utf-8');
        
        // إذا كان هناك @font-face، يجب أن يحتوي على font-display: swap
        const fontFaceMatches = cssContent.match(/@font-face\s*\{[^}]+\}/gi) || [];
        
        fontFaceMatches.forEach(fontFace => {
          // كل @font-face يجب أن يحتوي على font-display
          if (fontFace.toLowerCase().includes('cairo')) {
            expect(fontFace).toMatch(/font-display:\s*(swap|optional|fallback)/i);
          }
        });
      }
    });

    it('should have Google Fonts link with display=swap parameter', () => {
      const indexHtmlPath = resolve(process.cwd(), 'index.html');
      
      if (existsSync(indexHtmlPath)) {
        const htmlContent = readFileSync(indexHtmlPath, 'utf-8');
        
        // البحث عن روابط Google Fonts
        const googleFontsLinks = htmlContent.match(/https:\/\/fonts\.googleapis\.com[^"'\s]*/gi) || [];
        
        googleFontsLinks.forEach(link => {
          // يجب أن تحتوي على display=swap
          expect(link).toContain('display=swap');
        });
      }
    });
  });

  describe('Headers Configuration for CORS', () => {
    it('should have correct CORS headers for font files in _headers', () => {
      const headersPath = resolve(process.cwd(), 'public/_headers');
      
      if (existsSync(headersPath)) {
        const headersContent = readFileSync(headersPath, 'utf-8');
        
        // التحقق من وجود قواعد للخطوط
        expect(headersContent).toContain('/assets/*.woff2');
        expect(headersContent).toContain('Access-Control-Allow-Origin: *');
        expect(headersContent).toContain('Cross-Origin-Resource-Policy: cross-origin');
      }
    });

    it('should have immutable cache for font files', () => {
      const headersPath = resolve(process.cwd(), 'public/_headers');
      
      if (existsSync(headersPath)) {
        const headersContent = readFileSync(headersPath, 'utf-8');
        
        // التحقق من وجود cache headers صحيحة
        expect(headersContent).toContain('Cache-Control: public, max-age=31536000, immutable');
      }
    });

    it('should have cross-origin resource policy for assets', () => {
      const headersPath = resolve(process.cwd(), 'public/_headers');
      
      if (existsSync(headersPath)) {
        const headersContent = readFileSync(headersPath, 'utf-8');
        
        // التحقق من CORP header
        expect(headersContent).toContain('Cross-Origin-Resource-Policy: cross-origin');
      }
    });
  });

  describe('Font File Structure', () => {
    it('should have @fontsource/cairo in dependencies or configured properly', () => {
      const packageJsonPath = resolve(process.cwd(), 'package.json');
      
      if (existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
        
        // التحقق من وجود خط Cairo إما كـ dependency أو Google Fonts
        const hasCairoDep = packageJson.dependencies?.['@fontsource/cairo'];
        
        // إذا لم يكن موجوداً كـ dependency، يجب أن يكون في index.html
        if (!hasCairoDep) {
          const indexHtmlPath = resolve(process.cwd(), 'index.html');
          if (existsSync(indexHtmlPath)) {
            const htmlContent = readFileSync(indexHtmlPath, 'utf-8');
            // يجب أن يكون هناك رابط Google Fonts لـ Cairo
            const hasGoogleFontsCairo = htmlContent.includes('Cairo') || 
                                        htmlContent.includes('cairo');
            expect(hasGoogleFontsCairo || hasCairoDep).toBe(true);
          }
        }
      }
    });
  });

  describe('Performance Budget', () => {
    it('should not exceed font preload count threshold', () => {
      const indexHtmlPath = resolve(process.cwd(), 'index.html');
      
      if (existsSync(indexHtmlPath)) {
        const htmlContent = readFileSync(indexHtmlPath, 'utf-8');
        
        // استخراج عدد روابط preload للخطوط
        const fontPreloads = htmlContent.match(/<link[^>]*rel=["']preload["'][^>]*as=["']font["'][^>]*>/gi) || [];
        
        // يجب ألا تتجاوز 5 خطوط preloaded
        expect(fontPreloads.length).toBeLessThanOrEqual(5);
      }
    });

    it('should not have duplicate font preloads', () => {
      const indexHtmlPath = resolve(process.cwd(), 'index.html');
      
      if (existsSync(indexHtmlPath)) {
        const htmlContent = readFileSync(indexHtmlPath, 'utf-8');
        
        // استخراج روابط preload للخطوط
        const fontPreloads = htmlContent.match(/<link[^>]*rel=["']preload["'][^>]*as=["']font["'][^>]*href=["']([^"']+)["'][^>]*>/gi) || [];
        
        // استخراج الـ hrefs فقط
        const hrefs = fontPreloads.map(link => {
          const match = link.match(/href=["']([^"']+)["']/);
          return match ? match[1] : '';
        }).filter(Boolean);
        
        // التأكد من عدم وجود تكرار
        const uniqueHrefs = [...new Set(hrefs)];
        expect(hrefs.length).toBe(uniqueHrefs.length);
      }
    });
  });
});
