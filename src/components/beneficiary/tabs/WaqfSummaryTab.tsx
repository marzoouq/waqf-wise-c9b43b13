import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, TrendingUp, Users, Landmark, DollarSign, EyeOff } from "lucide-react";
import { useVisibilitySettings } from "@/hooks/governance/useVisibilitySettings";
import { MaskedValue } from "@/components/shared/MaskedValue";
import { useWaqfSummary } from "@/hooks/beneficiary/useWaqfSummary";
import { useFiscalYearPublishInfo } from "@/hooks/fiscal-years";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";

export function WaqfSummaryTab() {
  const { settings } = useVisibilitySettings();
  const { summary } = useWaqfSummary(settings?.show_overview || false);
  const { isCurrentYearPublished } = useFiscalYearPublishInfo();
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
      <UnifiedStatsGrid columns={{ sm: 2, md: 2, lg: 3 }}>
        {/* إجمالي العائد السنوي */}
        <UnifiedKPICard
          title="إجمالي العائد السنوي"
          value={
            isCurrentYearPublished ? (
              <MaskedValue
                value={summary?.totalPropertyValue.toLocaleString("ar-SA")}
                type="amount"
                masked={settings?.mask_exact_amounts || false}
              />
            ) : (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <EyeOff className="h-4 w-4" />
                ستظهر عند النشر
              </span>
            )
          }
          subtitle="من العقود النشطة"
          icon={Landmark}
          variant="default"
        />

        {/* عدد العقارات */}
        <UnifiedKPICard
          title="العقارات"
          value={summary?.propertiesCount || 0}
          subtitle="عقار في الوقف"
          icon={Building2}
          variant="info"
        />

        {/* عدد المستفيدين */}
        {settings?.show_total_beneficiaries_count && (
          <UnifiedKPICard
            title="المستفيدون"
            value={summary?.beneficiariesCount || 0}
            subtitle="مستفيد نشط"
            icon={Users}
            variant="success"
          />
        )}

        {/* الأرصدة البنكية */}
        {settings?.show_bank_balances && (
          <UnifiedKPICard
            title="الأرصدة البنكية"
            value={
              <MaskedValue
                value={summary?.totalBankBalance.toLocaleString("ar-SA")}
                type="amount"
                masked={settings?.mask_exact_amounts || false}
              />
            }
            subtitle="رصيد متاح"
            icon={DollarSign}
            variant="warning"
          />
        )}

        {/* إجمالي مخصصات الصناديق */}
        <UnifiedKPICard
          title="إجمالي مخصصات الصناديق"
          value={
            <MaskedValue
              value={(summary?.totalFunds || 0).toLocaleString("ar-SA")}
              type="amount"
              masked={settings?.mask_exact_amounts || false}
            />
          }
          subtitle="مجموع المبالغ المخصصة"
          icon={TrendingUp}
          variant="default"
        />
      </UnifiedStatsGrid>

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
