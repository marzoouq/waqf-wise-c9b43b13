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
    'import.meta.env.VITE_APP_VERSION': JSON.stringify('2.9.68'),
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
  
  // ✅ Pre-bundle React والمكتبات التي تعتمد عليها معاً
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'recharts',
      'framer-motion',
      'sonner',
      'next-themes',
      '@tanstack/react-query',
    ],
    exclude: ['jspdf', 'exceljs', 'xlsx'], // تحمّل عند الحاجة فقط
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
        // ✅ manualChunks آمن - فقط المكتبات المستقلة التي لا تعتمد على React
        manualChunks: (id) => {
          // ✅ مكتبات PDF - مستقلة، آمنة للفصل
          if (id.includes('jspdf') || id.includes('autotable')) {
            return 'pdf-lib';
          }
          
          // ✅ مكتبات Excel - مستقلة، آمنة للفصل
          if (id.includes('exceljs') || id.includes('xlsx')) {
            return 'excel-lib';
          }
          
          // ✅ Supabase - مستقل، آمن للفصل
          if (id.includes('@supabase')) {
            return 'supabase-vendor';
          }
          
          // ✅ date-fns - مستقل، آمن للفصل
          if (id.includes('date-fns')) {
            return 'date-vendor';
          }
          
          // ❌ تمت إزالة: recharts, framer-motion, @radix-ui, react-vendor
          // هذه المكتبات تعتمد على React وتُحمَّل معه تلقائياً
          // لتجنب خطأ: Cannot read properties of undefined (reading 'useState')
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  }
}});
