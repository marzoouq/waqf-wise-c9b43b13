import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UIService, type SavedSearch } from "@/services/ui.service";
import { useToast } from "@/hooks/use-toast";
import { createMutationErrorHandler } from "@/lib/errors";
import { QUERY_KEYS } from "@/lib/query-keys";

export type { SavedSearch };

export function useSavedSearches() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: searches = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.SAVED_SEARCHES,
    queryFn: () => UIService.getSavedSearches(),
  });

  const saveSearch = useMutation({
    mutationFn: (search: Omit<SavedSearch, "id" | "user_id" | "created_at" | "updated_at" | "usage_count">) =>
      UIService.saveSearch(search),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SAVED_SEARCHES });
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ البحث بنجاح",
      });
    },
    onError: createMutationErrorHandler({ 
      context: 'save_search',
      toastTitle: "خطأ في الحفظ"
    }),
  });

  const deleteSearch = useMutation({
    mutationFn: (id: string) => UIService.deleteSearch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SAVED_SEARCHES });
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف البحث المحفوظ بنجاح",
      });
    },
    onError: createMutationErrorHandler({ 
      context: 'delete_search',
      toastTitle: "خطأ في الحذف"
    }),
  });

  const updateUsage = useMutation({
    mutationFn: (id: string) => UIService.updateSearchUsage(id),
  });

  return {
    searches,
    isLoading,
    saveSearch: saveSearch.mutateAsync,
    deleteSearch: deleteSearch.mutateAsync,
    updateUsage: updateUsage.mutate,
  };
}
