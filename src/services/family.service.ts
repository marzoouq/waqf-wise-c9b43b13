/**
 * Family Service - خدمة العائلات
 * @version 2.8.65
 */

import { supabase } from "@/integrations/supabase/client";
import { productionLogger } from "@/lib/logger/production-logger";
import type { Family, FamilyMember } from "@/types";

export class FamilyService {
  /**
   * جلب جميع العائلات (مع استثناء المحذوفة)
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
        .is('deleted_at', null)
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
      // تنظيف البيانات - إزالة القيم الفارغة التي تسبب أخطاء UUID
      const cleanedUpdates: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(updates)) {
        // تحويل السلاسل الفارغة إلى null لحقول UUID
        if (key.endsWith('_id') && value === '') {
          cleanedUpdates[key] = null;
        } else if (value !== undefined) {
          cleanedUpdates[key] = value;
        }
      }

      const { data, error } = await supabase
        .from('families')
        .update(cleanedUpdates)
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
   * حذف عائلة (Soft Delete - أرشفة)
   */
  static async delete(id: string, reason?: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('families')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: user?.id || null,
          deletion_reason: reason || 'تم الأرشفة بواسطة المستخدم',
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      productionLogger.error('Error archiving family', error);
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
   * حذف فرد من العائلة (Soft Delete)
   */
  static async removeMember(id: string, reason?: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('family_members')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: user?.id || null,
          deletion_reason: reason || 'تمت الإزالة من العائلة',
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      productionLogger.error('Error removing family member', error);
      throw error;
    }
  }

  /**
   * جلب بيانات شجرة عائلة المستفيد
   */
  static async getBeneficiaryFamilyTree(beneficiaryId: string): Promise<{
    beneficiary: {
      id: string;
      full_name: string;
      family_name: string | null;
      category: string;
      relationship: string | null;
      is_head_of_family: boolean | null;
      gender: string | null;
      date_of_birth: string | null;
      status: string;
      number_of_sons: number | null;
      number_of_daughters: number | null;
      number_of_wives: number | null;
      family_size: number | null;
    };
    familyMembers: Array<{
      id: string;
      full_name: string;
      family_name: string | null;
      category: string;
      relationship: string | null;
      is_head_of_family: boolean | null;
      gender: string | null;
      date_of_birth: string | null;
      status: string;
    }>;
  }> {
    try {
      // جلب بيانات المستفيد الحالي
      const { data: beneficiary, error: benError } = await supabase
        .from('beneficiaries')
        .select('id, full_name, family_name, category, relationship, is_head_of_family, gender, date_of_birth, status, number_of_sons, number_of_daughters, number_of_wives, family_size')
        .eq('id', beneficiaryId)
        .maybeSingle();

      if (benError) throw benError;
      if (!beneficiary) throw new Error('المستفيد غير موجود');

      // جلب أفراد العائلة
      type FamilyMemberData = {
        id: string;
        full_name: string;
        family_name: string | null;
        category: string;
        relationship: string | null;
        is_head_of_family: boolean | null;
        gender: string | null;
        date_of_birth: string | null;
        status: string;
      };
      
      let familyMembers: FamilyMemberData[] = [];
      
      if (beneficiary.family_name) {
        const { data: members, error: membersError } = await supabase
          .from('beneficiaries')
          .select('id, full_name, family_name, category, relationship, is_head_of_family, gender, date_of_birth, status')
          .eq('family_name', beneficiary.family_name)
          .neq('id', beneficiaryId)
          .order('is_head_of_family', { ascending: false });

        if (!membersError && members) {
          familyMembers = members as FamilyMemberData[];
        }
      }

      // جلب الأبناء المباشرين
      const { data: children, error: childrenError } = await supabase
        .from('beneficiaries')
        .select('id, full_name, family_name, category, relationship, is_head_of_family, gender, date_of_birth, status')
        .eq('parent_beneficiary_id', beneficiaryId);

      if (!childrenError && children) {
        familyMembers = [...familyMembers, ...(children as FamilyMemberData[])];
      }

      return {
        beneficiary,
        familyMembers: familyMembers.filter((m, index, self) => 
          index === self.findIndex(t => t.id === m.id)
        )
      };
    } catch (error) {
      productionLogger.error('Error fetching beneficiary family tree', error);
      throw error;
    }
  }
}
