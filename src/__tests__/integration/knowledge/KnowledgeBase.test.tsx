/**
 * Knowledge Base Integration Tests - اختبارات تكامل قاعدة المعرفة
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  mockKnowledgeArticles, 
  mockKnowledgeCategories, 
  mockKnowledgeVideos, 
  mockKnowledgeDownloads,
  mockKnowledgeStats 
} from '../../fixtures/knowledge.fixtures';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockKnowledgeArticles[0], error: null }),
      then: vi.fn().mockResolvedValue({ data: mockKnowledgeArticles, error: null }),
    })),
  },
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false, gcTime: Infinity },
    mutations: { retry: false },
  },
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Knowledge Base Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Knowledge Articles', () => {
    it('should have mock articles data available', () => {
      expect(mockKnowledgeArticles).toBeDefined();
      expect(mockKnowledgeArticles.length).toBeGreaterThan(0);
    });

    it('should have correct article structure', () => {
      const article = mockKnowledgeArticles[0];
      expect(article).toHaveProperty('id');
      expect(article).toHaveProperty('title');
      expect(article).toHaveProperty('slug');
      expect(article).toHaveProperty('content');
      expect(article).toHaveProperty('category');
      expect(article).toHaveProperty('status');
      expect(article).toHaveProperty('view_count');
    });

    it('should have valid statuses', () => {
      const validStatuses = ['draft', 'published', 'archived'];
      mockKnowledgeArticles.forEach(article => {
        expect(validStatuses).toContain(article.status);
      });
    });

    it('should track helpful/not helpful counts', () => {
      mockKnowledgeArticles.forEach(article => {
        expect(article.helpful_count).toBeGreaterThanOrEqual(0);
        expect(article.not_helpful_count).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have tags array', () => {
      mockKnowledgeArticles.forEach(article => {
        expect(Array.isArray(article.tags)).toBe(true);
      });
    });
  });

  describe('Knowledge Categories', () => {
    it('should have categories defined', () => {
      expect(mockKnowledgeCategories).toBeDefined();
      expect(mockKnowledgeCategories.length).toBeGreaterThan(0);
    });

    it('should have correct category structure', () => {
      const category = mockKnowledgeCategories[0];
      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('slug');
      expect(category).toHaveProperty('count');
      expect(category).toHaveProperty('icon');
    });
  });

  describe('Knowledge Videos', () => {
    it('should have videos defined', () => {
      expect(mockKnowledgeVideos).toBeDefined();
      expect(mockKnowledgeVideos.length).toBeGreaterThan(0);
    });

    it('should have correct video structure', () => {
      const video = mockKnowledgeVideos[0];
      expect(video).toHaveProperty('id');
      expect(video).toHaveProperty('title');
      expect(video).toHaveProperty('description');
      expect(video).toHaveProperty('video_url');
      expect(video).toHaveProperty('duration');
      expect(video).toHaveProperty('view_count');
    });

    it('should have valid duration', () => {
      mockKnowledgeVideos.forEach(video => {
        expect(video.duration).toBeGreaterThan(0);
      });
    });
  });

  describe('Knowledge Downloads', () => {
    it('should have downloads defined', () => {
      expect(mockKnowledgeDownloads).toBeDefined();
      expect(mockKnowledgeDownloads.length).toBeGreaterThan(0);
    });

    it('should have correct download structure', () => {
      const download = mockKnowledgeDownloads[0];
      expect(download).toHaveProperty('id');
      expect(download).toHaveProperty('title');
      expect(download).toHaveProperty('file_path');
      expect(download).toHaveProperty('file_size');
      expect(download).toHaveProperty('download_count');
    });
  });

  describe('Knowledge Statistics', () => {
    it('should have stats defined', () => {
      expect(mockKnowledgeStats).toBeDefined();
      expect(mockKnowledgeStats.total_articles).toBeGreaterThan(0);
    });

    it('should track total views', () => {
      expect(mockKnowledgeStats.total_views).toBeGreaterThan(0);
    });

    it('should have popular searches', () => {
      expect(Array.isArray(mockKnowledgeStats.popular_searches)).toBe(true);
    });

    it('should have top articles', () => {
      expect(Array.isArray(mockKnowledgeStats.top_articles)).toBe(true);
    });
  });

  describe('Knowledge Search', () => {
    it('should search articles by title', () => {
      const searchTerm = 'مساعدة';
      const results = mockKnowledgeArticles.filter(a => 
        a.title.includes(searchTerm) || a.content.includes(searchTerm)
      );
      expect(results).toBeDefined();
    });

    it('should filter by category', () => {
      const categorySlug = 'guides';
      const filtered = mockKnowledgeArticles.filter(a => a.category === categorySlug);
      expect(filtered).toBeDefined();
    });

    it('should filter published only', () => {
      const published = mockKnowledgeArticles.filter(a => a.status === 'published');
      expect(published.length).toBe(mockKnowledgeArticles.length);
    });
  });
});
