import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Eye, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/date";
import AddJournalEntryDialog from "./AddJournalEntryDialog";
import ViewJournalEntryDialog from "./ViewJournalEntryDialog";
import { BadgeVariant } from "@/types";
import { ExportButton } from "@/components/shared/ExportButton";
import { useAccountingFilters } from "@/hooks/accounting/useAccountingFilters";
import { AccountingFilters } from "./AccountingFilters";
import { EmptyAccountingState } from "./EmptyAccountingState";
import { AccountingErrorState } from "./AccountingErrorState";
import { UnifiedDataTable, type Column } from "@/components/unified/UnifiedDataTable";
import { useJournalEntriesList, type JournalEntry } from "@/hooks/accounting/useJournalEntriesList";

const JournalEntries = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const { entries: allEntries, isLoading, error, refetch } = useJournalEntriesList();

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

  const columns: Column<JournalEntry>[] = [
    {
      key: "entry_number",
      label: "رقم القيد",
      render: (_, entry) => (
        <span className="font-mono text-xs sm:text-sm">{entry.entry_number}</span>
      ),
    },
    {
      key: "entry_date",
      label: "التاريخ",
      render: (_, entry) => (
        <span className="text-xs sm:text-sm whitespace-nowrap">
          {formatDate(entry.entry_date, "dd MMM yyyy")}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: "description",
      label: "البيان",
      render: (_, entry) => (
        <span className="text-xs sm:text-sm">{entry.description}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "status",
      label: "الحالة",
      render: (_, entry) => getStatusBadge(entry.status),
    },
    {
      key: "posted_at",
      label: "تاريخ الترحيل",
      render: (_, entry) => (
        <span className="text-xs sm:text-sm whitespace-nowrap">
          {entry.posted_at
            ? formatDate(entry.posted_at, "dd MMM yyyy")
            : "-"}
        </span>
      ),
      hideOnMobile: true,
    },
  ];

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
                'التاريخ': formatDate(e.entry_date, 'yyyy/MM/dd'),
                'الوصف': e.description,
                'الحالة': e.status === 'posted' ? 'مرحّل' : e.status === 'draft' ? 'مسودة' : 'ملغى',
                'تاريخ الترحيل': e.posted_at ? formatDate(e.posted_at, 'yyyy/MM/dd HH:mm') : '-',
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
            <Plus className="h-4 w-4 ms-2" />
            إضافة قيد جديد
          </Button>
        </div>
      </div>

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

      {entries.length === 0 && !isLoading ? (
        <EmptyAccountingState
          icon={<FileText className="h-12 w-12" />}
          title="لا توجد قيود محاسبية"
          description="ابدأ بإضافة أول قيد محاسبي لتسجيل العمليات المالية"
          actionLabel="إضافة قيد جديد"
          onAction={() => setIsAddDialogOpen(true)}
        />
      ) : (
        <UnifiedDataTable
          title=""
          columns={columns}
          data={entries}
          loading={isLoading}
          emptyMessage="لا توجد قيود محاسبية"
          actions={(entry: JournalEntry) => (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedEntry(entry);
                setIsViewDialogOpen(true);
              }}
              title="عرض"
              className="hover:bg-primary/10"
            >
              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          )}
          showMobileScrollHint={true}
        />
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
