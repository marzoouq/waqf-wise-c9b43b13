/**
 * قسم التحكم بعرض المستفيدين
 * يسمح للناظر بإخفاء/إظهار أقسام معينة للمستفيدين والورثة
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useVisibilitySettings } from "@/hooks/governance/useVisibilitySettings";
import { 
  Eye, EyeOff, Users, FileText, Wallet, Building2, 
  Shield, Settings, Save, Loader2, 
  DollarSign, FileBarChart, MessageSquare, Scale, FolderArchive
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingCategory {
  title: string;
  icon: React.ElementType;
  color: string;
  settings: {
    key: string;
    label: string;
    description?: string;
  }[];
}

const settingCategories: SettingCategory[] = [
  {
    title: "الأقسام الرئيسية",
    icon: FileText,
    color: "text-blue-600",
    settings: [
      { key: "show_overview", label: "نظرة عامة", description: "الصفحة الرئيسية" },
      { key: "show_profile", label: "الملف الشخصي" },
      { key: "show_requests", label: "الطلبات" },
      { key: "show_distributions", label: "التوزيعات" },
      { key: "show_statements", label: "كشف الحساب" },
      { key: "show_documents", label: "المستندات" },
    ],
  },
  {
    title: "المالية والمحاسبة",
    icon: DollarSign,
    color: "text-green-600",
    settings: [
      { key: "show_bank_accounts", label: "الحسابات البنكية" },
      { key: "show_bank_balances", label: "الأرصدة البنكية" },
      { key: "show_bank_transactions", label: "الحركات البنكية" },
      { key: "show_bank_statements", label: "كشوف الحساب البنكية" },
      { key: "show_invoices", label: "الفواتير" },
      { key: "show_financial_reports", label: "التقارير المالية" },
      { key: "show_journal_entries", label: "القيود المحاسبية" },
      { key: "show_trial_balance", label: "ميزان المراجعة" },
      { key: "show_ledger_details", label: "دفتر الأستاذ" },
    ],
  },
  {
    title: "العقارات والعقود",
    icon: Building2,
    color: "text-amber-600",
    settings: [
      { key: "show_properties", label: "العقارات" },
      { key: "show_contracts_details", label: "تفاصيل العقود" },
      { key: "show_property_revenues", label: "إيرادات العقارات" },
      { key: "show_maintenance_costs", label: "تكاليف الصيانة" },
    ],
  },
  {
    title: "الميزانيات والتخطيط",
    icon: FileBarChart,
    color: "text-purple-600",
    settings: [
      { key: "show_budgets", label: "الميزانيات" },
      { key: "show_annual_budget", label: "الميزانية السنوية" },
      { key: "show_budget_execution", label: "تنفيذ الميزانية" },
      { key: "show_reserve_funds", label: "الصناديق الاحتياطية" },
      { key: "show_investment_plans", label: "خطط الاستثمار" },
      { key: "show_expenses_breakdown", label: "تفصيل المصروفات" },
    ],
  },
  {
    title: "القروض والفزعات",
    icon: Wallet,
    color: "text-red-600",
    settings: [
      { key: "show_own_loans", label: "قروض المستفيد" },
      { key: "show_other_loans", label: "قروض الآخرين" },
      { key: "show_emergency_aid", label: "الفزعات" },
      { key: "show_emergency_statistics", label: "إحصائيات الفزعات" },
    ],
  },
  {
    title: "الحوكمة والقرارات",
    icon: Scale,
    color: "text-indigo-600",
    settings: [
      { key: "show_governance", label: "الحوكمة" },
      { key: "show_governance_meetings", label: "اجتماعات الحوكمة" },
      { key: "show_nazer_decisions", label: "قرارات الناظر" },
      { key: "show_policy_changes", label: "تغييرات السياسات" },
      { key: "show_strategic_plans", label: "الخطط الاستراتيجية" },
      { key: "show_disclosures", label: "الإفصاحات" },
      { key: "show_approvals_log", label: "سجل الموافقات" },
      { key: "show_audit_reports", label: "تقارير التدقيق" },
      { key: "show_compliance_reports", label: "تقارير الامتثال" },
    ],
  },
  {
    title: "المستفيدون الآخرون",
    icon: Users,
    color: "text-cyan-600",
    settings: [
      { key: "show_other_beneficiaries_names", label: "أسماء المستفيدين الآخرين" },
      { key: "show_other_beneficiaries_amounts", label: "مبالغ المستفيدين الآخرين" },
      { key: "show_other_beneficiaries_personal_data", label: "البيانات الشخصية للآخرين" },
      { key: "show_family_tree", label: "شجرة العائلة" },
      { key: "show_total_beneficiaries_count", label: "إجمالي عدد المستفيدين" },
      { key: "show_beneficiary_categories", label: "فئات المستفيدين" },
      { key: "show_beneficiaries_statistics", label: "إحصائيات المستفيدين" },
      { key: "show_inactive_beneficiaries", label: "المستفيدون غير النشطين" },
    ],
  },
  {
    title: "التواصل والدعم",
    icon: MessageSquare,
    color: "text-pink-600",
    settings: [
      { key: "show_internal_messages", label: "الرسائل الداخلية" },
      { key: "show_support_tickets", label: "تذاكر الدعم" },
    ],
  },
  {
    title: "إخفاء البيانات الحساسة",
    icon: Shield,
    color: "text-orange-600",
    settings: [
      { key: "mask_iban", label: "إخفاء IBAN" },
      { key: "mask_phone_numbers", label: "إخفاء أرقام الهواتف" },
      { key: "mask_exact_amounts", label: "إخفاء المبالغ الدقيقة" },
      { key: "mask_tenant_info", label: "إخفاء معلومات المستأجرين" },
      { key: "mask_national_ids", label: "إخفاء أرقام الهوية" },
      { key: "mask_loan_amounts", label: "إخفاء مبالغ القروض" },
    ],
  },
  {
    title: "إعدادات التصدير",
    icon: Settings,
    color: "text-gray-600",
    settings: [
      { key: "allow_export_pdf", label: "السماح بتصدير PDF" },
      { key: "allow_print", label: "السماح بالطباعة" },
    ],
  },
  {
    title: "الأرشيف والمستندات",
    icon: FolderArchive,
    color: "text-teal-600",
    settings: [
      { key: "show_archive_contracts", label: "مجلد العقود" },
      { key: "show_archive_legal_docs", label: "مجلد الوثائق القانونية" },
      { key: "show_archive_financial_reports", label: "مجلد التقارير المالية" },
      { key: "show_archive_meeting_minutes", label: "مجلد محاضر الاجتماعات" },
      { key: "allow_download_documents", label: "السماح بتحميل المستندات" },
      { key: "allow_preview_documents", label: "السماح بمعاينة المستندات" },
    ],
  },
];

interface VisibilityPanelProps {
  targetRole: 'beneficiary' | 'waqf_heir';
  roleLabel: string;
}

function VisibilityPanel({ targetRole, roleLabel }: VisibilityPanelProps) {
  const { settings, isLoading, updateSettings, isUpdating } = useVisibilitySettings(targetRole);
  const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({});

  const handleToggle = (key: string, value: boolean) => {
    setPendingChanges(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveAll = async () => {
    if (Object.keys(pendingChanges).length === 0) return;
    await updateSettings(pendingChanges);
    setPendingChanges({});
  };

  const getSettingValue = (key: string): boolean => {
    if (key in pendingChanges) return pendingChanges[key];
    return settings?.[key as keyof typeof settings] as boolean ?? true;
  };

  const countEnabled = (category: SettingCategory): number => {
    return category.settings.filter(s => getSettingValue(s.key)).length;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* شريط الإجراءات */}
      <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Users className="h-3 w-3" />
            {roleLabel}
          </Badge>
          {Object.keys(pendingChanges).length > 0 && (
            <Badge variant="secondary" className="animate-pulse">
              {Object.keys(pendingChanges).length} تغيير معلق
            </Badge>
          )}
        </div>
        <Button 
          onClick={handleSaveAll} 
          disabled={Object.keys(pendingChanges).length === 0 || isUpdating}
          size="sm"
          className="gap-2"
        >
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          حفظ التغييرات
        </Button>
      </div>

      {/* الفئات */}
      <div className="grid gap-4 md:grid-cols-2">
        {settingCategories.map((category) => (
          <Card key={category.title} className="overflow-hidden">
            <CardHeader className="pb-2 bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <category.icon className={cn("h-5 w-5", category.color)} />
                  <CardTitle className="text-sm font-medium">{category.title}</CardTitle>
                </div>
                <Badge variant="outline" className="text-xs">
                  {countEnabled(category)}/{category.settings.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-3 space-y-2">
              {category.settings.map((setting) => {
                const isEnabled = getSettingValue(setting.key);
                const hasChange = setting.key in pendingChanges;
                return (
                  <div 
                    key={setting.key} 
                    className={cn(
                      "flex items-center justify-between py-1.5 px-2 rounded-md transition-colors",
                      hasChange && "bg-primary/5 border border-primary/20"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {isEnabled ? (
                        <Eye className="h-3.5 w-3.5 text-status-success" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <Label 
                        htmlFor={`${targetRole}-${setting.key}`} 
                        className="text-xs cursor-pointer"
                      >
                        {setting.label}
                      </Label>
                    </div>
                    <Switch
                      id={`${targetRole}-${setting.key}`}
                      checked={isEnabled}
                      onCheckedChange={(checked) => handleToggle(setting.key, checked)}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function BeneficiaryControlSection() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <CardTitle>التحكم بعرض المستفيدين</CardTitle>
        </div>
        <CardDescription>
          تحكم بما يظهر للمستفيدين والورثة في لوحات التحكم الخاصة بهم
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="waqf_heir" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="waqf_heir" className="gap-2">
              <Shield className="h-4 w-4" />
              ورثة الوقف
            </TabsTrigger>
            <TabsTrigger value="beneficiary" className="gap-2">
              <Users className="h-4 w-4" />
              المستفيدون
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="waqf_heir">
            <VisibilityPanel targetRole="waqf_heir" roleLabel="ورثة الوقف" />
          </TabsContent>
          
          <TabsContent value="beneficiary">
            <VisibilityPanel targetRole="beneficiary" roleLabel="المستفيدون" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
