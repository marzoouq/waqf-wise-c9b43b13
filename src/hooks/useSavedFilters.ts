import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface SavedFilter {
  id: string;
  name: string;
  filter_type: string;
  filter_criteria: any;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Hook لإدارة الفلاتر المحفوظة
 */
export function useSavedFilters(filterType: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب الفلاتر المحفوظة
  const { data: filters = [], isLoading } = useQuery({
    queryKey: ['saved-filters', filterType],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('saved_filters')
        .select('*')
        .eq('user_id', user.id)
        .eq('filter_type', filterType)
        .order('is_favorite', { ascending: false })
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as SavedFilter[];
    },
  });

  // حفظ فلتر جديد
  const saveFilter = useMutation({
    mutationFn: async (filterData: Omit<SavedFilter, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('saved_filters')
        .insert({
          user_id: user.id,
          ...filterData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-filters', filterType] });
      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ الفلتر بنجاح',
      });
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'فشل حفظ الفلتر',
        variant: 'destructive',
      });
    },
  });

  // تحديث فلتر
  const updateFilter = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SavedFilter> & { id: string }) => {
      const { error } = await supabase
        .from('saved_filters')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-filters', filterType] });
      toast({
        title: 'تم التحديث',
        description: 'تم تحديث الفلتر بنجاح',
      });
    },
  });

  // حذف فلتر
  const deleteFilter = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('saved_filters')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-filters', filterType] });
      toast({
        title: 'تم الحذف',
        description: 'تم حذف الفلتر بنجاح',
      });
    },
  });

  // تبديل المفضلة
  const toggleFavorite = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      const { error } = await supabase
        .from('saved_filters')
        .update({ is_favorite: !isFavorite })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-filters', filterType] });
    },
  });

  return {
    filters,
    isLoading,
    saveFilter: saveFilter.mutateAsync,
    updateFilter: updateFilter.mutateAsync,
    deleteFilter: deleteFilter.mutateAsync,
    toggleFavorite: toggleFavorite.mutateAsync,
  };
}
