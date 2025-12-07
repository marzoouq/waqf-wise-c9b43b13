import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

  // Fetch attachments
  const { data: attachments = [], isLoading } = useQuery({
    queryKey: ["request-attachments", requestId],
    queryFn: async () => {
      if (!requestId) return [];
      
      const { data, error } = await supabase
        .from("request_attachments")
        .select("*")
        .eq("request_id", requestId)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      return data as RequestAttachment[];
    },
    enabled: !!requestId,
  });

  // Upload attachment
  const uploadAttachment = useMutation({
    mutationFn: async ({
      file,
      description,
    }: {
      file: File;
      description?: string;
    }) => {
      if (!requestId) throw new Error("Request ID is required");

      // Upload file to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${requestId}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("request-attachments")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("request-attachments")
        .getPublicUrl(fileName);

      // Save metadata to database
      const { data, error } = await supabase
        .from("request_attachments")
        .insert({
          request_id: requestId,
          file_name: file.name,
          file_path: urlData.publicUrl,
          file_type: file.type,
          file_size: file.size,
          description,
        })
        .select()
        .single();

      if (error) throw error;

      // Update attachments_count
      const { data: currentRequest } = await supabase
        .from("beneficiary_requests")
        .select("attachments_count")
        .eq("id", requestId)
        .single();

      if (currentRequest) {
        await supabase
          .from("beneficiary_requests")
          .update({ attachments_count: (currentRequest.attachments_count || 0) + 1 })
          .eq("id", requestId);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request-attachments", requestId] });
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      toast({
        title: "تم رفع المرفق",
        description: "تم رفع المرفق بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في الرفع",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete attachment
  const deleteAttachment = useMutation({
    mutationFn: async (attachmentId: string) => {
      const attachment = attachments.find((a) => a.id === attachmentId);
      if (!attachment) throw new Error("Attachment not found");

      // Extract file path from URL
      const urlParts = attachment.file_path.split("/request-attachments/");
      const filePath = urlParts[1];

      // Delete from storage
      if (filePath) {
        await supabase.storage
          .from("request-attachments")
          .remove([filePath]);
      }

      // Delete from database
      const { error } = await supabase
        .from("request_attachments")
        .delete()
        .eq("id", attachmentId);

      if (error) throw error;

      // Update attachments_count
      const { data: currentRequest } = await supabase
        .from("beneficiary_requests")
        .select("attachments_count")
        .eq("id", requestId)
        .single();

      if (currentRequest) {
        await supabase
          .from("beneficiary_requests")
          .update({
            attachments_count: Math.max((currentRequest.attachments_count || 0) - 1, 0),
          })
          .eq("id", requestId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request-attachments", requestId] });
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      toast({
        title: "تم الحذف",
        description: "تم حذف المرفق بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في الحذف",
        description: error.message,
        variant: "destructive",
      });
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
