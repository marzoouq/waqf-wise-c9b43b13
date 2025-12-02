import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UnifiedDataTable, type Column } from "@/components/unified/UnifiedDataTable";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/date";
import { LoanSchedule } from "@/types/loans";

interface LoanScheduleTableProps {
  loanId: string;
}

export function LoanScheduleTable({ loanId }: LoanScheduleTableProps) {
  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["loan-schedules", loanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loan_schedules")
        .select("*")
        .eq("loan_id", loanId)
        .order("installment_number");

      if (error) throw error;
      return data as LoanSchedule[];
    },
    enabled: !!loanId,
  });

  const columns: Column<LoanSchedule>[] = [
    {
      key: "installment_number",
      label: "القسط",
      render: (value: number) => `#${value}`
    },
    {
      key: "due_date",
      label: "تاريخ الاستحقاق",
      render: (value: string) => formatDate(value, 'dd/MM/yyyy')
    },
    {
      key: "total_amount",
      label: "المبلغ",
      render: (value: number) => (
        <span className="font-bold">{value.toLocaleString()} ر.س</span>
      )
    },
    {
      key: "paid_amount",
      label: "المدفوع",
      hideOnMobile: true,
      render: (value: number) => (
        <span className="text-muted-foreground">{value.toLocaleString()} ر.س</span>
      )
    },
    {
      key: "status",
      label: "الحالة",
      render: (value: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
          paid: 'secondary',
          pending: 'outline',
          overdue: 'destructive',
        };
        const labels: Record<string, string> = {
          paid: 'مدفوع',
          pending: 'معلق',
          overdue: 'متأخر',
          waived: 'معفى',
        };
        return <Badge variant={variants[value] || 'outline'}>{labels[value] || value}</Badge>;
      }
    },
  ];

  return (
    <UnifiedDataTable
      columns={columns}
      data={schedules}
      loading={isLoading}
      emptyMessage="لا توجد أقساط"
      showMobileScrollHint={true}
    />
  );
}
