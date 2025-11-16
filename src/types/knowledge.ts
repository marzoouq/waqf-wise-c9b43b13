/**
 * Types for Knowledge Base
 */

export interface KBArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags?: string[];
  view_count?: number;
  helpful_count?: number;
  not_helpful_count?: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface KBArticleInsert {
  title: string;
  content: string;
  category: string;
  tags?: string[];
  is_published?: boolean;
}

export interface KBArticleUpdate {
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
  is_published?: boolean;
}
