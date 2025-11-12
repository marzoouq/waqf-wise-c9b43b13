import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useBeneficiaryActivityLog } from "@/hooks/useBeneficiaryActivityLog";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, UserPlus, Edit, Trash2, DollarSign, FileText } from "lucide-react";

interface ActivityLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  beneficiaryId: string;
  beneficiaryName: string;
}

export function ActivityLogDialog({ open, onOpenChange, beneficiaryId, beneficiaryName }: ActivityLogDialogProps) {
  const { activities, isLoading } = useBeneficiaryActivityLog(beneficiaryId);

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "created":
        return <UserPlus className="h-4 w-4" />;
      case "updated":
        return <Edit className="h-4 w-4" />;
      case "deleted":
        return <Trash2 className="h-4 w-4" />;
      case "payment_received":
        return <DollarSign className="h-4 w-4" />;
      case "document_added":
        return <FileText className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case "created":
        return "default";
      case "updated":
        return "secondary";
      case "deleted":
        return "destructive";
      case "payment_received":
        return "default";
      case "document_added":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>سجل النشاط: {beneficiaryName}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[600px] pr-4">
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد أنشطة مسجلة
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="border-r-4 border-primary/20 pr-4 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <Badge variant={getActionColor(activity.action_type) as any} className="gap-1">
                        {getActionIcon(activity.action_type)}
                      </Badge>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{activity.action_description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{activity.performed_by_name}</span>
                        <span>•</span>
                        <span>{format(new Date(activity.created_at), "dd MMMM yyyy - hh:mm a", { locale: ar })}</span>
                      </div>
                      {activity.new_values && (
                        <details className="mt-2">
                          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                            عرض التفاصيل
                          </summary>
                          <div className="mt-2 p-2 bg-muted rounded text-xs">
                            <pre className="whitespace-pre-wrap">{JSON.stringify(activity.new_values, null, 2)}</pre>
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
