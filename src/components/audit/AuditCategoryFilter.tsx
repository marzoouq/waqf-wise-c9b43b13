import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  DollarSign, 
  Users, 
  Building2, 
  Shield, 
  UserCog, 
  Settings,
  X
} from "lucide-react";

interface AuditCategoryFilterProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

const CATEGORIES = [
  { id: "financial", label: "مالية", icon: DollarSign, color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" },
  { id: "beneficiaries", label: "مستفيدون", icon: Users, color: "bg-blue-500/10 text-blue-600 border-blue-500/30" },
  { id: "properties", label: "عقارات", icon: Building2, color: "bg-purple-500/10 text-purple-600 border-purple-500/30" },
  { id: "governance", label: "حوكمة", icon: Shield, color: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
  { id: "users", label: "مستخدمون", icon: UserCog, color: "bg-red-500/10 text-red-600 border-red-500/30" },
  { id: "system", label: "نظام", icon: Settings, color: "bg-gray-500/10 text-gray-600 border-gray-500/30" },
];

// ربط الجداول بالفئات
export const TABLE_TO_CATEGORY: Record<string, string> = {
  // مالية
  journal_entries: "financial",
  journal_entry_lines: "financial",
  payment_vouchers: "financial",
  bank_accounts: "financial",
  bank_transfers: "financial",
  bank_transactions: "financial",
  invoices: "financial",
  funds: "financial",
  distributions: "financial",
  loans: "financial",
  loan_payments: "financial",
  budgets: "financial",
  fiscal_years: "financial",
  accounts: "financial",
  // مستفيدون
  beneficiaries: "beneficiaries",
  beneficiary_requests: "beneficiaries",
  beneficiary_attachments: "beneficiaries",
  families: "beneficiaries",
  heir_distributions: "beneficiaries",
  // عقارات
  properties: "properties",
  property_units: "properties",
  contracts: "properties",
  tenants: "properties",
  maintenance_requests: "properties",
  rental_payments: "properties",
  // حوكمة
  governance_decisions: "governance",
  governance_votes: "governance",
  approvals: "governance",
  annual_disclosures: "governance",
  // مستخدمون
  user_roles: "users",
  profiles: "users",
  // نظام
  system_settings: "system",
  notifications: "system",
  audit_logs: "system",
};

// الجداول التي تنتمي لكل فئة
export const CATEGORY_TABLES: Record<string, string[]> = {
  financial: ["journal_entries", "journal_entry_lines", "payment_vouchers", "bank_accounts", "bank_transfers", "bank_transactions", "invoices", "funds", "distributions", "loans", "loan_payments", "budgets", "fiscal_years", "accounts"],
  beneficiaries: ["beneficiaries", "beneficiary_requests", "beneficiary_attachments", "families", "heir_distributions"],
  properties: ["properties", "property_units", "contracts", "tenants", "maintenance_requests", "rental_payments"],
  governance: ["governance_decisions", "governance_votes", "approvals", "annual_disclosures"],
  users: ["user_roles", "profiles"],
  system: ["system_settings", "notifications", "audit_logs"],
};

export function AuditCategoryFilter({ selectedCategory, onCategoryChange }: AuditCategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isSelected = selectedCategory === cat.id;
        
        return (
          <Button
            key={cat.id}
            variant="outline"
            size="sm"
            className={cn(
              "gap-2 transition-all",
              isSelected && cat.color
            )}
            onClick={() => onCategoryChange(isSelected ? null : cat.id)}
          >
            <Icon className="h-4 w-4" />
            {cat.label}
            {isSelected && (
              <X className="h-3 w-3 me-1" />
            )}
          </Button>
        );
      })}
      
      {selectedCategory && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCategoryChange(null)}
          className="text-muted-foreground"
        >
          إلغاء الفلتر
        </Button>
      )}
    </div>
  );
}
