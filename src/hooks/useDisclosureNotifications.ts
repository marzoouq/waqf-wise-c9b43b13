import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

export function useDisclosureNotifications() {
  const { toast } = useToast();

  useEffect(() => {
    const channel = supabase
      .channel('annual_disclosures_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'annual_disclosures',
          filter: 'status=eq.published'
        },
        (payload) => {
          logger.info('New disclosure published');
          
          toast({
            title: "إفصاح سنوي جديد",
            description: `تم نشر الإفصاح السنوي لعام ${(payload.new as any).year}`,
            duration: 8000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);
}
