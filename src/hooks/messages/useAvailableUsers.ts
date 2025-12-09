/**
 * Available Users for Messaging Hook
 * @version 2.8.43
 */

import { useQuery } from "@tanstack/react-query";
import { UserService } from "@/services";

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
      return UserService.getAvailableUsers();
    },
  });
}
