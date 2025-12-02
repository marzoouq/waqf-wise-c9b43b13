import { usePhaseChangelog } from "@/hooks/useProjectDocumentation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, arLocale as ar } from "@/lib/date";
import { Clock, User, FileText, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PhaseChangeLogProps {
  phaseId: string;
}

export const PhaseChangeLog = ({ phaseId }: PhaseChangeLogProps) => {
  const { data: changelog, isLoading } = usePhaseChangelog(phaseId);

  const getChangeIcon = (type: string) => {
    switch (type) {
      case "status_change":
        return CheckCircle;
      case "note_added":
        return FileText;
      case "phase_created":
        return Clock;
      default:
        return Clock;
    }
  };

  const getChangeLabel = (type: string) => {
    switch (type) {
      case "status_change":
        return "تغيير الحالة";
      case "task_completed":
        return "إنجاز مهمة";
      case "note_added":
        return "إضافة ملاحظة";
      case "phase_created":
        return "إنشاء المرحلة";
      case "phase_updated":
        return "تحديث المرحلة";
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!changelog || changelog.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">لا توجد تغييرات مسجلة</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-4 pr-4">
        {changelog.map((entry) => {
          const Icon = getChangeIcon(entry.change_type);
          return (
            <div key={entry.id} className="flex gap-3 border-r-2 border-border pr-3">
              <div className="mt-1">
                <div className="p-2 rounded-full bg-accent">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {getChangeLabel(entry.change_type)}
                  </span>
                  {entry.old_value && entry.new_value && (
                    <span className="text-xs text-muted-foreground">
                      من "{entry.old_value}" إلى "{entry.new_value}"
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{entry.changed_by_name || "مستخدم"}</span>
                  <span>•</span>
                  <Clock className="h-3 w-3" />
                  <span>
                    {format(new Date(entry.created_at), "PPp", { locale: ar })}
                  </span>
                </div>
                {entry.notes && (
                  <p className="text-sm text-muted-foreground mt-2 p-2 bg-accent/50 rounded">
                    {entry.notes}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
