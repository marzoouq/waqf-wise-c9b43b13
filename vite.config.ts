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
    'import.meta.env.VITE_APP_VERSION': JSON.stringify('2.6.2'),
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
    
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Core React - MUST be first and most specific
            if (id.match(/node_modules[\\/](react|react-dom|scheduler)[\\/]/) && 
                !id.includes('react-router') && 
                !id.includes('react-hook-') &&
                !id.includes('react-day') &&
                !id.includes('react-markdown') &&
                !id.includes('react-is')) {
              return 'react-core';
            }
            
            // React ecosystem libraries (after core React check)
            if (id.includes('react-router')) {
              return 'react-router';
            }
            if (id.includes('react-hook-form') || id.includes('@hookform')) {
              return 'react-forms';
            }
            if (id.includes('react-day-picker') || id.includes('react-markdown') || 
                id.includes('next-themes') || id.includes('sonner')) {
              return 'react-ui-libs';
            }
            
            // Radix UI - critical UI components
            if (id.includes('@radix-ui')) {
              if (id.includes('dialog') || id.includes('dropdown-menu') || 
                  id.includes('select') || id.includes('popover')) {
                return 'radix-core';
              }
              return 'radix-extended';
            }
            
            // Query & State Management
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
            
            // Form validation
            if (id.includes('zod')) {
              return 'validation';
            }
            
            // Date utilities
            if (id.includes('date-fns')) {
              return 'date-utils';
            }
            
            // PDF - lazy loaded
            if (id.includes('jspdf')) {
              return 'pdf-lib';
            }
            
            // Excel - lazy loaded
            if (id.includes('xlsx')) {
              return 'excel-lib';
            }
            
            // Icons
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            
            // Utility libraries
            if (id.includes('clsx') || id.includes('tailwind-merge') || 
                id.includes('class-variance-authority')) {
              return 'ui-utils';
            }
            
            // Command menu (cmdk) - used in GlobalSearch
            if (id.includes('cmdk')) {
              return 'ui-command';
            }
            
            // Drawer (vaul) - used in ResponsiveDialog
            if (id.includes('vaul')) {
              return 'ui-drawer';
            }
            
            // QR Code generation
            if (id.includes('qrcode')) {
              return 'qr-lib';
            }
            
            // Markdown rendering
            if (id.includes('react-markdown') || id.includes('remark-gfm')) {
              return 'markdown-lib';
            }
            
            // Monitoring (Sentry)
            if (id.includes('@sentry')) {
              return 'monitoring';
            }
            
            // Small utilities and everything else
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
