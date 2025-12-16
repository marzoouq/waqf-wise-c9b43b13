import { useEffect } from "react";
import { useToast } from "@/hooks/ui/use-toast";
import { logger } from "@/lib/logger";
import { DisclosurePayload } from "@/types/disclosure";
import { supabase } from "@/integrations/supabase/client";

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
          const disclosurePayload = payload as unknown as DisclosurePayload;
          
          toast({
            title: "إفصاح سنوي جديد",
            description: `تم نشر الإفصاح السنوي لعام ${disclosurePayload.new.year}`,
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
