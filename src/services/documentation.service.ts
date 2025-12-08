/**
 * Documentation Service - خدمة التوثيق
 * @version 2.8.29
 */

import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

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

export interface AddPhaseInput {
  category: "core" | "design" | "testing" | "future";
  phase_number: number;
  phase_name: string;
  description?: string;
  status?: "completed" | "in_progress" | "planned" | "blocked";
  completion_percentage?: number;
  tasks?: Array<{ id: string; name: string; completed: boolean; description?: string }>;
  deliverables?: Array<{ id: string; name: string; delivered: boolean }>;
  notes?: string;
  assigned_to?: string;
}

export class DocumentationService {
  /**
   * جلب مراحل المشروع
   */
  static async getPhases(category?: string): Promise<ProjectPhase[]> {
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
  }

  /**
   * جلب سجل التغييرات للمرحلة
   */
  static async getPhaseChangelog(phaseId: string): Promise<ChangelogEntry[]> {
    const { data, error } = await supabase
      .from("documentation_changelog")
      .select("*")
      .eq("doc_id", phaseId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return data as ChangelogEntry[];
  }

  /**
   * تحديث حالة المرحلة
   */
  static async updatePhaseStatus(phaseId: string, status: string, notes?: string): Promise<ProjectPhase> {
    const { data: userData } = await supabase.auth.getUser();

    const updateData: Record<string, unknown> = {
      status,
      updated_by: userData.user?.id,
    };

    if (notes) updateData.notes = notes;
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
    return data as ProjectPhase;
  }

  /**
   * تحديث نسبة الإنجاز
   */
  static async updatePhaseProgress(phaseId: string, percentage: number): Promise<ProjectPhase> {
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
    return data as ProjectPhase;
  }

  /**
   * تحديث المهام
   */
  static async updatePhaseTasks(phaseId: string, tasks: Array<{ id: string; name: string; completed: boolean }>): Promise<ProjectPhase> {
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
    return data as ProjectPhase;
  }

  /**
   * إضافة مرحلة جديدة
   */
  static async addPhase(phaseData: AddPhaseInput): Promise<ProjectPhase> {
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
    return data as ProjectPhase;
  }
}
