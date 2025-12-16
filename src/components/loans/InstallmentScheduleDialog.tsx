import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useLoanInstallments } from "@/hooks/payments/useLoanInstallments";
import { formatDate } from "@/lib/date";
import { LoadingState } from "@/components/shared/LoadingState";
import { Calendar, DollarSign, CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface InstallmentScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loanId: string;
  loanNumber: string;
}

export function InstallmentScheduleDialog({
  open,
  onOpenChange,
  loanId,
  loanNumber,
}: InstallmentScheduleDialogProps) {
  const { installments, isLoading } = useLoanInstallments(loanId);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "معلق", variant: "secondary" as const, icon: Clock },
      partial: { label: "مدفوع جزئياً", variant: "default" as const, icon: DollarSign },
      paid: { label: "مدفوع", variant: "outline" as const, icon: CheckCircle2 },
      overdue: { label: "متأخر", variant: "destructive" as const, icon: AlertCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const totalAmount = installments.reduce((sum, inst) => sum + inst.total_amount, 0);
  const totalPaid = installments.reduce((sum, inst) => sum + inst.paid_amount, 0);
  const totalRemaining = installments.reduce((sum, inst) => sum + inst.remaining_amount, 0);

  return (
    <ResponsiveDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title={`جدول أقساط القرض ${loanNumber}`}
      size="xl"
    >
      {isLoading ? (
        <LoadingState />
      ) : (
          <div className="space-y-4">
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-card p-4 rounded-lg border">
                <div className="text-sm text-muted-foreground">إجمالي المبلغ</div>
                <div className="text-2xl font-bold">{totalAmount.toLocaleString('ar-SA')} ريال</div>
              </div>
              <div className="bg-card p-4 rounded-lg border">
                <div className="text-sm text-muted-foreground">المدفوع</div>
                <div className="text-2xl font-bold text-success">{totalPaid.toLocaleString('ar-SA')} ريال</div>
              </div>
              <div className="bg-card p-4 rounded-lg border">
                <div className="text-sm text-muted-foreground">المتبقي</div>
                <div className="text-2xl font-bold text-warning">{totalRemaining.toLocaleString('ar-SA')} ريال</div>
              </div>
            </div>

            {/* Installments table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">رقم القسط</TableHead>
                    <TableHead className="text-right">تاريخ الاستحقاق</TableHead>
                    <TableHead className="text-right">مبلغ الأصل</TableHead>
                    <TableHead className="text-right">الفائدة</TableHead>
                    <TableHead className="text-right">الإجمالي</TableHead>
                    <TableHead className="text-right">المدفوع</TableHead>
                    <TableHead className="text-right">المتبقي</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {installments.map((installment) => (
                    <TableRow key={installment.id}>
                      <TableCell className="font-medium">
                        القسط #{installment.installment_number}
                      </TableCell>
                      <TableCell>
                        {formatDate(installment.due_date, "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        {installment.principal_amount.toLocaleString('ar-SA')} ريال
                      </TableCell>
                      <TableCell>
                        {installment.interest_amount.toLocaleString('ar-SA')} ريال
                      </TableCell>
                      <TableCell className="font-semibold">
                        {installment.total_amount.toLocaleString('ar-SA')} ريال
                      </TableCell>
                      <TableCell className="text-success">
                        {installment.paid_amount.toLocaleString('ar-SA')} ريال
                      </TableCell>
                      <TableCell className="text-warning">
                        {installment.remaining_amount.toLocaleString('ar-SA')} ريال
                      </TableCell>
                      <TableCell>{getStatusBadge(installment.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
            </Table>
          </div>
        </div>
      )}
    </ResponsiveDialog>
  );
}
