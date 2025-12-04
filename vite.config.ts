import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // ✅ استخدام الـ mode الممرر من الأمر (build:dev الآن يُرسل production)
  const isProduction = mode === 'production';
  
  return {
  // ✅ تقليل مخرجات البناء - إظهار التحذيرات والأخطاء فقط
  logLevel: 'warn',
  
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify('2.6.11'),
    'import.meta.env.VITE_BUILD_TIME': JSON.stringify(new Date().toISOString()),
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    // ❌ PWA معطّل لأن Lovable Cloud لا يدعمه بشكل كامل
  ].filter(Boolean),
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  build: {
    // Target modern browsers to avoid unnecessary polyfills
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    
    // Use esbuild for minification (faster and built-in)
    minify: true,
    
    // ✅ تقليل مخرجات البناء
    chunkSizeWarningLimit: 1000, // زيادة الحد لتقليل التحذيرات
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: false, // إيقاف حساب gzip لتسريع البناء
    
    // ✅ تفعيل Long-term caching headers
    assetsInlineLimit: 4096, // Inline assets < 4KB
    modulePreload: {
      polyfill: false, // Modern browsers only
    },
    
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // ✅ React و react-dom و react-is يذهبون لـ vendor تلقائياً
            // هذا يضمن تحميلهم معاً قبل أي مكتبة تعتمد عليهم
            
            // React Router - chunk منفصل
            if (id.includes('react-router')) {
              return 'react-router';
            }
            
            // React Forms
            if (id.includes('react-hook-form') || id.includes('@hookform')) {
              return 'react-forms';
            }
            
            // ✅ Radix UI يذهب لـ vendor مع React لضمان ترتيب التحميل الصحيح
            
            // React Query
            if (id.includes('@tanstack/react-query')) {
              return 'react-query';
            }
            
            // Supabase
            if (id.includes('@supabase/supabase-js')) {
              return 'supabase';
            }
            
            // Charts - lazy loaded
            if (id.includes('recharts')) {
              return 'charts';
            }
            
            // Animations - lazy loaded
            if (id.includes('framer-motion')) {
              return 'animations';
            }
            
            // PDF - lazy loaded
            if (id.includes('jspdf')) {
              return 'pdf-lib';
            }
            
            // Excel - lazy loaded
            if (id.includes('xlsx')) {
              return 'excel-lib';
            }
            
            // Monitoring (Sentry)
            if (id.includes('@sentry')) {
              return 'monitoring';
            }
            
            // كل شيء آخر (بما في ذلك React, next-themes, sonner) → vendor
            return 'vendor';
          }
        },
        // Optimize chunk sizes
        chunkFileNames: (chunkInfo) => {
          const name = chunkInfo.name;
          // Add hash for cache busting
          return `assets/${name}-[hash].js`;
        }
      }
    }
  }
}});
