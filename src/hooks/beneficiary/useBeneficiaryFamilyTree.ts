/**
 * Hook لجلب بيانات شجرة عائلة المستفيد
 * Beneficiary Family Tree Hook
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FamilyMember {
  id: string;
  full_name: string;
  family_name: string | null;
  category: string;
  relationship: string | null;
  is_head_of_family: boolean | null;
  gender: string | null;
  date_of_birth: string | null;
  status: string;
}

interface Beneficiary extends FamilyMember {
  number_of_sons: number | null;
  number_of_daughters: number | null;
  number_of_wives: number | null;
  family_size: number | null;
}

export function useBeneficiaryFamilyTree(beneficiaryId: string) {
  return useQuery({
    queryKey: ['beneficiary-family', beneficiaryId],
    queryFn: async () => {
      // جلب بيانات المستفيد الحالي
      const { data: beneficiary, error: benError } = await supabase
        .from('beneficiaries')
        .select('id, full_name, family_name, category, relationship, is_head_of_family, gender, date_of_birth, status, number_of_sons, number_of_daughters, number_of_wives, family_size')
        .eq('id', beneficiaryId)
        .maybeSingle();

      if (benError) throw benError;
      if (!beneficiary) throw new Error('المستفيد غير موجود');

      // جلب أفراد العائلة
      let familyMembers: FamilyMember[] = [];
      
      if (beneficiary.family_name) {
        const { data: members, error: membersError } = await supabase
          .from('beneficiaries')
          .select('id, full_name, family_name, category, relationship, is_head_of_family, gender, date_of_birth, status')
          .eq('family_name', beneficiary.family_name)
          .neq('id', beneficiaryId)
          .order('is_head_of_family', { ascending: false });

        if (!membersError && members) {
          familyMembers = members;
        }
      }

      // جلب الأبناء المباشرين
      const { data: children, error: childrenError } = await supabase
        .from('beneficiaries')
        .select('id, full_name, family_name, category, relationship, is_head_of_family, gender, date_of_birth, status')
        .eq('parent_beneficiary_id', beneficiaryId);

      if (!childrenError && children) {
        familyMembers = [...familyMembers, ...children];
      }

      return {
        beneficiary: beneficiary as Beneficiary,
        familyMembers: familyMembers.filter((m, index, self) => 
          index === self.findIndex(t => t.id === m.id)
        )
      };
    },
    staleTime: 60 * 1000,
  });
}
