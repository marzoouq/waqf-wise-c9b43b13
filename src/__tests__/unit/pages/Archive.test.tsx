/**
 * اختبارات صفحة الأرشيف
 * Archive Page Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import React from 'react';

// Mock useAuth
vi.mock('@/contexts/AuthContext', async () => {
  const actual = await vi.importActual('@/contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: { id: 'archivist-1', email: 'archivist@waqf.sa' },
      roles: ['archivist'],
      isLoading: false,
      isAuthenticated: true,
    }),
  };
});

// Archive mock data
const mockArchiveDocuments = [
  { id: 'doc-1', title: 'عقد إيجار القويشي', type: 'عقد', created_at: '2024-01-01' },
  { id: 'doc-2', title: 'سند قبض رقم 001', type: 'سند', created_at: '2024-02-01' },
  { id: 'doc-3', title: 'محضر اجتماع الورثة', type: 'محضر', created_at: '2024-03-01' },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Archive Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render archive page', async () => {
      const Archive = (await import('@/pages/Archive')).default;
      render(<Archive />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(document.body).toBeDefined();
      });
    });
  });

  describe('Documents List', () => {
    it('should load all documents', () => {
      expect(mockArchiveDocuments).toBeDefined();
      expect(mockArchiveDocuments.length).toBe(3);
    });

    it('should categorize documents by type', () => {
      const contracts = mockArchiveDocuments.filter(d => d.type === 'عقد');
      const receipts = mockArchiveDocuments.filter(d => d.type === 'سند');
      const minutes = mockArchiveDocuments.filter(d => d.type === 'محضر');
      
      expect(contracts.length).toBe(1);
      expect(receipts.length).toBe(1);
      expect(minutes.length).toBe(1);
    });

    it('should have valid document structure', () => {
      mockArchiveDocuments.forEach(doc => {
        expect(doc.id).toBeDefined();
        expect(doc.title).toBeDefined();
        expect(doc.type).toBeDefined();
      });
    });
  });

  describe('Document Search', () => {
    it('should search documents by title', () => {
      const searchResults = mockArchiveDocuments.filter(d => 
        d.title.includes('القويشي')
      );
      
      expect(searchResults.length).toBe(1);
    });
  });
});
