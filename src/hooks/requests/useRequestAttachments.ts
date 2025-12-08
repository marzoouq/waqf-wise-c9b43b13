/**
 * useRequestAttachments Hook - مرفقات الطلبات
 * يستخدم RequestService
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { RequestService } from "@/services";

export interface RequestAttachment {
  id: string;
  request_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_by?: string;
  uploaded_at: string;
  description?: string;
}

export function useRequestAttachments(requestId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: attachments = [], isLoading } = useQuery({
    queryKey: ["request-attachments", requestId],
    queryFn: () => RequestService.getAttachments(requestId!),
    enabled: !!requestId,
  });

  const uploadAttachment = useMutation({
    mutationFn: async ({ file, description }: { file: File; description?: string }) => {
      if (!requestId) throw new Error("Request ID is required");
      return RequestService.uploadAttachment(requestId, file, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request-attachments", requestId] });
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      toast({ title: "تم رفع المرفق", description: "تم رفع المرفق بنجاح" });
    },
    onError: (error: Error) => {
      toast({ title: "خطأ في الرفع", description: error.message, variant: "destructive" });
    },
  });

  const deleteAttachment = useMutation({
    mutationFn: async (attachmentId: string) => {
      const attachment = attachments.find((a: any) => a.id === attachmentId);
      if (!attachment) throw new Error("Attachment not found");
      return RequestService.deleteAttachment(attachmentId, attachment.file_path, requestId!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request-attachments", requestId] });
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      toast({ title: "تم الحذف", description: "تم حذف المرفق بنجاح" });
    },
    onError: (error: Error) => {
      toast({ title: "خطأ في الحذف", description: error.message, variant: "destructive" });
    },
  });

  return {
    attachments,
    isLoading,
    uploadAttachment: uploadAttachment.mutateAsync,
    deleteAttachment: deleteAttachment.mutateAsync,
    isUploading: uploadAttachment.isPending,
    isDeleting: deleteAttachment.isPending,
  };
}
