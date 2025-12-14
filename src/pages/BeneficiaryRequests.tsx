import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { useAuth } from '@/hooks/useAuth';
import { useMyBeneficiaryRequests, BeneficiaryRequest } from '@/hooks/useMyBeneficiaryRequests';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case 'approved':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'rejected':
      return <XCircle className="h-4 w-4 text-red-600" />;
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 md:p-8 space-y-6">
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
                <Plus className="h-4 w-4 ml-2" />
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
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                إجمالي الطلبات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                قيد المعالجة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                موافق عليها
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                مرفوضة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

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
