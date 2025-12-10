/**
 * Family Service - خدمة العائلات
 * @version 2.8.65
 */

import { supabase } from "@/integrations/supabase/client";
import { productionLogger } from "@/lib/logger/production-logger";
import type { Family, FamilyMember } from "@/types";

export class FamilyService {
  /**
   * جلب جميع العائلات
   */
  static async getAll(): Promise<Family[]> {
    try {
      const { data, error } = await supabase
        .from('families')
        .select(`
          *,
          head_of_family:beneficiaries!families_head_of_family_id_fkey(
            id,
            full_name,
            national_id
          )
        `)
        .order('family_name', { ascending: true });

      if (error) throw error;
      return (data || []) as unknown as Family[];
    } catch (error) {
      productionLogger.error('Error fetching families', error);
      throw error;
    }
  }

  /**
   * جلب عائلة بالمعرف
   */
  static async getById(id: string): Promise<Family | null> {
    try {
      const { data, error } = await supabase
        .from('families')
        .select(`
          *,
          head_of_family:beneficiaries!families_head_of_family_id_fkey(
            id,
            full_name,
            national_id
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as Family | null;
    } catch (error) {
      productionLogger.error('Error fetching family by id', error);
      throw error;
    }
  }

  /**
   * إضافة عائلة جديدة
   */
  static async create(family: Omit<Family, 'id' | 'created_at' | 'updated_at' | 'total_members'>): Promise<Family> {
    try {
      const { data, error } = await supabase
        .from('families')
        .insert(family)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('فشل إنشاء العائلة');
      return data as unknown as Family;
    } catch (error) {
      productionLogger.error('Error creating family', error);
      throw error;
    }
  }

  /**
   * تحديث عائلة
   */
  static async update(id: string, updates: Partial<Family>): Promise<Family> {
    try {
      const { data, error } = await supabase
        .from('families')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('العائلة غير موجودة');
      return data as unknown as Family;
    } catch (error) {
      productionLogger.error('Error updating family', error);
      throw error;
    }
  }

  /**
   * حذف عائلة
   */
  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('families')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      productionLogger.error('Error deleting family', error);
      throw error;
    }
  }

  /**
   * جلب أفراد العائلة
   */
  static async getMembers(familyId: string): Promise<FamilyMember[]> {
    try {
      const { data, error } = await supabase
        .from('family_members')
        .select(`
          *,
          beneficiary:beneficiaries(
            id,
            full_name,
            national_id,
            phone,
            email,
            status
          )
        `)
        .eq('family_id', familyId)
        .order('priority_level', { ascending: true });

      if (error) throw error;
      return (data || []) as unknown as FamilyMember[];
    } catch (error) {
      productionLogger.error('Error fetching family members', error);
      throw error;
    }
  }

  /**
   * إضافة فرد للعائلة
   */
  static async addMember(member: Omit<FamilyMember, 'id' | 'created_at' | 'updated_at'> & { relationship_to_head: string }): Promise<FamilyMember> {
    try {
      const { data, error } = await supabase
        .from('family_members')
        .insert([member])
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('فشل إضافة الفرد');
      return data as unknown as FamilyMember;
    } catch (error) {
      productionLogger.error('Error adding family member', error);
      throw error;
    }
  }

  /**
   * تحديث فرد في العائلة
   */
  static async updateMember(id: string, updates: Partial<FamilyMember>): Promise<FamilyMember> {
    try {
      const { data, error } = await supabase
        .from('family_members')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('الفرد غير موجود');
      return data as unknown as FamilyMember;
    } catch (error) {
      productionLogger.error('Error updating family member', error);
      throw error;
    }
  }

  /**
   * حذف فرد من العائلة
   */
  static async removeMember(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      productionLogger.error('Error removing family member', error);
      throw error;
    }
  }
}
