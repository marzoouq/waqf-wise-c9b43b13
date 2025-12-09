/**
 * Available Users for Messaging Hook
 * @version 2.8.39
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AvailableUser {
  id: string;
  name: string;
  roles: string[];
  displayName: string;
  role: string;
}

export function useAvailableUsers() {
  return useQuery({
    queryKey: ["available-users"],
    queryFn: async (): Promise<AvailableUser[]> => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .limit(200);
        
      if (error) throw error;
      
      if (!data || data.length === 0) return [];
      
      const userIds = [...new Set(data.map(u => u.user_id))];
      const { data: beneficiaries } = await supabase
        .from("beneficiaries")
        .select("user_id, full_name, beneficiary_number")
        .in("user_id", userIds);
        
      const userMap = new Map<string, { id: string; name: string; roles: string[] }>();
      
      data.forEach(u => {
        const beneficiary = beneficiaries?.find(b => b.user_id === u.user_id);
        const existingUser = userMap.get(u.user_id);
        
        if (existingUser) {
          existingUser.roles.push(u.role);
        } else {
          userMap.set(u.user_id, {
            id: u.user_id,
            name: beneficiary?.full_name || 
                  (u.role === 'nazer' ? 'الناظر' : 
                   u.role === 'admin' ? 'المشرف' :
                   u.role === 'accountant' ? 'المحاسب' :
                   u.role === 'cashier' ? 'أمين الصندوق' :
                   u.role === 'archivist' ? 'الأرشيفي' :
                   beneficiary?.beneficiary_number || 'مستخدم'),
            roles: [u.role]
          });
        }
      });
      
      return Array.from(userMap.values())
        .map(u => ({
          ...u,
          displayName: `${u.name} (${u.roles.join(', ')})`,
          role: u.roles[0]
        }))
        .sort((a, b) => {
          const roleOrder: Record<string, number> = {
            nazer: 1,
            admin: 2,
            accountant: 3,
            cashier: 4,
            archivist: 5,
            beneficiary: 6,
            user: 7
          };
          return (roleOrder[a.role] || 999) - (roleOrder[b.role] || 999);
        });
    },
  });
}
