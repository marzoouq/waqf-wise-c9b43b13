import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PaymentVoucherDialog } from "@/components/distributions/PaymentVoucherDialog";
import { Receipt, Search, FileText, CheckCircle, XCircle, Clock, DollarSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

export default function PaymentVouchers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const { data: vouchers, isLoading, refetch } = useQuery({
    queryKey: ["payment-vouchers", searchTerm, selectedStatus],
    queryFn: async () => {
      let query = supabase
        .from('payment_vouchers')
        .select(`
          *,
          beneficiaries (full_name, national_id),
          distributions (total_amount, distribution_date)
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`voucher_number.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (selectedStatus !== "all") {
        query = query.eq('status', selectedStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; variant: any; icon: any; className?: string }> = {
      draft: { label: "مسودة", variant: "secondary" as const, icon: Clock },
      approved: { label: "معتمد", variant: "default" as const, icon: CheckCircle },
      paid: { label: "مدفوع", variant: "default" as const, icon: CheckCircle, className: "bg-success text-success-foreground" },
      cancelled: { label: "ملغي", variant: "outline" as const, icon: XCircle },
      rejected: { label: "مرفوض", variant: "destructive" as const, icon: XCircle },
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

  const getVoucherTypeLabel = (type: string) => {
    const types = {
      payment: "سند صرف",
      receipt: "سند قبض",
      journal: "قيد يومية",
    };
    return types[type as keyof typeof types] || type;
  };

  const stats = {
    total: vouchers?.length || 0,
    draft: vouchers?.filter(v => v.status === 'draft').length || 0,
    approved: vouchers?.filter(v => v.status === 'approved').length || 0,
    paid: vouchers?.filter(v => v.status === 'paid').length || 0,
    totalAmount: vouchers?.reduce((sum, v) => sum + v.amount, 0) || 0,
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Receipt className="h-8 w-8" />
            سندات الدفع والقبض
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة سندات الصرف والقبض والقيود اليومية
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} size="lg">
          <Receipt className="ml-2 h-5 w-5" />
          إنشاء سند جديد
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي السندات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              مسودات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.draft}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              معتمدة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              مدفوعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.paid}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              إجمالي المبالغ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalAmount.toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">ريال سعودي</p>
          </CardContent>
        </Card>
      </div>

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
                className="pr-10"
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
        ) : vouchers && vouchers.length > 0 ? (
          vouchers.map((voucher) => (
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
                      {getStatusBadge(voucher.status)}
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
                        {formatDistanceToNow(new Date(voucher.created_at), {
                          addSuffix: true,
                          locale: ar,
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <div className="text-left">
                      <p className="text-2xl font-bold text-primary">
                        {voucher.amount.toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-muted-foreground">ريال سعودي</p>
                    </div>
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
    </div>
  );
}