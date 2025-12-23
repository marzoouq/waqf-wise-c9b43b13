/**
 * Knowledge Base Test Fixtures - بيانات اختبار قاعدة المعرفة
 * @version 1.0.0
 */

export const mockKnowledgeArticles = [
  {
    id: 'article-1',
    title: 'كيفية التقديم على المساعدة الطارئة',
    slug: 'emergency-aid-application',
    content: 'خطوات التقديم على المساعدة الطارئة:\n1. تسجيل الدخول للبوابة\n2. اختيار نوع الطلب\n3. تعبئة النموذج\n4. إرفاق المستندات\n5. إرسال الطلب',
    excerpt: 'دليل شامل لكيفية التقديم على المساعدة الطارئة من الوقف',
    category: 'guides',
    tags: ['مساعدة', 'طوارئ', 'تقديم'],
    author_id: 'admin-1',
    author_name: 'فريق الدعم',
    status: 'published',
    view_count: 1250,
    helpful_count: 89,
    not_helpful_count: 5,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    published_at: '2024-01-01T12:00:00Z',
  },
  {
    id: 'article-2',
    title: 'الأسئلة الشائعة حول التوزيعات',
    slug: 'distributions-faq',
    content: '## متى يتم التوزيع؟\nيتم التوزيع شهرياً في اليوم الأول من كل شهر.\n\n## كيف أعرف مبلغي؟\nيمكنك مراجعة كشف الحساب في بوابة المستفيد.',
    excerpt: 'إجابات على الأسئلة الأكثر شيوعاً حول توزيعات الوقف',
    category: 'faq',
    tags: ['توزيعات', 'أسئلة شائعة'],
    author_id: 'admin-1',
    author_name: 'فريق الدعم',
    status: 'published',
    view_count: 2340,
    helpful_count: 156,
    not_helpful_count: 12,
    created_at: '2024-01-05T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z',
    published_at: '2024-01-05T12:00:00Z',
  },
  {
    id: 'article-3',
    title: 'دليل استخدام بوابة المستفيد',
    slug: 'beneficiary-portal-guide',
    content: 'دليل شامل لاستخدام بوابة المستفيد...',
    excerpt: 'تعرف على كيفية استخدام جميع ميزات بوابة المستفيد',
    category: 'tutorials',
    tags: ['بوابة', 'مستفيد', 'دليل'],
    author_id: 'admin-1',
    author_name: 'فريق الدعم',
    status: 'published',
    view_count: 890,
    helpful_count: 67,
    not_helpful_count: 3,
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-25T10:00:00Z',
    published_at: '2024-01-10T12:00:00Z',
  },
];

export const mockKnowledgeCategories = [
  { id: 'cat-1', name: 'الأدلة والإرشادات', slug: 'guides', count: 15, icon: 'BookOpen' },
  { id: 'cat-2', name: 'الأسئلة الشائعة', slug: 'faq', count: 28, icon: 'HelpCircle' },
  { id: 'cat-3', name: 'الدروس التعليمية', slug: 'tutorials', count: 12, icon: 'GraduationCap' },
  { id: 'cat-4', name: 'السياسات واللوائح', slug: 'policies', count: 8, icon: 'FileText' },
  { id: 'cat-5', name: 'الإعلانات', slug: 'announcements', count: 5, icon: 'Bell' },
];

export const mockKnowledgeVideos = [
  {
    id: 'video-1',
    title: 'شرح التسجيل في بوابة المستفيد',
    description: 'فيديو توضيحي لخطوات التسجيل',
    thumbnail_url: '/thumbnails/video-1.jpg',
    video_url: 'https://example.com/videos/registration.mp4',
    duration: 180,
    view_count: 450,
    category: 'tutorials',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'video-2',
    title: 'كيفية تقديم طلب مساعدة',
    description: 'شرح خطوات تقديم طلب المساعدة',
    thumbnail_url: '/thumbnails/video-2.jpg',
    video_url: 'https://example.com/videos/request.mp4',
    duration: 240,
    view_count: 380,
    category: 'tutorials',
    created_at: '2024-01-20T10:00:00Z',
  },
];

export const mockKnowledgeDownloads = [
  {
    id: 'download-1',
    title: 'نموذج طلب مساعدة طارئة',
    description: 'نموذج PDF لطلب المساعدة الطارئة',
    file_path: '/downloads/emergency-aid-form.pdf',
    file_size: 256000,
    file_type: 'pdf',
    download_count: 234,
    category: 'forms',
    created_at: '2024-01-01T10:00:00Z',
  },
  {
    id: 'download-2',
    title: 'دليل المستفيد الشامل',
    description: 'دليل PDF شامل للمستفيدين',
    file_path: '/downloads/beneficiary-guide.pdf',
    file_size: 1024000,
    file_type: 'pdf',
    download_count: 567,
    category: 'guides',
    created_at: '2024-01-10T10:00:00Z',
  },
];

export const mockKnowledgeStats = {
  total_articles: 68,
  total_views: 15680,
  total_helpful: 1234,
  popular_searches: ['توزيعات', 'مساعدة', 'تسجيل', 'طلب'],
  top_articles: ['article-2', 'article-1', 'article-3'],
};

export const knowledgeFilters = {
  byCategory: { category: 'guides' },
  byStatus: { status: 'published' },
  byAuthor: { authorId: 'admin-1' },
  byTag: { tag: 'توزيعات' },
  search: { query: 'مساعدة طارئة' },
};
