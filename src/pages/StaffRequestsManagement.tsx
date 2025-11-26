import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Clock, FileText, User } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingState } from '@/components/shared/LoadingState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RequestWithBeneficiary {
  id: string;
  request_number?: string;
  request_type_id?: string;
  amount?: number;
  description: string;
  status: string;
  created_at: string;
  decision_notes?: string;
  beneficiary: {
    full_name: string;
    national_id: string;
    phone: string;
  };
}

/**
 * صفحة إدارة طلبات المستفيدين للموظفين
 */
export default function StaffRequestsManagement() {
  const [selectedRequest, setSelectedRequest] = useState<RequestWithBeneficiary | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [selectedTab, setSelectedTab] = useState('pending');
  
  const queryClient = useQueryClient();

  // جلب الطلبات
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['all-beneficiary-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('beneficiary_requests')
        .select(`
          *,
          beneficiary:beneficiaries(
            full_name,
            national_id,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as RequestWithBeneficiary[];
    },
  });

  // تحديث حالة الطلب
  const updateRequestStatus = useMutation({
    mutationFn: async ({ requestId, status, notes }: { requestId: string; status: string; notes: string }) => {
      const { error } = await supabase
        .from('beneficiary_requests')
        .update({
          status,
          decision_notes: notes,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['all-beneficiary-requests'] });
      toast.success(variables.status === 'approved' ? 'تمت الموافقة على الطلب' : 'تم رفض الطلب');
      setSelectedRequest(null);
      setReviewNotes('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'فشل تحديث الطلب');
    },
  });

  const handleApprove = () => {
    if (!selectedRequest) return;
    updateRequestStatus.mutate({
      requestId: selectedRequest.id,
      status: 'approved',
      notes: reviewNotes,
    });
  };

  const handleReject = () => {
    if (!selectedRequest || !reviewNotes.trim()) {
      toast.error('يرجى كتابة سبب الرفض');
      return;
    }
    updateRequestStatus.mutate({
      requestId: selectedRequest.id,
      status: 'rejected',
      notes: reviewNotes,
    });
  };

  const filteredRequests = requests.filter(r => {
    if (selectedTab === 'pending') return r.status === 'pending';
    if (selectedTab === 'approved') return r.status === 'approved';
    if (selectedTab === 'rejected') return r.status === 'rejected';
    return true;
  });

  if (isLoading) {
    return <LoadingState size="lg" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 md:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">إدارة طلبات المستفيدين</h1>
          <p className="text-muted-foreground mt-1">
            مراجعة والموافقة على طلبات المستفيدين
          </p>
        </div>

        {/* الإحصائيات */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                جميع الطلبات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{requests.length}</div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 dark:border-yellow-900">
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

          <Card className="border-green-200 dark:border-green-900">
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

          <Card className="border-red-200 dark:border-red-900">
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

        {/* الطلبات */}
        <Card>
          <CardHeader>
            <CardTitle>الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">الكل</TabsTrigger>
                <TabsTrigger value="pending">
                  قيد المعالجة ({requests.filter(r => r.status === 'pending').length})
                </TabsTrigger>
                <TabsTrigger value="approved">موافق عليها</TabsTrigger>
                <TabsTrigger value="rejected">مرفوضة</TabsTrigger>
              </TabsList>

              <TabsContent value={selectedTab} className="mt-4">
                {filteredRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>لا توجد طلبات في هذه الفئة</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredRequests.map((request) => (
                      <Card
                        key={request.id}
                        className="border cursor-pointer hover:border-primary"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold">
                                  {request.beneficiary?.full_name}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {request.beneficiary?.national_id}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-2 mb-2">
                                <Badge>طلب رقم {request.request_number || request.id.slice(0, 8)}</Badge>
                                {getRequestStatusBadge(request.status)}
                                {request.amount && (
                                  <Badge variant="secondary">
                                    {request.amount.toLocaleString('ar-SA')} ر.س
                                  </Badge>
                                )}
                              </div>

                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {request.description}
                              </p>
                            </div>

                            <div className="text-left text-xs text-muted-foreground">
                              <p>{new Date(request.created_at).toLocaleDateString('ar-SA')}</p>
                              <p>{new Date(request.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* محاورة مراجعة الطلب */}
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>مراجعة الطلب</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">المستفيد</Label>
                    <p className="font-semibold">{selectedRequest.beneficiary?.full_name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">رقم الهوية</Label>
                    <p className="font-mono">{selectedRequest.beneficiary?.national_id}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">رقم الطلب</Label>
                  <p className="font-mono">{selectedRequest.request_number || selectedRequest.id}</p>
                </div>

                {selectedRequest.amount && (
                  <div>
                    <Label className="text-xs text-muted-foreground">المبلغ المطلوب</Label>
                    <p className="text-xl font-bold font-mono">
                      {selectedRequest.amount.toLocaleString('ar-SA')} ر.س
                    </p>
                  </div>
                )}

                <div>
                  <Label className="text-xs text-muted-foreground">التفاصيل</Label>
                  <p className="mt-1 p-3 bg-muted rounded-lg">{selectedRequest.description}</p>
                </div>

                {selectedRequest.status === 'pending' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="review_notes">ملاحظات المراجعة</Label>
                      <Textarea
                        id="review_notes"
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="أضف ملاحظاتك هنا..."
                        rows={4}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={handleApprove}
                        disabled={updateRequestStatus.isPending}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 ml-2" />
                        موافقة
                      </Button>
                      <Button
                        onClick={handleReject}
                        disabled={updateRequestStatus.isPending}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 ml-2" />
                        رفض
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function getRequestStatusBadge(status: string) {
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
  
  const icons: Record<string, JSX.Element> = {
    'pending': <Clock className="h-3 w-3 ml-1" />,
    'approved': <CheckCircle className="h-3 w-3 ml-1" />,
    'rejected': <XCircle className="h-3 w-3 ml-1" />,
  };

  return (
    <Badge variant={variants[status] || 'secondary'} className="gap-1">
      {icons[status]}
      {labels[status] || status}
    </Badge>
  );
}
