/**
 * Knowledge Service - خدمة قاعدة المعرفة
 * @version 2.8.28
 */

import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export interface KnowledgeArticle {
  id: string;
  category: string;
  title: string;
  description: string | null;
  content: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
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

// Fallback data
const FALLBACK_ARTICLES: KnowledgeArticle[] = [
  { id: '1', category: "البداية", title: "كيفية استخدام النظام", description: "دليل شامل للبدء في استخدام نظام إدارة الوقف", content: "يوفر النظام مجموعة شاملة من الأدوات لإدارة الوقف بكفاءة...", sort_order: 1, is_published: true, created_at: '', updated_at: '' },
  { id: '2', category: "المستفيدون", title: "إضافة مستفيد جديد", description: "خطوات إضافة وإدارة المستفيدين", content: "لإضافة مستفيد جديد، اذهب إلى قسم المستفيدين...", sort_order: 2, is_published: true, created_at: '', updated_at: '' },
];

export class KnowledgeService {
  /**
   * جلب مقالات قاعدة المعرفة
   */
  static async getArticles(): Promise<KnowledgeArticle[]> {
    try {
      const { data, error } = await supabase
        .from('knowledge_articles')
        .select('id, category, title, content, is_published, created_at, updated_at')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map((item, index) => ({
        id: item.id,
        category: item.category || 'عام',
        title: item.title,
        description: item.content?.slice(0, 100) + '...',
        content: item.content,
        sort_order: index + 1,
        is_published: item.is_published,
        created_at: item.created_at,
        updated_at: item.updated_at,
      })) as KnowledgeArticle[];
    } catch {
      return FALLBACK_ARTICLES;
    }
  }

  /**
   * جلب مراحل المشروع
   */
  static async getProjectPhases(category?: string): Promise<ProjectPhase[]> {
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
   * جلب سجل تغييرات المرحلة
   */
  static async getPhaseChangelog(phaseId: string) {
    const { data, error } = await supabase
      .from("documentation_changelog")
      .select("*")
      .eq("doc_id", phaseId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  }

  /**
   * تحديث حالة المرحلة
   */
  static async updatePhaseStatus(phaseId: string, status: string, notes?: string) {
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
    return data;
  }

  /**
   * تحديث نسبة إنجاز المرحلة
   */
  static async updatePhaseProgress(phaseId: string, percentage: number) {
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
  }
}
