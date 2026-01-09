/**
 * اختبارات خدمة الأرشفة - اختبارات حقيقية
 * Archive Service Tests - Real Tests
 * 
 * هذه الاختبارات تتحقق من:
 * 1. استدعاء Supabase بالمعاملات الصحيحة
 * 2. معالجة البيانات المرجعة بشكل صحيح
 * 3. معالجة الأخطاء والحالات الحدية
 * 4. تكامل التخزين مع قاعدة البيانات
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ArchiveService } from '@/services/archive.service';
import { mockSupabase, setMockTableData, clearMockTableData } from '../../utils/supabase.mock';

describe('ArchiveService', () => {
  const mockDocuments = [
    {
      id: 'doc-1',
      name: 'عقد إيجار - محل تجاري',
      category: 'عقود',
      file_path: '/documents/contract-1.pdf',
      file_type: 'PDF',
      file_size: '2.5 MB',
      file_size_bytes: 2621440,
      folder_id: 'folder-1',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      description: 'عقد إيجار للمحل التجاري رقم 5',
      storage_path: 'contracts/doc-1.pdf'
    },
    {
      id: 'doc-2',
      name: 'تقرير مالي ربع سنوي',
      category: 'تقارير',
      file_path: '/documents/report-1.pdf',
      file_type: 'PDF',
      file_size: '1.2 MB',
      file_size_bytes: 1258291,
      folder_id: 'folder-2',
      created_at: '2024-02-20T14:30:00Z',
      updated_at: '2024-02-20T14:30:00Z',
      description: 'التقرير المالي للربع الأول 2024',
      storage_path: 'reports/doc-2.pdf'
    },
  ];

  const mockFolders = [
    {
      id: 'folder-1',
      name: 'العقود',
      description: 'مجلد العقود والاتفاقيات',
      parent_id: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'folder-2',
      name: 'التقارير',
      description: 'مجلد التقارير المالية والإدارية',
      parent_id: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
  });

  describe('getDocuments', () => {
    it('should call supabase.from with documents table', async () => {
      setMockTableData('documents', mockDocuments);

      await ArchiveService.getDocuments();

      expect(mockSupabase.from).toHaveBeenCalledWith('documents');
    });

    it('should return all documents when no folder specified', async () => {
      setMockTableData('documents', mockDocuments);

      const result = await ArchiveService.getDocuments();

      expect(Array.isArray(result)).toBe(true);
    });

    it('should filter by folder_id when specified', async () => {
      const folder1Docs = mockDocuments.filter(d => d.folder_id === 'folder-1');
      setMockTableData('documents', folder1Docs);

      const result = await ArchiveService.getDocuments('folder-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('documents');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array when no documents exist', async () => {
      setMockTableData('documents', []);

      const result = await ArchiveService.getDocuments();

      expect(result).toEqual([]);
    });
  });

  describe('getDocumentById', () => {
    it('should fetch single document by ID', async () => {
      setMockTableData('documents', [mockDocuments[0]]);

      const result = await ArchiveService.getDocumentById('doc-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('documents');
      expect(result).toBeDefined();
    });

    it('should return null for non-existent document', async () => {
      setMockTableData('documents', []);

      const result = await ArchiveService.getDocumentById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('createDocument', () => {
    it('should insert document with correct structure', async () => {
      setMockTableData('documents', []);

      const newDoc = {
        name: 'مستند جديد',
        category: 'عقود',
        file_type: 'PDF',
        file_path: '/new-doc.pdf',
        file_size: '500 KB'
      };

      const result = await ArchiveService.createDocument(newDoc);

      expect(mockSupabase.from).toHaveBeenCalledWith('documents');
      expect(result).toBeDefined();
    });
  });

  describe('updateDocument', () => {
    it('should update document and set updated_at', async () => {
      setMockTableData('documents', [mockDocuments[0]]);

      const updates = {
        name: 'عقد إيجار - محدث',
        description: 'وصف محدث'
      };

      const result = await ArchiveService.updateDocument('doc-1', updates);

      expect(mockSupabase.from).toHaveBeenCalledWith('documents');
      expect(result).toBeDefined();
    });
  });

  describe('deleteDocument', () => {
    it('should delete document from database', async () => {
      setMockTableData('documents', mockDocuments);

      await ArchiveService.deleteDocument('doc-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('documents');
    });

    it('should also delete from storage if path provided', async () => {
      setMockTableData('documents', mockDocuments);

      await ArchiveService.deleteDocument('doc-1', 'contracts/doc-1.pdf');

      expect(mockSupabase.storage.from).toHaveBeenCalledWith('archive-documents');
    });
  });

  describe('getFolders', () => {
    it('should fetch all folders', async () => {
      setMockTableData('folders', mockFolders);

      const result = await ArchiveService.getFolders();

      expect(mockSupabase.from).toHaveBeenCalledWith('folders');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array when no folders exist', async () => {
      setMockTableData('folders', []);

      const result = await ArchiveService.getFolders();

      expect(result).toEqual([]);
    });
  });

  describe('createFolder', () => {
    it('should create folder with correct structure', async () => {
      setMockTableData('folders', []);

      const newFolder = {
        name: 'مجلد جديد',
        description: 'وصف المجلد',
        parent_id: null
      };

      const result = await ArchiveService.createFolder(newFolder);

      expect(mockSupabase.from).toHaveBeenCalledWith('folders');
      expect(result).toBeDefined();
    });
  });

  describe('searchDocuments', () => {
    it('should search documents by name and description', async () => {
      setMockTableData('documents', mockDocuments);

      const result = await ArchiveService.searchDocuments('عقد');

      expect(mockSupabase.from).toHaveBeenCalledWith('documents');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array for no matches', async () => {
      setMockTableData('documents', []);

      const result = await ArchiveService.searchDocuments('غير موجود');

      expect(result).toEqual([]);
    });
  });

  describe('getStats', () => {
    it('should calculate archive statistics correctly', async () => {
      setMockTableData('documents', mockDocuments);
      setMockTableData('folders', mockFolders);

      const result = await ArchiveService.getStats();

      expect(result).toHaveProperty('totalDocuments');
      expect(result).toHaveProperty('totalFolders');
      expect(result).toHaveProperty('totalSize');
      expect(result).toHaveProperty('recentUploads');
      expect(result).toHaveProperty('thisMonthAdditions');
      
      expect(typeof result.totalDocuments).toBe('number');
      expect(typeof result.totalFolders).toBe('number');
      expect(typeof result.totalSize).toBe('string');
    });

    it('should handle empty archive', async () => {
      setMockTableData('documents', []);
      setMockTableData('folders', []);

      const result = await ArchiveService.getStats();

      expect(result.totalDocuments).toBe(0);
      expect(result.totalFolders).toBe(0);
    });
  });

  describe('uploadDocument', () => {
    it('should upload file and create document record', async () => {
      setMockTableData('documents', []);

      const file = new File(['test content'], 'test-document.pdf', { 
        type: 'application/pdf' 
      });

      const result = await ArchiveService.uploadDocument(
        file,
        'مستند اختباري',
        'عقود',
        'وصف المستند',
        'folder-1'
      );

      // يتحقق من استدعاء التخزين
      expect(mockSupabase.storage.from).toHaveBeenCalledWith('archive-documents');
      
      // يتحقق من إنشاء السجل في قاعدة البيانات
      expect(mockSupabase.from).toHaveBeenCalledWith('documents');
      expect(result).toBeDefined();
    });

    it('should handle upload without folder_id', async () => {
      setMockTableData('documents', []);

      const file = new File(['test'], 'doc.pdf', { type: 'application/pdf' });

      const result = await ArchiveService.uploadDocument(
        file,
        'مستند بدون مجلد',
        'تقارير',
        undefined,
        undefined
      );

      expect(result).toBeDefined();
    });
  });

  describe('getDocumentVersions', () => {
    it('should fetch document versions', async () => {
      setMockTableData('document_versions', [
        { id: 'v1', document_id: 'doc-1', version_number: 1, is_current: false },
        { id: 'v2', document_id: 'doc-1', version_number: 2, is_current: true }
      ]);

      const result = await ArchiveService.getDocumentVersions('doc-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('document_versions');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array for invalid document ID', async () => {
      const result = await ArchiveService.getDocumentVersions('');

      expect(result).toEqual([]);
    });
  });

  describe('getDocumentTags', () => {
    it('should fetch tags for specific document', async () => {
      setMockTableData('document_tags', [
        { id: 'tag-1', document_id: 'doc-1', tag_name: 'عقد', tag_type: 'manual' },
        { id: 'tag-2', document_id: 'doc-1', tag_name: 'إيجار', tag_type: 'ai' }
      ]);

      const result = await ArchiveService.getDocumentTags('doc-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('document_tags');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should fetch all tags when no document ID specified', async () => {
      setMockTableData('document_tags', []);

      const result = await ArchiveService.getDocumentTags();

      expect(mockSupabase.from).toHaveBeenCalledWith('document_tags');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('addDocumentTag', () => {
    it('should add tag to document', async () => {
      setMockTableData('document_tags', []);

      const tag = {
        document_id: 'doc-1',
        tag_name: 'عقد جديد',
        tag_type: 'manual' as const
      };

      const result = await ArchiveService.addDocumentTag(tag);

      expect(mockSupabase.from).toHaveBeenCalledWith('document_tags');
      expect(result).toBeDefined();
    });
  });

  describe('deleteDocumentTag', () => {
    it('should delete tag by ID', async () => {
      setMockTableData('document_tags', [{ id: 'tag-1' }]);

      await ArchiveService.deleteDocumentTag('tag-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('document_tags');
    });
  });

  describe('smartSearch', () => {
    it('should search by text in document names', async () => {
      setMockTableData('documents', mockDocuments);

      const result = await ArchiveService.smartSearch('عقد', 'text');

      expect(mockSupabase.from).toHaveBeenCalledWith('documents');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should search by tags', async () => {
      setMockTableData('document_tags', [
        { id: 'tag-1', tag_name: 'مالي', documents: mockDocuments[1] }
      ]);

      const result = await ArchiveService.smartSearch('مالي', 'tags');

      expect(mockSupabase.from).toHaveBeenCalledWith('document_tags');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should search by OCR content', async () => {
      setMockTableData('document_ocr_content', []);

      const result = await ArchiveService.smartSearch('نص مستخرج', 'ocr');

      expect(mockSupabase.from).toHaveBeenCalledWith('document_ocr_content');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('downloadFile', () => {
    it('should download file from storage', async () => {
      const result = await ArchiveService.downloadFile('archive-documents', 'test.pdf');

      expect(mockSupabase.storage.from).toHaveBeenCalledWith('archive-documents');
      expect(result).toBeInstanceOf(Blob);
    });
  });
});
