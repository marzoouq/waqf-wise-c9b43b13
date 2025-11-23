import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Eye } from "lucide-react";
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
import AddJournalEntryDialog from "./AddJournalEntryDialog";
import ViewJournalEntryDialog from "./ViewJournalEntryDialog";
import { BadgeVariant } from "@/types/approvals";
import { ExportButton } from "@/components/shared/ExportButton";
import { useAccountingFilters } from "@/hooks/useAccountingFilters";
import { AccountingFilters } from "./AccountingFilters";
import { EmptyAccountingState } from "./EmptyAccountingState";
import { AccountingErrorState } from "./AccountingErrorState";
import { FileText } from "lucide-react";

type JournalEntry = {
  id: string;
  entry_number: string;
  entry_date: string;
  description: string;
  status: string;
  posted_at: string | null;
  created_at: string;
};

const JournalEntries = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const { data: allEntries, isLoading, error, refetch } = useQuery({
    queryKey: ["journal_entries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .order("entry_date", { ascending: false });
      if (error) throw error;
      return data as JournalEntry[];
    },
  });

  const { filteredData: entries, filters } = useAccountingFilters({
    data: allEntries || [],
    searchFields: ["entry_number", "description"],
    dateField: "entry_date",
    statusField: "status",
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: BadgeVariant }> = {
      draft: { label: "مسودة", variant: "secondary" },
      posted: { label: "مرحّل", variant: "default" },
      cancelled: { label: "ملغى", variant: "destructive" },
    };
    const config = variants[status] || { label: status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  if (error) {
    return <AccountingErrorState error={error as Error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">القيود المحاسبية</h2>
        <div className="flex gap-2">
          {entries.length > 0 && (
            <ExportButton
              data={entries.map(e => ({
                'رقم القيد': e.entry_number,
                'التاريخ': format(new Date(e.entry_date), 'yyyy/MM/dd', { locale: ar }),
                'الوصف': e.description,
                'الحالة': e.status === 'posted' ? 'مرحّل' : e.status === 'draft' ? 'مسودة' : 'ملغى',
                'تاريخ الترحيل': e.posted_at ? format(new Date(e.posted_at), 'yyyy/MM/dd HH:mm', { locale: ar }) : '-',
              }))}
              filename="القيود_المحاسبية"
              title="القيود المحاسبية"
              headers={['رقم القيد', 'التاريخ', 'الوصف', 'الحالة', 'تاريخ الترحيل']}
              variant="outline"
              size="sm"
            />
          )}
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            size="sm"
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 ml-2" />
            إضافة قيد جديد
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <AccountingFilters
            searchQuery={filters.searchQuery}
            onSearchChange={filters.setSearchQuery}
            statusFilter={filters.statusFilter}
            onStatusChange={filters.setStatusFilter}
            dateFrom={filters.dateFrom}
            onDateFromChange={filters.setDateFrom}
            dateTo={filters.dateTo}
            onDateToChange={filters.setDateTo}
          />
        </CardContent>
      </Card>

      {entries.length === 0 ? (
        <EmptyAccountingState
          icon={<FileText className="h-12 w-12" />}
          title="لا توجد قيود محاسبية"
          description="ابدأ بإضافة أول قيد محاسبي لتسجيل العمليات المالية"
          actionLabel="إضافة قيد جديد"
          onAction={() => setIsAddDialogOpen(true)}
        />
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs sm:text-sm">رقم القيد</TableHead>
                <TableHead className="text-xs sm:text-sm hidden lg:table-cell">التاريخ</TableHead>
                <TableHead className="hidden md:table-cell text-xs sm:text-sm">البيان</TableHead>
                <TableHead className="text-xs sm:text-sm">الحالة</TableHead>
                <TableHead className="hidden lg:table-cell text-xs sm:text-sm">تاريخ الترحيل</TableHead>
                <TableHead className="text-left text-xs sm:text-sm">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-mono text-xs sm:text-sm">{entry.entry_number}</TableCell>
                  <TableCell className="text-xs sm:text-sm hidden lg:table-cell whitespace-nowrap">
                    {format(new Date(entry.entry_date), "dd MMM yyyy", {
                      locale: ar,
                    })}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs sm:text-sm">{entry.description}</TableCell>
                  <TableCell className="text-xs sm:text-sm">{getStatusBadge(entry.status)}</TableCell>
                  <TableCell className="hidden lg:table-cell text-xs sm:text-sm whitespace-nowrap">
                    {entry.posted_at
                      ? format(new Date(entry.posted_at), "dd MMM yyyy", {
                          locale: ar,
                        })
                      : "-"}
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedEntry(entry);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AddJournalEntryDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />

      {selectedEntry && (
        <ViewJournalEntryDialog
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          entry={selectedEntry}
        />
      )}
    </div>
  );
};

export default JournalEntries;
