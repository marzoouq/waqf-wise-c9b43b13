import { Button } from "@/components/ui/button";
import { Printer, FileDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Beneficiary } from "@/types/beneficiary";
import { PrintableBeneficiariesList } from "./PrintableBeneficiariesList";
import { createRoot } from "react-dom/client";

interface BeneficiariesPrintButtonProps {
  beneficiaries: Beneficiary[];
}

export function BeneficiariesPrintButton({ beneficiaries }: BeneficiariesPrintButtonProps) {
  
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const container = printWindow.document.createElement('div');
    printWindow.document.body.appendChild(container);

    const root = createRoot(container);
    root.render(
      <PrintableBeneficiariesList beneficiaries={beneficiaries} />
    );

    setTimeout(() => {
      printWindow.print();
      setTimeout(() => {
        printWindow.close();
      }, 100);
    }, 500);
  };

  const handleExportExcel = async () => {
    const { exportToExcel } = await import("@/lib/excel-helper");
    
    const data = beneficiaries.map((b, index) => ({
      'م': index + 1,
      'الاسم الكامل': b.full_name,
      'رقم الهوية': b.national_id,
      'الجنسية': b.nationality || 'سعودي',
      'صلة القرابة': b.relationship,
      'الجنس': b.gender,
      'رقم الجوال': b.phone,
      'البريد الإلكتروني': b.email || '',
      'الحالة': b.status,
    }));

    await exportToExcel(data, `كشف_المستفيدين_${new Date().getTime()}`, "المستفيدين");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Printer className="ml-2 h-4 w-4" />
          طباعة وتصدير
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handlePrint}>
          <Printer className="ml-2 h-4 w-4" />
          طباعة الكشف
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportExcel}>
          <FileDown className="ml-2 h-4 w-4" />
          تصدير Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}