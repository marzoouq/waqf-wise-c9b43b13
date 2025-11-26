/**
 * صف جدول المستفيدين مع Masking للبيانات الحساسة
 */

import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { maskNationalID, maskPhoneNumber, maskIBAN } from "@/lib/security/dataMasking";

interface BeneficiaryTableRowProps {
  beneficiary: {
    id: string;
    full_name: string;
    national_id: string;
    phone: string;
    category: string;
    status: string;
    iban?: string | null;
  };
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function BeneficiaryTableRow({ 
  beneficiary, 
  onView, 
  onEdit, 
  onDelete 
}: BeneficiaryTableRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">{beneficiary.full_name}</TableCell>
      <TableCell className="font-mono text-sm">
        {maskNationalID(beneficiary.national_id)}
      </TableCell>
      <TableCell className="font-mono text-sm" dir="ltr">
        {maskPhoneNumber(beneficiary.phone)}
      </TableCell>
      <TableCell>{beneficiary.category}</TableCell>
      <TableCell>
        <Badge 
          variant={beneficiary.status === 'نشط' ? 'default' : 'secondary'}
        >
          {beneficiary.status}
        </Badge>
      </TableCell>
      <TableCell className="font-mono text-sm">
        {beneficiary.iban ? maskIBAN(beneficiary.iban) : '-'}
      </TableCell>
      <TableCell className="text-left">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onView(beneficiary.id)}
            title="عرض التفاصيل"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onEdit(beneficiary.id)}
            title="تعديل"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onDelete(beneficiary.id)}
            title="حذف"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
