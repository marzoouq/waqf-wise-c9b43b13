import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  User, 
  Database, 
  FileText,
  Copy,
  Check
} from "lucide-react";
import type { EnhancedAuditLog } from "@/hooks/system/useAuditLogsEnhanced";
import { format } from "@/lib/date";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AuditLogDetailsDialogProps {
  log: EnhancedAuditLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const actionTypeLabels: Record<string, string> = {
  INSERT: "إضافة",
  UPDATE: "تحديث",
  DELETE: "حذف",
  VIEW_ACCESS: "عرض",
};

const severityConfig: Record<string, { label: string; className: string }> = {
  info: { label: "معلومة", className: "bg-info/10 text-info border-info/20" },
  warning: { label: "تحذير", className: "bg-warning/10 text-warning border-warning/20" },
  error: { label: "خطأ", className: "bg-destructive/10 text-destructive border-destructive/20" },
  critical: { label: "حرج", className: "bg-destructive text-destructive-foreground" },
};

// تنسيق القيم للعرض
function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "نعم" : "لا";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

// مقارنة القيم وإظهار الفروق
function ValueCompare({ 
  fieldName, 
  oldValue, 
  newValue 
}: { 
  fieldName: string; 
  oldValue: unknown; 
  newValue: unknown;
}) {
  const hasChanged = JSON.stringify(oldValue) !== JSON.stringify(newValue);
  
  if (!hasChanged && oldValue === undefined && newValue === undefined) {
    return null;
  }

  return (
    <div className="py-2 border-b border-border/50 last:border-0">
      <div className="font-medium text-sm mb-2 text-foreground">{fieldName}</div>
      <div className="grid grid-cols-2 gap-4">
        {/* القيمة القديمة */}
        <div className={cn(
          "p-2 rounded-md text-xs font-mono break-all",
          hasChanged ? "bg-destructive/10 border border-destructive/20" : "bg-muted"
        )}>
          <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" />
            قبل
          </div>
          <div className="text-foreground">
            {formatValue(oldValue)}
          </div>
        </div>
        {/* القيمة الجديدة */}
        <div className={cn(
          "p-2 rounded-md text-xs font-mono break-all",
          hasChanged ? "bg-status-success/10 border border-status-success/20" : "bg-muted"
        )}>
          <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
            <ArrowRight className="h-3 w-3" />
            بعد
          </div>
          <div className="text-foreground">
            {formatValue(newValue)}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuditLogDetailsDialog({ log, open, onOpenChange }: AuditLogDetailsDialogProps) {
  const [copied, setCopied] = useState(false);

  if (!log) return null;

  const severity = severityConfig[log.severity] || severityConfig.info;

  // جمع كل الحقول المتغيرة
  const allFields = new Set<string>();
  if (log.old_values) Object.keys(log.old_values).forEach(k => allFields.add(k));
  if (log.new_values) Object.keys(log.new_values).forEach(k => allFields.add(k));

  // فلترة الحقول غير المهمة
  const filteredFields = Array.from(allFields).filter(
    field => !['id', 'created_at', 'updated_at'].includes(field)
  );

  const handleCopyJson = async () => {
    const data = {
      id: log.id,
      action_type: log.action_type,
      table_name: log.table_name,
      user_email: log.user_email,
      created_at: log.created_at,
      old_values: log.old_values,
      new_values: log.new_values,
    };
    
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    toast.success("تم نسخ البيانات");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            تفاصيل سجل التدقيق
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6">
            {/* معلومات أساسية */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  العملية
                </div>
                <Badge variant="outline" className="font-medium">
                  {actionTypeLabels[log.action_type] || log.action_type}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  الجدول
                </div>
                <Badge variant="secondary">{log.table_name || "—"}</Badge>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" />
                  المستخدم
                </div>
                <div className="text-sm truncate" title={log.user_email || ""}>
                  {log.user_email || "غير معروف"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  الوقت
                </div>
                <div className="text-sm">
                  {format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss")}
                </div>
              </div>
            </div>

            {/* الخطورة والدور */}
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className={severity.className}>
                {severity.label}
              </Badge>
              {log.user_role && (
                <Badge variant="outline">
                  الدور: {log.user_role}
                </Badge>
              )}
              {log.record_id && (
                <Badge variant="outline" className="font-mono text-xs">
                  ID: {log.record_id.slice(0, 8)}...
                </Badge>
              )}
            </div>

            {/* الوصف */}
            {log.description && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">الوصف</div>
                <div className="text-sm">{log.description}</div>
              </div>
            )}

            <Separator />

            {/* مقارنة القيم */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-primary" />
                  مقارنة التغييرات
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyJson}
                  className="gap-2"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-status-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  نسخ JSON
                </Button>
              </div>

              {filteredFields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>لا توجد بيانات للمقارنة</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredFields.map(field => (
                    <ValueCompare
                      key={field}
                      fieldName={field}
                      oldValue={log.old_values?.[field]}
                      newValue={log.new_values?.[field]}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* معلومات إضافية */}
            {(log.ip_address || log.user_agent || log.session_id) && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3">معلومات إضافية</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {log.ip_address && (
                      <div>
                        <span className="text-muted-foreground">IP:</span>{" "}
                        <span className="font-mono">{log.ip_address}</span>
                      </div>
                    )}
                    {log.session_id && (
                      <div>
                        <span className="text-muted-foreground">الجلسة:</span>{" "}
                        <span className="font-mono text-xs">{log.session_id.slice(0, 16)}...</span>
                      </div>
                    )}
                    {log.user_agent && (
                      <div className="col-span-full">
                        <span className="text-muted-foreground">المتصفح:</span>{" "}
                        <span className="text-xs">{log.user_agent}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
