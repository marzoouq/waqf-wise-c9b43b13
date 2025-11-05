import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export const NotificationsBell = () => {
  const navigate = useNavigate();

  // Get pending approvals - optimized
  const { data: pendingApprovals } = useQuery({
    queryKey: ["pending-approvals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("approvals")
        .select("id, approver_name, journal_entries(entry_number)")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });

  // Get overdue invoices - optimized
  const { data: overdueInvoices } = useQuery({
    queryKey: ["overdue-invoices"],
    queryFn: async () => {
      const today = format(new Date(), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("invoices")
        .select("id, invoice_number, customer_name, due_date")
        .in("status", ["sent", "draft"])
        .not("due_date", "is", null)
        .lt("due_date", today)
        .order("due_date", { ascending: true })
        .limit(5);
      if (error) throw error;
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });

  // Get unbalanced journal entries - heavily optimized
  const { data: unbalancedEntries } = useQuery({
    queryKey: ["unbalanced-entries"],
    queryFn: async () => {
      const { data: entries, error } = await supabase
        .from("journal_entries")
        .select("id, entry_number, description, journal_entry_lines(debit_amount, credit_amount)")
        .eq("status", "draft")
        .order("created_at", { ascending: false })
        .limit(10); // Reduced limit

      if (error) throw error;

      // Filter unbalanced entries
      const unbalanced = entries.filter((entry: any) => {
        const totalDebit = entry.journal_entry_lines.reduce(
          (sum: number, line: any) => sum + Number(line.debit_amount),
          0
        );
        const totalCredit = entry.journal_entry_lines.reduce(
          (sum: number, line: any) => sum + Number(line.credit_amount),
          0
        );
        return Math.abs(totalDebit - totalCredit) > 0.01;
      });

      return unbalanced.slice(0, 5);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });

  const totalNotifications =
    (pendingApprovals?.length || 0) +
    (overdueInvoices?.length || 0) +
    (unbalancedEntries?.length || 0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {totalNotifications > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {totalNotifications > 9 ? "9+" : totalNotifications}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="font-bold">التنبيهات</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {totalNotifications === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            لا توجد تنبيهات جديدة
          </div>
        ) : (
          <>
            {/* Pending Approvals */}
            {pendingApprovals && pendingApprovals.length > 0 && (
              <>
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                  موافقات معلقة ({pendingApprovals.length})
                </DropdownMenuLabel>
                {pendingApprovals.map((approval: any) => (
                  <DropdownMenuItem
                    key={approval.id}
                    onClick={() => navigate("/approvals")}
                    className="cursor-pointer flex-col items-start gap-1"
                  >
                    <div className="font-semibold text-sm">
                      قيد رقم {approval.journal_entries?.entry_number}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {approval.approver_name} - في انتظار الموافقة
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </>
            )}

            {/* Overdue Invoices */}
            {overdueInvoices && overdueInvoices.length > 0 && (
              <>
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                  فواتير متأخرة ({overdueInvoices.length})
                </DropdownMenuLabel>
                {overdueInvoices.map((invoice: any) => (
                  <DropdownMenuItem
                    key={invoice.id}
                    onClick={() => navigate("/invoices")}
                    className="cursor-pointer flex-col items-start gap-1"
                  >
                    <div className="font-semibold text-sm text-destructive">
                      {invoice.invoice_number} - {invoice.customer_name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      مستحقة في {format(new Date(invoice.due_date), "dd MMM yyyy", { locale: ar })}
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </>
            )}

            {/* Unbalanced Entries */}
            {unbalancedEntries && unbalancedEntries.length > 0 && (
              <>
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                  قيود غير متوازنة ({unbalancedEntries.length})
                </DropdownMenuLabel>
                {unbalancedEntries.map((entry: any) => (
                  <DropdownMenuItem
                    key={entry.id}
                    onClick={() => navigate("/accounting")}
                    className="cursor-pointer flex-col items-start gap-1"
                  >
                    <div className="font-semibold text-sm text-warning">
                      {entry.entry_number}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {entry.description}
                    </div>
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
