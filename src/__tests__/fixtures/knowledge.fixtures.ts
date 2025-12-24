/**
 * Knowledge Base Test Fixtures - بيانات اختبار قاعدة المعرفة
 * تم إفراغ المحتوى - جاهز لإضافة بيانات جديدة
 */

export const mockKnowledgeArticles: any[] = [];
export const mockKnowledgeCategories: any[] = [];
export const mockKnowledgeVideos: any[] = [];
export const mockKnowledgeDownloads: any[] = [];

export const mockKnowledgeStats = {
  total_articles: 0,
  total_views: 0,
  total_helpful: 0,
  popular_searches: [],
  top_articles: [],
};

export const knowledgeFilters = {
  byCategory: { category: '' },
  byStatus: { status: '' },
  byAuthor: { authorId: '' },
  byTag: { tag: '' },
  search: { query: '' },
};
