/**
 * Service Worker & Cache Cleanup Script
 * يحذف جميع Service Workers و Caches القديمة لمنع أخطاء Workbox
 * + تحميل الخطوط بطريقة متوافقة مع CSP
 */
(function() {
  'use strict';
  
  // 1. تفعيل خط Cairo بطريقة متوافقة مع CSP (بدون inline event handler)
  var fontLink = document.getElementById('cairo-font');
  if (fontLink) {
    // إذا كان الخط محملاً بالفعل
    if (fontLink.sheet) {
      fontLink.media = 'all';
    } else {
      // انتظار تحميل الخط
      fontLink.addEventListener('load', function() {
        this.media = 'all';
      });
    }
  }
  
  // 2. إلغاء تسجيل جميع Service Workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      registrations.forEach(function(registration) {
        registration.unregister();
        console.log('🗑️ SW removed:', registration.scope);
      });
    });
  }
  
  // 3. حذف جميع Workbox/SW caches
  if ('caches' in window) {
    caches.keys().then(function(names) {
      names.forEach(function(name) {
        if (name.includes('workbox') || name.includes('precache') || 
            name.includes('runtime') || name.includes('sw-') || 
            name.includes('waqf-') || name.includes('cache')) {
          caches.delete(name);
          console.log('🗑️ Cache deleted:', name);
        }
      });
    });
  }
})();
