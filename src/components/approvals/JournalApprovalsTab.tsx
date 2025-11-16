import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useState } from "react";
import ViewJournalEntryDialog from "@/components/accounting/ViewJournalEntryDialog";
import { JournalApproval, BadgeVariant, JournalEntryWithLines } from "@/types/approvals";
import { LucideIcon } from "lucide-react";

export function JournalApprovalsTab() {
  const [selectedEntry, setSelectedEntry] = useState<JournalEntryWithLines | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const { data: approvals, isLoading } = useQuery<JournalApproval[]>({
    queryKey: ["journal_approvals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("approvals")
        .select(`
          *,
          journal_entry:journal_entries(
            id,
            entry_number,
            entry_date,
            description,
            status
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as JournalApproval[];
    },
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: BadgeVariant; icon: LucideIcon }> = {
      pending: { label: "قيد المراجعة", variant: "secondary", icon: Clock },
      approved: { label: "موافق عليه", variant: "default", icon: CheckCircle },
      rejected: { label: "مرفوض", variant: "destructive", icon: XCircle },
    };
    const c = config[status] || config.pending;
    const Icon = c.icon;
    return (
      <Badge variant={c.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {c.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {approvals?.map((approval) => (
          <Card key={approval.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-mono">
                  {approval.journal_entry?.entry_number}
                </CardTitle>
                {getStatusBadge(approval.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">الوصف</p>
                  <p className="text-base">{approval.journal_entry?.description}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ القيد</p>
                  <p className="text-base">
                    {approval.journal_entry?.entry_date && format(new Date(approval.journal_entry.entry_date), "dd MMM yyyy", {
                      locale: ar,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">المعتمد</p>
                  <p className="text-base">{approval.approver_name}</p>
                </div>
              </div>
              {approval.notes && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">ملاحظات:</p>
                  <p className="text-sm">{approval.notes}</p>
                </div>
              )}
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (approval.journal_entry) {
                      setSelectedEntry(approval.journal_entry as JournalEntryWithLines);
                      setIsViewDialogOpen(true);
                    }
                  }}
                >
                  <Eye className="h-4 w-4 ml-1" />
                  عرض القيد
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {approvals?.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد موافقات قيود محاسبية</p>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedEntry && (
        <ViewJournalEntryDialog
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          entry={selectedEntry}
        />
      )}
    </>
  );
}