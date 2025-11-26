import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify('2.1.0'),
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
        
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/zsacuvrcohmraoldilph\.supabase\.co\/rest\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 3600
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
        skipWaiting: false,
        clientsClaim: false
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
    // Aggressive minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
        pure_funcs: mode === 'production' ? ['console.log', 'console.info', 'console.debug'] : []
      }
    },
    
    // Chunk size optimization
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    sourcemap: false,
    
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React libraries
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-core';
            }
            if (id.includes('react-router-dom')) {
              return 'react-router';
            }
            
            // Radix UI - split into two chunks
            if (id.includes('@radix-ui')) {
              if (id.includes('dialog') || id.includes('dropdown') || id.includes('select')) {
                return 'radix-ui-core';
              }
              return 'radix-ui-extended';
            }
            
            // Data & State Management
            if (id.includes('@tanstack/react-query')) {
              return 'query-client';
            }
            if (id.includes('@supabase/supabase-js')) {
              return 'supabase';
            }
            
            // Heavy libraries
            if (id.includes('recharts')) {
              return 'charts';
            }
            if (id.includes('framer-motion')) {
              return 'animations';
            }
            
            // Forms
            if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) {
              return 'forms';
            }
            
            // Date utilities
            if (id.includes('date-fns')) {
              return 'date-utils';
            }
            
            // PDF generation
            if (id.includes('jspdf')) {
              return 'pdf-generator';
            }
            
            // Excel/XLSX
            if (id.includes('xlsx')) {
              return 'excel-utils';
            }
            
            // UI utilities
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance-authority')) {
              return 'utils';
            }
            
            // Libraries that depend on React Context - must load after React
            if (id.includes('next-themes') || 
                id.includes('sonner') || 
                id.includes('cmdk') || 
                id.includes('vaul') ||
                id.includes('react-day-picker') ||
                id.includes('embla-carousel')) {
              return 'react-context-libs';
            }
            
            // Everything else goes to vendor
            return 'vendor';
          }
        }
      }
    }
  }
}));
