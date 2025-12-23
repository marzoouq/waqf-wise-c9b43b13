/**
 * AI Fixtures - بيانات وهمية للذكاء الاصطناعي
 * @version 1.0.0
 */

// ==================== Chat Messages ====================
export const mockChatMessages = [
  {
    id: 'msg-1',
    role: 'user' as const,
    content: 'ما هو رصيدي الحالي؟',
    timestamp: new Date('2024-01-15T10:00:00'),
    conversation_id: 'conv-1',
  },
  {
    id: 'msg-2',
    role: 'assistant' as const,
    content: 'رصيدك الحالي هو 15,000 ريال سعودي',
    timestamp: new Date('2024-01-15T10:00:05'),
    conversation_id: 'conv-1',
  },
  {
    id: 'msg-3',
    role: 'user' as const,
    content: 'متى موعد التوزيع القادم؟',
    timestamp: new Date('2024-01-15T10:01:00'),
    conversation_id: 'conv-1',
  },
  {
    id: 'msg-4',
    role: 'assistant' as const,
    content: 'التوزيع القادم سيكون في تاريخ 2024-02-01',
    timestamp: new Date('2024-01-15T10:01:05'),
    conversation_id: 'conv-1',
  },
];

// ==================== Quick Replies ====================
export const mockQuickReplies = [
  {
    id: 'qr-1',
    text: 'ما هو رصيدي؟',
    category: 'financial',
    roles: ['beneficiary', 'staff'],
    order: 1,
  },
  {
    id: 'qr-2',
    text: 'موعد التوزيع القادم',
    category: 'distributions',
    roles: ['beneficiary'],
    order: 2,
  },
  {
    id: 'qr-3',
    text: 'كيف أقدم طلب مساعدة؟',
    category: 'support',
    roles: ['beneficiary'],
    order: 3,
  },
  {
    id: 'qr-4',
    text: 'إحصائيات المستفيدين',
    category: 'statistics',
    roles: ['staff', 'admin'],
    order: 4,
  },
  {
    id: 'qr-5',
    text: 'تقرير العقارات',
    category: 'properties',
    roles: ['staff', 'admin', 'nazer'],
    order: 5,
  },
];

// ==================== AI Insights ====================
export const mockAIInsights = [
  {
    id: 'insight-1',
    type: 'beneficiaries' as const,
    title: 'زيادة في عدد المستفيدين',
    description: 'لاحظنا زيادة بنسبة 15% في عدد المستفيدين الجدد هذا الشهر',
    priority: 'high' as const,
    created_at: new Date('2024-01-15').toISOString(),
    is_dismissed: false,
    data: {
      current: 150,
      previous: 130,
      change_percentage: 15.38,
    },
  },
  {
    id: 'insight-2',
    type: 'financial' as const,
    title: 'تحسن في التحصيل',
    description: 'ارتفعت نسبة تحصيل الإيجارات إلى 92%',
    priority: 'medium' as const,
    created_at: new Date('2024-01-14').toISOString(),
    is_dismissed: false,
    data: {
      collection_rate: 92,
      target: 95,
      gap: 3,
    },
  },
  {
    id: 'insight-3',
    type: 'properties' as const,
    title: 'صيانة مطلوبة',
    description: 'هناك 5 عقارات تحتاج صيانة عاجلة',
    priority: 'high' as const,
    created_at: new Date('2024-01-13').toISOString(),
    is_dismissed: false,
    data: {
      properties_needing_maintenance: 5,
      estimated_cost: 25000,
    },
  },
  {
    id: 'insight-4',
    type: 'loans' as const,
    title: 'قروض متأخرة',
    description: 'يوجد 3 مستفيدين لديهم أقساط متأخرة',
    priority: 'medium' as const,
    created_at: new Date('2024-01-12').toISOString(),
    is_dismissed: true,
    data: {
      overdue_loans: 3,
      total_overdue_amount: 4500,
    },
  },
];

// ==================== Property AI Analysis ====================
export const mockPropertyAnalysis = {
  property_id: 'prop-1',
  analysis_type: 'comprehensive',
  results: {
    occupancy_rate: 85,
    revenue_trend: 'increasing',
    maintenance_score: 72,
    recommendations: [
      'زيادة الإيجار بنسبة 5% للوحدات الجديدة',
      'جدولة صيانة دورية للمبنى',
      'تحسين نظام التكييف',
    ],
    predicted_revenue: {
      next_month: 45000,
      next_quarter: 140000,
      next_year: 560000,
    },
  },
  generated_at: new Date('2024-01-15').toISOString(),
};

