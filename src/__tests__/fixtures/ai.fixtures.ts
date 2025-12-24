/**
 * AI Fixtures - بيانات وهمية للذكاء الاصطناعي
 * تم إفراغ المحتوى - جاهز لإضافة بيانات جديدة
 */

// تصديرات فارغة
export const mockChatMessages: any[] = [];
export const mockQuickReplies: any[] = [];
export const mockAIInsights: any[] = [];
export const mockConversations: any[] = [];
export const mockAIAudits: any[] = [];
export const mockQuickActions: any[] = [];

// Property AI analysis results - structured as expected by tests
export const mockPropertyAnalysis = {
  results: {
    occupancy_rate: 85,
    revenue_trend: 'increasing',
    recommendations: [] as string[],
    predicted_revenue: {
      next_year: 560000,
      next_quarter: 140000,
      next_month: 45000,
    },
    maintenance_score: 72,
  },
};

export const mockMaintenanceSuggestions: any[] = [];

export const mockRevenuePrediction = {
  predictions: [] as any[],
  factors: [] as string[],
};

// Helper Functions
export const createMockChatMessage = (overrides: Record<string, any> = {}) => ({
  id: 'msg-1',
  content: '',
  role: 'user',
  created_at: new Date().toISOString(),
  ...overrides,
});

export const createMockInsight = (overrides: Record<string, any> = {}) => ({
  id: 'insight-1',
  title: 'رؤية افتراضية',
  description: '',
  type: 'beneficiaries',
  priority: 'medium',
  is_dismissed: false,
  data: {},
  created_at: new Date().toISOString(),
  ...overrides,
});

export const createMockQuickReply = (overrides: Record<string, any> = {}) => ({
  id: 'reply-1',
  text: '',
  ...overrides,
});

export const aiFixtures = {
  chatMessages: [],
  quickReplies: [],
  insights: [],
  propertyAnalysis: mockPropertyAnalysis,
  maintenanceSuggestions: mockMaintenanceSuggestions,
  revenuePrediction: mockRevenuePrediction,
  conversations: [],
  audits: [],
  quickActions: [],
};
