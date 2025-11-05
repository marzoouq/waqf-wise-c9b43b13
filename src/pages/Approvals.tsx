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

  const getStatusBadge = (status: string) => {
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
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4 md:p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">جاري التحميل...</p>
          </div>
        </div>
      </div>
    );
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
                    <Card>
                      <CardContent className="py-12 text-center">
                        <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">لا توجد موافقات بعد</h3>
                        <p className="text-sm text-muted-foreground">
                          ستظهر هنا جميع الموافقات على القيود المحاسبية
                        </p>
                      </CardContent>
                    </Card>
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
