/**
 * Hook لجلب قائمة المستلمين المتاحين للمراسلة
 * @version 2.8.65
 */

import { useState, useEffect } from "react";
import { MessageService, Recipient } from "@/services/message.service";
import { productionLogger } from "@/lib/logger/production-logger";

export function useRecipients(userId: string | undefined, isOpen: boolean) {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipients = async () => {
      if (!isOpen || !userId) return;
      
      setLoadingRecipients(true);
      setError(null);
      
      try {
        const recipientsList = await MessageService.getRecipients(userId);
        setRecipients(recipientsList);
      } catch (err) {
        productionLogger.error('Error fetching recipients', err, {
          context: 'useRecipients',
          severity: 'medium',
        });
        setError("حدث خطأ أثناء تحميل قائمة المستلمين");
      } finally {
        setLoadingRecipients(false);
      }
    };

    fetchRecipients();
  }, [isOpen, userId]);

  return {
    recipients,
    loadingRecipients,
    error,
  };
}
