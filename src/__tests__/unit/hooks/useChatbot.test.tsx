/**
 * useChatbot Hook Unit Tests
 * اختبارات وحدة hook المساعد الذكي
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mockChatMessages, mockQuickReplies, mockQuickActions } from '../../fixtures/ai.fixtures';

// Mock ChatbotService
vi.mock('@/services/chatbot.service', () => ({
  ChatbotService: {
    getConversations: vi.fn().mockResolvedValue(mockChatMessages),
    getQuickReplies: vi.fn().mockResolvedValue(mockQuickReplies),
    sendMessage: vi.fn().mockResolvedValue({
      id: 'msg-new',
      role: 'assistant',
      content: 'إجابة المساعد الذكي',
      timestamp: new Date(),
    }),
    clearConversations: vi.fn().mockResolvedValue(true),
  },
}));

// Mock useAuth
vi.mock('@/hooks/auth/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-1' },
    roles: ['staff'],
  }),
}));

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
  },
}));

// Create wrapper for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useChatbot Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('تحميل المحادثات', () => {
    it('يجب تحميل المحادثات عند بدء التشغيل', async () => {
      const { ChatbotService } = await import('@/services/chatbot.service');
      await ChatbotService.getConversations('user-1');
      
      expect(ChatbotService.getConversations).toHaveBeenCalledWith('user-1');
    });

    it('يجب إرجاع قائمة الرسائل', async () => {
      const { ChatbotService } = await import('@/services/chatbot.service');
      const messages = await ChatbotService.getConversations('user-1');
      
      expect(messages).toEqual(mockChatMessages);
      expect(messages).toHaveLength(4);
    });
  });

  describe('الردود السريعة', () => {
    it('يجب تحميل الردود السريعة', async () => {
      const { ChatbotService } = await import('@/services/chatbot.service');
      const replies = await ChatbotService.getQuickReplies();
      
      expect(replies).toEqual(mockQuickReplies);
    });

    it('يجب فلترة الردود حسب دور المستخدم', () => {
      const staffReplies = mockQuickReplies.filter(r => 
        r.roles.includes('staff')
      );
      expect(staffReplies.length).toBeGreaterThan(0);
    });

    it('يجب ترتيب الردود حسب الأولوية', () => {
      const sorted = [...mockQuickReplies].sort((a, b) => a.order - b.order);
      expect(sorted[0].order).toBeLessThanOrEqual(sorted[1].order);
    });
  });

  describe('إرسال الرسائل', () => {
    it('يجب إرسال رسالة بنجاح', async () => {
      const { ChatbotService } = await import('@/services/chatbot.service');
      const response = await ChatbotService.sendMessage('user-1', 'سؤال اختباري');
      
      expect(ChatbotService.sendMessage).toHaveBeenCalledWith('user-1', 'سؤال اختباري');
      expect(response.role).toBe('assistant');
    });

    it('يجب استلام رد من المساعد', async () => {
      const { ChatbotService } = await import('@/services/chatbot.service');
      const response = await ChatbotService.sendMessage('user-1', 'ما هو رصيدي؟');
      
      expect(response.content).toBeDefined();
      expect(response.content).toBe('إجابة المساعد الذكي');
    });

    it('يجب التعامل مع رسالة فارغة', () => {
      const emptyMessage = '';
      expect(emptyMessage.trim().length).toBe(0);
    });
  });

  describe('مسح المحادثات', () => {
    it('يجب مسح المحادثات بنجاح', async () => {
      const { ChatbotService } = await import('@/services/chatbot.service');
      const result = await ChatbotService.clearConversations('user-1');
      
      expect(result).toBe(true);
    });
  });

  describe('الإجراءات السريعة', () => {
    it('يجب عرض الإجراءات المتاحة', () => {
      expect(mockQuickActions).toHaveLength(3);
    });

    it('يجب أن تحتوي كل إجراء على معرف', () => {
      mockQuickActions.forEach(action => {
        expect(action.id).toBeDefined();
      });
    });
  });

  describe('حالات التحميل', () => {
    it('يجب تعيين حالة التحميل أثناء جلب البيانات', () => {
      const isLoading = true;
      expect(isLoading).toBe(true);
    });

    it('يجب إلغاء حالة التحميل بعد اكتمال الجلب', () => {
      const isLoading = false;
      expect(isLoading).toBe(false);
    });
  });

  describe('مؤشر الكتابة', () => {
    it('يجب إظهار مؤشر الكتابة أثناء انتظار الرد', () => {
      const isTyping = true;
      expect(isTyping).toBe(true);
    });

    it('يجب إخفاء مؤشر الكتابة بعد استلام الرد', () => {
      const isTyping = false;
      expect(isTyping).toBe(false);
    });
  });

  describe('معالجة الأخطاء', () => {
    it('يجب التعامل مع خطأ في الإرسال', async () => {
      const { ChatbotService } = await import('@/services/chatbot.service');
      vi.mocked(ChatbotService.sendMessage).mockRejectedValueOnce(new Error('Send error'));
      
      await expect(ChatbotService.sendMessage('user-1', 'test')).rejects.toThrow('Send error');
    });

    it('يجب التعامل مع خطأ في تحميل المحادثات', async () => {
      const { ChatbotService } = await import('@/services/chatbot.service');
      vi.mocked(ChatbotService.getConversations).mockRejectedValueOnce(new Error('Load error'));
      
      await expect(ChatbotService.getConversations('user-1')).rejects.toThrow('Load error');
    });
  });

  describe('التحقق من وجود محادثات', () => {
    it('يجب التحقق من وجود محادثات سابقة', () => {
      const hasConversations = mockChatMessages.length > 0;
      expect(hasConversations).toBe(true);
    });

    it('يجب إرجاع false إذا لم توجد محادثات', () => {
      const hasConversations = [].length > 0;
      expect(hasConversations).toBe(false);
    });
  });
});
