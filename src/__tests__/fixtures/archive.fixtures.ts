/**
 * Archive Test Fixtures - بيانات اختبار الأرشيف
 * @version 1.0.0
 */

export const mockArchiveDocuments = [
  {
    id: 'doc-1',
    title: 'عقد إيجار - عمارة الرياض',
    document_type: 'contract',
    category: 'contracts',
    file_path: '/archive/contracts/contract-1.pdf',
    file_size: 1024000,
    mime_type: 'application/pdf',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    created_by: 'user-1',
    tags: ['إيجار', 'عقارات', 'الرياض'],
    is_archived: true,
    archived_at: '2024-06-01T00:00:00Z',
    archived_by: 'archivist-1',
    description: 'عقد إيجار لعمارة الرياض - السنة المالية 2024',
    retention_period: 7,
    expiry_date: '2031-01-15',
  },
  {
    id: 'doc-2',
    title: 'تقرير مالي سنوي 2023',
    document_type: 'financial_report',
    category: 'financial',
    file_path: '/archive/financial/report-2023.pdf',
    file_size: 2048000,
    mime_type: 'application/pdf',
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-02-01T10:00:00Z',
    created_by: 'accountant-1',
    tags: ['تقرير', 'مالي', '2023'],
    is_archived: true,
    archived_at: '2024-03-01T00:00:00Z',
    archived_by: 'archivist-1',
    description: 'التقرير المالي السنوي للوقف - 2023',
    retention_period: 10,
    expiry_date: '2034-02-01',
  },
  {
    id: 'doc-3',
    title: 'محضر اجتماع مجلس الإدارة',
    document_type: 'meeting_minutes',
    category: 'governance',
    file_path: '/archive/governance/meeting-q1-2024.pdf',
    file_size: 512000,
    mime_type: 'application/pdf',
    created_at: '2024-03-15T10:00:00Z',
    updated_at: '2024-03-15T10:00:00Z',
    created_by: 'admin-1',
    tags: ['اجتماع', 'مجلس الإدارة', 'Q1'],
    is_archived: true,
    archived_at: '2024-04-01T00:00:00Z',
    archived_by: 'archivist-1',
    description: 'محضر اجتماع مجلس الإدارة - الربع الأول 2024',
    retention_period: 15,
    expiry_date: '2039-03-15',
  },
];

export const mockArchiveCategories = [
  { id: 'cat-1', name: 'العقود', slug: 'contracts', count: 45, icon: 'FileText' },
  { id: 'cat-2', name: 'التقارير المالية', slug: 'financial', count: 28, icon: 'BarChart' },
  { id: 'cat-3', name: 'الحوكمة', slug: 'governance', count: 15, icon: 'Shield' },
  { id: 'cat-4', name: 'المستندات القانونية', slug: 'legal', count: 12, icon: 'Scale' },
  { id: 'cat-5', name: 'الصيانة', slug: 'maintenance', count: 33, icon: 'Wrench' },
];

export const mockArchiveStats = {
  total_documents: 133,
  total_size_bytes: 1073741824,
  by_category: {
    contracts: 45,
    financial: 28,
    governance: 15,
    legal: 12,
    maintenance: 33,
  },
  by_year: {
    '2024': 55,
    '2023': 48,
    '2022': 30,
  },
  pending_review: 5,
  expiring_soon: 3,
};

export const archiveFilters = {
  byCategory: { category: 'contracts' },
  byDateRange: { startDate: '2024-01-01', endDate: '2024-12-31' },
  byDocumentType: { documentType: 'financial_report' },
  byTags: { tags: ['إيجار', 'عقارات'] },
  byCreator: { createdBy: 'user-1' },
};
