/**
 * useUsersRealtime Hook
 * اشتراك Realtime لتحديثات المستخدمين والأدوار
 */

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useUsersRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("users-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_roles" },
        () => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
          queryClient.invalidateQueries({ queryKey: ["roles-audit"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "role_permissions" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["role-permissions"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
