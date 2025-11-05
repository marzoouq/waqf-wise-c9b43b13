import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, ChevronLeft, Edit, FolderTree } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription } from "@/components/ui/card";
import AddAccountDialog from "./AddAccountDialog";

type Account = {
  id: string;
  code: string;
  name_ar: string;
  name_en: string | null;
  parent_id: string | null;
  account_type: string;
  account_nature: string;
  description: string | null;
  is_active: boolean;
  is_header: boolean;
};

const AccountsTree = () => {
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set(['1', '2', '3', '4', '5']));
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: accounts, isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .order("code");
      if (error) throw error;
      return data as Account[];
    },
  });

  const toggleAccount = (code: string) => {
    const newExpanded = new Set(expandedAccounts);
    if (newExpanded.has(code)) {
      newExpanded.delete(code);
    } else {
      newExpanded.add(code);
    }
    setExpandedAccounts(newExpanded);
  };

  const getAccountTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      asset: "أصول",
      liability: "خصوم",
      equity: "حقوق ملكية",
      revenue: "إيرادات",
      expense: "مصروفات",
    };
    return types[type] || type;
  };

  const getNatureLabel = (nature: string) => {
    return nature === "debit" ? "مدين" : "دائن";
  };

  const buildTree = (accounts: Account[], parentId: string | null = null): Account[] => {
    return accounts
      .filter((acc) => acc.parent_id === parentId)
      .sort((a, b) => a.code.localeCompare(b.code));
  };

  const renderAccount = (account: Account, level: number = 0) => {
    const children = buildTree(accounts || [], account.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedAccounts.has(account.code);

    return (
      <div key={account.id}>
        <div
          className={`flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors ${
            level > 0 ? "mr-" + level * 6 : ""
          }`}
          style={{ marginRight: `${level * 24}px` }}
        >
          <div className="flex items-center gap-2 flex-1">
            {hasChildren ? (
              <button
                onClick={() => toggleAccount(account.code)}
                className="p-1 hover:bg-accent rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </button>
            ) : (
              <div className="w-6" />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-muted-foreground">
                  {account.code}
                </span>
                <span className="font-medium">{account.name_ar}</span>
                {account.is_header && (
                  <Badge variant="outline" className="text-xs">
                    رئيسي
                  </Badge>
                )}
                {!account.is_active && (
                  <Badge variant="secondary" className="text-xs">
                    غير نشط
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {getAccountTypeLabel(account.account_type)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {getNatureLabel(account.account_nature)}
                </Badge>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedAccount(account);
              setIsAddDialogOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
        {hasChildren && isExpanded && (
          <div>{children.map((child) => renderAccount(child, level + 1))}</div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl font-bold">شجرة الحسابات</h2>
          <Button 
            onClick={() => {
              setSelectedAccount(null);
              setIsAddDialogOpen(true);
            }}
            size="sm"
          >
            <Plus className="h-4 w-4 ml-2" />
            إضافة حساب
          </Button>
        </div>
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <FolderTree className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-medium mb-2">لا توجد حسابات</h3>
              <CardDescription className="mb-4">
                ابدأ ببناء شجرة الحسابات الخاصة بك
              </CardDescription>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 ml-2" />
                إضافة أول حساب
              </Button>
            </div>
          </div>
        </Card>
        <AddAccountDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          account={selectedAccount}
          accounts={[]}
        />
      </div>
    );
  }

  const rootAccounts = buildTree(accounts || [], null);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">شجرة الحسابات</h2>
        <Button 
          onClick={() => {
            setSelectedAccount(null);
            setIsAddDialogOpen(true);
          }}
          size="sm"
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 ml-2" />
          إضافة حساب
        </Button>
      </div>

      <div className="space-y-1 bg-card rounded-lg border p-2 sm:p-4">
        {rootAccounts.length > 0 ? (
          rootAccounts.map((account) => renderAccount(account))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد حسابات رئيسية
          </div>
        )}
      </div>

      <AddAccountDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        account={selectedAccount}
        accounts={accounts || []}
      />
    </div>
  );
};

export default AccountsTree;
