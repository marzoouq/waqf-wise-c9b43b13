import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RefreshCcw, X, Download } from 'lucide-react';
import { clearAllCaches } from '@/lib/clearCache';
import { motion, AnimatePresence } from 'framer-motion';

interface UpdateNotificationProps {
  onDismiss?: () => void;
}

/**
 * مكون إشعار التحديث المتاح
 * يظهر عند اكتشاف إصدار جديد من التطبيق
 */
export function UpdateNotification({ onDismiss }: UpdateNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // استمع لأحداث Service Worker
    if ('serviceWorker' in navigator) {
      const handleControllerChange = () => {
        setIsVisible(true);
      };

      // عند تغير الـ controller (تحديث جديد)
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

      // فحص التحديثات عند التحميل
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // هناك تحديث جديد متاح
                setIsVisible(true);
              }
            });
          }
        });

        // فحص التحديثات كل 5 دقائق
        const checkInterval = setInterval(() => {
          registration.update().catch(console.error);
        }, 5 * 60 * 1000);

        return () => clearInterval(checkInterval);
      });

      return () => {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      };
    }
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await clearAllCaches();
      localStorage.removeItem('waqf_app_version');
      window.location.reload();
    } catch (error) {
      console.error('Error updating:', error);
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
        >
          <Card className="p-4 shadow-lg border-primary/20 bg-card">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Download className="w-5 h-5 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground mb-1">
                  تحديث جديد متاح
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  يتوفر إصدار جديد من التطبيق. حدّث الآن للحصول على أحدث الميزات.
                </p>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdate}
                    size="sm"
                    disabled={isUpdating}
                    className="gap-1.5"
                  >
                    {isUpdating ? (
                      <RefreshCcw className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCcw className="w-4 h-4" />
                    )}
                    {isUpdating ? 'جاري التحديث...' : 'تحديث الآن'}
                  </Button>
                  
                  <Button
                    onClick={handleDismiss}
                    variant="ghost"
                    size="sm"
                    disabled={isUpdating}
                  >
                    لاحقاً
                  </Button>
                </div>
              </div>
              
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="icon"
                className="flex-shrink-0 h-8 w-8"
                disabled={isUpdating}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default UpdateNotification;