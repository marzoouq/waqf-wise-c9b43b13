import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TribeService } from "@/services/tribe.service";
import { toast } from "sonner";
import type { Tribe, TribeInsert, TribeUpdate } from "@/types/tribes";
import { logger } from "@/lib/logger";

export const useTribes = () => {
  return useQuery<Tribe[]>({
    queryKey: ["tribes"],
    queryFn: () => TribeService.getAll(),
  });
};

export const useAddTribe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tribe: TribeInsert) => TribeService.create(tribe),
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
    mutationFn: ({ id, ...updates }: TribeUpdate & { id: string }) => 
      TribeService.update(id, updates),
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
    mutationFn: (id: string) => TribeService.delete(id),
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
