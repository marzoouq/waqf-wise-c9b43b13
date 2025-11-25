import { Database } from '@/integrations/supabase/types';

type Document = Database['public']['Tables']['documents']['Insert'];

export const mockDocument = (overrides?: Partial<Document>): Document => ({
  name: 'وثيقة ملكية عقار',
  file_type: 'application/pdf',
  file_size: '1024000',
  category: 'عقارات',
  description: 'وثيقة ملكية العقار رقم 1',
  ...overrides,
});

export const mockDocuments = (count: number = 20): Document[] => {
  const categories = ['عقارات', 'مستفيدون', 'محاسبة', 'إدارية', 'قانونية'];
  const fileTypes = ['application/pdf', 'image/jpeg', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  return Array.from({ length: count }, (_, i) => 
    mockDocument({ 
      name: `مستند ${categories[i % categories.length]} رقم ${i + 1}`,
      file_type: fileTypes[i % fileTypes.length],
      file_size: String(500000 + (i * 100000)),
      category: categories[i % categories.length],
      description: `وصف مستند ${categories[i % categories.length]} رقم ${i + 1}`,
    })
  );
};
