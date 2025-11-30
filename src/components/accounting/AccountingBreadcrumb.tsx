import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { HomeIcon } from "lucide-react";

interface AccountingBreadcrumbProps {
  activeTab: string;
}

const tabLabels: Record<string, string> = {
  accounts: "شجرة الحسابات",
  entries: "القيود المحاسبية",
  budgets: "الميزانيات",
  "trial-balance": "ميزان المراجعة",
  ledger: "دفتر الأستاذ",
  "bank-accounts": "الحسابات البنكية",
  "cash-flow": "التدفقات النقدية",
};

export function AccountingBreadcrumb({ activeTab }: AccountingBreadcrumbProps) {
  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/redirect" className="flex items-center gap-1">
            <HomeIcon className="h-3 w-3" />
            الرئيسية
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/accounting">المحاسبة</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{tabLabels[activeTab] || activeTab}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
