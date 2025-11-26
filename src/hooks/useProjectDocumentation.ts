import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  tasks: Array<{
    id: string;
    name: string;
    completed: boolean;
    description?: string;
  }>;
  deliverables: Array<{
    id: string;
    name: string;
    delivered: boolean;
  }>;
  notes: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
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

      const updateData: any = {
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
      console.error("Error updating phase status:", error);
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
      console.error("Error updating progress:", error);
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
      tasks: Array<any>;
    }) => {
      const { data: userData } = await supabase.auth.getUser();

      const completedTasks = tasks.filter((t) => t.completed).length;
      const percentage = Math.round((completedTasks / tasks.length) * 100);

      const { data, error } = await supabase
        .from("project_documentation")
        .update({
          tasks,
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
      console.error("Error updating tasks:", error);
    },
  });
};

export const useAddPhase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (phaseData: Partial<ProjectPhase>) => {
      const { data: userData } = await supabase.auth.getUser();

      const insertData: any = {
        ...phaseData,
      };

      if (userData.user?.id) {
        insertData.updated_by = userData.user.id;
      }

      const { data, error } = await supabase
        .from("project_documentation")
        .insert(insertData)
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
      console.error("Error adding phase:", error);
    },
  });
};
