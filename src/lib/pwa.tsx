import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function usePWAUpdate() {
  const { toast } = useToast();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Check for updates every 30 minutes
      const checkForUpdates = () => {
        navigator.serviceWorker.ready.then((registration) => {
          registration.update();
        });
      };

      const interval = setInterval(checkForUpdates, 30 * 60 * 1000);

      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                toast({
                  title: "⬆️ تحديث متوفر",
                  description: "إصدار جديد من التطبيق متاح الآن (v2.0.0)",
                  action: (
                    <button 
                      onClick={() => {
                        newWorker.postMessage({ type: 'SKIP_WAITING' });
                        window.location.reload();
                      }}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                      تحديث الآن
                    </button>
                  ),
                  duration: Infinity
                });
              }
            });
          }
        });
      });

      return () => clearInterval(interval);
    }
  }, [toast]);
}
