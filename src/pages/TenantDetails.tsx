import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TenantLedger } from '@/components/tenants/TenantLedger';
import { TenantContracts } from '@/components/tenants/TenantContracts';
import { useTenant } from '@/hooks/property/useTenants';
import { useTenantLedger } from '@/hooks/property/useTenantLedger';
import { formatCurrency } from '@/lib/utils';
import {
  ArrowRight,
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  FileText,
  Hash,
} from 'lucide-react';

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  active: { label: 'نشط', variant: 'default' },
  inactive: { label: 'غير نشط', variant: 'secondary' },
  blacklisted: { label: 'محظور', variant: 'destructive' },
};

const idTypeLabels: Record<string, string> = {
  national_id: 'هوية وطنية',
  iqama: 'إقامة',
  commercial_register: 'سجل تجاري',
};

export default function TenantDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: tenant, isLoading: tenantLoading } = useTenant(id);
  const { balance } = useTenantLedger(id);

  if (tenantLoading) {
    return (
      <div className="space-y-6 p-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">المستأجر غير موجود</p>
        <Button variant="link" onClick={() => navigate('/tenants')}>
          العودة لقائمة المستأجرين
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/tenants')}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-bold truncate">{tenant.full_name}</h1>
              <Badge variant={statusLabels[tenant.status]?.variant || 'secondary'}>
                {statusLabels[tenant.status]?.label || tenant.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              رقم المستأجر: {tenant.tenant_number}
            </p>
          </div>
        </div>
        
        {/* Balance Card - Mobile */}
        <Card className="bg-muted/50">
          <CardContent className="py-3 px-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">الرصيد الحالي</span>
              <span
                className={`text-lg sm:text-xl font-bold ${
                  balance > 0 ? 'text-destructive' : balance < 0 ? 'text-success' : ''
                }`}
              >
                {formatCurrency(Math.abs(balance))}
                {balance > 0 ? ' مدين' : balance < 0 ? ' دائن' : ''}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList className="w-full grid grid-cols-3 h-auto">
          <TabsTrigger value="info" className="text-xs sm:text-sm py-2">
            <User className="ms-1 sm:ms-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">البيانات</span>
            <span className="sm:hidden">بيانات</span>
          </TabsTrigger>
          <TabsTrigger value="ledger" className="text-xs sm:text-sm py-2">
            <FileText className="ms-1 sm:ms-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">كشف الحساب</span>
            <span className="sm:hidden">حساب</span>
          </TabsTrigger>
          <TabsTrigger value="contracts" className="text-xs sm:text-sm py-2">
            <Building className="ms-1 sm:ms-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">العقود</span>
            <span className="sm:hidden">عقود</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {/* Personal Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  المعلومات الشخصية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">نوع المستأجر</p>
                    <p className="font-medium">
                      {tenant.tenant_type === 'individual' ? 'فرد' : 'شركة'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">نوع الهوية</p>
                    <p className="font-medium">
                      {idTypeLabels[tenant.id_type] || tenant.id_type}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">رقم الهوية</p>
                    <p className="font-medium font-mono text-xs sm:text-sm">{tenant.id_number}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">تاريخ التسجيل</p>
                    <p className="font-medium text-xs sm:text-sm">
                      {new Date(tenant.created_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  معلومات التواصل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {tenant.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span dir="ltr" className="truncate">{tenant.phone}</span>
                  </div>
                )}
                {tenant.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span dir="ltr" className="truncate">{tenant.email}</span>
                  </div>
                )}
                {tenant.city && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{tenant.city}</span>
                  </div>
                )}
                {tenant.address && (
                  <div className="flex items-start gap-3">
                    <Building className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="break-words">{tenant.address}</span>
                  </div>
                )}
                {!tenant.phone && !tenant.email && !tenant.city && !tenant.address && (
                  <p className="text-muted-foreground text-center py-2">لا توجد بيانات تواصل</p>
                )}
              </CardContent>
            </Card>

            {/* Tax & Commercial Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  البيانات الضريبية والتجارية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-muted-foreground">الرقم الضريبي</p>
                    <p className="font-medium font-mono text-xs">
                      {tenant.tax_number || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">السجل التجاري</p>
                    <p className="font-medium font-mono text-xs">
                      {tenant.commercial_register || '-'}
                    </p>
                  </div>
                </div>
                {tenant.national_address && (
                  <div>
                    <p className="text-muted-foreground">العنوان الوطني</p>
                    <p className="font-medium break-words">{tenant.national_address}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            {tenant.notes && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    ملاحظات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm">{tenant.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ledger">
          <TenantLedger tenantId={tenant.id} tenantName={tenant.full_name} />
        </TabsContent>

        <TabsContent value="contracts">
          <TenantContracts tenantId={tenant.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}