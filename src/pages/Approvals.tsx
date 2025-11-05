import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";

const Approvals = () => {
  const { data: approvals, isLoading } = useQuery({
    queryKey: ["approvals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("approvals")
        .select(`
          *,
          journal_entry:journal_entries(
            entry_number,
            entry_date,
            description
          )
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const getStatusBadge = useCallback((status: string) => {
    const variants: Record<string, { label: string; variant: any; icon: any }> = {
      pending: { label: "قيد المراجعة", variant: "secondary", icon: Clock },
      approved: { label: "موافق عليه", variant: "default", icon: CheckCircle },
      rejected: { label: "مرفوض", variant: "destructive", icon: XCircle },
    };
    const config = variants[status] || { label: status, variant: "outline", icon: Clock };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  }, []);

  // Calculate stats
  const stats = {
    pending: approvals?.filter((a: any) => a.status === "pending").length || 0,
    approved: approvals?.filter((a: any) => a.status === "approved").length || 0,
    rejected: approvals?.filter((a: any) => a.status === "rejected").length || 0,
  };

  if (isLoading) {
    return <LoadingState message="جاري تحميل الموافقات..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 md:p-8 lg:p-10 space-y-6 md:space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gradient-primary">
            الموافقات المحاسبية
          </h1>
          <p className="text-muted-foreground mt-1">سجل الموافقات على القيود المحاسبية</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-soft">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-warning/10">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">قيد المراجعة</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-success/10">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">موافق عليها</p>
                  <p className="text-2xl font-bold">{stats.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-destructive/10">
                  <XCircle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">مرفوضة</p>
                  <p className="text-2xl font-bold">{stats.rejected}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم القيد</TableHead>
                <TableHead>تاريخ القيد</TableHead>
                <TableHead className="hidden sm:table-cell">البيان</TableHead>
                <TableHead>اسم الموافق</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="hidden md:table-cell">تاريخ الموافقة</TableHead>
                <TableHead className="hidden lg:table-cell">الملاحظات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!approvals || approvals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <EmptyState
                      icon={CheckCircle}
                      title="لا توجد موافقات بعد"
                      description="ستظهر هنا جميع الموافقات على القيود المحاسبية"
                      className="py-8"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                approvals.map((approval: any) => (
                  <TableRow key={approval.id}>
                    <TableCell className="font-mono text-sm font-semibold">
                      {approval.journal_entry?.entry_number}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(
                        new Date(approval.journal_entry?.entry_date),
                        "dd MMM yyyy",
                        { locale: ar }
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">
                      {approval.journal_entry?.description}
                    </TableCell>
                    <TableCell className="font-medium">
                      {approval.approver_name}
                    </TableCell>
                    <TableCell>{getStatusBadge(approval.status)}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {approval.approved_at
                        ? format(new Date(approval.approved_at), "dd MMM yyyy", {
                            locale: ar,
                          })
                        : "-"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {approval.notes || "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Approvals;
