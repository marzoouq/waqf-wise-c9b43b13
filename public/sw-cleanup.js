/**
 * Service Worker & Cache Cleanup Script
 * يحذف جميع Service Workers و Caches القديمة لمنع أخطاء Workbox
 */
(function() {
  'use strict';
  
  // 1. إلغاء تسجيل جميع Service Workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      registrations.forEach(function(registration) {
        registration.unregister();
      });
    });
  }
  
  // 2. حذف جميع Workbox/SW caches
  if ('caches' in window) {
    caches.keys().then(function(names) {
      names.forEach(function(name) {
        if (name.includes('workbox') || name.includes('precache') || 
            name.includes('runtime') || name.includes('sw-') || 
            name.includes('waqf-') || name.includes('cache')) {
          caches.delete(name);
        }
      });
    });
  }
})();
