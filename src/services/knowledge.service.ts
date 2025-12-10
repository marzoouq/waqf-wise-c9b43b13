/**
 * Knowledge Service - خدمة قاعدة المعرفة
 * @version 2.8.73
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

// KB Article types for kb_articles table
export interface KBArticle {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  slug: string;
  category: string;
  tags: string[] | null;
  status: string;
  is_featured: boolean;
  sort_order: number;
  views_count: number;
  helpful_count: number;
  not_helpful_count: number;
  author_id: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  metadata: Json | null;
}

export interface KBFAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  is_active: boolean;
  views_count: number;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

// Fallback data
const FALLBACK_ARTICLES: KnowledgeArticle[] = [
  { id: '1', category: "البداية", title: "كيفية استخدام النظام", description: "دليل شامل للبدء في استخدام نظام إدارة الوقف", content: "يوفر النظام مجموعة شاملة من الأدوات لإدارة الوقف بكفاءة...", sort_order: 1, is_published: true, created_at: '', updated_at: '' },
  { id: '2', category: "المستفيدون", title: "إضافة مستفيد جديد", description: "خطوات إضافة وإدارة المستفيدين", content: "لإضافة مستفيد جديد، اذهب إلى قسم المستفيدين...", sort_order: 2, is_published: true, created_at: '', updated_at: '' },
];

export class KnowledgeService {
  /**
   * جلب مقالات قاعدة المعرفة (knowledge_articles)
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

  // ============ KB Articles (kb_articles table) ============

  /**
   * جلب مقالات KB المنشورة
   */
  static async getKBArticles(): Promise<KBArticle[]> {
    const { data, error } = await supabase
      .from('kb_articles')
      .select('id, title, content, summary, slug, category, tags, status, is_featured, sort_order, views_count, helpful_count, not_helpful_count, author_id, created_at, updated_at, published_at, metadata')
      .eq('status', 'published')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as KBArticle[];
  }

  /**
   * جلب المقالات المميزة
   */
  static async getFeaturedKBArticles(): Promise<KBArticle[]> {
    const { data, error } = await supabase
      .from('kb_articles')
      .select('id, title, content, summary, slug, category, tags, status, is_featured, sort_order, views_count, helpful_count, not_helpful_count, author_id, created_at, updated_at, published_at, metadata')
      .eq('status', 'published')
      .eq('is_featured', true)
      .order('sort_order', { ascending: true })
      .limit(5);

    if (error) throw error;
    return (data || []) as KBArticle[];
  }

  /**
   * جلب مقالة واحدة بالـ ID
   */
  static async getKBArticleById(id: string): Promise<KBArticle | null> {
    const { data, error } = await supabase
      .from('kb_articles')
      .select('id, title, content, summary, slug, category, tags, status, is_featured, sort_order, views_count, helpful_count, not_helpful_count, author_id, created_at, updated_at, published_at, metadata')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as KBArticle | null;
  }

  /**
   * البحث في المقالات
   */
  static async searchKBArticles(searchTerm: string): Promise<KBArticle[]> {
    const { data, error } = await supabase
      .from('kb_articles')
      .select('id, title, content, summary, slug, category, tags, views_count, created_at, updated_at')
      .eq('status', 'published')
      .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,summary.ilike.%${searchTerm}%`)
      .order('views_count', { ascending: false })
      .limit(10);

    if (error) throw error;
    return (data || []) as KBArticle[];
  }

  /**
   * زيادة عدد مشاهدات مقالة
   */
  static async incrementKBArticleViews(id: string): Promise<void> {
    const { data: current } = await supabase
      .from('kb_articles')
      .select('views_count')
      .eq('id', id)
      .maybeSingle();

    const { error } = await supabase
      .from('kb_articles')
      .update({ views_count: (current?.views_count || 0) + 1 })
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * تقييم مقالة (مفيدة / غير مفيدة)
   */
  static async rateKBArticle(id: string, helpful: boolean): Promise<void> {
    const column = helpful ? 'helpful_count' : 'not_helpful_count';
    
    const { data: current } = await supabase
      .from('kb_articles')
      .select(column)
      .eq('id', id)
      .maybeSingle();

    const { error } = await supabase
      .from('kb_articles')
      .update({ [column]: ((current?.[column] as number) || 0) + 1 })
      .eq('id', id);

    if (error) throw error;
  }

  // ============ KB FAQs ============

  /**
   * جلب الأسئلة الشائعة النشطة
   */
  static async getKBFAQs(): Promise<KBFAQ[]> {
    const { data, error } = await supabase
      .from('kb_faqs')
      .select('id, question, answer, category, sort_order, is_active, views_count, helpful_count, created_at, updated_at')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return (data || []) as KBFAQ[];
  }

  /**
   * زيادة عدد مشاهدات FAQ
   */
  static async incrementFAQViews(id: string): Promise<void> {
    const { data: current } = await supabase
      .from('kb_faqs')
      .select('views_count')
      .eq('id', id)
      .maybeSingle();

    const { error } = await supabase
      .from('kb_faqs')
      .update({ views_count: (current?.views_count || 0) + 1 })
      .eq('id', id);

    if (error) throw error;
  }

  // ============ Project Documentation ============

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
