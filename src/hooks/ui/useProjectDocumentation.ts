import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { productionLogger } from "@/lib/logger/production-logger";
import { DocumentationService, type ProjectPhase, type ChangelogEntry, type AddPhaseInput } from "@/services";
import type { Json } from "@/integrations/supabase/types";
import { QUERY_KEYS } from "@/lib/query-keys";

export type { ProjectPhase, ChangelogEntry, AddPhaseInput };

// أنواع المهام والتسليمات
interface PhaseTask {
  id: string;
  name: string;
  completed: boolean;
  description?: string;
}

interface PhaseDeliverable {
  id: string;
  name: string;
  delivered: boolean;
}

// دوال مساعدة لتحويل البيانات
export function parseTasks(data: Json | null): PhaseTask[] {
  if (!data || !Array.isArray(data)) return [];
  return data as unknown as PhaseTask[];
}

export function parseDeliverables(data: Json | null): PhaseDeliverable[] {
  if (!data || !Array.isArray(data)) return [];
  return data as unknown as PhaseDeliverable[];
}

export const useProjectDocumentation = (category?: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.PROJECT_DOCUMENTATION(category),
    queryFn: () => DocumentationService.getPhases(category),
  });
};

export const usePhaseChangelog = (phaseId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.PHASE_CHANGELOG(phaseId),
    queryFn: () => DocumentationService.getPhaseChangelog(phaseId),
  });
};

export const useUpdatePhaseStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ phaseId, status, notes }: { phaseId: string; status: string; notes?: string }) =>
      DocumentationService.updatePhaseStatus(phaseId, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECT_DOCUMENTATION() });
      toast.success("تم تحديث حالة المرحلة بنجاح");
    },
    onError: (error) => {
      toast.error("فشل تحديث حالة المرحلة");
      productionLogger.error("Error updating phase status:", error);
    },
  });
};

export const useUpdatePhaseProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ phaseId, percentage }: { phaseId: string; percentage: number }) =>
      DocumentationService.updatePhaseProgress(phaseId, percentage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECT_DOCUMENTATION() });
      toast.success("تم تحديث نسبة الإنجاز");
    },
    onError: (error) => {
      toast.error("فشل تحديث نسبة الإنجاز");
      productionLogger.error("Error updating progress:", error);
    },
  });
};

export const useUpdatePhaseTasks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ phaseId, tasks }: { phaseId: string; tasks: PhaseTask[] }) =>
      DocumentationService.updatePhaseTasks(phaseId, tasks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECT_DOCUMENTATION() });
      toast.success("تم تحديث المهام");
    },
    onError: (error) => {
      toast.error("فشل تحديث المهام");
      productionLogger.error("Error updating tasks:", error);
    },
  });
};

export const useAddPhase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (phaseData: AddPhaseInput) => DocumentationService.addPhase(phaseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECT_DOCUMENTATION() });
      toast.success("تمت إضافة المرحلة بنجاح");
    },
    onError: (error) => {
      toast.error("فشل إضافة المرحلة");
      productionLogger.error("Error adding phase:", error);
    },
  });
};
