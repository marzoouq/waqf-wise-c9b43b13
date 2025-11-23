import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { createMutationErrorHandler } from "@/lib/errors";
import type { Json } from '@/integrations/supabase/types';

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  search_criteria: Json;
  is_favorite: boolean;
  usage_count: number;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

export function useSavedSearches() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: searches = [], isLoading } = useQuery({
    queryKey: ["saved-searches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_searches")
        .select("*")
        .order("is_favorite", { ascending: false })
        .order("last_used_at", { ascending: false });

      if (error) throw error;
      return data as SavedSearch[];
    },
  });

  const saveSearch = useMutation({
    mutationFn: async (search: Omit<SavedSearch, "id" | "user_id" | "created_at" | "updated_at" | "usage_count">) => {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("saved_searches")
        .insert([{
          ...search,
          user_id: userData?.user?.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-searches"] });
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
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("saved_searches")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-searches"] });
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
    mutationFn: async (id: string) => {
      const { data: search } = await supabase
        .from("saved_searches")
        .select("usage_count")
        .eq("id", id)
        .single();
      
      const { error } = await supabase
        .from("saved_searches")
        .update({ 
          usage_count: (search?.usage_count || 0) + 1,
          last_used_at: new Date().toISOString()
        })
        .eq("id", id);
        
      if (error) throw error;
    },
  });

  return {
    searches,
    isLoading,
    saveSearch: saveSearch.mutateAsync,
    deleteSearch: deleteSearch.mutateAsync,
    updateUsage: updateUsage.mutate,
  };
}
