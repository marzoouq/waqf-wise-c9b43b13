import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

export const testSupabase = createClient<Database>(supabaseUrl, supabaseKey);

/**
 * تنظيف بيانات الاختبار
 */
export async function cleanupTestData() {
  const tables = [
    'bank_transfer_details',
    'rental_payments',
    'contracts',
    'beneficiary_requests',
    'distribution_details',
    'distributions',
    'beneficiaries',
    'properties',
  ];

  for (const table of tables) {
    try {
      await testSupabase
        .from(table as keyof Database['public']['Tables'])
        .delete()
        .like('created_at', new Date().toISOString().split('T')[0] + '%');
    } catch (error) {
      console.warn(`Failed to clean table ${table}:`, error);
    }
  }
}

/**
 * إنشاء مستفيد اختباري
 */
export async function createTestBeneficiary(data: Partial<Database['public']['Tables']['beneficiaries']['Insert']>) {
  const { data: beneficiary, error } = await testSupabase
    .from('beneficiaries')
    .insert({
      full_name: data.full_name || 'مستفيد اختباري',
      national_id: data.national_id || Math.floor(Math.random() * 9000000000 + 1000000000).toString(),
      phone: data.phone || '0500000000',
      category: data.category || 'ذكور',
      status: data.status || 'نشط',
      ...data,
    })
    .select()
    .single();

  if (error) throw error;
  return beneficiary;
}

/**
 * إنشاء توزيع اختباري
 */
export async function createTestDistribution(data: Partial<Database['public']['Tables']['distributions']['Insert']>) {
  const now = new Date();
  const { data: distribution, error } = await testSupabase
    .from('distributions')
    .insert({
      month: data.month || now.toISOString().slice(0, 7),
      beneficiaries_count: data.beneficiaries_count || 10,
      distribution_date: data.distribution_date || now.toISOString().split('T')[0],
      total_amount: data.total_amount || 10000,
      status: data.status || 'draft',
      waqf_name: data.waqf_name || 'وقف اختباري',
      ...data,
    })
    .select()
    .single();

  if (error) throw error;
  return distribution;
}

/**
 * الحصول على إحصائيات الاختبار
 */
export async function getTestStats() {
  const [beneficiaries, distributions, contracts] = await Promise.all([
    testSupabase.from('beneficiaries').select('count').single(),
    testSupabase.from('distributions').select('count').single(),
    testSupabase.from('contracts').select('count').single(),
  ]);

  return {
    beneficiariesCount: beneficiaries.count || 0,
    distributionsCount: distributions.count || 0,
    contractsCount: contracts.count || 0,
  };
}
