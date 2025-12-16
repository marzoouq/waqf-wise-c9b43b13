import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
  logLevel: 'warn',
  
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify('2.9.25'),
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
  ].filter(Boolean),
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  build: {
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: false,
    assetsInlineLimit: 4096,
    modulePreload: {
      polyfill: false,
    },
    
    rollupOptions: {
      output: {
        // ✅ تحسين تقسيم الكود - فصل المكتبات الكبيرة
        manualChunks: (id) => {
          // مكتبات PDF - تحمّل عند الحاجة فقط
          if (id.includes('jspdf') || id.includes('autotable')) {
            return 'pdf-lib';
          }
          // مكتبات Excel - تحمّل عند الحاجة فقط
          if (id.includes('exceljs') || id.includes('xlsx')) {
            return 'excel-lib';
          }
          // مكتبات React الأساسية
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-vendor';
          }
          // مكتبات Radix UI
          if (id.includes('@radix-ui')) {
            return 'ui-vendor';
          }
          // Supabase
          if (id.includes('@supabase')) {
            return 'supabase-vendor';
          }
          // TanStack Query
          if (id.includes('@tanstack')) {
            return 'tanstack-vendor';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  }
}});
