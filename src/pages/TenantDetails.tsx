import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TenantLedger } from '@/components/tenants/TenantLedger';
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
  CreditCard,
  FileText,
  Hash,
  Calendar,
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
      <MainLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (!tenant) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">المستأجر غير موجود</p>
          <Button variant="link" onClick={() => navigate('/tenants')}>
            العودة لقائمة المستأجرين
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/tenants')}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{tenant.full_name}</h1>
              <Badge variant={statusLabels[tenant.status]?.variant || 'secondary'}>
                {statusLabels[tenant.status]?.label || tenant.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              رقم المستأجر: {tenant.tenant_number}
            </p>
          </div>
          <div className="text-left">
            <p className="text-sm text-muted-foreground">الرصيد الحالي</p>
            <p
              className={`text-2xl font-bold ${
                balance > 0 ? 'text-destructive' : balance < 0 ? 'text-green-600' : ''
              }`}
            >
              {formatCurrency(Math.abs(balance))}
              {balance > 0 ? ' مدين' : balance < 0 ? ' دائن' : ''}
            </p>
          </div>
        </div>

        <Tabs defaultValue="info" className="space-y-4">
          <TabsList>
            <TabsTrigger value="info">
              <User className="ml-2 h-4 w-4" />
              البيانات الأساسية
            </TabsTrigger>
            <TabsTrigger value="ledger">
              <FileText className="ml-2 h-4 w-4" />
              كشف الحساب
            </TabsTrigger>
            <TabsTrigger value="contracts">
              <Building className="ml-2 h-4 w-4" />
              العقود
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    المعلومات الشخصية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">نوع المستأجر</p>
                      <p className="font-medium">
                        {tenant.tenant_type === 'individual' ? 'فرد' : 'شركة'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">نوع الهوية</p>
                      <p className="font-medium">
                        {idTypeLabels[tenant.id_type] || tenant.id_type}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">رقم الهوية</p>
                      <p className="font-medium font-mono">{tenant.id_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">تاريخ التسجيل</p>
                      <p className="font-medium">
                        {new Date(tenant.created_at).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    معلومات التواصل
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tenant.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span dir="ltr">{tenant.phone}</span>
                    </div>
                  )}
                  {tenant.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span dir="ltr">{tenant.email}</span>
                    </div>
                  )}
                  {tenant.city && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{tenant.city}</span>
                    </div>
                  )}
                  {tenant.address && (
                    <div className="flex items-start gap-3">
                      <Building className="h-4 w-4 text-muted-foreground mt-1" />
                      <span>{tenant.address}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tax & Commercial Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Hash className="h-5 w-5" />
                    البيانات الضريبية والتجارية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">الرقم الضريبي</p>
                      <p className="font-medium font-mono">
                        {tenant.tax_number || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">السجل التجاري</p>
                      <p className="font-medium font-mono">
                        {tenant.commercial_register || '-'}
                      </p>
                    </div>
                  </div>
                  {tenant.national_address && (
                    <div>
                      <p className="text-sm text-muted-foreground">العنوان الوطني</p>
                      <p className="font-medium">{tenant.national_address}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              {tenant.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      ملاحظات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{tenant.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="ledger">
            <TenantLedger tenantId={tenant.id} tenantName={tenant.full_name} />
          </TabsContent>

          <TabsContent value="contracts">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">عقود المستأجر</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  سيتم عرض العقود المرتبطة بهذا المستأجر
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
