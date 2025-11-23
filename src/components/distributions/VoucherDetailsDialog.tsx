import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { FileText, Download, CheckCircle, XCircle, Clock, User, Calendar, DollarSign, Building2 } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface VoucherDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voucher: any;
}

export function VoucherDetailsDialog({
  open,
  onOpenChange,
  voucher,
}: VoucherDetailsDialogProps) {
  if (!voucher) return null;

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; variant: any; icon: any; className?: string }> = {
      draft: { label: "مسودة", variant: "secondary", icon: Clock },
      approved: { label: "معتمد", variant: "default", icon: CheckCircle, className: "bg-info text-info-foreground" },
      paid: { label: "مدفوع", variant: "default", icon: CheckCircle, className: "bg-success text-success-foreground" },
      cancelled: { label: "ملغي", variant: "outline", icon: XCircle },
      rejected: { label: "مرفوض", variant: "destructive", icon: XCircle },
    };
    return configs[status] || configs.draft;
  };

  const getVoucherTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      payment: "سند صرف",
      receipt: "سند قبض",
      journal: "قيد يومية",
    };
    return types[type] || type;
  };

  const config = getStatusConfig(voucher.status);
  const StatusIcon = config.icon;

  const handlePrint = () => {
    window.print();
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`تفاصيل السند: ${voucher.voucher_number}`}
      description={getVoucherTypeLabel(voucher.voucher_type)}
      size="lg"
    >
      <div className="space-y-6">
        {/* Header Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{voucher.voucher_number}</h3>
                  <p className="text-sm text-muted-foreground">
                    {getVoucherTypeLabel(voucher.voucher_type)}
                  </p>
                </div>
              </div>
              <Badge variant={config.variant} className={`${config.className || ""} text-base px-4 py-2`}>
                <StatusIcon className="ml-1 h-4 w-4" />
                {config.label}
              </Badge>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>المبلغ</span>
                </div>
                <p className="text-2xl font-bold text-primary">
                  {voucher.amount.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>تاريخ الإنشاء</span>
                </div>
                <p className="text-lg font-medium">
                  {format(new Date(voucher.created_at), "dd MMMM yyyy - HH:mm", { locale: ar })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">البيان</label>
              <p className="mt-1 text-foreground">{voucher.description}</p>
            </div>

            {voucher.beneficiaries && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  المستفيد
                </label>
                <p className="mt-1 text-foreground font-medium">
                  {voucher.beneficiaries.full_name}
                </p>
                {voucher.beneficiaries.national_id && (
                  <p className="text-sm text-muted-foreground">
                    رقم الهوية: {voucher.beneficiaries.national_id}
                  </p>
                )}
              </div>
            )}

            {voucher.payment_method && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">طريقة الدفع</label>
                <p className="mt-1 text-foreground">{voucher.payment_method}</p>
              </div>
            )}

            {voucher.bank_name && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  البنك
                </label>
                <p className="mt-1 text-foreground">{voucher.bank_name}</p>
                {voucher.account_number && (
                  <p className="text-sm text-muted-foreground">
                    رقم الحساب: {voucher.account_number}
                  </p>
                )}
                {voucher.bank_iban && (
                  <p className="text-sm text-muted-foreground">
                    IBAN: {voucher.bank_iban}
                  </p>
                )}
              </div>
            )}

            {voucher.reference_number && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">الرقم المرجعي</label>
                <p className="mt-1 text-foreground font-mono">{voucher.reference_number}</p>
              </div>
            )}

            {voucher.notes && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">ملاحظات</label>
                <p className="mt-1 text-muted-foreground">{voucher.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Approval/Payment Info */}
        {(voucher.approved_by || voucher.paid_by) && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              {voucher.approved_by && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">اعتمد بواسطة</label>
                  <p className="mt-1 text-foreground">{voucher.approved_by}</p>
                  {voucher.approved_at && (
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(voucher.approved_at), "dd MMMM yyyy - HH:mm", { locale: ar })}
                    </p>
                  )}
                </div>
              )}

              {voucher.paid_by && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">دفع بواسطة</label>
                  <p className="mt-1 text-foreground">{voucher.paid_by}</p>
                  {voucher.paid_at && (
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(voucher.paid_at), "dd MMMM yyyy - HH:mm", { locale: ar })}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
          <Button onClick={handlePrint}>
            <Download className="ml-2 h-4 w-4" />
            طباعة السند
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  );
}