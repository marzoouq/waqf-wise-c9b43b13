/**
 * DistributePreviewSection
 * قسم معاينة توزيع الغلة
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Users, AlertCircle } from "lucide-react";

interface HeirShare {
  beneficiary_id: string;
  heir_type: string;
  share_amount: number;
  share_percentage: number;
  beneficiary_name?: string;
}

interface DistributePreviewSectionProps {
  previewShares: HeirShare[];
}

// استخدام ألوان CSS variables الدلالية
const getHeirTypeColor = (type: string) => {
  switch (type) {
    case "زوجة":
      return "bg-heir-wife/10 text-heir-wife dark:bg-heir-wife/20";
    case "ابن":
      return "bg-heir-son/10 text-heir-son dark:bg-heir-son/20";
    case "بنت":
      return "bg-heir-daughter/10 text-heir-daughter dark:bg-heir-daughter/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export function DistributePreviewSection({
  previewShares,
}: DistributePreviewSectionProps) {
  const summary = {
    wivesShare: previewShares
      .filter((s) => s.heir_type === "زوجة")
      .reduce((sum, s) => sum + s.share_amount, 0),
    sonsShare: previewShares
      .filter((s) => s.heir_type === "ابن")
      .reduce((sum, s) => sum + s.share_amount, 0),
    daughtersShare: previewShares
      .filter((s) => s.heir_type === "بنت")
      .reduce((sum, s) => sum + s.share_amount, 0),
    wivesCount: previewShares.filter((s) => s.heir_type === "زوجة").length,
    sonsCount: previewShares.filter((s) => s.heir_type === "ابن").length,
    daughtersCount: previewShares.filter((s) => s.heir_type === "بنت").length,
  };

  return (
    <>
      {/* ملخص التوزيع */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">ملخص التوزيع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <div className="text-center p-3 bg-background rounded-lg">
              <p className="text-sm text-muted-foreground">
                حصة الزوجات (الثمن)
              </p>
              <p className="text-lg font-bold text-heir-wife">
                {summary.wivesShare.toLocaleString("ar-SA")} ر.س
              </p>
              <Badge variant="outline" className="mt-1">
                {summary.wivesCount} زوجات
              </Badge>
            </div>
            <div className="text-center p-3 bg-background rounded-lg">
              <p className="text-sm text-muted-foreground">حصة الأبناء</p>
              <p className="text-lg font-bold text-heir-son">
                {summary.sonsShare.toLocaleString("ar-SA")} ر.س
              </p>
              <Badge variant="outline" className="mt-1">
                {summary.sonsCount} أبناء
              </Badge>
            </div>
            <div className="text-center p-3 bg-background rounded-lg">
              <p className="text-sm text-muted-foreground">حصة البنات</p>
              <p className="text-lg font-bold text-heir-daughter">
                {summary.daughtersShare.toLocaleString("ar-SA")} ر.س
              </p>
              <Badge variant="outline" className="mt-1">
                {summary.daughtersCount} بنات
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* تفاصيل الورثة */}
      <div className="space-y-3">
        <h4 className="font-medium flex items-center gap-2">
          <Users className="h-4 w-4" />
          تفاصيل حصة كل وريث
        </h4>
        <div className="grid gap-2">
          {previewShares.map((share, index) => (
            <div
              key={share.beneficiary_id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground text-sm">
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium">{share.beneficiary_name}</p>
                  <Badge
                    variant="secondary"
                    className={getHeirTypeColor(share.heir_type)}
                  >
                    {share.heir_type}
                  </Badge>
                </div>
              </div>
              <div className="text-end">
                <p className="font-bold">
                  {share.share_amount.toLocaleString("ar-SA")} ر.س
                </p>
                <p className="text-sm text-muted-foreground">
                  {share.share_percentage}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* تحذير */}
      <Card className="border-status-warning/30 bg-status-warning/5">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-status-warning shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-status-warning">تنبيه مهم</p>
              <p className="text-sm text-status-warning/80">
                عند الاعتماد، سيتم إيداع المبالغ في حسابات الورثة فوراً
                وستظهر لهم في لوحة التحكم الخاصة بهم.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
