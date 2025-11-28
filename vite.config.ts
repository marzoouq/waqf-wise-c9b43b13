import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // ✅ فرض وضع الإنتاج دائماً للبناء
  const isProduction = true; // Force production optimizations
  
  return {
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify('2.5.0'),
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
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'robots.txt', 'placeholder.svg'],
      
      manifest: {
        name: 'منصة إدارة الوقف الإلكترونية',
        short_name: 'نظام الوقف',
        description: 'نظام إلكتروني متكامل لإدارة الأوقاف الإسلامية',
        theme_color: '#047857',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        dir: 'rtl',
        lang: 'ar',
        icons: [
          {
            src: '/pwa-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,woff}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/functions/],
        
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/zsacuvrcohmraoldilph\.supabase\.co\/functions\/v1\/log-error$/i,
            handler: 'NetworkOnly',
            options: {
              networkTimeoutSeconds: 15
            }
          },
          {
            urlPattern: /^https:\/\/zsacuvrcohmraoldilph\.supabase\.co\/rest\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 60
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/zsacuvrcohmraoldilph\.supabase\.co\/auth\/.*/i,
            handler: 'NetworkOnly'
          },
          {
            urlPattern: /^https:\/\/zsacuvrcohmraoldilph\.supabase\.co\/storage\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'supabase-storage-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/css2\?family=Cairo.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets'
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          }
        ],
        
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true
      },
      
      devOptions: {
        enabled: false
      }
    })
  ].filter(Boolean),
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  build: {
    // Use esbuild for minification (faster and built-in)
    minify: true,
    
    // Chunk size optimization
    chunkSizeWarningLimit: 500,
    cssCodeSplit: true,
    sourcemap: false,
    
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
