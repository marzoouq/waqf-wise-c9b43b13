/**
 * Saved Filters Hook - استخدام SettingsService
 * @refactored 2.9.2 - نقل منطق Supabase إلى SettingsService
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { SettingsService, type SavedFilter } from '@/services/settings.service';
import type { Json } from '@/integrations/supabase/types';

export type { SavedFilter };

/**
 * Hook لإدارة الفلاتر المحفوظة
 */
export function useSavedFilters(filterType: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // جلب الفلاتر المحفوظة
  const { data: filters = [], isLoading } = useQuery({
    queryKey: ['saved-filters', filterType],
    queryFn: async () => {
      if (!user) return [];
      return SettingsService.getSavedFilters(user.id, filterType);
    },
    enabled: !!user,
  });

  // حفظ فلتر جديد
  const saveFilter = useMutation({
    mutationFn: async (filterData: { name: string; filter_type: string; filter_criteria: Json; is_favorite: boolean }) => {
      if (!user) throw new Error('User not authenticated');
      await SettingsService.saveFilter(user.id, filterData);
      toast.success('تم الحفظ', { description: 'تم حفظ الفلتر بنجاح' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-filters', filterType] });
    },
    onError: () => {
      toast.error('خطأ', { description: 'فشل حفظ الفلتر' });
    },
  });

  // تحديث فلتر
  const updateFilter = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SavedFilter> & { id: string }) => {
      await SettingsService.updateFilter(id, updates);
      toast.success('تم التحديث', { description: 'تم تحديث الفلتر بنجاح' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-filters', filterType] });
    },
  });

  // حذف فلتر
  const deleteFilter = useMutation({
    mutationFn: async (id: string) => {
      await SettingsService.deleteFilter(id);
      toast.success('تم الحذف', { description: 'تم حذف الفلتر بنجاح' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-filters', filterType] });
    },
  });

  // تبديل المفضلة
  const toggleFavorite = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      await SettingsService.toggleFilterFavorite(id, isFavorite);
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
