import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { ScrollableTableWrapper } from "@/components/shared/ScrollableTableWrapper";
import { MobileScrollHint } from "@/components/shared/MobileScrollHint";
import { BadgeVariant } from "@/types/approvals";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data: allEntries, isLoading } = useQuery({
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

  const entries = useMemo(() => {
    if (!allEntries) return [];
    
    return allEntries.filter((entry) => {
      // Search filter
      const matchesSearch = 
        searchQuery === "" ||
        entry.entry_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === "all" || entry.status === statusFilter;

      // Date filters
      const entryDate = new Date(entry.entry_date);
      const matchesDateFrom = !dateFrom || entryDate >= new Date(dateFrom);
      const matchesDateTo = !dateTo || entryDate <= new Date(dateTo);

      return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
    });
  }, [allEntries, searchQuery, statusFilter, dateFrom, dateTo]);

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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">القيود المحاسبية</h2>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          size="sm"
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 ml-2" />
          إضافة قيد جديد
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث برقم القيد أو البيان..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="جميع الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="draft">مسودة</SelectItem>
                <SelectItem value="posted">مرحّل</SelectItem>
                <SelectItem value="cancelled">ملغى</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              placeholder="من تاريخ"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <Input
              type="date"
              placeholder="إلى تاريخ"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>رقم القيد</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead className="hidden sm:table-cell">البيان</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="hidden md:table-cell">تاريخ الترحيل</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  لا توجد قيود محاسبية
                </TableCell>
              </TableRow>
            ) : (
              entries?.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-mono text-sm">{entry.entry_number}</TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(entry.entry_date), "dd MMM yyyy", {
                      locale: ar,
                    })}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{entry.description}</TableCell>
                  <TableCell>{getStatusBadge(entry.status)}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {entry.posted_at
                      ? format(new Date(entry.posted_at), "dd MMM yyyy", {
                          locale: ar,
                        })
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedEntry(entry);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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
