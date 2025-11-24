import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Save, RotateCcw, Eye } from "lucide-react";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { Separator } from "@/components/ui/separator";
import { useUserRole } from "@/hooks/useUserRole";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function TransparencySettings() {
  const navigate = useNavigate();
  const { settings, isLoading, updateSettings, isUpdating } = useVisibilitySettings();
  const { isNazer, isAdmin } = useUserRole();
  const [localSettings, setLocalSettings] = useState(settings);

  if (!isNazer && !isAdmin) {
    return (
      <MobileOptimizedLayout>
        <Alert variant="destructive">
          <AlertDescription>
            غير مصرح لك بالوصول لهذه الصفحة. هذه الصفحة متاحة فقط للناظر والمشرف.
          </AlertDescription>
        </Alert>
      </MobileOptimizedLayout>
    );
  }

  const handleToggle = (key: keyof typeof settings) => {
    setLocalSettings((prev: any) => ({
      ...prev,
      [key]: !prev?.[key],
    }));
  };

  const handleSave = async () => {
    if (localSettings) {
      await updateSettings(localSettings);
    }
  };

  const handleReset = () => {
    setLocalSettings(settings);
  };

  if (isLoading || !settings) {
    return (
      <MobileOptimizedLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MobileOptimizedLayout>
    );
  }

  return (
    <PageErrorBoundary>
      <MobileOptimizedLayout>
        <MobileOptimizedHeader
          title="إعدادات الشفافية للمستفيدين"
          description="التحكم في البيانات التي يمكن للمستفيدين من الدرجة الأولى الاطلاع عليها"
          actions={
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowRight className="h-4 w-4 ml-2" />
              رجوع
            </Button>
          }
        />

        <div className="space-y-6 p-6">
          <Alert>
            <Eye className="h-4 w-4" />
            <AlertDescription>
              هذه الإعدادات تتحكم في ما يراه <strong>المستفيدون من الدرجة الأولى (14 مستفيد)</strong> في بوابة المستفيدين.
              جميع التغييرات تُطبق مباشرةً على جميع المستفيدين.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="sections" dir="rtl">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="sections">الأقسام</TabsTrigger>
              <TabsTrigger value="financial">المالية</TabsTrigger>
              <TabsTrigger value="beneficiaries">المستفيدون</TabsTrigger>
              <TabsTrigger value="privacy">الخصوصية</TabsTrigger>
            </TabsList>

            {/* الأقسام الرئيسية */}
            <TabsContent value="sections" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">الأقسام الرئيسية (13 قسم)</h3>
                <div className="space-y-4">
                  {[
                    { key: "show_overview", label: "نظرة عامة" },
                    { key: "show_profile", label: "الملف الشخصي" },
                    { key: "show_requests", label: "الطلبات" },
                    { key: "show_distributions", label: "التوزيعات" },
                    { key: "show_statements", label: "كشف الحساب" },
                    { key: "show_properties", label: "العقارات" },
                    { key: "show_documents", label: "المستندات" },
                    { key: "show_bank_accounts", label: "الحسابات البنكية" },
                    { key: "show_financial_reports", label: "التقارير المالية" },
                    { key: "show_approvals_log", label: "سجل الموافقات" },
                    { key: "show_disclosures", label: "الإفصاحات السنوية" },
                    { key: "show_governance", label: "الحوكمة" },
                    { key: "show_budgets", label: "الميزانيات" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <Label htmlFor={item.key}>{item.label}</Label>
                      <Switch
                        id={item.key}
                        checked={localSettings?.[item.key as keyof typeof settings] as boolean}
                        onCheckedChange={() => handleToggle(item.key as keyof typeof settings)}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* الجداول المالية */}
            <TabsContent value="financial" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">الجداول المالية (8 جداول)</h3>
                <div className="space-y-4">
                  {[
                    { key: "show_bank_balances", label: "أرصدة البنوك" },
                    { key: "show_bank_transactions", label: "الحركات البنكية" },
                    { key: "show_bank_statements", label: "كشوف الحساب البنكية" },
                    { key: "show_invoices", label: "الفواتير" },
                    { key: "show_contracts_details", label: "تفاصيل العقود" },
                    { key: "show_maintenance_costs", label: "تكاليف الصيانة" },
                    { key: "show_property_revenues", label: "إيرادات العقارات" },
                    { key: "show_expenses_breakdown", label: "تفصيل المصروفات" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <Label htmlFor={item.key}>{item.label}</Label>
                      <Switch
                        id={item.key}
                        checked={localSettings?.[item.key as keyof typeof settings] as boolean}
                        onCheckedChange={() => handleToggle(item.key as keyof typeof settings)}
                      />
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">المحاسبة التفصيلية (3)</h3>
                <div className="space-y-4">
                  {[
                    { key: "show_journal_entries", label: "القيود اليومية" },
                    { key: "show_trial_balance", label: "ميزان المراجعة" },
                    { key: "show_ledger_details", label: "تفاصيل دفتر الأستاذ" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <Label htmlFor={item.key}>{item.label}</Label>
                      <Switch
                        id={item.key}
                        checked={localSettings?.[item.key as keyof typeof settings] as boolean}
                        onCheckedChange={() => handleToggle(item.key as keyof typeof settings)}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* المستفيدون الآخرون */}
            <TabsContent value="beneficiaries" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">بيانات المستفيدين الآخرين (8)</h3>
                <div className="space-y-4">
                  {[
                    { key: "show_other_beneficiaries_names", label: "أسماء المستفيدين" },
                    { key: "show_other_beneficiaries_amounts", label: "مبالغ المستفيدين" },
                    { key: "show_other_beneficiaries_personal_data", label: "البيانات الشخصية" },
                    { key: "show_family_tree", label: "شجرة العائلة" },
                    { key: "show_total_beneficiaries_count", label: "عدد المستفيدين الكلي" },
                    { key: "show_beneficiary_categories", label: "فئات المستفيدين" },
                    { key: "show_beneficiaries_statistics", label: "إحصائيات المستفيدين" },
                    { key: "show_inactive_beneficiaries", label: "المستفيدون غير النشطين" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <Label htmlFor={item.key}>{item.label}</Label>
                      <Switch
                        id={item.key}
                        checked={localSettings?.[item.key as keyof typeof settings] as boolean}
                        onCheckedChange={() => handleToggle(item.key as keyof typeof settings)}
                      />
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">القروض والفزعات (5)</h3>
                <div className="space-y-4">
                  {[
                    { key: "show_own_loans", label: "قروض المستفيد نفسه" },
                    { key: "show_other_loans", label: "قروض المستفيدين الآخرين" },
                    { key: "mask_loan_amounts", label: "إخفاء مبالغ القروض" },
                    { key: "show_emergency_aid", label: "الفزعات" },
                    { key: "show_emergency_statistics", label: "إحصائيات الفزعات" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <Label htmlFor={item.key}>{item.label}</Label>
                      <Switch
                        id={item.key}
                        checked={localSettings?.[item.key as keyof typeof settings] as boolean}
                        onCheckedChange={() => handleToggle(item.key as keyof typeof settings)}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* الخصوصية والإخفاء */}
            <TabsContent value="privacy" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">البيانات الحساسة (5)</h3>
                <div className="space-y-4">
                  {[
                    { key: "mask_iban", label: "إخفاء IBAN (عرض آخر 4 أرقام)" },
                    { key: "mask_phone_numbers", label: "إخفاء أرقام الهواتف" },
                    { key: "mask_exact_amounts", label: "إخفاء المبالغ الدقيقة (تقريبي)" },
                    { key: "mask_tenant_info", label: "إخفاء بيانات المستأجرين" },
                    { key: "mask_national_ids", label: "إخفاء أرقام الهوية" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <Label htmlFor={item.key}>{item.label}</Label>
                      <Switch
                        id={item.key}
                        checked={localSettings?.[item.key as keyof typeof settings] as boolean}
                        onCheckedChange={() => handleToggle(item.key as keyof typeof settings)}
                      />
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">الإعدادات العامة (2)</h3>
                <div className="space-y-4">
                  {[
                    { key: "allow_export_pdf", label: "السماح بتصدير PDF" },
                    { key: "allow_print", label: "السماح بالطباعة" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <Label htmlFor={item.key}>{item.label}</Label>
                      <Switch
                        id={item.key}
                        checked={localSettings?.[item.key as keyof typeof settings] as boolean}
                        onCheckedChange={() => handleToggle(item.key as keyof typeof settings)}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={isUpdating} className="flex-1">
              <Save className="ml-2 h-4 w-4" />
              حفظ التغييرات
            </Button>
            <Button variant="outline" onClick={handleReset} disabled={isUpdating}>
              <RotateCcw className="ml-2 h-4 w-4" />
              إلغاء
            </Button>
          </div>
        </div>
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
}
