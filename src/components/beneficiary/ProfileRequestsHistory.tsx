import { useBeneficiaryProfileRequests } from '@/hooks/beneficiary/useBeneficiaryProfileRequests';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/shared/LoadingState';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ProfileRequestsHistoryProps {
  beneficiaryId: string;
}

export function ProfileRequestsHistory({ beneficiaryId }: ProfileRequestsHistoryProps) {
  const { data: requests, isLoading } = useBeneficiaryProfileRequests(beneficiaryId);

  if (isLoading) {
    return <LoadingState message="جاري تحميل الطلبات..." />;
  }

  const pendingCount = requests?.filter(r => r.status === 'قيد المراجعة').length || 0;
  const approvedCount = requests?.filter(r => r.status === 'معتمد').length || 0;
  const rejectedCount = requests?.filter(r => r.status === 'مرفوض').length || 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'معتمد':
        return <CheckCircle className="h-4 w-4" />;
      case 'مرفوض':
        return <XCircle className="h-4 w-4" />;
      case 'قيد المراجعة':
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'معتمد':
        return 'default';
      case 'مرفوض':
        return 'destructive';
      case 'قيد المراجعة':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* إحصائيات الطلبات */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-warning-light flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">قيد المراجعة</p>
                <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-success-light flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">معتمد</p>
                <p className="text-2xl font-bold text-foreground">{approvedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-destructive-light flex items-center justify-center">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">مرفوض</p>
                <p className="text-2xl font-bold text-foreground">{rejectedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* قائمة الطلبات */}
      <Card>
        <CardHeader>
          <CardTitle>سجل الطلبات</CardTitle>
        </CardHeader>
        <CardContent>
          {!requests || requests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد طلبات مسجلة</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex flex-col gap-3 p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-semibold text-foreground">
                          {(request as { request_types?: { name_ar?: string } }).request_types?.name_ar || 'طلب'}
                        </h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {request.description}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>
                          {format(new Date(request.created_at), 'PPP', { locale: ar })}
                        </span>
                        {request.request_number && (
                          <>
                            <span>•</span>
                            <span>رقم الطلب: {request.request_number}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-left space-y-2">
                      {request.amount && (
                        <div className="text-lg font-bold text-primary">
                          {request.amount.toLocaleString('ar-SA')} ريال
                        </div>
                      )}
                      <Badge variant={getStatusVariant(request.status)} className="gap-1">
                        {getStatusIcon(request.status)}
                        {request.status}
                      </Badge>
                    </div>
                  </div>

                  {request.decision_notes && (
                    <div className="pt-3 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold">ملاحظات: </span>
                        {request.decision_notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
