/**
 * Messages Test Fixtures - بيانات اختبار الرسائل
 * تم إفراغ المحتوى - جاهز لإضافة بيانات جديدة
 */

export const mockMessages: any[] = [];
export const mockConversations: any[] = [];

export const mockMessageStats = {
  total_messages: 0,
  unread_count: 0,
  sent_today: 0,
  received_today: 0,
  by_category: {},
  by_priority: {},
};

export const messageFilters = {
  unreadOnly: { isRead: false },
  byCategory: { category: '' },
  byPriority: { priority: '' },
  bySender: { senderId: '' },
  byDateRange: { startDate: '', endDate: '' },
  archived: { isArchived: false },
};

export const mockMessageTemplates: any[] = [];
