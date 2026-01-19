import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PaymentVoucherDialog } from "@/components/distributions/PaymentVoucherDialog";
import { Receipt, Search, FileText, CheckCircle, XCircle, Clock, DollarSign, Link2, Link2Off, Loader2, Edit, Trash2 } from "lucide-react";
import { formatRelative, format, arLocale as ar } from "@/lib/date";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { usePaymentVouchersData } from "@/hooks/payments/usePaymentVouchersData";
import { useToast } from "@/hooks/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ExportButton } from "@/components/shared/ExportButton";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";

export default function PaymentVouchers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [linkingVoucherId, setLinkingVoucherId] = useState<string | null>(null);
  const { toast } = useToast();

  const { vouchers, stats, isLoading, refetch } = usePaymentVouchersData(searchTerm, selectedStatus);

  // حساب السندات غير المرتبطة
  const unlinkedCount = vouchers?.filter(v => !v.journal_entry_id && v.voucher_type === 'payment').length || 0;

  // فلترة السندات غير المرتبطة
  const filteredVouchers = selectedStatus === 'unlinked' 
    ? vouchers?.filter(v => !v.journal_entry_id && v.voucher_type === 'payment')
    : vouchers;

  const handleLinkVoucher = async (voucherId: string, voucherNumber: string) => {
    setLinkingVoucherId(voucherId);
    try {
      const { error } = await supabase.functions.invoke('link-voucher-journal', {
        body: { voucher_id: voucherId, create_journal: true }
      });
      
      if (error) throw error;
      
      toast({
        title: "تم الربط بنجاح",
        description: `تم ربط السند ${voucherNumber} بقيد محاسبي`,
      });
      refetch();
    } catch (err) {
      console.error('Error linking voucher:', err);
      toast({
        title: "خطأ في الربط",
        description: "فشل ربط السند بقيد محاسبي",
        variant: "destructive",
      });
    } finally {
      setLinkingVoucherId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    type BadgeVariant = "default" | "secondary" | "outline" | "destructive";
    const configs: Record<string, { label: string; variant: BadgeVariant; icon: React.ComponentType<{ className?: string }>; className?: string }> = {
      draft: { label: "مسودة", variant: "secondary" as const, icon: Clock },
      approved: { label: "معتمد", variant: "default" as const, icon: CheckCircle },
      paid: { label: "مدفوع", variant: "default" as const, icon: CheckCircle, className: "bg-success text-success-foreground" },
      pending: { label: "معلق", variant: "secondary" as const, icon: Clock },
      cancelled: { label: "ملغي", variant: "outline" as const, icon: XCircle },
      rejected: { label: "مرفوض", variant: "destructive" as const, icon: XCircle },
    };

    const config = configs[status] || configs.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.className || ""}>
        <Icon className="ms-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getJournalLinkBadge = (voucher: { journal_entry_id?: string | null; voucher_type: string }) => {
    if (voucher.voucher_type !== 'payment') return null;
    
    if (voucher.journal_entry_id) {
      return (
        <Badge variant="outline" className="bg-success/10 text-success border-success/30">
          <Link2 className="ms-1 h-3 w-3" />
          مرتبط بقيد
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
        <Link2Off className="ms-1 h-3 w-3" />
        غير مرتبط
      </Badge>
    );
  };

  const getVoucherTypeLabel = (type: string) => {
    const types = {
      payment: "سند صرف",
      receipt: "سند قبض",
      journal: "قيد يومية",
    };
    return types[type as keyof typeof types] || type;
  };

  return (
    <PageErrorBoundary pageName="سندات الدفع والقبض">
      <MobileOptimizedLayout>
        <MobileOptimizedHeader
          title="سندات الدفع والقبض"
          description="إدارة سندات الصرف والقبض والقيود اليومية"
          icon={<Receipt className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />}
          actions={
            <div className="flex gap-2">
              {vouchers && vouchers.length > 0 && (
                <ExportButton
                  data={vouchers.map(v => ({
                    'رقم السند': v.voucher_number,
                    'النوع': getVoucherTypeLabel(v.voucher_type),
                    'الوصف': v.description || '-',
                    'المبلغ': v.amount.toLocaleString('ar-SA', { minimumFractionDigits: 2 }) + ' ر.س',
                    'الحالة': v.status,
                    'المستفيد': v.beneficiaries?.full_name || '-',
                    'طريقة الدفع': v.payment_method || '-',
                    'التاريخ': format(new Date(v.created_at), 'dd/MM/yyyy', { locale: ar }),
                  }))}
                  filename="سندات_الدفع"
                  title="تقرير سندات الدفع والقبض"
                  headers={['رقم السند', 'النوع', 'الوصف', 'المبلغ', 'الحالة', 'المستفيد', 'طريقة الدفع', 'التاريخ']}
                />
              )}
              <Button onClick={() => setShowCreateDialog(true)} size="sm">
                <Receipt className="ms-2 h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">إنشاء سند جديد</span>
                <span className="sm:hidden">جديد</span>
              </Button>
            </div>
          }
        />

        {/* Stats Cards */}
        <UnifiedStatsGrid columns={4}>
          <UnifiedKPICard
            title="إجمالي السندات"
            value={stats.total}
            icon={FileText}
            variant="default"
          />
          <UnifiedKPICard
            title="مسودات"
            value={stats.draft}
            icon={Clock}
            variant="warning"
          />
          <UnifiedKPICard
            title="معتمدة"
            value={stats.approved}
            icon={CheckCircle}
            variant="info"
          />
          <UnifiedKPICard
            title="مدفوعة"
            value={stats.paid}
            icon={CheckCircle}
            variant="success"
          />
        </UnifiedStatsGrid>

        {/* Financial Stats */}
        <UnifiedStatsGrid columns={3}>
          <UnifiedKPICard
            title="إجمالي المبالغ"
            value={`${stats.totalAmount.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س`}
            icon={DollarSign}
            variant="primary"
          />
          <UnifiedKPICard
            title="غير مرتبطة بقيود"
            value={unlinkedCount}
            icon={Link2Off}
            variant={unlinkedCount > 0 ? "warning" : "default"}
            subtitle="تحتاج ربط محاسبي"
          />
        </UnifiedStatsGrid>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث برقم السند أو الوصف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pe-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedStatus === "all" ? "default" : "outline"}
                  onClick={() => setSelectedStatus("all")}
                  size="sm"
                >
                  الكل
                </Button>
                <Button
                  variant={selectedStatus === "draft" ? "default" : "outline"}
                  onClick={() => setSelectedStatus("draft")}
                  size="sm"
                >
                  مسودات
                </Button>
                <Button
                  variant={selectedStatus === "approved" ? "default" : "outline"}
                  onClick={() => setSelectedStatus("approved")}
                  size="sm"
                >
                  معتمدة
                </Button>
                <Button
                  variant={selectedStatus === "paid" ? "default" : "outline"}
                  onClick={() => setSelectedStatus("paid")}
                  size="sm"
                >
                  مدفوعة
                </Button>
                <Button
                  variant={selectedStatus === "unlinked" ? "default" : "outline"}
                  onClick={() => setSelectedStatus("unlinked")}
                  size="sm"
                  className={selectedStatus !== "unlinked" ? "text-warning hover:text-warning" : ""}
                >
                  <Link2Off className="ms-1 h-4 w-4" />
                  غير مرتبطة ({unlinkedCount})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vouchers List */}
        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                جاري التحميل...
              </CardContent>
            </Card>
          ) : filteredVouchers && filteredVouchers.length > 0 ? (
            filteredVouchers.map((voucher) => (
              <Card key={voucher.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{voucher.voucher_number}</h3>
                            <p className="text-sm text-muted-foreground">
                              {getVoucherTypeLabel(voucher.voucher_type)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {getStatusBadge(voucher.status)}
                          {getJournalLinkBadge(voucher)}
                        </div>
                      </div>

                      <p className="text-foreground">{voucher.description}</p>

                      {voucher.beneficiaries && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>المستفيد:</span>
                          <span className="font-medium text-foreground">
                            {voucher.beneficiaries.full_name}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {voucher.payment_method && (
                          <span>طريقة الدفع: {voucher.payment_method}</span>
                        )}
                        {voucher.reference_number && (
                          <span>المرجع: {voucher.reference_number}</span>
                        )}
                        <span>
                          {formatRelative(voucher.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between gap-3">
                      <div className="text-start">
                        <p className="text-2xl font-bold text-primary">
                          {voucher.amount.toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-muted-foreground">ريال سعودي</p>
                      </div>
                      
                      {/* زر الربط للسندات غير المرتبطة */}
                      {voucher.voucher_type === 'payment' && !voucher.journal_entry_id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLinkVoucher(voucher.id, voucher.voucher_number)}
                          disabled={linkingVoucherId === voucher.id}
                          className="text-primary"
                        >
                          {linkingVoucherId === voucher.id ? (
                            <Loader2 className="ms-1 h-4 w-4 animate-spin" />
                          ) : (
                            <Link2 className="ms-1 h-4 w-4" />
                          )}
                          ربط بقيد محاسبي
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد سندات</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Create Dialog */}
        <PaymentVoucherDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={refetch}
        />
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
}