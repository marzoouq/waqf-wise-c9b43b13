import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaymentVoucherDialog } from "./PaymentVoucherDialog";
import { VoucherDetailsDialog } from "./VoucherDetailsDialog";
import { BankTransferGenerator } from "./BankTransferGenerator";
import { Receipt, Eye, Plus, FileText, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DistributionVouchersTabProps {
  distributionId: string;
}

export function DistributionVouchersTab({ distributionId }: DistributionVouchersTabProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const { data: vouchers, isLoading, refetch } = useQuery({
    queryKey: ["distribution-vouchers", distributionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_vouchers_with_details')
        .select('*')
        .eq('distribution_id', distributionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["distribution-vouchers-stats", distributionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_vouchers')
        .select('amount, status')
        .eq('distribution_id', distributionId);

      if (error) throw error;

      return {
        total: data.length,
        draft: data.filter(v => v.status === 'draft').length,
        approved: data.filter(v => v.status === 'approved').length,
        paid: data.filter(v => v.status === 'paid').length,
        totalAmount: data.reduce((sum, v) => sum + v.amount, 0),
        paidAmount: data.filter(v => v.status === 'paid').reduce((sum, v) => sum + v.amount, 0),
      };
    },
  });

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; variant: any; icon: any; className?: string }> = {
      draft: { label: "مسودة", variant: "secondary", icon: Clock },
      approved: { label: "معتمد", variant: "default", icon: CheckCircle, className: "bg-info text-info-foreground" },
      paid: { label: "مدفوع", variant: "default", icon: CheckCircle, className: "bg-success text-success-foreground" },
      cancelled: { label: "ملغي", variant: "outline", icon: XCircle },
      rejected: { label: "مرفوض", variant: "destructive", icon: XCircle },
    };

    const config = configs[status] || configs.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.className || ""}>
        <Icon className="ml-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const handleViewDetails = (voucher: any) => {
    setSelectedVoucher(voucher);
    setShowDetailsDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-sm text-muted-foreground">إجمالي السندات</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-success">{stats.paid}</div>
              <p className="text-sm text-muted-foreground">مدفوعة</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-warning">{stats.draft + stats.approved}</div>
              <p className="text-sm text-muted-foreground">قيد المعالجة</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-lg font-bold">
                {stats.paidAmount.toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-sm text-muted-foreground">المبلغ المدفوع</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bank Transfer Generator */}
      <BankTransferGenerator distributionId={distributionId} onSuccess={refetch} />

      {/* Vouchers List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              سندات الصرف
            </CardTitle>
            <Button onClick={() => setShowCreateDialog(true)} size="sm">
              <Plus className="ml-2 h-4 w-4" />
              إنشاء سند
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
          ) : vouchers && vouchers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم السند</TableHead>
                    <TableHead>المستفيد</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead className="text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vouchers.map((voucher) => (
                    <TableRow key={voucher.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          {voucher.voucher_number}
                        </div>
                      </TableCell>
                      <TableCell>{voucher.beneficiary_name || "-"}</TableCell>
                      <TableCell className="font-bold">
                        {voucher.amount.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س
                      </TableCell>
                      <TableCell>{getStatusBadge(voucher.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(voucher.created_at), {
                          addSuffix: true,
                          locale: ar,
                        })}
                      </TableCell>
                      <TableCell className="text-left">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(voucher)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                لا توجد سندات صرف لهذا التوزيع بعد. يمكنك إنشاء سند جديد باستخدام الزر أعلاه.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <PaymentVoucherDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        distributionId={distributionId}
        onSuccess={refetch}
      />

      <VoucherDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        voucher={selectedVoucher}
      />
    </div>
  );
}