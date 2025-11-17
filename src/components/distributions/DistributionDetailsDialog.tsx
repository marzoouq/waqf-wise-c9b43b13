import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useDistributionDetails } from "@/hooks/useDistributionDetails";
import { Distribution } from "@/hooks/useDistributions";
import { Loader2 } from "lucide-react";

interface DistributionDetailsDialogProps {
  distribution: Distribution | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DistributionDetailsDialog({
  distribution,
  open,
  onOpenChange,
}: DistributionDetailsDialogProps) {
  const { details, isLoading } = useDistributionDetails(distribution?.id);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      "معلق": "secondary",
      "مدفوع": "default",
      "ملغي": "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تفاصيل التوزيع - {distribution?.month}</DialogTitle>
        </DialogHeader>

        {distribution && (
          <div className="space-y-6">
            {/* ملخص التوزيع */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الإيرادات</p>
                <p className="text-lg font-bold">{distribution.total_revenues?.toLocaleString()} ريال</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المصروفات</p>
                <p className="text-lg font-bold text-destructive">{distribution.total_expenses?.toLocaleString()} ريال</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">صافي الإيرادات</p>
                <p className="text-lg font-bold text-primary">{distribution.net_revenues?.toLocaleString()} ريال</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">المبلغ القابل للتوزيع</p>
                <p className="text-lg font-bold text-green-600">{distribution.distributable_amount?.toLocaleString()} ريال</p>
              </div>
            </div>

            {/* الاستقطاعات */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-muted-foreground">حصة الناظر</p>
                <p className="text-lg font-semibold">{distribution.nazer_share?.toLocaleString()} ريال</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-muted-foreground">صدقة الواقف</p>
                <p className="text-lg font-semibold">{distribution.waqif_charity?.toLocaleString()} ريال</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-muted-foreground">رقبة الوقف</p>
                <p className="text-lg font-semibold">{distribution.waqf_corpus?.toLocaleString()} ريال</p>
              </div>
            </div>

            {/* جدول المستفيدين */}
            <div>
              <h3 className="text-lg font-semibold mb-4">توزيع المستفيدين</h3>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>المستفيد</TableHead>
                        <TableHead>النوع</TableHead>
                        <TableHead>المبلغ المخصص</TableHead>
                        <TableHead>حالة الدفع</TableHead>
                        <TableHead>تاريخ الدفع</TableHead>
                        <TableHead>البنك</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {details.map((detail: any) => (
                        <TableRow key={detail.id}>
                          <TableCell className="font-medium">
                            {detail.beneficiaries?.full_name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{detail.beneficiary_type}</Badge>
                          </TableCell>
                          <TableCell className="font-semibold text-green-600">
                            {detail.allocated_amount.toLocaleString()} ريال
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(detail.payment_status)}
                          </TableCell>
                          <TableCell>
                            {detail.payment_date ? new Date(detail.payment_date).toLocaleDateString('ar-SA') : '-'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {detail.beneficiaries?.bank_name || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
