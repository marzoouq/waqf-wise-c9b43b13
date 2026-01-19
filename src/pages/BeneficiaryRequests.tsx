import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Clock, CheckCircle, XCircle, AlertCircle, ListFilter, AlertTriangle } from 'lucide-react';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { useAuth } from '@/contexts/AuthContext';
import { useMyBeneficiaryRequests, BeneficiaryRequest } from '@/hooks/beneficiary/useMyBeneficiaryRequests';
import { UnifiedKPICard } from '@/components/unified/UnifiedKPICard';
import { UnifiedStatsGrid } from '@/components/unified/UnifiedStatsGrid';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4 text-warning" />;
    case 'approved':
      return <CheckCircle className="h-4 w-4 text-success" />;
    case 'rejected':
      return <XCircle className="h-4 w-4 text-destructive" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

const getStatusBadge = (status: string) => {
  const labels: Record<string, string> = {
    'pending': 'معلق',
    'approved': 'موافق',
    'rejected': 'مرفوض',
  };
  const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
    'pending': 'secondary',
    'approved': 'default',
    'rejected': 'destructive',
  };
  return <Badge variant={variants[status] || 'secondary'}>{labels[status] || status}</Badge>;
};

/**
 * صفحة طلبات المستفيد
 * تمكن المستفيد من تقديم وإدارة طلباته
 */
export default function BeneficiaryRequests() {
  const { user } = useAuth();
  const {
    requests,
    stats,
    isLoading,
    error,
    formData,
    updateFormData,
    isDialogOpen,
    openDialog,
    closeDialog,
    submitRequest,
    isSubmitting,
  } = useMyBeneficiaryRequests(user?.id);

  if (isLoading) {
    return <LoadingState size="lg" />;
  }

  if (error) {
    return (
      <ErrorState 
        title="فشل تحميل الطلبات" 
        message="حدث خطأ أثناء تحميل طلباتك"
        onRetry={() => window.location.reload()}
        fullScreen
      />
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6 lg:px-8 lg:py-8 space-y-4 sm:space-y-5 md:space-y-6 w-full max-w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">طلباتي</h1>
            <p className="text-muted-foreground mt-1">
              تقديم وإدارة الطلبات الخاصة بك
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={(open) => open ? openDialog() : closeDialog()}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ms-2" />
                طلب جديد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>تقديم طلب جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="request_type">نوع الطلب*</Label>
                  <Select
                    value={formData.request_type}
                    onValueChange={(value) => updateFormData({ request_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="فزعة">فزعة طارئة</SelectItem>
                      <SelectItem value="قرض">قرض</SelectItem>
                      <SelectItem value="تحديث بيانات">تحديث بيانات</SelectItem>
                      <SelectItem value="إضافة مولود">إضافة مولود</SelectItem>
                      <SelectItem value="استفسار">استفسار عام</SelectItem>
                      <SelectItem value="شكوى">شكوى</SelectItem>
                      <SelectItem value="أخرى">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {['فزعة', 'قرض'].includes(formData.request_type) && (
                  <div className="space-y-2">
                    <Label htmlFor="amount">المبلغ المطلوب*</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) => updateFormData({ amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="description">السبب/التفاصيل*</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateFormData({ description: e.target.value })}
                    placeholder="اشرح سبب الطلب بالتفصيل..."
                    rows={4}
                  />
                </div>

                <Button
                  onClick={submitRequest}
                  disabled={isSubmitting || !formData.description}
                  className="w-full"
                >
                  {isSubmitting ? 'جاري التقديم...' : 'تقديم الطلب'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* الإحصائيات */}
        <UnifiedStatsGrid columns={4}>
          <UnifiedKPICard
            title="إجمالي الطلبات"
            value={stats.total}
            icon={FileText}
            variant="default"
          />
          <UnifiedKPICard
            title="قيد المعالجة"
            value={stats.pending}
            icon={Clock}
            variant="warning"
          />
          <UnifiedKPICard
            title="موافق عليها"
            value={stats.approved}
            icon={CheckCircle}
            variant="success"
          />
          <UnifiedKPICard
            title="مرفوضة"
            value={stats.rejected}
            icon={XCircle}
            variant="destructive"
          />
        </UnifiedStatsGrid>

        {/* قائمة الطلبات */}
        <Card>
          <CardHeader>
            <CardTitle>سجل الطلبات</CardTitle>
            <CardDescription>جميع الطلبات المقدمة</CardDescription>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">لم تقدم أي طلبات بعد</p>
                <Button variant="outline" className="mt-4" onClick={openDialog}>
                  تقديم أول طلب
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((request: BeneficiaryRequest) => (
                  <Card key={request.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusIcon(request.status)}
                            <h3 className="font-semibold">
                              طلب رقم {request.request_number || request.id.slice(0, 8)}
                            </h3>
                            {getStatusBadge(request.status)}
                          </div>

                          <p className="text-sm text-muted-foreground mb-3">
                            {request.description}
                          </p>

                          {request.amount && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">المبلغ المطلوب: </span>
                              <span className="font-semibold font-mono">
                                {request.amount.toLocaleString('ar-SA')} ر.س
                              </span>
                            </div>
                          )}

                          {request.decision_notes && (
                            <div className="mt-3 p-3 bg-muted rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">
                                ملاحظات المراجع:
                              </p>
                              <p className="text-sm">{request.decision_notes}</p>
                            </div>
                          )}
                        </div>

                        <div className="text-left text-xs text-muted-foreground">
                          <p>{new Date(request.created_at).toLocaleDateString('ar-SA')}</p>
                          <p>{new Date(request.created_at).toLocaleTimeString('ar-SA')}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
