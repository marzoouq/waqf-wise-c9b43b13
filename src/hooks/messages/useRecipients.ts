/**
 * Hook لجلب قائمة المستلمين المتاحين للمراسلة
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { productionLogger } from "@/lib/logger/production-logger";

interface Recipient {
  id: string;
  name: string;
  role: string;
  roleKey: string;
}

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
        // جلب دور المستخدم الحالي
        const { data: currentUserRole, error: currentRoleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle();

        if (currentRoleError) throw currentRoleError;

        // تحديد الأدوار المتاحة للمراسلة
        type RoleType = "accountant" | "admin" | "archivist" | "beneficiary" | "cashier" | "nazer" | "user" | "waqf_heir";
        let allowedRoles: RoleType[];
        
        if (currentUserRole?.role === 'beneficiary' || currentUserRole?.role === 'waqf_heir') {
          allowedRoles = ['admin', 'nazer'];
        } else {
          allowedRoles = ['admin', 'nazer', 'accountant', 'cashier', 'beneficiary', 'waqf_heir', 'archivist'];
        }
        
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .in('role', allowedRoles)
          .neq('user_id', userId);

        if (rolesError) throw rolesError;

        if (userRoles && userRoles.length > 0) {
          const userIds = userRoles.map(ur => ur.user_id);
          
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('user_id, full_name')
            .in('user_id', userIds);

          if (profilesError) throw profilesError;

          const roleTranslations: Record<string, string> = {
            'admin': 'مشرف',
            'nazer': 'ناظر',
            'accountant': 'محاسب',
            'cashier': 'صراف',
            'beneficiary': 'مستفيد',
            'archivist': 'أرشيفي'
          };

          const roleOrder: Record<string, number> = {
            'nazer': 1,
            'admin': 2,
            'accountant': 3,
            'cashier': 4,
            'archivist': 5,
            'beneficiary': 6
          };

          const recipientsList = profiles?.map(profile => {
            const userRole = userRoles.find(ur => ur.user_id === profile.user_id);
            const roleName = userRole?.role || 'user';
            return {
              id: profile.user_id,
              name: profile.full_name || 'مستخدم',
              role: roleTranslations[roleName] || roleName,
              roleKey: roleName
            };
          })
          .sort((a, b) => {
            const roleCompare = (roleOrder[a.roleKey] || 999) - (roleOrder[b.roleKey] || 999);
            if (roleCompare !== 0) return roleCompare;
            return a.name.localeCompare(b.name, 'ar');
          }) || [];

          setRecipients(recipientsList);
        } else {
          setRecipients([]);
        }
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
