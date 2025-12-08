import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SystemService } from "@/services/system.service";
import { useToast } from "@/hooks/use-toast";

export function useBackup() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: backupLogs, isLoading } = useQuery({
    queryKey: ["backup-logs"],
    queryFn: () => SystemService.getBackupLogs(),
  });

  const { data: backupSchedules } = useQuery({
    queryKey: ["backup-schedules"],
    queryFn: () => SystemService.getBackupSchedules(),
  });

  const createBackup = useMutation({
    mutationFn: async (options?: { tablesIncluded?: string[] }) => {
      return SystemService.createBackup(options?.tablesIncluded);
    },
    onSuccess: (data) => {
      if (data.success) {
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

  const restoreBackup = useMutation({
    mutationFn: async (options: { backupData: Record<string, unknown>; mode?: "replace" | "merge" }) => {
      return SystemService.restoreBackup(options.backupData, options.mode);
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "تمت الاستعادة بنجاح",
          description: data.message,
        });
        queryClient.invalidateQueries({ queryKey: ["backup-logs"] });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
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
