import { useState } from "react";
import { useAccounts, Account } from "@/hooks/useAccounts";
import { ChevronDown, ChevronLeft, Plus, Edit, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import AddAccountDialog from "./AddAccountDialog";

interface AccountNodeProps {
  account: Account & { children?: Account[] };
  level: number;
  onEdit?: (account: Account) => void;
  onAddChild?: (parentAccount: Account) => void;
}

function AccountNode({ account, level, onEdit, onAddChild }: AccountNodeProps) {
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
            {account.current_balance > 0 && <TrendingUp className="inline h-3 w-3 mr-1" />}
            {account.current_balance < 0 && <TrendingDown className="inline h-3 w-3 mr-1" />}
          </span>

            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              {!account.is_system_account && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => {
                    if (onEdit) onEdit(account);
                  }}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              )}
              {account.is_header && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => {
                    if (onAddChild) onAddChild(account);
                  }}
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
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function EnhancedAccountsTree() {
  const { accountTree, accounts, isLoading } = useAccounts();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  if (isLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <>
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">شجرة الحسابات</h2>
            <Button onClick={() => {
              setSelectedAccount(null);
              setDialogOpen(true);
            }}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة حساب رئيسي
            </Button>
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
              />
            ))}
          </div>
        </div>
      </Card>

      <AddAccountDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        account={selectedAccount as any}
        accounts={accounts as any[]}
      />
    </>
  );
}