/**
 * Test Data Seed - نظام بيانات الاختبار
 * @version 1.0.0
 */

import { supabase } from '@/integrations/supabase/client';

const TEST_PREFIX = 'TEST_';

export interface TestDataResult {
  success: boolean;
  id?: string;
  error?: string;
}

export const TestDataSeed = {
  async createBeneficiary(): Promise<TestDataResult> {
    try {
      const timestamp = Date.now();
      const { data, error } = await supabase
        .from('beneficiaries')
        .insert({
          full_name: `${TEST_PREFIX}BENEFICIARY_${timestamp}`,
          national_id: `1${timestamp}`.slice(0, 10),
          phone: '0500000000',
          status: 'active',
          category: 'أبناء',
        })
        .select('id')
        .single();
      
      if (error) return { success: false, error: error.message };
      return { success: true, id: data.id };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
    }
  },

  async createProperty(): Promise<TestDataResult> {
    try {
      const timestamp = Date.now();
      const { data, error } = await supabase
        .from('properties')
        .insert({
          name: `${TEST_PREFIX}PROPERTY_${timestamp}`,
          type: 'commercial',
          status: 'active',
          location: 'Test Location',
        })
        .select('id')
        .single();
      
      if (error) return { success: false, error: error.message };
      return { success: true, id: data.id };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
    }
  },

  async cleanup(): Promise<{ success: boolean; deleted: number; errors: string[] }> {
    const errors: string[] = [];
    let deleted = 0;
    
    try {
      const { data } = await supabase
        .from('beneficiaries')
        .delete()
        .like('full_name', `${TEST_PREFIX}%`)
        .select('id');
      deleted += data?.length || 0;
    } catch (e) {
      errors.push(e instanceof Error ? e.message : 'Unknown');
    }
    
    try {
      const { data } = await supabase
        .from('properties')
        .delete()
        .like('name', `${TEST_PREFIX}%`)
        .select('id');
      deleted += data?.length || 0;
    } catch (e) {
      errors.push(e instanceof Error ? e.message : 'Unknown');
    }
    
    return { success: errors.length === 0, deleted, errors };
  },
};

export default TestDataSeed;
