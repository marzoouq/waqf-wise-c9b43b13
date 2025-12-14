import { useState } from "react";
import { ResponsiveDialog, DialogFooter } from "@/components/shared/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { Printer, CheckCircle, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ApprovalDialog from "./ApprovalDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { format, arLocale as ar } from "@/lib/date";
import { BadgeVariant } from "@/types";
import { useViewJournalEntry } from "@/hooks/accounting/useViewJournalEntry";

type JournalEntry = {
  id: string;
  entry_number: string;
  entry_date: string;
  description: string;
  status: string;
  posted_at: string | null;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: JournalEntry;
};

const ViewJournalEntryDialog = ({ open, onOpenChange, entry }: Props) => {
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  
  const {
    lines,
    totalDebit,
    totalCredit,
    postEntry,
    isPosting,
  } = useViewJournalEntry(entry.id, open);

  const handlePrint = () => {
    window.print();
  };

  const handlePost = () => {
    if (entry.status === "draft") {
      postEntry();
      onOpenChange(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: BadgeVariant }> = {
      draft: { label: "مسودة", variant: "secondary" },
      posted: { label: "مرحّل", variant: "default" },
      cancelled: { label: "ملغى", variant: "destructive" },
    };
    const config = variants[status] || { label: status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <>
      <ResponsiveDialog 
        open={open} 
        onOpenChange={onOpenChange}
        title="تفاصيل القيد المحاسبي"
        size="xl"
      >
        <div className="space-y-4" id="print-content">
          <div className="grid grid-cols-2 gap-4 p-4 bg-accent/20 rounded-lg print:bg-background print:border print:border-border">
            <div>
              <div className="text-sm text-muted-foreground">رقم القيد</div>
              <div className="font-mono font-semibold">{entry.entry_number}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">التاريخ</div>
              <div className="font-semibold">
                {format(new Date(entry.entry_date), "dd MMMM yyyy", { locale: ar })}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">الحالة</div>
              <div>{getStatusBadge(entry.status)}</div>
            </div>
            {entry.posted_at && (
              <div>
                <div className="text-sm text-muted-foreground">تاريخ الترحيل</div>
                <div className="font-semibold">
                  {format(new Date(entry.posted_at), "dd MMMM yyyy", { locale: ar })}
                </div>
              </div>
            )}
            <div className="col-span-2">
              <div className="text-sm text-muted-foreground">البيان</div>
              <div>{entry.description}</div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الحساب</TableHead>
                <TableHead>البيان</TableHead>
                <TableHead className="text-center">مدين</TableHead>
                <TableHead className="text-center">دائن</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines?.map((line) => (
                <TableRow key={line.id}>
                  <TableCell>
                    <div className="font-mono text-sm">{line.account.code}</div>
                    <div className="text-sm">{line.account.name_ar}</div>
                  </TableCell>
                  <TableCell>{line.description}</TableCell>
                  <TableCell className="text-center font-mono">
                    {Number(line.debit_amount) > 0 ? Number(line.debit_amount).toFixed(2) : "-"}
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    {Number(line.credit_amount) > 0 ? Number(line.credit_amount).toFixed(2) : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2} className="text-left font-bold">
                  الإجمالي
                </TableCell>
                <TableCell className="text-center font-bold font-mono">
                  {totalDebit.toFixed(2)}
                </TableCell>
                <TableCell className="text-center font-bold font-mono">
                  {totalCredit.toFixed(2)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>

        <DialogFooter className="flex gap-2 print:hidden">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 ms-2" />
            طباعة
          </Button>
          {entry.status === "posted" && (
            <Button variant="secondary" onClick={() => setIsApprovalDialogOpen(true)}>
              <UserCheck className="h-4 w-4 ms-2" />
              طلب موافقة
            </Button>
          )}
          {entry.status === "draft" && (
            <Button onClick={handlePost} disabled={isPosting}>
              <CheckCircle className="h-4 w-4 ms-2" />
              ترحيل القيد
            </Button>
          )}
        </DialogFooter>
      </ResponsiveDialog>

      <ApprovalDialog
        open={isApprovalDialogOpen}
        onOpenChange={setIsApprovalDialogOpen}
        journalEntryId={entry.id}
        entryNumber={entry.entry_number}
      />
    </>
  );
};

export default ViewJournalEntryDialog;
