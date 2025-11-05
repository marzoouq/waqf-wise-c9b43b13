import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

type JournalEntry = {
  id: string;
  entry_number: string;
  entry_date: string;
  description: string;
  status: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: JournalEntry;
};

const ViewJournalEntryDialog = ({ open, onOpenChange, entry }: Props) => {
  const { data: lines } = useQuery({
    queryKey: ["journal_entry_lines", entry.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_entry_lines")
        .select(`
          *,
          account:accounts(code, name_ar)
        `)
        .eq("journal_entry_id", entry.id)
        .order("line_number");
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const totalDebit = lines?.reduce((sum, line) => sum + Number(line.debit_amount), 0) || 0;
  const totalCredit = lines?.reduce((sum, line) => sum + Number(line.credit_amount), 0) || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>تفاصيل القيد المحاسبي</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 p-4 bg-accent/20 rounded-lg">
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
              {lines?.map((line: any) => (
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
      </DialogContent>
    </Dialog>
  );
};

export default ViewJournalEntryDialog;
