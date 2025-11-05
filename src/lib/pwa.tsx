import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function usePWAUpdate() {
  const { toast } = useToast();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                toast({
                  title: "⬆️ تحديث متوفر",
                  description: "إصدار جديد من التطبيق متاح الآن",
                  action: (
                    <button 
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
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
    }
  }, [toast]);
}
