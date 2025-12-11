/**
 * قسم التحكم بعرض المستفيدين - محسّن
 * يسمح للناظر بإخفاء/إظهار أقسام معينة للمستفيدين والورثة
 * 
 * التحسينات:
 * - بحث وفلترة للإعدادات (60+ إعداد)
 * - أزرار جماعية (تفعيل الكل / إلغاء الكل)
 * - معاينة التغييرات قبل الحفظ
 * 
 * @version 2.8.78
 */
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useVisibilitySettings } from "@/hooks/governance/useVisibilitySettings";
import { 
  Eye, EyeOff, Users, FileText, Wallet, Building2, 
  Shield, Settings, Save, Loader2, Search, X, Filter,
  DollarSign, FileBarChart, MessageSquare, Scale, FolderArchive,
  ChevronDown, CheckCircle2, XCircle, RotateCcw, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SettingCategory {
  id: string;
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
    id: "main",
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
    id: "finance",
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
    id: "properties",
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
    id: "budgets",
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
    id: "loans",
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
    id: "governance",
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
    id: "beneficiaries",
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
    id: "communication",
    title: "التواصل والدعم",
    icon: MessageSquare,
    color: "text-pink-600",
    settings: [
      { key: "show_internal_messages", label: "الرسائل الداخلية" },
      { key: "show_support_tickets", label: "تذاكر الدعم" },
    ],
  },
  {
    id: "privacy",
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
    id: "export",
    title: "إعدادات التصدير",
    icon: Settings,
    color: "text-gray-600",
    settings: [
      { key: "allow_export_pdf", label: "السماح بتصدير PDF" },
      { key: "allow_print", label: "السماح بالطباعة" },
    ],
  },
  {
    id: "archive",
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

// حساب إجمالي الإعدادات
const totalSettings = settingCategories.reduce((acc, cat) => acc + cat.settings.length, 0);

interface VisibilityPanelProps {
  targetRole: 'beneficiary' | 'waqf_heir';
  roleLabel: string;
}

function VisibilityPanel({ targetRole, roleLabel }: VisibilityPanelProps) {
  const { settings, isLoading, updateSettings, isUpdating } = useVisibilitySettings(targetRole);
  const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    settingCategories.map(c => c.id)
  );

  const handleToggle = (key: string, value: boolean) => {
    setPendingChanges(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveAll = async () => {
    if (Object.keys(pendingChanges).length === 0) return;
    await updateSettings(pendingChanges);
    setPendingChanges({});
  };

  const handleDiscardChanges = () => {
    setPendingChanges({});
  };

  const getSettingValue = (key: string): boolean => {
    if (key in pendingChanges) return pendingChanges[key];
    return settings?.[key as keyof typeof settings] as boolean ?? true;
  };

  // تفعيل/إلغاء الكل لفئة معينة
  const handleBulkAction = (categoryId: string, enable: boolean) => {
    const category = settingCategories.find(c => c.id === categoryId);
    if (!category) return;
    
    const changes: Record<string, boolean> = {};
    category.settings.forEach(s => {
      changes[s.key] = enable;
    });
    setPendingChanges(prev => ({ ...prev, ...changes }));
  };

  // تفعيل/إلغاء الكل
  const handleBulkActionAll = (enable: boolean) => {
    const changes: Record<string, boolean> = {};
    settingCategories.forEach(cat => {
      cat.settings.forEach(s => {
        changes[s.key] = enable;
      });
    });
    setPendingChanges(prev => ({ ...prev, ...changes }));
  };

  // إعادة للافتراضي (الكل مفعّل)
  const handleResetToDefault = () => {
    handleBulkActionAll(true);
  };

  // فلترة الفئات والإعدادات
  const filteredCategories = useMemo(() => {
    return settingCategories
      .filter(cat => selectedCategory === "all" || cat.id === selectedCategory)
      .map(cat => ({
        ...cat,
        settings: cat.settings.filter(s => 
          s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }))
      .filter(cat => cat.settings.length > 0);
  }, [searchQuery, selectedCategory]);

  const countEnabled = (category: SettingCategory): number => {
    return category.settings.filter(s => getSettingValue(s.key)).length;
  };

  const totalEnabled = useMemo(() => {
    return settingCategories.reduce((acc, cat) => 
      acc + cat.settings.filter(s => getSettingValue(s.key)).length, 0
    );
  }, [settings, pendingChanges]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
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
      {/* شريط البحث والفلترة */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`بحث في ${totalSettings} إعداد...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-1 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="h-4 w-4 ml-2" />
            <SelectValue placeholder="كل الفئات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الفئات</SelectItem>
            {settingCategories.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>
                <div className="flex items-center gap-2">
                  <cat.icon className={cn("h-4 w-4", cat.color)} />
                  {cat.title}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* شريط الإجراءات */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-muted/50 rounded-lg p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="gap-1">
            <Users className="h-3 w-3" />
            {roleLabel}
          </Badge>
          <Badge variant="secondary">
            {totalEnabled}/{totalSettings} مفعّل
          </Badge>
          {Object.keys(pendingChanges).length > 0 && (
            <Badge variant="default" className="animate-pulse bg-primary">
              {Object.keys(pendingChanges).length} تغيير معلق
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          {/* أزرار جماعية */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleBulkActionAll(true)}
            className="gap-1 text-xs"
          >
            <CheckCircle2 className="h-3 w-3 text-status-success" />
            تفعيل الكل
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleBulkActionAll(false)}
            className="gap-1 text-xs"
          >
            <XCircle className="h-3 w-3 text-destructive" />
            إلغاء الكل
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleResetToDefault}
            className="gap-1 text-xs"
          >
            <RotateCcw className="h-3 w-3" />
            افتراضي
          </Button>
        </div>
      </div>

      {/* معاينة التغييرات */}
      {Object.keys(pendingChanges).length > 0 && (
        <Alert className="bg-primary/5 border-primary/20">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-sm">
              لديك {Object.keys(pendingChanges).length} تغيير معلق. اضغط "حفظ التغييرات" لتطبيقها.
            </span>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDiscardChanges}
                className="text-xs h-7"
              >
                تجاهل
              </Button>
              <Button 
                onClick={handleSaveAll} 
                disabled={isUpdating}
                size="sm"
                className="gap-1 text-xs h-7"
              >
                {isUpdating ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Save className="h-3 w-3" />
                )}
                حفظ التغييرات
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* نتائج البحث */}
      {searchQuery && (
        <div className="text-sm text-muted-foreground">
          تم العثور على {filteredCategories.reduce((acc, cat) => acc + cat.settings.length, 0)} نتيجة
        </div>
      )}

      {/* الفئات */}
      <ScrollArea className="h-[500px] pr-2">
        <div className="space-y-3">
          {filteredCategories.map((category) => (
            <Collapsible
              key={category.id}
              open={expandedCategories.includes(category.id)}
              onOpenChange={() => toggleCategory(category.id)}
            >
              <Card className="overflow-hidden">
                <CollapsibleTrigger asChild>
                  <CardHeader className="pb-2 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <category.icon className={cn("h-5 w-5", category.color)} />
                        <CardTitle className="text-sm font-medium">{category.title}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {countEnabled(category)}/{category.settings.length}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* أزرار جماعية للفئة */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBulkAction(category.id, true);
                          }}
                          title="تفعيل كل إعدادات هذه الفئة"
                        >
                          <CheckCircle2 className="h-3 w-3 text-status-success" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBulkAction(category.id, false);
                          }}
                          title="إلغاء كل إعدادات هذه الفئة"
                        >
                          <XCircle className="h-3 w-3 text-destructive" />
                        </Button>
                        <ChevronDown className={cn(
                          "h-4 w-4 transition-transform",
                          expandedCategories.includes(category.id) && "rotate-180"
                        )} />
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-3 space-y-1">
                    {category.settings.map((setting) => {
                      const isEnabled = getSettingValue(setting.key);
                      const hasChange = setting.key in pendingChanges;
                      return (
                        <div 
                          key={setting.key} 
                          className={cn(
                            "flex items-center justify-between py-2 px-2 rounded-md transition-colors",
                            hasChange && "bg-primary/5 border border-primary/20"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {isEnabled ? (
                              <Eye className="h-3.5 w-3.5 text-status-success" />
                            ) : (
                              <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                            <div>
                              <Label 
                                htmlFor={`${targetRole}-${setting.key}`} 
                                className="text-xs cursor-pointer"
                              >
                                {setting.label}
                              </Label>
                              {setting.description && (
                                <p className="text-[10px] text-muted-foreground">
                                  {setting.description}
                                </p>
                              )}
                            </div>
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
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      </ScrollArea>
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
          تحكم بما يظهر للمستفيدين والورثة في لوحات التحكم الخاصة بهم ({totalSettings} إعداد)
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
