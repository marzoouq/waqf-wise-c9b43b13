import { useState, useMemo, useCallback } from 'react';
import { Search, Filter, Clock, CheckCircle, XCircle, AlertCircle, GitBranch, MessageSquare, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useRequests } from '@/hooks/useRequests';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { RequestApprovalDialog } from '@/components/requests/RequestApprovalDialog';
import { RequestCommentsDialog } from '@/components/requests/RequestCommentsDialog';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
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
import { ExportButton } from '@/components/shared/ExportButton';
import { PrintButton } from '@/components/shared/PrintButton';
import { Pagination } from '@/components/shared/Pagination';
import { EnhancedEmptyState } from '@/components/shared/EnhancedEmptyState';
import { PAGINATION } from '@/lib/constants';
import { SortableTableHeader, SortDirection } from '@/components/shared/SortableTableHeader';
import { BulkActionsBar } from '@/components/shared/BulkActionsBar';
import { AdvancedFiltersDialog, FilterConfig, FiltersRecord } from '@/components/shared/AdvancedFiltersDialog';
import { useTableSort } from '@/hooks/useTableSort';
import { useBulkSelection } from '@/hooks/useBulkSelection';
import { toast } from 'sonner';
import { getRequestTypeName, getBeneficiaryName } from '@/types/request.types';

// Type for request data from the hook (with partial relations)
interface RequestData {
  id: string;
  request_number: string;
  beneficiary_id: string;
  description: string;
  amount: number;
  status: string;
  priority: string;
  is_overdue: boolean;
  submitted_at: string;
  request_type?: { name_ar?: string; description?: string; name?: string } | null;
  beneficiary?: { full_name?: string } | null;
  [key: string]: unknown;
}