export const mockMaintenanceSuggestions = [
  {
    id: 'maint-1',
    property_id: 'prop-1',
    type: 'preventive',
    description: 'فحص نظام التكييف المركزي',
    priority: 'high',
    estimated_cost: 2500,
    suggested_date: '2024-02-01',
  },
  {
    id: 'maint-2',
    property_id: 'prop-1',
    type: 'corrective',
    description: 'إصلاح تسريب في السطح',
    priority: 'urgent',
    estimated_cost: 5000,
    suggested_date: '2024-01-20',
  },
];

export const mockRevenuePrediction = {
  property_id: 'prop-1',
  predictions: [
    { month: 'يناير 2024', amount: 42000, confidence: 0.95 },
    { month: 'فبراير 2024', amount: 44000, confidence: 0.92 },
    { month: 'مارس 2024', amount: 45000, confidence: 0.88 },
    { month: 'أبريل 2024', amount: 46000, confidence: 0.85 },
  ],
  factors: ['موسمية', 'معدل إشغال', 'اتجاهات السوق'],
};

// ==================== Conversations ====================
export const mockConversations = [
  {
    id: 'conv-1',
    user_id: 'user-1',
    started_at: new Date('2024-01-15T10:00:00'),
    last_message_at: new Date('2024-01-15T10:05:00'),
    message_count: 4,
    status: 'active',
  },
  {
    id: 'conv-2',
    user_id: 'user-2',
    started_at: new Date('2024-01-14T14:00:00'),
    last_message_at: new Date('2024-01-14T14:30:00'),
    message_count: 10,
    status: 'closed',
  },
];

// ==================== AI System Audits ====================
export const mockAIAudits = [
  {
    id: 'audit-1',
    audit_type: 'comprehensive',
    created_at: new Date('2024-01-15').toISOString(),
    completed_at: new Date('2024-01-15').toISOString(),
    findings: {
      total_issues: 12,
      critical: 2,
      warnings: 5,
      info: 5,
    },
    ai_analysis: 'تم اكتشاف مشكلتين حرجتين تتعلقان بالأمان',
    fixed_issues: 8,
  },
];

// ==================== Quick Actions ====================
export const mockQuickActions = [
  {
    id: 'action-1',
    label: 'عرض الرصيد',
    action: 'show_balance',
    icon: 'wallet',
  },
  {
    id: 'action-2',
    label: 'طلب مساعدة',
    action: 'request_help',
    icon: 'help-circle',
  },
  {
    id: 'action-3',
    label: 'التوزيعات',
    action: 'show_distributions',
    icon: 'pie-chart',
  },
];

// ==================== Helper Functions ====================
export const createMockChatMessage = (overrides: Partial<typeof mockChatMessages[0]> = {}) => ({
  id: `msg-${Date.now()}`,
  role: 'user' as const,
  content: 'رسالة اختبارية',
  timestamp: new Date(),
  conversation_id: 'conv-1',
  ...overrides,
});

export const createMockInsight = (overrides: Partial<typeof mockAIInsights[0]> = {}) => ({
  id: `insight-${Date.now()}`,
  type: 'beneficiaries' as const,
  title: 'رؤية اختبارية',
  description: 'وصف الرؤية الاختبارية',
  priority: 'medium' as const,
  created_at: new Date().toISOString(),
  is_dismissed: false,
  data: {},
  ...overrides,
});

export const createMockQuickReply = (overrides: Partial<typeof mockQuickReplies[0]> = {}) => ({
  id: `qr-${Date.now()}`,
  text: 'رد سريع اختباري',
  category: 'general',
  roles: ['beneficiary'],
  order: 1,
  ...overrides,
});

// ==================== Export All ====================
export const aiFixtures = {
  chatMessages: mockChatMessages,
  quickReplies: mockQuickReplies,
  insights: mockAIInsights,
  propertyAnalysis: mockPropertyAnalysis,
  maintenanceSuggestions: mockMaintenanceSuggestions,
  revenuePrediction: mockRevenuePrediction,
  conversations: mockConversations,
  audits: mockAIAudits,
  quickActions: mockQuickActions,
};
