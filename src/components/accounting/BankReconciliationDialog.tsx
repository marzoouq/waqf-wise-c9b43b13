import { useState } from "react";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBankReconciliation } from "@/hooks/useBankReconciliation";
import { useBankAccounts } from "@/hooks/useBankAccounts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface BankReconciliationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

import { BankAccountRow } from "@/types/supabase-helpers";

export function BankReconciliationDialog({ open, onOpenChange }: BankReconciliationDialogProps) {
  const { createStatement } = useBankReconciliation();
  const { bankAccounts, isLoading: loadingBankAccounts } = useBankAccounts();
  
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
          </div>
        )}
    </ResponsiveDialog>
  );
}