import { useState } from 'react';
import { Search, Filter, Clock, CheckCircle, XCircle, AlertCircle, GitBranch, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRequests } from '@/hooks/useRequests';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { RequestApprovalDialog } from '@/components/requests/RequestApprovalDialog';
import { RequestCommentsDialog } from '@/components/requests/RequestCommentsDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollableTableWrapper } from '@/components/shared/ScrollableTableWrapper';
import { MobileScrollHint } from '@/components/shared/MobileScrollHint';
import { MobileOptimizedLayout, MobileOptimizedHeader } from '@/components/layout/MobileOptimizedLayout';
import type { BeneficiaryRequest } from '@/types/index';

const Requests = () => {
  const { requests, isLoading } = useRequests();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<BeneficiaryRequest | null>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.request_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (request.beneficiary && 'full_name' in request.beneficiary && 
        request.beneficiary.full_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'معلق').length,
    inProgress: requests.filter(r => r.status === 'قيد المعالجة').length,
    approved: requests.filter(r => r.status === 'موافق').length,
    rejected: requests.filter(r => r.status === 'مرفوض').length,
    overdue: requests.filter(r => r.is_overdue).length,
  };

  const getStatusBadge = (status: string) => {
    type BadgeVariant = "default" | "secondary" | "destructive" | "outline";
    type IconComponent = React.ComponentType<{ className?: string }>;
    const variants: Record<string, { variant: BadgeVariant; icon: IconComponent }> = {
      'معلق': { variant: 'secondary', icon: Clock },
      'قيد المعالجة': { variant: 'default', icon: AlertCircle },
      'قيد المراجعة': { variant: 'default', icon: AlertCircle },
      'موافق': { variant: 'default', icon: CheckCircle },
      'مرفوض': { variant: 'destructive', icon: XCircle },
      'ملغي': { variant: 'secondary', icon: XCircle },
    };

    const config = variants[status] || variants['معلق'];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return <LoadingState size="lg" />;
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">إدارة الطلبات</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-xs sm:text-sm">
            عرض ومعالجة طلبات المستفيدين
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
        <Card>
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              إجمالي الطلبات
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-xl md:text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              معلق
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              قيد المعالجة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              موافق عليه
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              مرفوض
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.rejected}</div>
          </CardContent>
        </Card>

        <Card className="border-destructive">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-destructive">
              متأخر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>البحث والتصفية</CardTitle>
          <CardDescription>ابحث عن طلب أو صفي حسب الحالة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث برقم الطلب أو اسم المستفيد..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="ml-2 h-4 w-4" />
                <SelectValue placeholder="جميع الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="معلق">معلق</SelectItem>
                <SelectItem value="قيد المعالجة">قيد المعالجة</SelectItem>
                <SelectItem value="قيد المراجعة">قيد المراجعة</SelectItem>
                <SelectItem value="موافق">موافق</SelectItem>
                <SelectItem value="مرفوض">مرفوض</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الطلبات</CardTitle>
          <CardDescription>
            عرض جميع الطلبات ({filteredRequests.length})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <EmptyState
              icon={AlertCircle}
              title="لا توجد طلبات"
              description={
                searchQuery || statusFilter !== 'all'
                  ? 'لا توجد نتائج مطابقة لبحثك'
                  : 'لم يتم تقديم أي طلبات بعد'
              }
            />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">رقم الطلب</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">المستفيد</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">نوع الطلب</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">الوصف</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">المبلغ</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">الحالة</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">الأولوية</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">تاريخ التقديم</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow
                      key={request.id}
                      className={`cursor-pointer hover:bg-muted/50 ${
                        request.is_overdue ? 'bg-destructive/5' : ''
                      }`}
                    >
                      <TableCell className="font-mono font-medium text-xs sm:text-sm">
                        {request.request_number}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {request.beneficiary && 'full_name' in request.beneficiary 
                          ? request.beneficiary.full_name 
                          : '-'}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <Badge variant="outline" className="text-xs">
                          {request.request_type && 'name' in request.request_type 
                            ? request.request_type.name 
                            : '-'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-xs sm:text-sm">
                        {request.description}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {request.amount > 0
                          ? `${request.amount.toLocaleString('ar-SA')} ريال`
                          : '-'}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <Badge
                          variant={
                            request.priority === 'عاجل'
                              ? 'destructive'
                              : request.priority === 'مهم'
                              ? 'default'
                              : 'secondary'
                          }
                          className="text-xs"
                        >
                          {request.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs sm:text-sm">
                        {new Date(request.submitted_at).toLocaleDateString('ar-SA')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 sm:gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedRequest(request);
                              setApprovalDialogOpen(true);
                            }}
                            className="text-xs"
                          >
                            <GitBranch className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                            <span className="hidden sm:inline">مسار الموافقات</span>
                            <span className="sm:hidden">موافقات</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedRequest(request);
                              setCommentsDialogOpen(true);
                            }}
                            className="text-xs"
                          >
                            <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                            <span className="hidden sm:inline">التعليقات</span>
                            <span className="sm:hidden">تعليق</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request Approval Dialog */}
      {selectedRequest && (
        <>
          <RequestApprovalDialog
            open={approvalDialogOpen}
            onOpenChange={setApprovalDialogOpen}
            requestId={selectedRequest.id}
            requestType={selectedRequest.request_type && 'name' in selectedRequest.request_type 
              ? selectedRequest.request_type.name 
              : "طلب"}
            requestDescription={selectedRequest.description}
          />
          <RequestCommentsDialog
            open={commentsDialogOpen}
            onOpenChange={setCommentsDialogOpen}
            requestId={selectedRequest.id}
            requestNumber={selectedRequest.request_number}
          />
        </>
      )}
    </div>
  );
};

export default Requests;
