/**
 * قسم عرض طلبات العقد (فسخ، تعديل إيجار)
 */

import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertCircle,
  FileX,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
} from 'lucide-react';
import {
  useContractRequests,
  type TerminationRequest,
  type RentAdjustmentRequest,
} from '@/hooks/contracts/useContractRequests';
import { Skeleton } from '@/components/ui/skeleton';

interface ContractRequestsSectionProps {
  contractId: string;
  onRespond?: (type: 'termination' | 'adjustment', id: string) => void;
}

const terminationStatusConfig = {
  pending: { label: 'قيد المراجعة', variant: 'secondary' as const, icon: Clock },
  approved: { label: 'موافق', variant: 'default' as const, icon: CheckCircle },
  rejected: { label: 'مرفوض', variant: 'destructive' as const, icon: XCircle },
  cancelled: { label: 'ملغى', variant: 'outline' as const, icon: FileX },
};

const adjustmentStatusConfig = {
  pending: { label: 'قيد المراجعة', variant: 'secondary' as const, icon: Clock },
  approved: { label: 'موافق', variant: 'default' as const, icon: CheckCircle },
  rejected: { label: 'مرفوض', variant: 'destructive' as const, icon: XCircle },
  negotiating: { label: 'قيد التفاوض', variant: 'outline' as const, icon: MessageSquare },
};

export function ContractRequestsSection({
  contractId,
  onRespond,
}: ContractRequestsSectionProps) {
  const {
    terminationRequests,
    rentAdjustmentRequests,
    isLoading,
    stats,
  } = useContractRequests(contractId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  const hasRequests =
    (terminationRequests?.length || 0) > 0 ||
    (rentAdjustmentRequests?.length || 0) > 0;

  if (!hasRequests) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertCircle className="h-5 w-5 text-primary" />
          طلبات العقد
          {stats.terminationRequests.pending + stats.rentAdjustmentRequests.pending > 0 && (
            <Badge variant="destructive" className="mr-2">
              {stats.terminationRequests.pending + stats.rentAdjustmentRequests.pending} قيد المراجعة
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="termination">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="termination" className="gap-2">
              <FileX className="h-4 w-4" />
              طلبات الفسخ
              {terminationRequests?.length ? (
                <Badge variant="outline" className="mr-1">
                  {terminationRequests.length}
                </Badge>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="adjustment" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              تعديل الإيجار
              {rentAdjustmentRequests?.length ? (
                <Badge variant="outline" className="mr-1">
                  {rentAdjustmentRequests.length}
                </Badge>
              ) : null}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="termination" className="mt-4">
            {terminationRequests?.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>تاريخ الطلب</TableHead>
                    <TableHead>نوع الفسخ</TableHead>
                    <TableHead>مقدم الطلب</TableHead>
                    <TableHead>السبب</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {terminationRequests.map((request) => {
                    const statusConfig = terminationStatusConfig[request.status];
                    const StatusIcon = statusConfig.icon;

                    return (
                      <TableRow key={request.id}>
                        <TableCell>
                          {format(new Date(request.created_at), 'dd/MM/yyyy', {
                            locale: ar,
                          })}
                        </TableCell>
                        <TableCell>
                          {request.termination_type === 'mutual'
                            ? 'بالاتفاق'
                            : 'من طرف واحد'}
                        </TableCell>
                        <TableCell>
                          {request.requested_by === 'landlord'
                            ? 'المؤجر'
                            : 'المستأجر'}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {request.reason}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusConfig.variant} className="gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {request.status === 'pending' && onRespond && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onRespond('termination', request.id)}
                            >
                              الرد
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد طلبات فسخ
              </div>
            )}
          </TabsContent>

          <TabsContent value="adjustment" className="mt-4">
            {rentAdjustmentRequests?.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>تاريخ الطلب</TableHead>
                    <TableHead>نوع التعديل</TableHead>
                    <TableHead>الإيجار الحالي</TableHead>
                    <TableHead>المطلوب</TableHead>
                    <TableHead>النسبة</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rentAdjustmentRequests.map((request) => {
                    const statusConfig = adjustmentStatusConfig[request.status];
                    const StatusIcon = statusConfig.icon;
                    const isIncrease = request.adjustment_type === 'increase';

                    return (
                      <TableRow key={request.id}>
                        <TableCell>
                          {format(new Date(request.created_at), 'dd/MM/yyyy', {
                            locale: ar,
                          })}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`flex items-center gap-1 ${
                              isIncrease ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {isIncrease ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            {isIncrease ? 'رفع' : 'خفض'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {request.current_rent.toLocaleString()} ر.س
                        </TableCell>
                        <TableCell>
                          {request.requested_rent.toLocaleString()} ر.س
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              isIncrease ? 'text-green-600' : 'text-red-600'
                            }
                          >
                            {isIncrease ? '+' : ''}
                            {request.adjustment_percentage?.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusConfig.variant} className="gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {request.status === 'pending' && onRespond && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onRespond('adjustment', request.id)}
                            >
                              الرد
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد طلبات تعديل إيجار
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
