/**
 * Available Users for Messaging Hook
 * @version 2.8.67
 * 
 * يستخدم MessageService.getRecipients لجلب المستلمين المتاحين
 * حسب دور المستخدم الحالي (المستفيدين يرون الناظر/المشرف فقط)
 */

import { useQuery } from "@tanstack/react-query";
import { MessageService } from "@/services/message.service";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useAuth } from "@/contexts/AuthContext";

export interface AvailableUser {
  id: string;
  name: string;
  roles: string[];
  displayName: string;
  role: string;
}

export function useAvailableUsers() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: [...QUERY_KEYS.AVAILABLE_USERS, user?.id],
    queryFn: async (): Promise<AvailableUser[]> => {
      // استخدام الدالة الصحيحة التي تصفي المستلمين حسب دور المستخدم
      const recipients = await MessageService.getRecipients(user!.id);
      return recipients.map(r => ({
        id: r.id,
        name: r.name,
        roles: [r.roleKey],
        displayName: `${r.name} (${r.role})`,
        role: r.roleKey,
      }));
    },
    enabled: !!user,
  });
}
