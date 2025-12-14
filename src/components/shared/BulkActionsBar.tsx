import { CheckSquare, X, Trash2, Download, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onDelete?: () => void;
  onExport?: () => void;
  onCustomAction?: (action: string) => void;
  customActions?: Array<{
    label: string;
    icon: React.ReactNode;
    action: string;
    variant?: "default" | "destructive" | "outline";
  }>;
}

export function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onDelete,
  onExport,
  onCustomAction,
  customActions = [],
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <Card className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 shadow-lg border-primary">
      <div className="flex items-center gap-4 p-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-primary" />
          <Badge variant="default" className="text-sm">
            {selectedCount} محدد
          </Badge>
        </div>

        <div className="h-6 w-px bg-border" />

        <div className="flex gap-2">
          {onExport && (
            <Button size="sm" variant="outline" onClick={onExport}>
              <Download className="h-4 w-4 ms-2" />
              تصدير
            </Button>
          )}

          {customActions.map((action) => (
            <Button
              key={action.action}
              size="sm"
              variant={action.variant || "outline"}
              onClick={() => onCustomAction?.(action.action)}
            >
              {action.icon}
              {action.label}
            </Button>
          ))}

          {onDelete && (
            <Button size="sm" variant="destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4 ms-2" />
              حذف
            </Button>
          )}

          <Button size="sm" variant="ghost" onClick={onClearSelection}>
            <X className="h-4 w-4 ms-2" />
            إلغاء
          </Button>
        </div>
      </div>
    </Card>
  );
}
