import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { productionLogger } from "@/lib/logger/production-logger";
import type { Json } from "@/integrations/supabase/types";

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

export interface ProjectPhase {
  id: string;
  category: "core" | "design" | "testing" | "future";
  phase_number: number;
  phase_name: string;
  description: string | null;
  status: "completed" | "in_progress" | "planned" | "blocked";
  completion_percentage: number;
  start_date: string | null;
  completion_date: string | null;
  tasks: Json;
  deliverables: Json;
  notes: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
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

// نوع الإدخال لإضافة مرحلة جديدة
export interface AddPhaseInput {
  category: "core" | "design" | "testing" | "future";
  phase_number: number;
  phase_name: string;
  description?: string;
  status?: "completed" | "in_progress" | "planned" | "blocked";
  completion_percentage?: number;
  tasks?: PhaseTask[];
  deliverables?: PhaseDeliverable[];
  notes?: string;
  assigned_to?: string;
}

export interface ChangelogEntry {
  id: string;
  doc_id: string;
  changed_by: string | null;
  changed_by_name: string | null;
  change_type: string;
  old_value: string | null;
  new_value: string | null;
  notes: string | null;
  created_at: string;
}

export const useProjectDocumentation = (category?: string) => {
  return useQuery({
    queryKey: ["project-documentation", category],
    queryFn: async () => {
      let query = supabase
        .from("project_documentation")
        .select("*")
        .order("phase_number", { ascending: true });

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ProjectPhase[];
    },
  });
};

export const usePhaseChangelog = (phaseId: string) => {
  return useQuery({
    queryKey: ["phase-changelog", phaseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documentation_changelog")
        .select("*")
        .eq("doc_id", phaseId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as ChangelogEntry[];
    },
  });
};

export const useUpdatePhaseStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      phaseId,
      status,
      notes,
    }: {
      phaseId: string;
      status: string;
      notes?: string;
    }) => {
      const { data: userData } = await supabase.auth.getUser();

      const updateData: {
        status: string;
        updated_by?: string;
        notes?: string;
        completion_percentage?: number;
        completion_date?: string;
        start_date?: string;
      } = {
        status,
        updated_by: userData.user?.id,
      };

      if (notes) {
        updateData.notes = notes;
      }

      if (status === "completed") {
        updateData.completion_percentage = 100;
        updateData.completion_date = new Date().toISOString();
      } else if (status === "in_progress") {
        updateData.start_date = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("project_documentation")
        .update(updateData)
        .eq("id", phaseId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-documentation"] });
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
    mutationFn: async ({
      phaseId,
      percentage,
    }: {
      phaseId: string;
      percentage: number;
    }) => {
      const { data: userData } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("project_documentation")
        .update({
          completion_percentage: percentage,
          updated_by: userData.user?.id,
        })
        .eq("id", phaseId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-documentation"] });
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
    mutationFn: async ({
      phaseId,
      tasks,
    }: {
      phaseId: string;
      tasks: PhaseTask[];
    }) => {
      const { data: userData } = await supabase.auth.getUser();

      const completedTasks = tasks.filter((t) => t.completed).length;
      const percentage = Math.round((completedTasks / tasks.length) * 100);

      const { data, error } = await supabase
        .from("project_documentation")
        .update({
          tasks: tasks as unknown as Json,
          completion_percentage: percentage,
          updated_by: userData.user?.id,
        })
        .eq("id", phaseId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-documentation"] });
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
    mutationFn: async (phaseData: AddPhaseInput) => {
      const { data: userData } = await supabase.auth.getUser();

      const insertData = {
        category: phaseData.category,
        phase_number: phaseData.phase_number,
        phase_name: phaseData.phase_name,
        description: phaseData.description,
        status: phaseData.status || 'planned',
        completion_percentage: phaseData.completion_percentage || 0,
        tasks: (phaseData.tasks || []) as unknown as Json,
        deliverables: (phaseData.deliverables || []) as unknown as Json,
        notes: phaseData.notes,
        assigned_to: phaseData.assigned_to,
        updated_by: userData.user?.id,
      };

      const { data, error } = await supabase
        .from("project_documentation")
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-documentation"] });
      toast.success("تمت إضافة المرحلة بنجاح");
    },
    onError: (error) => {
      toast.error("فشل إضافة المرحلة");
      productionLogger.error("Error adding phase:", error);
    },
  });
};