const Requests = () => {
  const { requests, isLoading, deleteRequest } = useRequests();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<RequestData | null>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<RequestData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);
  const [advancedFilters, setAdvancedFilters] = useState<FiltersRecord>({});
  
  const handleItemsPerPageChange = useCallback((items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
    const matchesSearch = 
      request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.request_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (request.beneficiary && 'full_name' in request.beneficiary && 
        request.beneficiary.full_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesPriority = !advancedFilters.priority || request.priority === advancedFilters.priority;
    const matchesOverdue = advancedFilters.overdue === undefined || 
      (advancedFilters.overdue === 'true' ? request.is_overdue : !request.is_overdue);

    return matchesSearch && matchesStatus && matchesPriority && matchesOverdue;
    });
  }, [requests, searchQuery, statusFilter, advancedFilters]);

  const { sortedData, sortConfig, handleSort } = useTableSort({
    data: filteredRequests,
    defaultSortKey: 'submitted_at',
    defaultDirection: 'desc',
  });

  const {
    selectedIds,
    selectedCount,
    isSelected,
    isAllSelected,
    toggleSelection,
    toggleAll,
    clearSelection,
  } = useBulkSelection(sortedData);

  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const filterConfigs: FilterConfig[] = [
    {
      key: 'priority',
      label: 'الأولوية',
      type: 'select',
      options: [
        { value: 'عادي', label: 'عادي' },
        { value: 'مهم', label: 'مهم' },
        { value: 'عاجل', label: 'عاجل' },
      ],
    },
    {
      key: 'overdue',
      label: 'متأخر',
      type: 'select',
      options: [
        { value: 'true', label: 'نعم' },
        { value: 'false', label: 'لا' },
      ],
    },
  ];

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'معلق').length,
    inProgress: requests.filter(r => r.status === 'قيد المعالجة').length,
    approved: requests.filter(r => r.status === 'موافق').length,
    rejected: requests.filter(r => r.status === 'مرفوض').length,
    overdue: requests.filter(r => r.is_overdue).length,
  };

  const handleDeleteClick = (request: RequestData) => {
    setRequestToDelete(request);
    setDeleteDialogOpen(true);
  };

  const handleBulkDelete = async () => {
    if (selectedCount === 0) return;
    
    const confirmed = window.confirm(`هل تريد حذف ${selectedCount} طلب؟`);
    if (!confirmed) return;

    try {
      await Promise.all(selectedIds.map(id => deleteRequest.mutateAsync(id)));
      toast.success(`تم حذف ${selectedCount} طلب بنجاح`);
      clearSelection();
    } catch (error) {
      toast.error('فشل حذف بعض الطلبات');
    }
  };

  const handleBulkExport = () => {
    const selectedRequests = requests.filter(r => selectedIds.includes(r.id));
    toast.success(`جاري تصدير ${selectedCount} طلب...`);
  };

  const handleDeleteConfirm = () => {
    if (requestToDelete) {
      deleteRequest.mutate(requestToDelete.id);
      setDeleteDialogOpen(false);
      setRequestToDelete(null);
    }
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
    <PageErrorBoundary pageName="الطلبات">
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">إدارة الطلبات</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-xs sm:text-sm">
            عرض ومعالجة طلبات المستفيدين
          </p>
        </div>
        {filteredRequests.length > 0 && (
          <ExportButton
            data={filteredRequests.map(r => ({
              'رقم الطلب': r.request_number,
              'المستفيد': getBeneficiaryName(r),
              'نوع الطلب': getRequestTypeName(r),
              'الوصف': r.description,
              'المبلغ': r.amount ? `${r.amount.toLocaleString()} ر.س` : '-',
              'الحالة': r.status,
              'تاريخ التقديم': r.submitted_at ? format(new Date(r.submitted_at), 'yyyy/MM/dd', { locale: ar }) : '-',
            }))}
            filename="الطلبات"
            title="تقرير الطلبات"
            headers={['رقم الطلب', 'المستفيد', 'نوع الطلب', 'الوصف', 'المبلغ', 'الحالة', 'تاريخ التقديم']}
          />
        )}
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
            <AdvancedFiltersDialog
              filters={filterConfigs}
              activeFilters={advancedFilters}
              onApplyFilters={setAdvancedFilters}
              onClearFilters={() => setAdvancedFilters({})}
            />
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
          {paginatedRequests.length === 0 ? (
            <EnhancedEmptyState
              icon={AlertCircle}
              title="لا توجد طلبات"
              description={
                searchQuery || statusFilter !== 'all'
                  ? 'لا توجد نتائج مطابقة لبحثك. جرب تغيير معايير البحث أو الفلتر.'
                  : 'لم يتم تقديم أي طلبات بعد. سيتم عرض الطلبات هنا عند تقديمها من المستفيدين.'
              }
            />
          ) : (
            <div className="space-y-4">
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={toggleAll}
                        aria-label="تحديد الكل"
                      />
                    </TableHead>
                    <SortableTableHeader
                      label="رقم الطلب"
                      sortKey="request_number"
                      currentSort={sortConfig}
                      onSort={handleSort}
                      className="text-xs sm:text-sm whitespace-nowrap"
                    />
                    <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">المستفيد</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">نوع الطلب</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">الوصف</TableHead>
                    <SortableTableHeader
                      label="المبلغ"
                      sortKey="amount"
                      currentSort={sortConfig}
                      onSort={handleSort}
                      className="hidden md:table-cell text-xs sm:text-sm whitespace-nowrap"
                    />
                    <SortableTableHeader
                      label="الحالة"
                      sortKey="status"
                      currentSort={sortConfig}
                      onSort={handleSort}
                      className="text-xs sm:text-sm whitespace-nowrap"
                    />
                    <SortableTableHeader
                      label="الأولوية"
                      sortKey="priority"
                      currentSort={sortConfig}
                      onSort={handleSort}
                      className="hidden lg:table-cell text-xs sm:text-sm whitespace-nowrap"
                    />
                    <SortableTableHeader
                      label="تاريخ التقديم"
                      sortKey="submitted_at"
                      currentSort={sortConfig}
                      onSort={handleSort}
                      className="hidden lg:table-cell text-xs sm:text-sm whitespace-nowrap"
                    />
                    <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRequests.map((request) => (
                    <TableRow
                      key={request.id}
                      className={`cursor-pointer hover:bg-muted/50 ${
                        request.is_overdue ? 'bg-destructive/5' : ''
                      }`}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected(request.id)}
                          onCheckedChange={() => toggleSelection(request.id)}
                          aria-label={`تحديد ${request.request_number}`}
                        />
                      </TableCell>
                      <TableCell className="font-mono font-medium text-xs sm:text-sm">
                        {request.request_number}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {request.beneficiary && 'full_name' in request.beneficiary 
                          ? request.beneficiary.full_name 
                          : '-'}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm hidden md:table-cell">
                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                          {getRequestTypeName(request)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-xs sm:text-sm hidden lg:table-cell">
                        {request.description}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm hidden md:table-cell whitespace-nowrap">
                        {request.amount > 0
                          ? `${request.amount.toLocaleString('ar-SA')} ريال`
                          : '-'}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-xs sm:text-sm hidden lg:table-cell">
                        <Badge
                          variant={
                            request.priority === 'عاجل'
                              ? 'destructive'
                              : request.priority === 'مهم'
                              ? 'default'
                              : 'secondary'
                          }
                          className="text-xs whitespace-nowrap"
                        >
                          {request.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs sm:text-sm hidden lg:table-cell whitespace-nowrap">
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
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteClick(request)}
                            className="text-xs text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                            <span className="hidden sm:inline">حذف</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              <div className="mt-4 pt-4 border-t">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredRequests.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </div>
            </div>
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
      
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="حذف الطلب"
        description="هل أنت متأكد من حذف هذا الطلب؟"
        itemName={requestToDelete ? `${requestToDelete.request_number} - ${requestToDelete.description}` : ""}
        isLoading={deleteRequest.isPending}
        />
      </div>
    </PageErrorBoundary>
  );
};

export default Requests;
