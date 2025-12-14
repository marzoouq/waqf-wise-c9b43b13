/**
 * useFamilies Hook - إدارة العائلات
 * @version 2.8.65
 * 
 * يستخدم FamilyService للوصول لقاعدة البيانات
 */

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { Family, FamilyMember } from '@/types';
import { QUERY_KEYS } from '@/lib/query-keys';
import { FamilyService, RealtimeService } from '@/services';

// ===========================
// Families Hook
// ===========================

export const useFamilies = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all families
  const { data: families = [], isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.FAMILIES,
    queryFn: () => FamilyService.getAll(),
  });

  // Real-time subscription
  useEffect(() => {
    const subscription = RealtimeService.subscribeToTable(
      'families',
      () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FAMILIES });
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  // Add new family
  const addFamily = useMutation({
    mutationFn: (newFamily: Omit<Family, 'id' | 'created_at' | 'updated_at' | 'total_members'>) => 
      FamilyService.create(newFamily),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FAMILIES });
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
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Family> }) => 
      FamilyService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FAMILIES });
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
    mutationFn: (id: string) => FamilyService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FAMILIES });
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
    refetch,
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
  const { data: members = [], isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.FAMILY_MEMBERS(familyId),
    queryFn: () => familyId ? FamilyService.getMembers(familyId) : Promise.resolve([]),
    enabled: !!familyId,
  });

  // Add family member
  const addMember = useMutation({
    mutationFn: (newMember: Omit<FamilyMember, 'id' | 'created_at' | 'updated_at'> & { relationship_to_head: string }) => 
      FamilyService.addMember(newMember),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FAMILY_MEMBERS(undefined) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FAMILIES });
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
    mutationFn: ({ id, updates }: { id: string; updates: Partial<FamilyMember> }) => 
      FamilyService.updateMember(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FAMILY_MEMBERS(undefined) });
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
    mutationFn: (id: string) => FamilyService.removeMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FAMILY_MEMBERS(undefined) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FAMILIES });
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
    error,
    refetch,
    addMember,
    updateMember,
    removeMember,
  };
};
