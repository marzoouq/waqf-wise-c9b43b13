/**
 * اختبارات خدمة الأرشفة
 * Archive Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ArchiveService } from '@/services/archive.service';
import { mockSupabase, setMockTableData, clearMockTableData } from '../../utils/supabase.mock';

describe('ArchiveService', () => {
  const mockDocuments = [
    {
      id: 'doc-1',
      title: 'عقد إيجار',
      category: 'عقود',
      file_path: '/documents/contract-1.pdf',
      created_at: '2024-01-15',
    },
    {
      id: 'doc-2',
      title: 'تقرير مالي',
      category: 'تقارير',
      file_path: '/documents/report-1.pdf',
      created_at: '2024-02-20',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
  });

  describe('getDocuments', () => {
    it('should fetch all documents', async () => {
      setMockTableData('documents', mockDocuments);

      const result = await ArchiveService.getDocuments();
      
      expect(mockSupabase.from).toHaveBeenCalledWith('documents');
      expect(result).toBeDefined();
    });
  });

  describe('getDocumentById', () => {
    it('should fetch document by ID', async () => {
      setMockTableData('documents', [mockDocuments[0]]);

      const result = await ArchiveService.getDocumentById(mockDocuments[0].id);
      
      expect(result).toBeDefined();
    });
  });

  describe('uploadDocument', () => {
    it('should upload document', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

      const result = await ArchiveService.uploadDocument(file, 'عقود', 'عقد جديد');
      
      expect(result).toBeDefined();
    });
  });

  describe('deleteDocument', () => {
    it('should delete document', async () => {
      setMockTableData('documents', mockDocuments);

      await ArchiveService.deleteDocument(mockDocuments[0].id);
      
      expect(mockSupabase.from).toHaveBeenCalledWith('documents');
    });
  });

});

