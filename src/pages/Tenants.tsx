import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenantsRealtime } from '@/hooks/property/useTenantsRealtime';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TenantDialog } from '@/components/tenants/TenantDialog';
import { QuickPaymentDialog } from '@/components/tenants/QuickPaymentDialog';
import { useTenants } from '@/hooks/property/useTenants';
import { formatCurrency } from '@/lib/utils';
import { ExportButton } from '@/components/shared/ExportButton';
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  FileText,
  Building,
  Phone,
  Mail,
  Banknote,
} from 'lucide-react';
import type { Tenant, TenantInsert, TenantWithBalance } from '@/types/tenants';

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  active: { label: 'نشط', variant: 'default' },
  inactive: { label: 'غير نشط', variant: 'secondary' },
  blacklisted: { label: 'محظور', variant: 'destructive' },
};

export default function Tenants() {
  const navigate = useNavigate();
  const { tenants, isLoading, addTenant, updateTenant, deleteTenant, isAdding, isUpdating } = useTenants();
  useTenantsRealtime(); // تحديثات فورية
  
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<TenantWithBalance | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<TenantWithBalance | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [tenantForPayment, setTenantForPayment] = useState<{
    id: string;
    full_name: string;
    current_balance: number;
  } | null>(null);

  const openPaymentDialog = (tenant: TenantWithBalance) => {
    setTenantForPayment({
      id: tenant.id,
      full_name: tenant.full_name,
      current_balance: tenant.current_balance,
    });
    setPaymentDialogOpen(true);
  };

  const filteredTenants = tenants.filter(
    (tenant) =>
      tenant.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.id_number.includes(searchQuery) ||
      tenant.phone?.includes(searchQuery) ||
      tenant.tenant_number?.includes(searchQuery)
  );

  const handleSubmit = async (data: TenantInsert) => {
    if (selectedTenant) {
      await updateTenant({ id: selectedTenant.id, ...data });
    } else {
      await addTenant(data);
    }
  };

  const handleEdit = (tenant: TenantWithBalance) => {
    setSelectedTenant(tenant);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (tenantToDelete) {
      await deleteTenant(tenantToDelete.id);
      setDeleteDialogOpen(false);
      setTenantToDelete(null);
    }
  };

  const openDeleteDialog = (tenant: TenantWithBalance) => {
    setTenantToDelete(tenant);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6 p-4 md:p-6 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            إدارة المستأجرين
          </h1>
          <p className="text-muted-foreground">
            قائمة المستأجرين وحساباتهم
          </p>
        </div>
        <div className="flex gap-2">
          {tenants.length > 0 && (
            <ExportButton
              data={tenants.map(t => ({
                'رقم المستأجر': t.tenant_number || '-',
                'الاسم': t.full_name,
                'رقم الهوية': t.id_number,
                'الجوال': t.phone || '-',
                'البريد': t.email || '-',
                'الحالة': statusLabels[t.status]?.label || t.status,
                'الرصيد': formatCurrency(t.current_balance),
              }))}
              filename="المستأجرين"
              title="تقرير المستأجرين"
              headers={['رقم المستأجر', 'الاسم', 'رقم الهوية', 'الجوال', 'البريد', 'الحالة', 'الرصيد']}
            />
          )}
          <Button
            onClick={() => {
              setSelectedTenant(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="ms-2 h-4 w-4" />
            إضافة مستأجر
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المستأجرين</p>
                <p className="text-2xl font-bold">{tenants.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">المستأجرين النشطين</p>
                <p className="text-2xl font-bold">
                  {tenants.filter((t) => t.status === 'نشط' || t.status === 'active').length}
                </p>
              </div>
              <Building className="h-8 w-8 text-status-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الذمم المستحقة</p>
                <p className="text-2xl font-bold text-destructive">
                  {formatCurrency(
                    tenants.reduce((sum, t) => sum + Math.max(0, t.current_balance), 0)
                  )}
                </p>
              </div>
              <FileText className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث بالاسم، رقم الهوية، الجوال..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredTenants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا يوجد مستأجرين
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-3">
                {filteredTenants.map((tenant) => (
                  <Card 
                    key={tenant.id} 
                    className="p-3 cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/tenants/${tenant.id}`)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{tenant.full_name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{tenant.tenant_number}</p>
                      </div>
                      <Badge variant={statusLabels[tenant.status]?.variant || 'secondary'}>
                        {statusLabels[tenant.status]?.label || tenant.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs">{tenant.phone || '-'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs truncate">{tenant.email || '-'}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-xs text-muted-foreground">الرصيد:</span>
                      <span className={`font-medium ${
                        tenant.current_balance > 0 ? 'text-destructive' :
                        tenant.current_balance < 0 ? 'text-status-success' : ''
                      }`}>
                        {formatCurrency(tenant.current_balance)}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2 pt-2 border-t">
                      {/* زر الدفع السريع */}
                      <Button
                        size="sm"
                        variant="default"
                        className="flex-1 text-xs bg-green-600 hover:bg-green-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          openPaymentDialog(tenant);
                        }}
                      >
                        <Banknote className="h-3 w-3 ms-1" />
                        دفع
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(tenant);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteDialog(tenant);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm hidden lg:table-cell">رقم المستأجر</TableHead>
                      <TableHead className="text-xs sm:text-sm">الاسم</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden lg:table-cell">رقم الهوية</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden xl:table-cell">التواصل</TableHead>
                      <TableHead className="text-xs sm:text-sm">الحالة</TableHead>
                      <TableHead className="text-left text-xs sm:text-sm">الرصيد</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTenants.map((tenant) => (
                      <TableRow
                        key={tenant.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/tenants/${tenant.id}`)}
                      >
                        <TableCell className="font-mono text-xs sm:text-sm hidden lg:table-cell">
                          {tenant.tenant_number}
                        </TableCell>
                        <TableCell className="font-medium text-xs sm:text-sm">
                          {tenant.full_name}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-xs sm:text-sm">{tenant.id_number}</TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <div className="flex flex-col gap-1">
                            {tenant.phone && (
                              <div className="flex items-center gap-1 text-xs sm:text-sm">
                                <Phone className="h-3 w-3" />
                                {tenant.phone}
                              </div>
                            )}
                            {tenant.email && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {tenant.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          <Badge variant={statusLabels[tenant.status]?.variant || 'secondary'}>
                            {statusLabels[tenant.status]?.label || tenant.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-left text-xs sm:text-sm">
                          <span
                            className={
                              tenant.current_balance > 0
                                ? 'text-destructive font-medium'
                                : tenant.current_balance < 0
                                ? 'text-status-success font-medium'
                                : ''
                            }
                          >
                            {formatCurrency(tenant.current_balance)}
                          </span>
                        </TableCell>
                        <TableCell className="flex items-center gap-1">
                          {/* زر الدفع السريع */}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openPaymentDialog(tenant);
                                  }}
                                >
                                  <Banknote className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>تسجيل دفعة</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-green-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openPaymentDialog(tenant);
                                }}
                              >
                                <Banknote className="ms-2 h-4 w-4" />
                                تسجيل دفعة
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(tenant);
                                }}
                              >
                                <Edit className="ms-2 h-4 w-4" />
                                تعديل
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/tenants/${tenant.id}`);
                                }}
                              >
                                <FileText className="ms-2 h-4 w-4" />
                                كشف الحساب
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDeleteDialog(tenant);
                                }}
                              >
                                <Trash2 className="ms-2 h-4 w-4" />
                                حذف
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Tenant Dialog */}
      <TenantDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tenant={selectedTenant}
        onSubmit={handleSubmit}
        isLoading={isAdding || isUpdating}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف المستأجر "{tenantToDelete?.full_name}"؟
              <br />
              سيتم حذف جميع البيانات المرتبطة به.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Quick Payment Dialog */}
      <QuickPaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        tenant={tenantForPayment}
      />
    </div>
  );
}
