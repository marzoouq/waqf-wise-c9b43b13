/**
 * useUsersRealtime Hook
 * اشتراك Realtime لتحديثات المستخدمين والأدوار
 * @version 2.0.0 - تم إصلاح مشكلة تراكم الاشتراكات
 */

import { useEffect } from "react";
import { realtimeManager } from "@/services/realtime-manager";
import { queryInvalidationManager } from "@/lib/query-invalidation-manager";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useUsersRealtime() {
  useEffect(() => {
    const unsubProfiles = realtimeManager.subscribe("profiles", () => {
      queryInvalidationManager.invalidate(QUERY_KEYS.USERS);
    });

    const unsubRoles = realtimeManager.subscribe("user_roles", () => {
      queryInvalidationManager.invalidateMultiple([
        QUERY_KEYS.USERS,
        ["roles-audit"]
      ]);
    });

    const unsubPermissions = realtimeManager.subscribe("role_permissions", () => {
      queryInvalidationManager.invalidate(["role-permissions"]);
    });

    return () => {
      unsubProfiles();
      unsubRoles();
      unsubPermissions();
    };
  }, []); // لا تبعيات
}
