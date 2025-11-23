import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";
import { useBankAccounts } from "@/hooks/useBankAccounts";
import { useAccounts } from "@/hooks/useAccounts";
import { LoadingState } from "@/components/shared/LoadingState";
import { logger } from "@/lib/logger";
import { ResponsiveDialog, DialogFooter } from "@/components/shared/ResponsiveDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

import { BankAccountRow } from "@/types/supabase-helpers";

export function BankAccountsManagement() {
  const { bankAccounts, isLoading, addBankAccount, updateBankAccount, deleteBankAccount } =
    useBankAccounts();
  const { accounts } = useAccounts();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccountRow | null>(null);
  const [formData, setFormData] = useState({
    account_id: "",
    bank_name: "",
    account_number: "",
    iban: "",
    swift_code: "",
    currency: "SAR",
    current_balance: 0,
    is_active: true,
  });

  const bankAccountsOnly = accounts.filter((acc) => acc.code?.startsWith("1.1.2"));

  if (isLoading) {
    return <LoadingState message="جاري تحميل الحسابات البنكية..." />;
  }

  const handleOpenDialog = (account?: BankAccountRow) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        account_id: account.account_id || "",
        bank_name: account.bank_name,
        account_number: account.account_number,
        iban: account.iban || "",
        swift_code: account.swift_code || "",
        currency: account.currency,
        current_balance: account.current_balance,
        is_active: account.is_active,
      });
    } else {
      setEditingAccount(null);
      setFormData({
        account_id: "",
        bank_name: "",
        account_number: "",
        iban: "",
        swift_code: "",
        currency: "SAR",
        current_balance: 0,
        is_active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingAccount) {
        await updateBankAccount({ id: editingAccount.id, ...formData });
      } else {
        await addBankAccount(formData);
      }
      setDialogOpen(false);
    } catch (error) {
      logger.error(error, { context: 'save_bank_account', severity: 'medium' });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا الحساب البنكي؟")) {
      await deleteBankAccount(id);
    }
  };

  // Using formatCurrency from @/lib/utils

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            إدارة الحسابات البنكية
          </CardTitle>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 ml-2" />
            إضافة حساب بنكي
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs sm:text-sm">اسم البنك</TableHead>
                <TableHead className="text-xs sm:text-sm">رقم الحساب</TableHead>
                <TableHead className="text-xs sm:text-sm hidden lg:table-cell">IBAN</TableHead>
                <TableHead className="text-xs sm:text-sm hidden md:table-cell">العملة</TableHead>
                <TableHead className="text-xs sm:text-sm">الرصيد الحالي</TableHead>
                <TableHead className="text-xs sm:text-sm hidden md:table-cell">الحالة</TableHead>
                <TableHead className="text-xs sm:text-sm">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bankAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium text-xs sm:text-sm">{account.bank_name}</TableCell>
                  <TableCell className="text-xs sm:text-sm">{account.account_number}</TableCell>
                  <TableCell className="font-mono text-xs sm:text-sm hidden lg:table-cell">{account.iban || "-"}</TableCell>
                  <TableCell className="text-xs sm:text-sm hidden md:table-cell">{account.currency}</TableCell>
                  <TableCell className="font-semibold text-xs sm:text-sm">
                    {formatCurrency(account.current_balance)}
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm hidden md:table-cell">
                    <Badge variant={account.is_active ? "default" : "secondary"}>
                      {account.is_active ? "نشط" : "غير نشط"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(account as BankAccountRow)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(account.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {bankAccounts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    لا توجد حسابات بنكية. قم بإضافة حساب جديد للبدء.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ResponsiveDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        title={editingAccount ? "تعديل حساب بنكي" : "إضافة حساب بنكي جديد"}
        size="lg"
      >
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="account_id">الحساب المحاسبي</Label>
                <Select
                  value={formData.account_id}
                  onValueChange={(value) => setFormData({ ...formData, account_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحساب" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccountsOnly.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.code} - {account.name_ar}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_name">اسم البنك</Label>
                <Input
                  id="bank_name"
                  value={formData.bank_name}
                  onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  placeholder="مثال: البنك الأهلي"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="account_number">رقم الحساب</Label>
                <Input
                  id="account_number"
                  value={formData.account_number}
                  onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                  placeholder="0123456789"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="iban">IBAN (اختياري)</Label>
                <Input
                  id="iban"
                  value={formData.iban}
                  onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                  placeholder="SA0000000000000000000000"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="swift_code">SWIFT Code (اختياري)</Label>
                <Input
                  id="swift_code"
                  value={formData.swift_code}
                  onChange={(e) => setFormData({ ...formData, swift_code: e.target.value })}
                  placeholder="XXXXSARI"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">العملة</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                    <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                    <SelectItem value="EUR">يورو (EUR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="current_balance">الرصيد الحالي</Label>
              <Input
                id="current_balance"
                type="number"
                value={formData.current_balance}
                onChange={(e) =>
                  setFormData({ ...formData, current_balance: parseFloat(e.target.value) || 0 })
                }
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSubmit}>
              {editingAccount ? "تحديث" : "إضافة"}
            </Button>
          </DialogFooter>
      </ResponsiveDialog>
    </>
  );
}
