import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Eye, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

  const { data: entries, isLoading } = useQuery({
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: any }> = {
      draft: { label: "مسودة", variant: "secondary" },
      posted: { label: "مرحّل", variant: "default" },
      cancelled: { label: "ملغى", variant: "destructive" },
    };
    const config = variants[status] || { label: status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
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
