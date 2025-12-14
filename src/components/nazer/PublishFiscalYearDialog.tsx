import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Globe,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useFiscalYearsList } from "@/hooks/fiscal-years";
import { usePublishFiscalYear } from "@/hooks/nazer/usePublishFiscalYear";

interface PublishFiscalYearDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PublishFiscalYearDialog({
  open,
  onOpenChange,
}: PublishFiscalYearDialogProps) {
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>("");
  const [notifyHeirs, setNotifyHeirs] = useState(true);

  // استخدام الـ hooks الموحدة
  const { fiscalYears, isLoading } = useFiscalYearsList();
  const { publish, isPublishing } = usePublishFiscalYear(() => {
    onOpenChange(false);
    setSelectedFiscalYear("");
  });

  const selectedYear = fiscalYears.find((fy) => fy.id === selectedFiscalYear);

  const unpublishedYears = fiscalYears.filter((fy) => !fy.is_published);
  const publishedYears = fiscalYears.filter((fy) => fy.is_published);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            نشر السنة المالية
          </DialogTitle>
          <DialogDescription>
            نشر التفاصيل المالية (العقود، الإيجارات، المصروفات) للورثة
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Fiscal Year Selection */}
          <div className="space-y-2">
            <Label>اختر السنة المالية للنشر</Label>
            <Select
              value={selectedFiscalYear}
              onValueChange={setSelectedFiscalYear}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر السنة المالية" />
              </SelectTrigger>
              <SelectContent>
                {unpublishedYears.length === 0 ? (
                  <div className="p-3 text-center text-muted-foreground text-sm">
                    جميع السنوات المالية منشورة
                  </div>
                ) : (
                  unpublishedYears.map((fy) => (
                    <SelectItem key={fy.id} value={fy.id}>
                      <div className="flex items-center gap-2">
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                        {fy.name}
                        {fy.is_active && (
                          <Badge variant="secondary" className="me-2">
                            نشطة
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Year Info */}
          {selectedYear && (
            <Card className="bg-muted/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">السنة المالية</span>
                  <span className="font-medium">{selectedYear.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">الفترة</span>
                  <span className="text-sm">
                    {format(new Date(selectedYear.start_date), "yyyy/MM/dd", {
                      locale: ar,
                    })}{" "}
                    -{" "}
                    {format(new Date(selectedYear.end_date), "yyyy/MM/dd", {
                      locale: ar,
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">الحالة</span>
                  <div className="flex gap-2">
                    {selectedYear.is_active && (
                      <Badge variant="default">نشطة</Badge>
                    )}
                    {selectedYear.is_closed && (
                      <Badge variant="secondary">مغلقة</Badge>
                    )}
                    <Badge variant="outline" className="bg-status-warning/10 text-status-warning">
                      غير منشورة
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Published Years List */}
          {publishedYears.length > 0 && (
            <div className="space-y-2">
              <Label className="text-muted-foreground">السنوات المنشورة</Label>
              <div className="space-y-2">
                {publishedYears.slice(0, 3).map((fy) => (
                  <div
                    key={fy.id}
                    className="flex items-center justify-between p-2 bg-status-success/10 rounded-lg text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-status-success" />
                      <span>{fy.name}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-status-success/10 text-status-success border-status-success/20"
                    >
                      منشورة
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notify Heirs */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>إشعار الورثة</Label>
              <p className="text-sm text-muted-foreground">
                إرسال إشعار للورثة بنشر السنة المالية
              </p>
            </div>
            <Switch checked={notifyHeirs} onCheckedChange={setNotifyHeirs} />
          </div>

          {/* Warning */}
          <Card className="border-status-warning/30 bg-status-warning/10">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-status-warning shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-status-warning">
                    ماذا يعني النشر؟
                  </p>
                  <ul className="text-sm text-status-warning/80 space-y-1">
                    <li>• ستظهر تفاصيل العقود والإيجارات للورثة</li>
                    <li>• ستظهر تقارير المصروفات والإيرادات</li>
                    <li>• لا يمكن إلغاء النشر بعد التنفيذ</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button
            onClick={() => publish({ 
              fiscalYearId: selectedFiscalYear, 
              notifyHeirs,
              fiscalYearName: selectedYear?.name 
            })}
            disabled={!selectedFiscalYear || isPublishing}
            className="gap-2"
          >
            {isPublishing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Globe className="h-4 w-4" />
            )}
            نشر للورثة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
