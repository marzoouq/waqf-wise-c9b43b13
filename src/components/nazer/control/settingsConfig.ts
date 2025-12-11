/**
 * تكوين فئات وإعدادات التحكم بالظهور
 * 
 * @version 2.8.91
 */
import { 
  FileText, DollarSign, Building2, FileBarChart, 
  Wallet, Scale, Users, MessageSquare, Shield, 
  Settings, FolderArchive 
} from "lucide-react";

export interface SettingCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  iconColor: string;
  settings: {
    key: string;
    label: string;
    description?: string;
  }[];
}

export const SETTING_CATEGORIES: SettingCategory[] = [
  {
    id: "main",
    title: "الأقسام الرئيسية",
    icon: FileText,
    iconColor: "text-[hsl(var(--chart-1))]",
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
    iconColor: "text-[hsl(var(--status-success))]",
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
    iconColor: "text-[hsl(var(--status-warning))]",
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
    iconColor: "text-[hsl(var(--chart-5))]",
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
    iconColor: "text-destructive",
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
    iconColor: "text-[hsl(var(--chart-3))]",
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
    iconColor: "text-[hsl(var(--chart-4))]",
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
    iconColor: "text-[hsl(var(--chart-2))]",
    settings: [
      { key: "show_internal_messages", label: "الرسائل الداخلية" },
      { key: "show_support_tickets", label: "تذاكر الدعم" },
    ],
  },
  {
    id: "privacy",
    title: "إخفاء البيانات الحساسة",
    icon: Shield,
    iconColor: "text-[hsl(var(--status-warning))]",
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
    iconColor: "text-muted-foreground",
    settings: [
      { key: "allow_export_pdf", label: "السماح بتصدير PDF" },
      { key: "allow_print", label: "السماح بالطباعة" },
    ],
  },
  {
    id: "archive",
    title: "الأرشيف والمستندات",
    icon: FolderArchive,
    iconColor: "text-[hsl(var(--chart-4))]",
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

export const TOTAL_SETTINGS = SETTING_CATEGORIES.reduce(
  (acc, cat) => acc + cat.settings.length, 
  0
);
