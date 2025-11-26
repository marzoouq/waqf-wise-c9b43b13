import { Database } from '@/integrations/supabase/types';

type Property = Database['public']['Tables']['properties']['Insert'];

export const mockRealisticProperties = (): Property[] => [
  {
    name: 'عمارة الوقف السكنية',
    type: 'عمارة سكنية',
    location: 'الرياض - حي الربوة',
    status: 'مؤجر',
    monthly_revenue: 15000,
  },
  {
    name: 'محل تجاري',
    type: 'محل تجاري',
    location: 'الرياض - شارع الملك فهد',
    status: 'مؤجر',
    monthly_revenue: 8000,
  },
];
