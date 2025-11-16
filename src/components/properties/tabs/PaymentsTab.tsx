import { useState, useMemo } from "react";
import { Search, DollarSign, Edit } from "lucide-react";
import { useRentalPayments } from "@/hooks/useRentalPayments";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { type RentalPayment } from "@/hooks/useRentalPayments";

interface Props {
  onEdit: (payment: RentalPayment) => void;
}

export const PaymentsTab = ({ onEdit }: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { payments, isLoading } = useRentalPayments();

  const filteredPayments = useMemo(() => {
    if (!searchQuery) return payments;
    
    const query = searchQuery.toLowerCase();
    return payments?.filter(
      (p) =>
        p.payment_number.toLowerCase().includes(query) ||
        p.contracts?.tenant_name.toLowerCase().includes(query)
    ) || [];
  }, [payments, searchQuery]);

  const getStatusBadge = (status: string) => {
    const styles = {
      "مدفوع": "bg-success/10 text-success",
      "معلق": "bg-warning/10 text-warning",
      "متأخر": "bg-destructive/10 text-destructive",
      "مدفوع جزئياً": "bg-primary/10 text-primary",
      "ملغي": "bg-muted text-muted-foreground",
    };
    return styles[status as keyof typeof styles] || "bg-muted";
  };

  const totalPaid = payments?.reduce((sum, p) => sum + Number(p.amount_paid), 0) || 0;
  const totalDue = payments?.reduce((sum, p) => sum + Number(p.amount_due), 0) || 0;
  const overdue = payments?.filter(p => p.status === 'متأخر').length || 0;

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="البحث عن دفعة..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">إجمالي الدفعات</div>
          <div className="text-2xl font-bold">{payments?.length || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">المبلغ المدفوع</div>
          <div className="text-2xl font-bold text-success">
            {totalPaid.toLocaleString()} ر.س
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">المبلغ المستحق</div>
          <div className="text-2xl font-bold text-warning">
            {(totalDue - totalPaid).toLocaleString()} ر.س
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">دفعات متأخرة</div>
          <div className="text-2xl font-bold text-destructive">{overdue}</div>
        </Card>
      </div>

      {/* Payments Table */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>
      ) : filteredPayments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">لا توجد دفعات</div>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">رقم الدفعة</TableHead>
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">العقد</TableHead>
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">المستأجر</TableHead>
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">تاريخ الاستحقاق</TableHead>
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">المبلغ المستحق</TableHead>
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">المبلغ المدفوع</TableHead>
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">المتبقي</TableHead>
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">الحالة</TableHead>
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium text-xs sm:text-sm whitespace-nowrap">{payment.payment_number}</TableCell>
                  <TableCell className="text-xs sm:text-sm hidden lg:table-cell">{payment.contracts?.contract_number || '-'}</TableCell>
                  <TableCell className="text-xs sm:text-sm hidden md:table-cell">{payment.contracts?.tenant_name || '-'}</TableCell>
                  <TableCell className="text-xs sm:text-sm hidden lg:table-cell whitespace-nowrap">
                    {format(new Date(payment.due_date), 'yyyy/MM/dd', { locale: ar })}
                  </TableCell>
                  <TableCell className="font-medium text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">
                    {Number(payment.amount_due).toLocaleString()} ر.س
                  </TableCell>
                  <TableCell className="font-bold text-success text-xs sm:text-sm whitespace-nowrap">
                    {Number(payment.amount_paid).toLocaleString()} ر.س
                  </TableCell>
                  <TableCell className="font-bold text-warning text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">
                    {(Number(payment.amount_due) - Number(payment.amount_paid)).toLocaleString()} ر.س
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    <Badge className={getStatusBadge(payment.status)}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(payment)}
                    >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};