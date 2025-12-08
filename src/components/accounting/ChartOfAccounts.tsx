import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AccountingService } from '@/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, FolderTree, ChevronLeft, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { Account, AccountType, AccountNature } from '@/types/accounting';
import { LoadingState } from '@/components/shared/LoadingState';

/**
 * مكون شجرة الحسابات
 * يعرض الحسابات بشكل هرمي ويسمح بإدارتها
 */
export function ChartOfAccounts() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    code: '',
    name_ar: '',
    name_en: '',
    account_type: 'asset' as AccountType,
    account_nature: 'debit' as AccountNature,
    parent_id: null as string | null,
    is_header: false,
    description: '',
  });

  const queryClient = useQueryClient();

  // جلب جميع الحسابات باستخدام Service
  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => AccountingService.getAccounts(),
  });

  // إضافة حساب جديد باستخدام Service
  const addAccount = useMutation({
    mutationFn: (accountData: typeof formData) => AccountingService.createAccount(accountData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('تم إضافة الحساب بنجاح');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إضافة الحساب');
    },
  });

  const resetForm = () => {
    setFormData({
      code: '',
      name_ar: '',
      name_en: '',
      account_type: 'asset',
      account_nature: 'debit',
      parent_id: null,
      is_header: false,
      description: '',
    });
  };

  const toggleExpand = (accountId: string) => {
    const newExpanded = new Set(expandedAccounts);
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId);
    } else {
      newExpanded.add(accountId);
    }
    setExpandedAccounts(newExpanded);
  };

  // بناء الشجرة الهرمية
  const buildTree = (parentId: string | null = null, level: number = 0): JSX.Element[] => {
    return accounts
      .filter(acc => acc.parent_id === parentId)
      .map(account => {
        const children = accounts.filter(a => a.parent_id === account.id);
        const hasChildren = children.length > 0;
        const isExpanded = expandedAccounts.has(account.id);

        return (
          <div key={account.id} className="space-y-1">
            <div
              className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg cursor-pointer"
              style={{ paddingRight: `${level * 20 + 8}px` }}
            >
              {hasChildren ? (
                <button onClick={() => toggleExpand(account.id)}>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </button>
              ) : (
                <div className="w-4" />
              )}

              <span className="font-mono text-sm font-medium">{account.code}</span>
              <span className="flex-1">{account.name_ar}</span>

              {account.is_header && (
                <Badge variant="secondary" className="text-xs">
                  حساب رئيسي
                </Badge>
              )}

              <Badge variant="outline" className="text-xs">
                {getAccountTypeLabel(account.account_type)}
              </Badge>

              {!account.is_header && account.current_balance !== null && (
                <span className="text-sm text-muted-foreground font-mono">
                  {(account.current_balance || 0).toLocaleString('ar-SA')} ر.س
                </span>
              )}
            </div>

            {isExpanded && hasChildren && (
              <div>{buildTree(account.id, level + 1)}</div>
            )}
          </div>
        );
      });
  };

  const getAccountTypeLabel = (type: AccountType): string => {
    const labels: Record<AccountType, string> = {
      asset: 'أصول',
      liability: 'خصوم',
      equity: 'حقوق ملكية',
      revenue: 'إيرادات',
      expense: 'مصروفات',
    };
    return labels[type];
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderTree className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">شجرة الحسابات</h2>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              إضافة حساب
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>إضافة حساب جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">رمز الحساب*</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="1.1.1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account_type">نوع الحساب*</Label>
                  <Select
                    value={formData.account_type}
                    onValueChange={(value: AccountType) =>
                      setFormData({ ...formData, account_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asset">أصول</SelectItem>
                      <SelectItem value="liability">خصوم</SelectItem>
                      <SelectItem value="equity">حقوق ملكية</SelectItem>
                      <SelectItem value="revenue">إيرادات</SelectItem>
                      <SelectItem value="expense">مصروفات</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name_ar">اسم الحساب (عربي)*</Label>
                <Input
                  id="name_ar"
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  placeholder="النقدية بالصندوق"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name_en">اسم الحساب (إنجليزي)</Label>
                <Input
                  id="name_en"
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  placeholder="Cash on Hand"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account_nature">طبيعة الحساب*</Label>
                  <Select
                    value={formData.account_nature}
                    onValueChange={(value: AccountNature) =>
                      setFormData({ ...formData, account_nature: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debit">مدين</SelectItem>
                      <SelectItem value="credit">دائن</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parent_id">الحساب الأب</Label>
                  <Select
                    value={formData.parent_id || 'none'}
                    onValueChange={(value) =>
                      setFormData({ ...formData, parent_id: value === 'none' ? null : value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="بدون" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">بدون</SelectItem>
                      {accounts
                        .filter(a => a.is_header)
                        .map(acc => (
                          <SelectItem key={acc.id} value={acc.id}>
                            {acc.code} - {acc.name_ar}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف الحساب..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_header"
                  checked={formData.is_header}
                  onChange={(e) =>
                    setFormData({ ...formData, is_header: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="is_header">حساب رئيسي (Header Account)</Label>
              </div>

              <Button
                onClick={() => addAccount.mutate(formData)}
                disabled={addAccount.isPending || !formData.code || !formData.name_ar}
                className="w-full"
              >
                {addAccount.isPending ? 'جاري الإضافة...' : 'إضافة الحساب'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* شجرة الحسابات */}
      <Card>
        <CardHeader>
          <CardTitle>الحسابات ({accounts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">{buildTree()}</div>

          {accounts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FolderTree className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد حسابات بعد. ابدأ بإضافة حساب جديد.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
