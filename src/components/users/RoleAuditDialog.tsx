/**
 * RoleAuditDialog Component
 * حوار عرض سجل تغييرات الأدوار - مستخرج من RolesManagement
 * @version 2.9.13
 */

import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { ROLE_LABELS, ROLE_COLORS, type AppRole } from "@/types/roles";
import type { RoleAuditLog } from "@/hooks/users/useRolesManagement";

interface RoleAuditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  auditLogs: RoleAuditLog[];
}

export function RoleAuditDialog({ 
  open, 
  onOpenChange, 
  auditLogs 
}: RoleAuditDialogProps) {
  return (
    <ResponsiveDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title="سجل تغييرات الأدوار"
      size="lg"
    >
      <div className="space-y-3 max-h-[60vh] overflow-y-auto">
        {auditLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">لا توجد تغييرات</div>
        ) : (
          auditLogs.map((log) => (
            <div key={log.id} className="p-3 sm:p-4 border rounded-lg flex items-start gap-3">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  log.action === "added" ? "bg-success/10" : "bg-destructive/10"
                }`}
              >
                {log.action === "added" ? (
                  <Plus className="h-4 w-4 text-success" />
                ) : (
                  <Trash2 className="h-4 w-4 text-destructive" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm sm:text-base">
                  {log.action === "added" ? "إضافة" : "حذف"} دور{" "}
                  <Badge className={ROLE_COLORS[log.role as AppRole]}>
                    {ROLE_LABELS[log.role as AppRole]}
                  </Badge>
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  بواسطة: {log.changed_by_name || "النظام"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(log.changed_at).toLocaleString("ar-SA")}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </ResponsiveDialog>
  );
}
