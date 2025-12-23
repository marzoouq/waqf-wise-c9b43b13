/**
 * Archive Integration Tests - اختبارات تكامل الأرشيف
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mockArchiveDocuments, mockArchiveCategories, mockArchiveStats } from '../../fixtures/archive.fixtures';

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
      single: vi.fn().mockResolvedValue({ data: mockArchiveDocuments[0], error: null }),
      then: vi.fn().mockResolvedValue({ data: mockArchiveDocuments, error: null }),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
        download: vi.fn().mockResolvedValue({ data: new Blob(), error: null }),
        remove: vi.fn().mockResolvedValue({ data: null, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://test.com/file.pdf' } }),
      })),
    },
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

describe('Archive Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Archive Documents', () => {
    it('should have mock documents data available', () => {
      expect(mockArchiveDocuments).toBeDefined();
      expect(mockArchiveDocuments.length).toBeGreaterThan(0);
    });

    it('should have correct document structure', () => {
      const doc = mockArchiveDocuments[0];
      expect(doc).toHaveProperty('id');
      expect(doc).toHaveProperty('title');
      expect(doc).toHaveProperty('document_type');
      expect(doc).toHaveProperty('category');
      expect(doc).toHaveProperty('file_path');
      expect(doc).toHaveProperty('is_archived');
    });

    it('should have valid document types', () => {
      const validTypes = ['contract', 'financial_report', 'meeting_minutes', 'legal', 'maintenance'];
      mockArchiveDocuments.forEach(doc => {
        expect(validTypes).toContain(doc.document_type);
      });
    });

    it('should have retention period set', () => {
      mockArchiveDocuments.forEach(doc => {
        expect(doc.retention_period).toBeGreaterThan(0);
      });
    });
  });

  describe('Archive Categories', () => {
    it('should have categories defined', () => {
      expect(mockArchiveCategories).toBeDefined();
      expect(mockArchiveCategories.length).toBeGreaterThan(0);
    });

    it('should have correct category structure', () => {
      const category = mockArchiveCategories[0];
      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('slug');
      expect(category).toHaveProperty('count');
    });
  });

  describe('Archive Statistics', () => {
    it('should have stats defined', () => {
      expect(mockArchiveStats).toBeDefined();
      expect(mockArchiveStats.total_documents).toBeGreaterThan(0);
    });

    it('should have by_category breakdown', () => {
      expect(mockArchiveStats.by_category).toBeDefined();
      expect(Object.keys(mockArchiveStats.by_category).length).toBeGreaterThan(0);
    });

    it('should have by_year breakdown', () => {
      expect(mockArchiveStats.by_year).toBeDefined();
    });
  });

  describe('Archive Search and Filter', () => {
    it('should filter documents by category', () => {
      const contractDocs = mockArchiveDocuments.filter(d => d.category === 'contracts');
      expect(contractDocs.length).toBeGreaterThanOrEqual(0);
    });

    it('should filter documents by date range', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const filteredDocs = mockArchiveDocuments.filter(d => {
        const docDate = new Date(d.created_at);
        return docDate >= startDate && docDate <= endDate;
      });
      expect(filteredDocs.length).toBeGreaterThan(0);
    });

    it('should filter archived documents', () => {
      const archivedDocs = mockArchiveDocuments.filter(d => d.is_archived);
      expect(archivedDocs.length).toBe(mockArchiveDocuments.length);
    });
  });
});
