/**
 * Archive Test Fixtures - بيانات اختبار الأرشيف
 * تم إفراغ المحتوى - جاهز لإضافة بيانات جديدة
 */

export const mockArchiveDocuments: any[] = [];
export const mockArchiveCategories: any[] = [];

export const mockArchiveStats = {
  total_documents: 0,
  total_size_bytes: 0,
  by_category: {},
  by_year: {},
  pending_review: 0,
  expiring_soon: 0,
};

export const archiveFilters = {
  byCategory: { category: '' },
  byDateRange: { startDate: '', endDate: '' },
  byDocumentType: { documentType: '' },
  byTags: { tags: [] },
  byCreator: { createdBy: '' },
};
