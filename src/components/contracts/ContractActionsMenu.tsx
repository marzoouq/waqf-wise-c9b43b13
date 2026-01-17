/**
 * قائمة إجراءات العقد - مطابقة لمنصة إيجار
 * تحتوي على جميع الإجراءات المتاحة للعقد في قائمة منسدلة واحدة
 */

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  MoreVertical,
  Eye,
  Printer,
  FileText,
  Bell,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2,
  ClipboardCheck,
  ExternalLink,
} from 'lucide-react';
import { type Contract } from '@/hooks/property/useContracts';
import { matchesStatus } from '@/lib/constants';

export interface ContractActionsMenuProps {
  contract: Contract;
  onView?: (contract: Contract) => void;
  onPrint?: (contract: Contract) => void;
  onEdit?: (contract: Contract) => void;
  onDelete?: (contract: Contract) => void;
  onHandover?: (contract: Contract) => void;
  onSendNotification?: (contract: Contract) => void;
  onCancelAutoRenew?: (contract: Contract) => void;
  onUnilateralTermination?: (contract: Contract) => void;
  onRentAdjustment?: (contract: Contract, type: 'increase' | 'decrease') => void;
  onEarlyTermination?: (contract: Contract) => void;
}

export function ContractActionsMenu({
  contract,
  onView,
  onPrint,
  onEdit,
  onDelete,
  onHandover,
  onSendNotification,
  onCancelAutoRenew,
  onUnilateralTermination,
  onRentAdjustment,
  onEarlyTermination,
}: ContractActionsMenuProps) {
  const [open, setOpen] = useState(false);

  const isActive = matchesStatus(contract.status, 'active');
  const hasAutoRenew = contract.auto_renew;
  const hasEjarDocument = !!contract.ejar_document_url;

  const handleAction = (action: () => void) => {
    action();
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-muted"
        >
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">فتح القائمة</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* عرض العقد */}
        {onView && (
          <DropdownMenuItem onClick={() => handleAction(() => onView(contract))}>
            <Eye className="h-4 w-4 ms-2" />
            عرض العقد
          </DropdownMenuItem>
        )}

        {/* طباعة العقد */}
        {onPrint && (
          <DropdownMenuItem onClick={() => handleAction(() => onPrint(contract))}>
            <Printer className="h-4 w-4 ms-2" />
            طباعة العقد
          </DropdownMenuItem>
        )}

        {/* عرض عقد إيجار (إذا كان موجوداً) */}
        {hasEjarDocument && (
          <DropdownMenuItem 
            onClick={() => window.open(contract.ejar_document_url, '_blank')}
            className="text-success"
          >
            <ExternalLink className="h-4 w-4 ms-2" />
            عرض عقد إيجار
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* عرض نموذج استلام الوحدة */}
        {onHandover && (
          <DropdownMenuItem onClick={() => handleAction(() => onHandover(contract))}>
            <ClipboardCheck className="h-4 w-4 ms-2" />
            نموذج استلام/تسليم الوحدة
          </DropdownMenuItem>
        )}

        {/* إرسال إشعار تعاقدي */}
        {onSendNotification && isActive && (
          <DropdownMenuItem onClick={() => handleAction(() => onSendNotification(contract))}>
            <Bell className="h-4 w-4 ms-2" />
            إرسال إشعار تعاقدي
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* إلغاء التجديد التلقائي */}
        {onCancelAutoRenew && isActive && hasAutoRenew && (
          <DropdownMenuItem 
            onClick={() => handleAction(() => onCancelAutoRenew(contract))}
            className="text-warning"
          >
            <XCircle className="h-4 w-4 ms-2" />
            إلغاء التجديد التلقائي
          </DropdownMenuItem>
        )}

        {/* فسخ العقد من طرف واحد */}
        {onUnilateralTermination && isActive && (
          <DropdownMenuItem 
            onClick={() => handleAction(() => onUnilateralTermination(contract))}
            className="text-warning"
          >
            <AlertTriangle className="h-4 w-4 ms-2" />
            فسخ العقد من طرف واحد
          </DropdownMenuItem>
        )}

        {/* طلب رفع قيمة الإيجار */}
        {onRentAdjustment && isActive && (
          <>
            <DropdownMenuItem 
              onClick={() => handleAction(() => onRentAdjustment(contract, 'increase'))}
            >
              <TrendingUp className="h-4 w-4 ms-2" />
              طلب رفع قيمة الإيجار
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleAction(() => onRentAdjustment(contract, 'decrease'))}
            >
              <TrendingDown className="h-4 w-4 ms-2" />
              طلب خفض قيمة الإيجار
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />

        {/* تعديل العقد */}
        {onEdit && (
          <DropdownMenuItem onClick={() => handleAction(() => onEdit(contract))}>
            <Edit className="h-4 w-4 ms-2" />
            تعديل العقد
          </DropdownMenuItem>
        )}

        {/* إنهاء العقد */}
        {onEarlyTermination && isActive && (
          <DropdownMenuItem 
            onClick={() => handleAction(() => onEarlyTermination(contract))}
            className="text-destructive"
          >
            <FileText className="h-4 w-4 ms-2" />
            إنهاء العقد
          </DropdownMenuItem>
        )}

        {/* حذف العقد */}
        {onDelete && (
          <DropdownMenuItem 
            onClick={() => handleAction(() => onDelete(contract))}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 ms-2" />
            حذف العقد
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
