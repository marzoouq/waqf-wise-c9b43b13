import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Family, FamilyMember } from '@/types';
import { updateInTable, deleteFromTable } from '@/utils/supabaseHelpers';

// ===========================
// Families Hook
// ===========================

export const useFamilies = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all families
  const { data: families = [], isLoading, error } = useQuery({
    queryKey: ['families'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('families' as any)
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
      return data as unknown as Family[];
    },
  });

  // Add new family
  const addFamily = useMutation({
    mutationFn: async (newFamily: Omit<Family, 'id' | 'created_at' | 'updated_at' | 'total_members'>) => {
      const { data, error } = await supabase
        .from('families' as any)
        .insert(newFamily as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم إضافة العائلة بنجاح',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update family
  const updateFamily = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Family> }) => {
      const result = await updateInTable<Family>('families', id, updates);
      const error = result.error;
      const data = result.data;

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم تحديث العائلة بنجاح',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete family
  const deleteFamily = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteFromTable('families', id);
      const error = result.error;

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم حذف العائلة بنجاح',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    families,
    isLoading,
    error,
    addFamily,
    updateFamily,
    deleteFamily,
  };
};

// ===========================
// Family Members Hook
// ===========================

export const useFamilyMembers = (familyId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch family members
  const { data: members = [], isLoading } = useQuery({
    queryKey: ['family-members', familyId],
    queryFn: async () => {
      if (!familyId) return [];

      const { data, error } = await supabase
        .from('family_members' as any)
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
      return data as unknown as FamilyMember[];
    },
    enabled: !!familyId,
  });

  // Add family member
  const addMember = useMutation({
    mutationFn: async (newMember: Omit<FamilyMember, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('family_members' as any)
        .insert(newMember as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-members'] });
      queryClient.invalidateQueries({ queryKey: ['families'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم إضافة فرد للعائلة بنجاح',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update family member
  const updateMember = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<FamilyMember> }) => {
      const { data, error } = await supabase
        .from('family_members' as any)
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-members'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم تحديث بيانات الفرد بنجاح',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Remove family member
  const removeMember = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('family_members' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-members'] });
      queryClient.invalidateQueries({ queryKey: ['families'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم إزالة الفرد من العائلة بنجاح',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    members,
    isLoading,
    addMember,
    updateMember,
    removeMember,
  };
};
