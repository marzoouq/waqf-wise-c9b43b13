import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useBackup() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب سجلات النسخ الاحتياطي
  const { data: backupLogs, isLoading } = useQuery({
    queryKey: ["backup-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("backup_logs")
        .select("id, backup_type, status, file_path, file_size, tables_included, started_at, completed_at, error_message, created_at")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
  });

  // جلب جداول النسخ الاحتياطي التلقائية
  const { data: backupSchedules } = useQuery({
    queryKey: ["backup-schedules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("backup_schedules")
        .select("id, schedule_name, backup_type, frequency, tables_included, retention_days, is_active, include_storage, last_backup_at, next_backup_at, created_at, updated_at")
        .eq("is_active", true);

      if (error) throw error;
      return data;
    },
  });

  // إنشاء نسخة احتياطية
  const createBackup = useMutation({
    mutationFn: async (options?: { tablesIncluded?: string[] }) => {
      const { data, error } = await supabase.functions.invoke("backup-database", {
        body: {
          backupType: "manual",
          tablesIncluded: options?.tablesIncluded || [],
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.success) {
        // تنزيل الملف
        const blob = new Blob([data.content], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = data.fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "تم إنشاء النسخة الاحتياطية",
          description: `تم تصدير ${data.totalRecords} سجل من ${data.totalTables} جدول`,
        });

        queryClient.invalidateQueries({ queryKey: ["backup-logs"] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "فشل إنشاء النسخة الاحتياطية",
        description: error.message || "حدث خطأ أثناء النسخ الاحتياطي",
        variant: "destructive",
      });
    },
  });

  // استعادة نسخة احتياطية
  const restoreBackup = useMutation({
    mutationFn: async (options: { backupData: Record<string, unknown>; mode?: "replace" | "merge" }) => {
      const { data, error } = await supabase.functions.invoke("restore-database", {
        body: {
          backupData: options.backupData,
          mode: options.mode || "replace",
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "تمت الاستعادة بنجاح",
          description: data.message,
        });

        // إعادة تحميل جميع البيانات
        queryClient.invalidateQueries();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "فشلت الاستعادة",
        description: error.message || "حدث خطأ أثناء استعادة البيانات",
        variant: "destructive",
      });
    },
  });

  return {
    backupLogs,
    backupSchedules,
    isLoading,
    createBackup: createBackup.mutateAsync,
    restoreBackup: restoreBackup.mutateAsync,
    isCreatingBackup: createBackup.isPending,
    isRestoring: restoreBackup.isPending,
  };
}
