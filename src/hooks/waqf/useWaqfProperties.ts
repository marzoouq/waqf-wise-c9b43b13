/**
 * useWaqfProperties Hook
 * إدارة عقارات أقلام الوقف
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { WaqfService, type WaqfProperty, type UnlinkedProperty } from "@/services/waqf.service";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useUnlinkedProperties() {
  return useQuery<UnlinkedProperty[]>({
    queryKey: ['unlinked-properties'],
    queryFn: () => WaqfService.getUnlinkedProperties(),
  });
}

export function useWaqfUnitProperties(waqfUnitId: string | undefined) {
  return useQuery<WaqfProperty[]>({
    queryKey: ['waqf-unit-properties', waqfUnitId],
    queryFn: () => WaqfService.getWaqfUnitProperties(waqfUnitId!),
    enabled: !!waqfUnitId,
  });
}

export function useLinkProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ propertyId, waqfUnitId }: { propertyId: string; waqfUnitId: string }) =>
      WaqfService.linkProperty(propertyId, waqfUnitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unlinked-properties'] });
      queryClient.invalidateQueries({ queryKey: ['waqf-unit-properties'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROPERTIES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WAQF_UNITS });
      toast.success("تم ربط العقار بنجاح");
    },
    onError: (error: Error) => {
      toast.error("فشل في ربط العقار: " + error.message);
    },
  });
}

export function useUnlinkProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyId: string) => WaqfService.unlinkProperty(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unlinked-properties'] });
      queryClient.invalidateQueries({ queryKey: ['waqf-unit-properties'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROPERTIES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WAQF_UNITS });
      toast.success("تم إلغاء ربط العقار");
    },
    onError: (error: Error) => {
      toast.error("فشل في إلغاء الربط: " + error.message);
    },
  });
}

export type { WaqfProperty, UnlinkedProperty };
