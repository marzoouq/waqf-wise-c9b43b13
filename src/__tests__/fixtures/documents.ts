import { Database } from '@/integrations/supabase/types';

type Document = Database['public']['Tables']['documents']['Insert'];

export const mockDocument = (overrides?: Partial<Document>): Document => ({
  name: 'وثيقة ملكية عقار',
  document_type: 'عقود',
  file_path: '/documents/contract-001.pdf',
  file_size: '1024000',
  mime_type: 'application/pdf',
  status: 'active',
  category: 'عقارات',
  description: 'وثيقة ملكية العقار رقم 1',
  tags: ['عقارات', 'ملكية', 'وثائق رسمية'],
  ...overrides,
});

export const mockDocuments = (count: number = 20): Document[] => {
  const types = ['عقود', 'مستندات قانونية', 'تقارير مالية', 'مراسلات', 'شهادات'];
  const categories = ['عقارات', 'مستفيدون', 'محاسبة', 'إدارية', 'قانونية'];
  const statuses = ['active', 'archived', 'pending'];
  
  return Array.from({ length: count }, (_, i) => 
    mockDocument({ 
      name: `${types[i % types.length]} رقم ${i + 1}`,
      document_type: types[i % types.length],
      file_path: `/documents/doc-${String(i + 1).padStart(3, '0')}.pdf`,
      file_size: String(500000 + (i * 100000)),
      category: categories[i % categories.length],
      status: statuses[i % statuses.length],
      description: `وصف ${types[i % types.length]} رقم ${i + 1}`,
      tags: [categories[i % categories.length], types[i % types.length]],
    })
  );
};
