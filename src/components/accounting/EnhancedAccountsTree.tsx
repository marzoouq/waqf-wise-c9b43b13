import { useState } from "react";
import { useAccounts } from "@/hooks/accounting/useAccounts";
import { ChevronDown, ChevronLeft, Plus, Edit, TrendingUp, TrendingDown, Trash2, TreePine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import AddAccountDialog from "./AddAccountDialog";
import { AccountRow, AccountWithBalance } from "@/types/supabase-helpers";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { ExportButton } from "@/components/shared/ExportButton";
import { EmptyAccountingState } from "./EmptyAccountingState";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { getAccountTypeLabel } from "@/lib/constants";

interface AccountNodeProps {
  account: AccountWithBalance;
  level: number;
  onEdit?: (account: AccountRow) => void;
  onAddChild?: (parentAccount: AccountRow) => void;
  onDelete?: (account: AccountRow) => void;
}

function AccountNode({ account, level, onEdit, onAddChild, onDelete }: AccountNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const hasChildren = account.children && account.children.length > 0;

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case "أصول": return "text-primary";
      case "خصوم": return "text-warning";
      case "حقوق ملكية": return "text-accent";
      case "إيرادات": return "text-success";
      case "مصروفات": return "text-destructive";
      default: return "text-foreground";
    }
  };

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('ar-SA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(balance));
  };

  return (
    <div className="space-y-1">
      <div
        className={cn(
          "flex items-center gap-2 p-2 rounded-lg hover:bg-accent/50 transition-colors group",
          level === 1 && "bg-primary/5 font-bold",
          level === 2 && "bg-secondary/5 font-semibold",
          !account.is_active && "opacity-50"
        )}
        style={{ paddingRight: `${level * 1.5}rem` }}
      >
        {hasChildren ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        ) : (
          <div className="w-6" />
        )}

        <span className={cn("font-mono text-sm", getAccountTypeColor(account.account_type))}>
          {account.code}
        </span>

        <span className="flex-1 text-sm">{account.name_ar}</span>

        {account.is_header && (
          <Badge variant="outline" className="text-xs">
            حساب رئيسي
          </Badge>
        )}

        {!account.allows_transactions && (
          <Badge variant="secondary" className="text-xs">
            لا يقبل قيود
          </Badge>
        )}

        <div className="flex items-center gap-2">
          <span className={cn(
            "font-mono text-sm font-medium min-w-[120px] text-left",
            account.current_balance > 0 ? "text-success" : account.current_balance < 0 ? "text-destructive" : "text-muted-foreground"
          )}>
            {formatBalance(account.current_balance)}
            {account.current_balance > 0 && <TrendingUp className="inline h-3 w-3 me-1" />}
            {account.current_balance < 0 && <TrendingDown className="inline h-3 w-3 me-1" />}
          </span>

            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              {!account.is_system_account && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => {
                      if (onEdit) onEdit(account);
                    }}
                    title="تعديل"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      if (onDelete) onDelete(account);
                    }}
                    title="حذف"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </>
              )}
              {account.is_header && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => {
                    if (onAddChild) onAddChild(account);
                  }}
                  title="إضافة حساب فرعي"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              )}
            </div>
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="space-y-1">
          {account.children!.map((child) => (
            <AccountNode
              key={child.id}
              account={child}
              level={level + 1}
              onEdit={onEdit}
              onAddChild={onAddChild}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function EnhancedAccountsTree() {
  const { accountTree, accounts, isLoading, deleteAccount, error, refetch } = useAccounts();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountRow | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<AccountRow | null>(null);

  const handleDeleteClick = (account: AccountRow) => {
    setAccountToDelete(account);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (accountToDelete) {
      try {
        await deleteAccount(accountToDelete.id);
        setDeleteDialogOpen(false);
        setAccountToDelete(null);
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  interface FlattenedAccount {
    الكود: string;
    الاسم: string;
    النوع: string;
    الطبيعة: string;
    الرصيد: string;
    الحالة: string;
  }

  const flattenAccounts = (accounts: AccountWithBalance[]): FlattenedAccount[] => {
    let result: FlattenedAccount[] = [];
    accounts.forEach(account => {
      result.push({
        'الكود': account.code,
        'الاسم': account.name_ar,
        'النوع': getAccountTypeLabel(account.account_type),
        'الطبيعة': account.account_nature === 'debit' ? 'مدين' : 'دائن',
        'الرصيد': account.current_balance?.toLocaleString() || '0.00',
        'الحالة': account.is_active ? 'نشط' : 'غير نشط',
      });
      if (account.children && account.children.length > 0) {
        result = result.concat(flattenAccounts(account.children));
      }
    });
    return result;
  };

  if (isLoading) {
    return <LoadingState message="جاري تحميل شجرة الحسابات..." />;
  }

  if (error) {
    return <ErrorState title="خطأ في تحميل شجرة الحسابات" message={(error as Error).message} onRetry={refetch} />;
  }

  if (accountTree.length === 0) {
    return (
      <EmptyAccountingState
        icon={<TreePine className="h-12 w-12" />}
        title="لا توجد حسابات"
        description="ابدأ بإنشاء شجرة الحسابات لتنظيم العمليات المالية"
        actionLabel="إضافة حساب رئيسي"
        onAction={() => {
          setSelectedAccount(null);
          setDialogOpen(true);
        }}
      />
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">شجرة الحسابات</h2>
            <div className="flex gap-2">
              <ExportButton
                data={flattenAccounts(accountTree)}
                filename="شجرة_الحسابات"
                title="شجرة الحسابات"
                headers={['الكود', 'الاسم', 'النوع', 'الطبيعة', 'الرصيد', 'الحالة']}
              />
              <Button onClick={() => {
                setSelectedAccount(null);
                setDialogOpen(true);
              }}>
                <Plus className="ms-2 h-4 w-4" />
                إضافة حساب رئيسي
              </Button>
            </div>
          </div>

          <Input
            placeholder="بحث في الحسابات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />

          <div className="space-y-1">
            {accountTree.map((account) => (
              <AccountNode
                key={account.id}
                account={account}
                level={1}
                onEdit={(acc) => {
                  setSelectedAccount(acc);
                  setDialogOpen(true);
                }}
                onAddChild={(acc) => {
                  setSelectedAccount(acc);
                  setDialogOpen(true);
                }}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        </div>
      </Card>

      <AddAccountDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        account={selectedAccount || undefined}
        accounts={accounts}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="حذف الحساب"
        description="هل أنت متأكد من حذف هذا الحساب؟ لن يمكن استرجاعه بعد الحذف."
        itemName={accountToDelete ? `${accountToDelete.code} - ${accountToDelete.name_ar}` : ""}
      />
    </>
  );
}