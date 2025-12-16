import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Save, RotateCcw, Eye, Shield, DollarSign, Users, Lock, Briefcase, CreditCard, PieChart, MessageSquare } from "lucide-react";
import { useVisibilitySettings } from "@/hooks/governance/useVisibilitySettings";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingState } from "@/components/shared/LoadingState";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { Separator } from "@/components/ui/separator";
import { useUserRole } from "@/hooks/auth/useUserRole";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function TransparencySettings() {
  const navigate = useNavigate();
  const { isNazer, isAdmin } = useUserRole();
  
  // إدارة الدور النشط (المستفيدون أو الورثة)
  const [activeRole, setActiveRole] = useState<'beneficiary' | 'waqf_heir'>('beneficiary');
  
  // جلب الإعدادات حسب الدور النشط
  const { settings, isLoading, error, refetch, updateSettings, isUpdating } = useVisibilitySettings(activeRole);
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings, activeRole]);

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
    setLocalSettings((prev) => ({
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
        <LoadingState message="جاري تحميل إعدادات الشفافية..." />
      </MobileOptimizedLayout>
    );
  }

  if (error) {
    return (
      <MobileOptimizedLayout>
        <ErrorState title="خطأ في التحميل" message="فشل تحميل إعدادات الشفافية" onRetry={refetch} />
      </MobileOptimizedLayout>
    );
  }

  return (
    <PageErrorBoundary>
      <MobileOptimizedLayout>
        <MobileOptimizedHeader
          title="إعدادات الشفافية"
          description="التحكم الكامل في البيانات المتاحة للمستفيدين والورثة"
          actions={
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowRight className="h-4 w-4 ml-2" />
              رجوع
            </Button>
          }
        />

        <div className="space-y-6 p-6">
          {/* تبويب اختيار الفئة: المستفيدون أو الورثة */}
          <Card className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  {activeRole === 'beneficiary' ? 'إعدادات المستفيدين' : 'إعدادات الورثة'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {activeRole === 'beneficiary' 
                    ? 'التحكم في ما يراه المستفيدون من الدرجة الأولى (14 مستفيد)'
                    : 'التحكم في الشفافية الكاملة لورثة الوقف (2 وارث)'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={activeRole === 'beneficiary' ? 'default' : 'outline'}
                  onClick={() => setActiveRole('beneficiary')}
                  size="sm"
                >
                  <Users className="h-4 w-4 ml-2" />
                  المستفيدون
                </Button>
                <Button
                  variant={activeRole === 'waqf_heir' ? 'default' : 'outline'}
                  onClick={() => setActiveRole('waqf_heir')}
                  size="sm"
                >
                  <Shield className="h-4 w-4 ml-2" />
                  الورثة
                </Button>
              </div>
            </div>
          </Card>

          <Alert>
            <Eye className="h-4 w-4" />
            <AlertDescription>
              {activeRole === 'beneficiary' ? (
                <>هذه الإعدادات تتحكم في ما يراه <strong>المستفيدون من الدرجة الأولى (14 مستفيد)</strong> في بوابة المستفيدين.</>
              ) : (
                <>
                  <strong>الشفافية الكاملة للورثة:</strong> يمكنك التحكم في جميع البيانات المتاحة لورثة الوقف.
                  الإعدادات الافتراضية تمنح الورثة وصول كامل لجميع البيانات (شفافية 100%).
                </>
              )}
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="sections" dir="rtl">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-2">
              <TabsTrigger value="sections" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                الأقسام
              </TabsTrigger>
              <TabsTrigger value="financial" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                المالية
              </TabsTrigger>
              <TabsTrigger value="beneficiaries" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                المستفيدون
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                الخصوصية
              </TabsTrigger>
              <TabsTrigger value="governance" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                الحوكمة
              </TabsTrigger>
              <TabsTrigger value="loans" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                القروض
              </TabsTrigger>
              <TabsTrigger value="budgets" className="flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                الميزانيات
              </TabsTrigger>
              <TabsTrigger value="accounting" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                المحاسبة
              </TabsTrigger>
            </TabsList>

            {/* التبويب 1: الأقسام الرئيسية */}
            <TabsContent value="sections" className="space-y-4">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">الأقسام الرئيسية (13 قسم)</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  التحكم في الأقسام الأساسية التي يمكن للمستفيد الوصول إليها في البوابة
                </p>
                <Separator className="mb-4" />
                <div className="space-y-4">
                  {[
                    { key: "show_overview", label: "نظرة عامة", desc: "لوحة التحكم الرئيسية والإحصائيات" },
                    { key: "show_profile", label: "الملف الشخصي", desc: "البيانات الشخصية والتواصل" },
                    { key: "show_requests", label: "الطلبات", desc: "تقديم ومتابعة الطلبات" },
                    { key: "show_distributions", label: "التوزيعات", desc: "سجل توزيعات الغلة" },
                    { key: "show_statements", label: "كشف الحساب", desc: "كشف حساب مفصل بالحركات" },
                    { key: "show_properties", label: "العقارات", desc: "معلومات عقارات الوقف" },
                    { key: "show_documents", label: "المستندات", desc: "رفع وتحميل المستندات" },
                    { key: "show_bank_accounts", label: "الحسابات البنكية", desc: "الحسابات البنكية للوقف" },
                    { key: "show_financial_reports", label: "التقارير المالية", desc: "التقارير المالية المتاحة" },
                    { key: "show_approvals_log", label: "سجل الموافقات", desc: "سجل الموافقات والقرارات" },
                    { key: "show_disclosures", label: "الإفصاحات السنوية", desc: "التقارير السنوية المنشورة" },
                    { key: "show_governance", label: "الحوكمة", desc: "معلومات الحوكمة والإدارة" },
                    { key: "show_budgets", label: "الميزانيات", desc: "الميزانيات والخطط المالية" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex-1">
                        <Label htmlFor={item.key} className="font-medium cursor-pointer">{item.label}</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
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

            {/* التبويب 2: الجداول المالية */}
            <TabsContent value="financial" className="space-y-4">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">الجداول المالية (8 جداول)</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  التحكم في البيانات المالية التفصيلية المتاحة للمستفيد
                </p>
                <Separator className="mb-4" />
                <div className="space-y-4">
                  {[
                    { key: "show_bank_balances", label: "أرصدة البنوك", desc: "عرض الأرصدة الحالية للحسابات" },
                    { key: "show_bank_transactions", label: "الحركات البنكية", desc: "جميع المعاملات البنكية" },
                    { key: "show_bank_statements", label: "كشوف الحساب البنكية", desc: "كشوف الحساب الشهرية" },
                    { key: "show_invoices", label: "الفواتير", desc: "فواتير الموردين والمقاولين" },
                    { key: "show_contracts_details", label: "تفاصيل العقود", desc: "تفاصيل عقود الإيجار والصيانة" },
                    { key: "show_maintenance_costs", label: "تكاليف الصيانة", desc: "مصاريف صيانة العقارات" },
                    { key: "show_property_revenues", label: "إيرادات العقارات", desc: "إيرادات كل عقار" },
                    { key: "show_expenses_breakdown", label: "تفصيل المصروفات", desc: "تفصيل جميع المصروفات" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex-1">
                        <Label htmlFor={item.key} className="font-medium cursor-pointer">{item.label}</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
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

            {/* التبويب 3: المستفيدون الآخرون */}
            <TabsContent value="beneficiaries" className="space-y-4">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">بيانات المستفيدين الآخرين (8)</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  التحكم في مستوى الشفافية حول المستفيدين الآخرين
                </p>
                <Separator className="mb-4" />
                <div className="space-y-4">
                  {[
                    { key: "show_other_beneficiaries_names", label: "أسماء المستفيدين", desc: "أسماء المستفيدين الآخرين" },
                    { key: "show_other_beneficiaries_amounts", label: "مبالغ المستفيدين", desc: "المبالغ المصروفة للآخرين" },
                    { key: "show_other_beneficiaries_personal_data", label: "البيانات الشخصية", desc: "بيانات شخصية عن الآخرين" },
                    { key: "show_family_tree", label: "شجرة العائلة", desc: "شجرة العائلة الكاملة" },
                    { key: "show_total_beneficiaries_count", label: "عدد المستفيدين الكلي", desc: "إجمالي عدد المستفيدين" },
                    { key: "show_beneficiary_categories", label: "فئات المستفيدين", desc: "تصنيفات المستفيدين" },
                    { key: "show_beneficiaries_statistics", label: "إحصائيات المستفيدين", desc: "إحصائيات عامة" },
                    { key: "show_inactive_beneficiaries", label: "المستفيدون غير النشطين", desc: "المستفيدون المتوقفون" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex-1">
                        <Label htmlFor={item.key} className="font-medium cursor-pointer">{item.label}</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
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

            {/* التبويب 4: البيانات الحساسة والإخفاء */}
            <TabsContent value="privacy" className="space-y-4">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">البيانات الحساسة والإخفاء (5)</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  إعدادات إخفاء البيانات الحساسة لحماية الخصوصية
                </p>
                <Separator className="mb-4" />
                <div className="space-y-4">
                  {[
                    { key: "mask_iban", label: "إخفاء IBAN", desc: "عرض آخر 4 أرقام فقط" },
                    { key: "mask_phone_numbers", label: "إخفاء أرقام الهواتف", desc: "إخفاء جزئي للأرقام" },
                    { key: "mask_exact_amounts", label: "إخفاء المبالغ الدقيقة", desc: "عرض مبالغ تقريبية" },
                    { key: "mask_tenant_info", label: "إخفاء بيانات المستأجرين", desc: "حماية خصوصية المستأجرين" },
                    { key: "mask_national_ids", label: "إخفاء أرقام الهوية", desc: "إخفاء جزئي لرقم الهوية" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex-1">
                        <Label htmlFor={item.key} className="font-medium cursor-pointer">{item.label}</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
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
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">الإعدادات العامة (2)</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { key: "allow_export_pdf", label: "السماح بتصدير PDF", desc: "تحميل التقارير كملفات PDF" },
                    { key: "allow_print", label: "السماح بالطباعة", desc: "طباعة الصفحات مباشرة" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex-1">
                        <Label htmlFor={item.key} className="font-medium cursor-pointer">{item.label}</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
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

            {/* التبويب 5: الحوكمة والقرارات */}
            <TabsContent value="governance" className="space-y-4">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">الحوكمة والقرارات (6)</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  مستوى الشفافية في قرارات الإدارة والحوكمة
                </p>
                <Separator className="mb-4" />
                <div className="space-y-4">
                  {[
                    { key: "show_governance_meetings", label: "اجتماعات الحوكمة", desc: "محاضر اجتماعات مجلس الإدارة" },
                    { key: "show_nazer_decisions", label: "قرارات الناظر", desc: "القرارات الصادرة من الناظر" },
                    { key: "show_policy_changes", label: "تغييرات السياسات", desc: "التحديثات على السياسات" },
                    { key: "show_strategic_plans", label: "الخطط الاستراتيجية", desc: "خطط الوقف المستقبلية" },
                    { key: "show_audit_reports", label: "تقارير المراجعة", desc: "تقارير المراجعة الداخلية" },
                    { key: "show_compliance_reports", label: "تقارير الامتثال", desc: "تقارير الامتثال القانوني" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex-1">
                        <Label htmlFor={item.key} className="font-medium cursor-pointer">{item.label}</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
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

            {/* التبويب 6: القروض والفزعات */}
            <TabsContent value="loans" className="space-y-4">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">القروض والفزعات (5)</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  التحكم في معلومات القروض والمساعدات الطارئة
                </p>
                <Separator className="mb-4" />
                <div className="space-y-4">
                  {[
                    { key: "show_own_loans", label: "قروض المستفيد نفسه", desc: "قروضه الشخصية فقط" },
                    { key: "show_other_loans", label: "قروض المستفيدين الآخرين", desc: "قروض باقي المستفيدين" },
                    { key: "mask_loan_amounts", label: "إخفاء مبالغ القروض", desc: "إخفاء القيم الدقيقة" },
                    { key: "show_emergency_aid", label: "الفزعات الطارئة", desc: "المساعدات الطارئة المقدمة" },
                    { key: "show_emergency_statistics", label: "إحصائيات الفزعات", desc: "إحصائيات عامة للفزعات" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex-1">
                        <Label htmlFor={item.key} className="font-medium cursor-pointer">{item.label}</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
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

            {/* التبويب 7: الميزانيات والتخطيط */}
            <TabsContent value="budgets" className="space-y-4">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <PieChart className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">الميزانيات والتخطيط (4)</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  الشفافية في الميزانيات والخطط المالية
                </p>
                <Separator className="mb-4" />
                <div className="space-y-4">
                  {[
                    { key: "show_annual_budget", label: "الميزانية السنوية", desc: "ميزانية الوقف السنوية" },
                    { key: "show_budget_execution", label: "تنفيذ الميزانية", desc: "نسب التنفيذ الفعلية" },
                    { key: "show_reserve_funds", label: "صناديق الاحتياطي", desc: "الاحتياطيات المالية" },
                    { key: "show_investment_plans", label: "خطط الاستثمار", desc: "الخطط الاستثمارية للوقف" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex-1">
                        <Label htmlFor={item.key} className="font-medium cursor-pointer">{item.label}</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
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

            {/* التبويب 8: المحاسبة والتواصل */}
            <TabsContent value="accounting" className="space-y-4">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">المحاسبة التفصيلية (3)</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  التحكم في السجلات المحاسبية التفصيلية
                </p>
                <Separator className="mb-4" />
                <div className="space-y-4">
                  {[
                    { key: "show_journal_entries", label: "القيود اليومية", desc: "جميع القيود المحاسبية" },
                    { key: "show_trial_balance", label: "ميزان المراجعة", desc: "ميزان المراجعة الشهري" },
                    { key: "show_ledger_details", label: "تفاصيل دفتر الأستاذ", desc: "دفتر الأستاذ التفصيلي" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex-1">
                        <Label htmlFor={item.key} className="font-medium cursor-pointer">{item.label}</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
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
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">التواصل والدعم (2)</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { key: "show_internal_messages", label: "الرسائل الداخلية", desc: "المراسلات مع الإدارة" },
                    { key: "show_support_tickets", label: "تذاكر الدعم", desc: "نظام تذاكر الدعم الفني" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex-1">
                        <Label htmlFor={item.key} className="font-medium cursor-pointer">{item.label}</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
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
              {isUpdating ? "جارِ الحفظ..." : "حفظ التغييرات"}
            </Button>
            <Button variant="outline" onClick={handleReset} disabled={isUpdating}>
              <RotateCcw className="ml-2 h-4 w-4" />
              إلغاء
            </Button>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>ملاحظة:</strong> جميع التغييرات تُطبق مباشرةً على جميع المستفيدين من الدرجة الأولى (14 مستفيد).
              يُنصح بمراجعة الإعدادات بعناية قبل الحفظ.
            </AlertDescription>
          </Alert>
        </div>
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
}
