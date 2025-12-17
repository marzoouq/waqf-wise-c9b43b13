import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";
import { useBankAccounts } from "@/hooks/payments/useBankAccounts";
import { useAccounts } from "@/hooks/accounting/useAccounts";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyAccountingState } from "./EmptyAccountingState";
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
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { BankAccountRow } from "@/types/supabase-helpers";
import { UnifiedDataTable, type Column } from "@/components/unified/UnifiedDataTable";
import { useDeleteConfirmation } from "@/hooks/shared/useDeleteConfirmation";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";

export function BankAccountsManagement() {
  const { bankAccounts, isLoading, addBankAccount, updateBankAccount, deleteBankAccount, error, refetch } =
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

  const {
    confirmDelete,
    isOpen: deleteDialogOpen,
    onOpenChange: setDeleteDialogOpen,
    executeDelete,
    isDeleting,
    itemName,
  } = useDeleteConfirmation({
    onDelete: deleteBankAccount,
    successMessage: "تم حذف الحساب البنكي بنجاح",
    errorMessage: "حدث خطأ أثناء حذف الحساب البنكي",
    title: "حذف الحساب البنكي",
    description: "هل أنت متأكد من حذف هذا الحساب البنكي؟",
  });

  if (isLoading) {
    return <LoadingState message="جاري تحميل الحسابات البنكية..." />;
  }

  if (error) {
    return <ErrorState title="خطأ في تحميل الحسابات البنكية" message={(error as Error).message} onRetry={refetch} />;
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

  const columns: Column<BankAccountRow>[] = [
    {
      key: "bank_name",
      label: "اسم البنك",
      render: (_, account) => (
        <span className="font-medium text-xs sm:text-sm">{account.bank_name}</span>
      ),
    },
    {
      key: "account_number",
      label: "رقم الحساب",
      render: (_, account) => (
        <span className="text-xs sm:text-sm">{account.account_number}</span>
      ),
    },
    {
      key: "iban",
      label: "IBAN",
      render: (_, account) => (
        <span className="font-mono text-xs sm:text-sm">{account.iban || "-"}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "currency",
      label: "العملة",
      render: (_, account) => (
        <span className="text-xs sm:text-sm">{account.currency}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "current_balance",
      label: "الرصيد الحالي",
      render: (_, account) => (
        <span className="font-semibold text-xs sm:text-sm">
          {formatCurrency(account.current_balance)}
        </span>
      ),
    },
    {
      key: "is_active",
      label: "الحالة",
      render: (_, account) => (
        <Badge variant={account.is_active ? "default" : "secondary"}>
          {account.is_active ? "نشط" : "غير نشط"}
        </Badge>
      ),
      hideOnMobile: true,
    },
  ];

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            إدارة الحسابات البنكية
          </CardTitle>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 ms-2" />
            إضافة حساب بنكي
          </Button>
        </CardHeader>
        <CardContent>
          {bankAccounts.length === 0 ? (
            <EmptyAccountingState
              icon={<Building2 className="h-12 w-12" />}
              title="لا توجد حسابات بنكية"
              description="ابدأ بإضافة أول حساب بنكي لإدارة المعاملات المصرفية"
              actionLabel="إضافة حساب بنكي"
              onAction={() => handleOpenDialog()}
            />
          ) : (
            <UnifiedDataTable
              columns={columns}
              data={bankAccounts}
              loading={isLoading}
              actions={(account) => (
                <div className="flex gap-2 justify-end">
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
                    onClick={() => confirmDelete(account.id, account.bank_name)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              )}
            />
          )}
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

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={executeDelete}
        title="حذف الحساب البنكي"
        description="هل أنت متأكد من حذف هذا الحساب البنكي؟"
        itemName={itemName}
        isLoading={isDeleting}
      />
    </>
  );
}
