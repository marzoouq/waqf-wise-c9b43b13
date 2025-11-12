import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Tribe {
  id: string;
  name: string;
  description: string | null;
  total_families: number;
  total_beneficiaries: number;
  created_at: string;
}

export const useTribes = () => {
  return useQuery({
    queryKey: ["tribes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tribes" as any)
        .select("*")
        .order("name");

      if (error) throw error;
      return data as unknown as Tribe[];
    },
  });
};

export const useAddTribe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tribe: Omit<Tribe, "id" | "total_families" | "total_beneficiaries" | "created_at">) => {
      const { data, error } = await supabase
        .from("tribes" as any)
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
    onError: (error) => {
      toast.error("حدث خطأ أثناء إضافة القبيلة");
      console.error("Error adding tribe:", error);
    },
  });
};

export const useUpdateTribe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Tribe> & { id: string }) => {
      const { data, error } = await supabase
        .from("tribes" as any)
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
    onError: (error) => {
      toast.error("حدث خطأ أثناء تحديث القبيلة");
      console.error("Error updating tribe:", error);
    },
  });
};

export const useDeleteTribe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("tribes" as any)
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tribes"] });
      toast.success("تم حذف القبيلة بنجاح");
    },
    onError: (error) => {
      toast.error("حدث خطأ أثناء حذف القبيلة");
      console.error("Error deleting tribe:", error);
    },
  });
};
