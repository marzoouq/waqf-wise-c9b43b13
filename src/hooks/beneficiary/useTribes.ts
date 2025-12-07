import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tribe, TribeInsert, TribeUpdate } from "@/types/tribes";
import { logger } from "@/lib/logger";

export const useTribes = () => {
  return useQuery<Tribe[]>({
    queryKey: ["tribes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tribes")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as Tribe[];
    },
  });
};

export const useAddTribe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tribe: TribeInsert) => {
      const { data, error } = await supabase
        .from("tribes")
        .insert([tribe])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tribes"] });
      toast.success("تم إضافة القبيلة بنجاح");
    },
    onError: (error: unknown) => {
      toast.error("حدث خطأ أثناء إضافة القبيلة");
      logger.error(error, { context: 'add_tribe', severity: 'medium' });
    },
  });
};

export const useUpdateTribe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TribeUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("tribes")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tribes"] });
      toast.success("تم تحديث القبيلة بنجاح");
    },
    onError: (error: unknown) => {
      toast.error("حدث خطأ أثناء تحديث القبيلة");
      logger.error(error, { context: 'update_tribe', severity: 'medium' });
    },
  });
};

export const useDeleteTribe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("tribes")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tribes"] });
      toast.success("تم حذف القبيلة بنجاح");
    },
    onError: (error: unknown) => {
      toast.error("حدث خطأ أثناء حذف القبيلة");
      logger.error(error, { context: 'delete_tribe', severity: 'medium' });
    },
  });
};
