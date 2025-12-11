/**
 * شريط الإجراءات الجماعية للإعدادات
 * 
 * @version 2.8.91
 */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, Save, Loader2, CheckCircle2, XCircle, 
  RotateCcw, AlertCircle 
} from "lucide-react";

interface BulkActionsBarProps {
  roleLabel: string;
  totalEnabled: number;
  totalSettings: number;
  pendingChangesCount: number;
  isUpdating: boolean;
  onEnableAll: () => void;
  onDisableAll: () => void;
  onResetToDefault: () => void;
  onSave: () => void;
  onDiscard: () => void;
}

export function BulkActionsBar({
  roleLabel,
  totalEnabled,
  totalSettings,
  pendingChangesCount,
  isUpdating,
  onEnableAll,
  onDisableAll,
  onResetToDefault,
  onSave,
  onDiscard,
}: BulkActionsBarProps) {
  return (
    <div className="space-y-3">
      {/* شريط الإجراءات */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-muted/50 rounded-lg p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="gap-1">
            <Users className="h-3 w-3" />
            {roleLabel}
          </Badge>
          <Badge variant="secondary">
            {totalEnabled}/{totalSettings} مفعّل
          </Badge>
          {pendingChangesCount > 0 && (
            <Badge variant="default" className="animate-pulse bg-primary">
              {pendingChangesCount} تغيير معلق
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onEnableAll}
            className="gap-1 text-xs"
          >
            <CheckCircle2 className="h-3 w-3 text-[hsl(var(--status-success))]" />
            تفعيل الكل
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onDisableAll}
            className="gap-1 text-xs"
          >
            <XCircle className="h-3 w-3 text-destructive" />
            إلغاء الكل
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onResetToDefault}
            className="gap-1 text-xs"
          >
            <RotateCcw className="h-3 w-3" />
            افتراضي
          </Button>
        </div>
      </div>

      {/* معاينة التغييرات */}
      {pendingChangesCount > 0 && (
        <Alert className="bg-primary/5 border-primary/20">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-sm">
              لديك {pendingChangesCount} تغيير معلق. اضغط "حفظ التغييرات" لتطبيقها.
            </span>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onDiscard}
                className="text-xs h-7"
              >
                تجاهل
              </Button>
              <Button 
                onClick={onSave} 
                disabled={isUpdating}
                size="sm"
                className="gap-1 text-xs h-7"
              >
                {isUpdating ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Save className="h-3 w-3" />
                )}
                حفظ التغييرات
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
