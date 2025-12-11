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
    'import.meta.env.VITE_APP_VERSION': JSON.stringify('2.8.87'),
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
        // ✅ تبسيط جذري - فقط فصل المكتبات الكبيرة التي تُحمّل كسولاً
        manualChunks: {
          // PDF و Excel فقط - لأنها تُحمّل عند الحاجة
          'pdf-lib': ['jspdf', 'jspdf-autotable'],
          'excel-lib': ['exceljs', 'xlsx'],
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  }
}});
