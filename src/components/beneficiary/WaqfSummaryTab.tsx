import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, TrendingUp, Users, Landmark, DollarSign } from "lucide-react";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
import { MaskedValue } from "@/components/shared/MaskedValue";
import { useWaqfSummary } from "@/hooks/useWaqfSummary";

export function WaqfSummaryTab() {
  const { settings } = useVisibilitySettings();
  const { summary } = useWaqfSummary(settings?.show_overview || false);

  if (!settings?.show_overview) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          غير مصرح بعرض هذه البيانات
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* إجمالي قيمة الوقف */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي قيمة الوقف</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <MaskedValue
                value={summary?.totalWaqfValue.toLocaleString("ar-SA")}
                type="amount"
                masked={settings?.mask_exact_amounts || false}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">القيمة الإجمالية للأصول</p>
          </CardContent>
        </Card>

        {/* عدد العقارات */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">العقارات</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.propertiesCount}</div>
            <p className="text-xs text-muted-foreground mt-1">عقار في الوقف</p>
          </CardContent>
        </Card>

        {/* عدد المستفيدين */}
        {settings?.show_total_beneficiaries_count && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">المستفيدون</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.beneficiariesCount}</div>
              <p className="text-xs text-muted-foreground mt-1">مستفيد نشط</p>
            </CardContent>
          </Card>
        )}

        {/* الأرصدة البنكية */}
        {settings?.show_bank_balances && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">الأرصدة البنكية</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <MaskedValue
                  value={summary?.totalBankBalance.toLocaleString("ar-SA")}
                  type="amount"
                  masked={settings?.mask_exact_amounts || false}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">رصيد متاح</p>
            </CardContent>
          </Card>
        )}

        {/* الدخل الشهري */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">الدخل الشهري</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <MaskedValue
                value={(summary?.totalFunds || 0).toLocaleString("ar-SA")}
                type="amount"
                masked={settings?.mask_exact_amounts || false}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">إجمالي التوزيعات</p>
          </CardContent>
        </Card>
      </div>

      {/* معلومات إضافية */}
      <Card>
        <CardHeader>
          <CardTitle>نبذة عن الوقف</CardTitle>
          <CardDescription>معلومات عامة عن أصول الوقف وإدارته</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">الأصول العقارية</h4>
            <p className="text-sm text-muted-foreground">
              يمتلك الوقف {summary?.propertiesCount} عقار متنوع بين سكني وتجاري وزراعي،
              بقيمة إجمالية تقديرية تبلغ{" "}
              <MaskedValue
                value={summary?.totalPropertyValue.toLocaleString("ar-SA")}
                type="amount"
                masked={settings?.mask_exact_amounts || false}
              />{" "}
              ريال.
            </p>
          </div>

          {settings?.show_total_beneficiaries_count && (
            <div>
              <h4 className="font-medium mb-2">المستفيدون</h4>
              <p className="text-sm text-muted-foreground">
                يستفيد من الوقف حالياً {summary?.beneficiariesCount} مستفيد نشط من
                مختلف الفئات والأولويات.
              </p>
            </div>
          )}

          <div>
            <h4 className="font-medium mb-2">الاحتياطيات والتطوير</h4>
            <p className="text-sm text-muted-foreground">
              يتم استقطاع نسبة من عوائد الوقف للصيانة والتطوير وبناء احتياطي
              استراتيجي لضمان استدامة الوقف.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
