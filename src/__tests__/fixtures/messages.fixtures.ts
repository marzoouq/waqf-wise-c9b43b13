/**
 * Messages Test Fixtures - بيانات اختبار الرسائل
 * @version 1.0.0
 */

export const mockMessages = [
  {
    id: 'msg-1',
    sender_id: 'user-admin-1',
    sender_name: 'أحمد المدير',
    sender_role: 'admin',
    recipient_id: 'user-beneficiary-1',
    recipient_name: 'محمد المستفيد',
    subject: 'تحديث حالة الطلب',
    content: 'تم قبول طلبك للمساعدة الطارئة. سيتم التواصل معك قريباً.',
    is_read: false,
    is_archived: false,
    priority: 'high',
    category: 'notification',
    created_at: '2024-01-15T10:00:00Z',
    read_at: null,
    attachments: [],
  },
  {
    id: 'msg-2',
    sender_id: 'user-beneficiary-1',
    sender_name: 'محمد المستفيد',
    sender_role: 'beneficiary',
    recipient_id: 'user-admin-1',
    recipient_name: 'أحمد المدير',
    subject: 'استفسار عن التوزيعات',
    content: 'السلام عليكم، أود الاستفسار عن موعد التوزيع القادم.',
    is_read: true,
    is_archived: false,
    priority: 'normal',
    category: 'inquiry',
    created_at: '2024-01-14T09:00:00Z',
    read_at: '2024-01-14T10:30:00Z',
    attachments: [],
  },
  {
    id: 'msg-3',
    sender_id: 'system',
    sender_name: 'النظام',
    sender_role: 'system',
    recipient_id: 'user-admin-1',
    recipient_name: 'أحمد المدير',
    subject: 'تنبيه: عقد على وشك الانتهاء',
    content: 'عقد الإيجار رقم C-2024-001 سينتهي خلال 30 يوماً.',
    is_read: false,
    is_archived: false,
    priority: 'urgent',
    category: 'alert',
    created_at: '2024-01-13T08:00:00Z',
    read_at: null,
    attachments: [],
  },
];

export const mockConversations = [
  {
    id: 'conv-1',
    participants: ['user-admin-1', 'user-beneficiary-1'],
    last_message_id: 'msg-1',
    last_message_preview: 'تم قبول طلبك للمساعدة الطارئة...',
    last_message_at: '2024-01-15T10:00:00Z',
    unread_count: 1,
    is_archived: false,
  },
  {
    id: 'conv-2',
    participants: ['user-admin-1', 'user-nazer-1'],
    last_message_id: 'msg-4',
    last_message_preview: 'تمت الموافقة على التوزيع...',
    last_message_at: '2024-01-12T14:00:00Z',
    unread_count: 0,
    is_archived: false,
  },
];

export const mockMessageStats = {
  total_messages: 156,
  unread_count: 12,
  sent_today: 5,
  received_today: 8,
  by_category: {
    notification: 45,
    inquiry: 38,
    alert: 28,
    general: 45,
  },
  by_priority: {
    urgent: 10,
    high: 25,
    normal: 100,
    low: 21,
  },
};

export const messageFilters = {
  unreadOnly: { isRead: false },
  byCategory: { category: 'notification' },
  byPriority: { priority: 'urgent' },
  bySender: { senderId: 'user-admin-1' },
  byDateRange: { startDate: '2024-01-01', endDate: '2024-01-31' },
  archived: { isArchived: true },
};

export const mockMessageTemplates = [
  {
    id: 'template-1',
    name: 'إشعار قبول الطلب',
    subject: 'تم قبول طلبك',
    content: 'عزيزي {{beneficiary_name}}، تم قبول طلبك رقم {{request_number}}.',
    category: 'notification',
  },
  {
    id: 'template-2',
    name: 'تذكير بموعد التوزيع',
    subject: 'تذكير: موعد التوزيع',
    content: 'نود تذكيركم بموعد التوزيع القادم في {{distribution_date}}.',
    category: 'reminder',
  },
];
