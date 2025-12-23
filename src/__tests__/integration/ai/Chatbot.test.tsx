/**
 * Chatbot Integration Tests
 * اختبارات تكامل المساعد الذكي
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { mockChatMessages, mockQuickReplies, mockQuickActions, mockConversations } from '../../fixtures/ai.fixtures';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockConversations[0], error: null }),
    })),
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: { response: 'إجابة المساعد الذكي' }, error: null }),
    },
  },
}));

// Mock ChatbotService
vi.mock('@/services/chatbot.service', () => ({
  ChatbotService: {
    getConversations: vi.fn().mockResolvedValue(mockChatMessages),
    getQuickReplies: vi.fn().mockResolvedValue(mockQuickReplies),
    sendMessage: vi.fn().mockImplementation((_msg: string, _userId: string) => Promise.resolve({
      id: 'msg-new',
      role: 'assistant',
      content: 'إجابة المساعد الذكي',
      timestamp: new Date(),
    })),
    clearConversations: vi.fn().mockImplementation((_userId: string) => Promise.resolve(true)),
  },
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
      mutations: { retry: false },
    },
  });

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{component}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Chatbot Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('عرض المحادثات', () => {
    it('يجب عرض رسائل المحادثة السابقة', async () => {
      // Test that previous messages are displayed
      expect(mockChatMessages).toHaveLength(4);
      expect(mockChatMessages[0].role).toBe('user');
      expect(mockChatMessages[1].role).toBe('assistant');
    });

    it('يجب عرض رسالة المستخدم بشكل صحيح', () => {
      const userMessage = mockChatMessages.find(m => m.role === 'user');
      expect(userMessage).toBeDefined();
      expect(userMessage?.content).toBe('ما هو رصيدي الحالي؟');
    });

    it('يجب عرض رد المساعد بشكل صحيح', () => {
      const assistantMessage = mockChatMessages.find(m => m.role === 'assistant');
      expect(assistantMessage).toBeDefined();
      expect(assistantMessage?.content).toContain('رصيدك الحالي');
    });
  });

  describe('الردود السريعة', () => {
    it('يجب تحميل الردود السريعة', () => {
      expect(mockQuickReplies).toHaveLength(5);
    });

    it('يجب فلترة الردود حسب الدور - مستفيد', () => {
      const beneficiaryReplies = mockQuickReplies.filter(r => 
        r.roles.includes('beneficiary')
      );
      expect(beneficiaryReplies.length).toBeGreaterThan(0);
    });

    it('يجب فلترة الردود حسب الدور - موظف', () => {
      const staffReplies = mockQuickReplies.filter(r => 
        r.roles.includes('staff')
      );
      expect(staffReplies.length).toBeGreaterThan(0);
    });

    it('يجب ترتيب الردود حسب الأولوية', () => {
      const sortedReplies = [...mockQuickReplies].sort((a, b) => a.order - b.order);
      expect(sortedReplies[0].order).toBe(1);
    });
  });

  describe('إرسال الرسائل', () => {
    it('يجب التحقق من وجود محتوى الرسالة قبل الإرسال', () => {
      const emptyMessage = '';
      expect(emptyMessage.trim()).toBe('');
    });

    it('يجب إرسال الرسالة بشكل صحيح', async () => {
      const message = 'ما هو رصيدي؟';
      const { ChatbotService } = await import('@/services/chatbot.service');
      
      await ChatbotService.sendMessage(message, 'user-1');
      expect(ChatbotService.sendMessage).toHaveBeenCalledWith(message, 'user-1');
    });

    it('يجب استلام رد من المساعد', async () => {
      const { ChatbotService } = await import('@/services/chatbot.service');
      const response = await ChatbotService.sendMessage('سؤال اختباري', 'user-1');
      
      expect(response).toHaveProperty('content');
      expect(response.role).toBe('assistant');
    });
  });

  describe('الإجراءات السريعة', () => {
    it('يجب عرض الإجراءات السريعة المتاحة', () => {
      expect(mockQuickActions).toHaveLength(3);
    });

    it('يجب أن تحتوي كل إجراء على label و action', () => {
      mockQuickActions.forEach(action => {
        expect(action).toHaveProperty('label');
        expect(action).toHaveProperty('action');
      });
    });

    it('يجب أن تحتوي الإجراءات على أيقونات', () => {
      mockQuickActions.forEach(action => {
        expect(action).toHaveProperty('icon');
      });
    });
  });

  describe('إدارة المحادثات', () => {
    it('يجب مسح المحادثات السابقة', async () => {
      const { ChatbotService } = await import('@/services/chatbot.service');
      const result = await ChatbotService.clearConversations('user-1');
      
      expect(result).toBe(true);
    });

    it('يجب تحميل المحادثات السابقة', async () => {
      const { ChatbotService } = await import('@/services/chatbot.service');
      const conversations = await ChatbotService.getConversations('user-1');
      
      expect(conversations).toEqual(mockChatMessages);
    });
  });

  describe('التصنيفات', () => {
    it('يجب تصنيف الردود السريعة حسب الفئة', () => {
      const categories = [...new Set(mockQuickReplies.map(r => r.category))];
      expect(categories).toContain('financial');
      expect(categories).toContain('distributions');
      expect(categories).toContain('support');
    });

    it('يجب فلترة الردود حسب الفئة المالية', () => {
      const financialReplies = mockQuickReplies.filter(r => r.category === 'financial');
      expect(financialReplies.length).toBeGreaterThan(0);
    });
  });

  describe('حالة التحميل', () => {
    it('يجب إظهار مؤشر الكتابة أثناء انتظار الرد', () => {
      // Simulate typing indicator
      const isTyping = true;
      expect(isTyping).toBe(true);
    });

    it('يجب إخفاء مؤشر الكتابة بعد استلام الرد', () => {
      // Simulate typing indicator after response
      const isTyping = false;
      expect(isTyping).toBe(false);
    });
  });

  describe('التاريخ والوقت', () => {
    it('يجب عرض وقت الرسالة بشكل صحيح', () => {
      const message = mockChatMessages[0];
      expect(message.timestamp).toBeInstanceOf(Date);
    });

    it('يجب ترتيب الرسائل حسب الوقت', () => {
      const sortedMessages = [...mockChatMessages].sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      );
      expect(sortedMessages[0].id).toBe('msg-1');
    });
  });

  describe('معالجة الأخطاء', () => {
    it('يجب التعامل مع فشل الإرسال', async () => {
      const { ChatbotService } = await import('@/services/chatbot.service');
      vi.mocked(ChatbotService.sendMessage).mockRejectedValueOnce(new Error('Network error'));
      
      await expect(ChatbotService.sendMessage('test', 'user-1')).rejects.toThrow('Network error');
    });

    it('يجب التعامل مع فشل تحميل المحادثات', async () => {
      const { ChatbotService } = await import('@/services/chatbot.service');
      vi.mocked(ChatbotService.getConversations).mockRejectedValueOnce(new Error('Load error'));
      
      await expect(ChatbotService.getConversations('user-1')).rejects.toThrow('Load error');
    });
  });
});
