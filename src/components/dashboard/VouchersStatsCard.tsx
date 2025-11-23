import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function VouchersStatsCard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["vouchers-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_vouchers')
        .select('amount, status, created_at');

      if (error) throw error;

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      return {
        total: data.length,
        draft: data.filter(v => v.status === 'draft').length,
        paid: data.filter(v => v.status === 'paid').length,
        thisMonth: data.filter(v => new Date(v.created_at) >= thisMonth).length,
        totalAmount: data.reduce((sum, v) => sum + v.amount, 0),
        paidAmount: data.filter(v => v.status === 'paid').reduce((sum, v) => sum + v.amount, 0),
      };
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-8 bg-muted rounded w-1/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-primary" />
            سندات الدفع
          </span>
          <Link to="/payment-vouchers">
            <Button variant="ghost" size="sm">عرض الكل</Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-3xl font-bold">{stats?.total || 0}</div>
          <p className="text-sm text-muted-foreground">إجمالي السندات</p>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-2 border-t">
          <div>
            <div className="flex items-center gap-1 text-warning mb-1">
              <Clock className="h-3 w-3" />
              <span className="text-xs font-medium">معلقة</span>
            </div>
            <div className="text-lg font-bold">{stats?.draft || 0}</div>
          </div>

          <div>
            <div className="flex items-center gap-1 text-success mb-1">
              <CheckCircle className="h-3 w-3" />
              <span className="text-xs font-medium">مدفوعة</span>
            </div>
            <div className="text-lg font-bold">{stats?.paid || 0}</div>
          </div>

          <div>
            <div className="flex items-center gap-1 text-info mb-1">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs font-medium">هذا الشهر</span>
            </div>
            <div className="text-lg font-bold">{stats?.thisMonth || 0}</div>
          </div>
        </div>

        {stats && stats.totalAmount > 0 && (
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">إجمالي المبالغ:</span>
              <span className="font-bold">
                {stats.totalAmount.toLocaleString('ar-SA', { minimumFractionDigits: 0 })} ر.س
              </span>
            </div>
            <div className="flex justify-between items-center text-sm mt-1">
              <span className="text-muted-foreground">المدفوع:</span>
              <span className="font-bold text-success">
                {stats.paidAmount.toLocaleString('ar-SA', { minimumFractionDigits: 0 })} ر.س
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}