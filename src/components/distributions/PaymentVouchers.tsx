import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Printer, Download } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { usePaymentVouchersList } from "@/hooks/distributions/useDistributionTabsData";

export function PaymentVouchers() {
  const { data: vouchers, isLoading } = usePaymentVouchersList();

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { label: "معلق", variant: "secondary" as const, className: "" },
      printed: { label: "مطبوع", variant: "default" as const, className: "" },
      paid: { label: "مدفوع", variant: "default" as const, className: "bg-success/10 text-success" },
      cancelled: { label: "ملغي", variant: "destructive" as const, className: "" },
    };
    
    const config = variants[status as keyof typeof variants] || variants.pending;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return <div className="text-center p-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">سندات الصرف</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="ml-2 h-4 w-4" />
            تصدير الكل
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {vouchers?.map((voucher) => (
          <Card key={voucher.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">{voucher.voucher_number}</h3>
                  {getStatusBadge(voucher.status)}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">المستفيد</p>
                    <p className="font-medium">{voucher.beneficiaries?.full_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">المبلغ</p>
                    <p className="font-bold text-primary">{formatCurrency(voucher.amount)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">التاريخ</p>
                    <p className="font-medium">
                      {new Date(voucher.created_at).toLocaleDateString("ar-SA")}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">الحالة</p>
                    <p className="font-medium">{voucher.status}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Printer className="ml-2 h-4 w-4" />
                  طباعة
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="ml-2 h-4 w-4" />
                  PDF
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
