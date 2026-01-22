import { useState } from "react";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBankReconciliation } from "@/hooks/payments/useBankReconciliation";
import { useBankAccounts } from "@/hooks/payments/useBankAccounts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import { BankAccountRow } from "@/types/supabase-helpers";
import { format, arLocale as ar } from "@/lib/date";

interface BankReconciliationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BankReconciliationDialog({ open, onOpenChange }: BankReconciliationDialogProps) {
  const { statements, createStatement } = useBankReconciliation();
  const { bankAccounts, isLoading: loadingBankAccounts } = useBankAccounts();
  
  const [step, _setStep] = useState<"select" | "import" | "match">("select");
  
  const [newStatement, setNewStatement] = useState({
    bank_account_id: "",
    statement_date: "",
    opening_balance: 0,
    closing_balance: 0,
  });

  const handleCreateStatement = async () => {
    if (!newStatement.bank_account_id || !newStatement.statement_date) {
      return;
    }
    
    if (newStatement.opening_balance === 0 || newStatement.closing_balance === 0) {
      alert("يرجى إدخال الرصيد الافتتاحي والختامي");
      return;
    }
    
    await createStatement({
      ...newStatement,
      status: 'pending',
    });
    
    onOpenChange(false);
  };

  return (
    <ResponsiveDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title="التسوية البنكية"
      size="xl"
    >

        {step === "select" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">إنشاء كشف حساب جديد</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الحساب البنكي</Label>
                <Select
                  value={newStatement.bank_account_id}
                  onValueChange={(value) => setNewStatement({ ...newStatement, bank_account_id: value })}
                  disabled={loadingBankAccounts}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحساب البنكي" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map((account: BankAccountRow) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.bank_name} - {account.account_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>تاريخ الكشف</Label>
                <Input
                  type="date"
                  value={newStatement.statement_date}
                  onChange={(e) => setNewStatement({ ...newStatement, statement_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>الرصيد الافتتاحي</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newStatement.opening_balance || 0}
                  onChange={(e) => setNewStatement({ ...newStatement, opening_balance: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label>الرصيد الختامي</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newStatement.closing_balance || 0}
                  onChange={(e) => setNewStatement({ ...newStatement, closing_balance: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <Button onClick={handleCreateStatement} className="w-full">
              إنشاء كشف الحساب
            </Button>

            <div className="pt-6">
              <h3 className="text-lg font-semibold mb-4">كشوف الحساب السابقة</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الحساب</TableHead>
                    <TableHead>الرصيد الافتتاحي</TableHead>
                    <TableHead>الرصيد الختامي</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statements.map((statement) => (
                    <TableRow key={statement.id}>
                      <TableCell>
                        {format(new Date(statement.statement_date), "dd/MM/yyyy", { locale: ar })}
                      </TableCell>
                      <TableCell>
                        {statement.bank_accounts?.bank_name} - {statement.bank_accounts?.account_number}
                      </TableCell>
                      <TableCell>{statement.opening_balance.toLocaleString('ar-SA')}</TableCell>
                      <TableCell>{statement.closing_balance.toLocaleString('ar-SA')}</TableCell>
                      <TableCell>
                        {statement.status === 'reconciled' ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            مسوى
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            غير مسوى
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
    </ResponsiveDialog>
  );
}