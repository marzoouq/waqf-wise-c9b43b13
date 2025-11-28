import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingState } from '@/components/shared/LoadingState';
import { useAuth } from '@/hooks/useAuth';

interface Request {
  id: string;
  request_number?: string;
  request_type_id?: string;
  description: string;
  amount?: number;
  status: string;
  created_at: string;
  reviewed_at?: string;
  decision_notes?: string;
}

/**
 * صفحة طلبات المستفيد
 * تمكن المستفيد من تقديم وإدارة طلباته
 */
export default function BeneficiaryRequests() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    request_type: 'فزعة',
    amount: '',
    description: '',
  });
  
  const queryClient = useQueryClient();

  // جلب معرف المستفيد من user_id
  const { data: beneficiary } = useQuery({
    queryKey: ['my-beneficiary', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // جلب الطلبات
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['beneficiary-requests', beneficiary?.id],
    queryFn: async () => {
      if (!beneficiary?.id) return [];

      const { data, error } = await supabase
        .from('beneficiary_requests')
        .select('id, request_number, request_type_id, description, amount, status, created_at, reviewed_at, decision_notes')
        .eq('beneficiary_id', beneficiary.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Request[];
    },
    enabled: !!beneficiary?.id,
  });

  // إنشاء طلب جديد
  const createRequest = useMutation({
    mutationFn: async (requestData: typeof formData) => {
      if (!beneficiary?.id) throw new Error('لم يتم العثور على حساب المستفيد');

      // الحصول على نوع طلب افتراضي
      const { data: requestType } = await supabase
        .from('request_types')
        .select('id')
        .limit(1)
        .single();

      const { error } = await supabase
        .from('beneficiary_requests')
        .insert([
          {
            beneficiary_id: beneficiary.id,
            request_type_id: requestType?.id || null,
            description: requestData.description,
            amount: requestData.amount ? parseFloat(requestData.amount) : null,
            status: 'pending',
          },
        ]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiary-requests'] });
      toast.success('تم تقديم الطلب بنجاح');
      setIsDialogOpen(false);
      setFormData({
        request_type: 'فزعة',
        amount: '',
        description: '',
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تقديم الطلب');
    },
  });

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

  if (isLoading) {
    return <LoadingState size="lg" />;
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

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                    onValueChange={(value) =>
                      setFormData({ ...formData, request_type: value })
                    }
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
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                      placeholder="0.00"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="description">السبب/التفاصيل*</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="اشرح سبب الطلب بالتفصيل..."
                    rows={4}
                  />
                </div>

                <Button
                  onClick={() => createRequest.mutate(formData)}
                  disabled={createRequest.isPending || !formData.description}
                  className="w-full"
                >
                  {createRequest.isPending ? 'جاري التقديم...' : 'تقديم الطلب'}
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
              <div className="text-2xl font-bold">{requests.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                قيد المعالجة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {requests.filter(r => r.status === 'pending').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                موافق عليها
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {requests.filter(r => r.status === 'approved').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                مرفوضة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {requests.filter(r => r.status === 'rejected').length}
              </div>
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
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setIsDialogOpen(true)}
                >
                  تقديم أول طلب
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <Card key={request.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusIcon(request.status)}
                            <h3 className="font-semibold">طلب رقم {request.request_number || request.id.slice(0, 8)}</h3>
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
