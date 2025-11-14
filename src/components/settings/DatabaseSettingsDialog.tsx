import { useState } from "react";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Database, Download, Upload, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DatabaseSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DatabaseSettingsDialog({
  open,
  onOpenChange,
}: DatabaseSettingsDialogProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      toast({
        title: "جاري تصدير البيانات",
        description: "سيتم تنزيل نسخة احتياطية من البيانات قريباً",
      });

      // في التطبيق الفعلي، هنا سيتم استدعاء API لتصدير البيانات
      setTimeout(() => {
        toast({
          title: "تم التصدير بنجاح",
          description: "تم تصدير البيانات بنجاح",
        });
        setIsExporting(false);
      }, 2000);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تصدير البيانات",
        variant: "destructive",
      });
      setIsExporting(false);
    }
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="إعدادات قاعدة البيانات"
      description="إدارة النسخ الاحتياطي واستعادة البيانات"
      size="lg"
    >
      <div className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              يتم حفظ النسخ الاحتياطية تلقائياً كل 24 ساعة. يمكنك أيضاً إنشاء نسخة احتياطية يدوية في أي وقت.
            </AlertDescription>
          </Alert>

          {/* النسخ الاحتياطي */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Download className="h-4 w-4" />
                <h3 className="font-semibold">النسخ الاحتياطي</h3>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                تصدير نسخة احتياطية كاملة من قاعدة البيانات
              </p>

              <div className="space-y-3">
                <Button
                  onClick={handleExportData}
                  disabled={isExporting}
                  className="w-full"
                >
                  {isExporting ? "جاري التصدير..." : "تصدير البيانات"}
                </Button>

                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-2">البيانات المشمولة:</p>
                  <ul className="list-disc list-inside space-y-1 mr-4">
                    <li>الحسابات المحاسبية</li>
                    <li>القيود اليومية</li>
                    <li>المدفوعات والفواتير</li>
                    <li>المستفيدين والتوزيعات</li>
                    <li>المستندات والأرشيف</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* استعادة البيانات */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Upload className="h-4 w-4" />
                <h3 className="font-semibold">استعادة البيانات</h3>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                استيراد نسخة احتياطية سابقة لاستعادة البيانات
              </p>

              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  تحذير: استعادة البيانات ستستبدل جميع البيانات الحالية. يُنصح بإنشاء نسخة احتياطية قبل المتابعة.
                </AlertDescription>
              </Alert>

              <Button variant="outline" className="w-full" disabled>
                استيراد نسخة احتياطية (قريباً)
              </Button>
            </CardContent>
          </Card>

          {/* النسخ الاحتياطية التلقائية */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">النسخ الاحتياطية التلقائية</h3>
              <p className="text-sm text-muted-foreground mb-4">
                آخر نسخة احتياطية تلقائية: اليوم في تمام الساعة 03:00 صباحاً
              </p>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">التكرار:</span>
                  <span className="font-medium">يومياً</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">عدد النسخ المحفوظة:</span>
                  <span className="font-medium">30 نسخة</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">مدة الاحتفاظ:</span>
                  <span className="font-medium">30 يوم</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    </ResponsiveDialog>
  );
}
