import { memo } from 'react';
import { GitBranch, MessageSquare, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingState } from '@/components/shared/LoadingState';
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
import { ExportButton } from '@/components/shared/ExportButton';
import { Pagination } from '@/components/shared/Pagination';
import { EnhancedEmptyState } from '@/components/shared';
import { SortableTableHeader } from '@/components/shared/SortableTableHeader';
import { BulkActionsBar } from '@/components/shared/BulkActionsBar';
import { getRequestTypeName, getBeneficiaryName } from '@/types/request.types';
import { RequestMobileCard } from '@/components/requests/RequestMobileCard';

// New modular components
import { RequestsStatsCards } from '@/components/requests/RequestsStatsCards';
import { RequestsFilters } from '@/components/requests/RequestsFilters';
import { RequestStatusBadge } from '@/components/requests/RequestStatusBadge';
import { useRequestsPage } from '@/hooks/useRequestsPage';

const Requests = memo(() => {
  const isMobile = useIsMobile();
  const {
    filteredRequests,
    paginatedRequests,
    stats,
    isLoading,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    handleItemsPerPageChange,
    totalPages,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    advancedFilters,
    setAdvancedFilters,
    sortConfig,
    handleSort,
    bulkSelection,
    handleBulkDelete,
    handleBulkExport,
    selectedRequest,
    setSelectedRequest,
    approvalDialogOpen,
    setApprovalDialogOpen,
    commentsDialogOpen,
    setCommentsDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    requestToDelete,
    handleDeleteClick,
    handleDeleteConfirm,
    deleteRequest,
  } = useRequestsPage();

  const {
    selectedCount,
    isSelected,
    isAllSelected,
    toggleSelection,
    toggleAll,
  } = bulkSelection;

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

        {/* Stats Cards - Modular Component */}
        <RequestsStatsCards stats={stats} />

        {/* Filters - Modular Component */}
        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">البحث والتصفية</CardTitle>
            <CardDescription className="text-xs sm:text-sm">ابحث عن طلب أو صفي حسب الحالة</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <RequestsFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              advancedFilters={advancedFilters}
              onAdvancedFiltersChange={setAdvancedFilters}
            />
          </CardContent>
        </Card>

        {/* Bulk Actions Bar */}
        {selectedCount > 0 && (
          <BulkActionsBar
            selectedCount={selectedCount}
            onDelete={handleBulkDelete}
            onExport={handleBulkExport}
            onClearSelection={bulkSelection.clearSelection}
          />
        )}

        {/* Requests - Mobile or Desktop */}
        {isMobile ? (
          <MobileView
            paginatedRequests={paginatedRequests}
            filteredRequests={filteredRequests}
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            setSelectedRequest={setSelectedRequest}
            setApprovalDialogOpen={setApprovalDialogOpen}
            setCommentsDialogOpen={setCommentsDialogOpen}
            handleDeleteClick={handleDeleteClick}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
          />
        ) : (
          <DesktopView
            paginatedRequests={paginatedRequests}
            filteredRequests={filteredRequests}
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            isAllSelected={isAllSelected}
            toggleAll={toggleAll}
            isSelected={isSelected}
            toggleSelection={toggleSelection}
            sortConfig={sortConfig}
            handleSort={handleSort}
            setSelectedRequest={setSelectedRequest}
            setApprovalDialogOpen={setApprovalDialogOpen}
            setCommentsDialogOpen={setCommentsDialogOpen}
            handleDeleteClick={handleDeleteClick}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            handleItemsPerPageChange={handleItemsPerPageChange}
          />
        )}

        {/* Dialogs */}
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
});

// Mobile View Component
const MobileView = memo(({ 
  paginatedRequests, 
  filteredRequests, 
  searchQuery, 
  statusFilter,
  setSelectedRequest,
  setApprovalDialogOpen,
  setCommentsDialogOpen,
  handleDeleteClick,
  currentPage,
  setCurrentPage,
  totalPages,
  itemsPerPage,
}: any) => (
  <div className="space-y-3">
    <Card className="shadow-soft">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-base">قائمة الطلبات ({filteredRequests.length})</CardTitle>
      </CardHeader>
    </Card>
    
    {paginatedRequests.length === 0 ? (
      <Card className="shadow-soft">
        <CardContent className="p-6 text-center text-muted-foreground">
          {searchQuery || statusFilter !== 'all'
            ? 'لا توجد نتائج مطابقة لبحثك'
            : 'لا توجد طلبات حالياً'}
        </CardContent>
      </Card>
    ) : (
      <>
        <div className="space-y-2">
          {paginatedRequests.map((request: any) => (
            <RequestMobileCard
              key={request.id}
              request={request}
              onViewDetails={(r: any) => {
                setSelectedRequest(r);
                setApprovalDialogOpen(true);
              }}
              onViewComments={(r: any) => {
                setSelectedRequest(r);
                setCommentsDialogOpen(true);
              }}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
        
        {totalPages > 1 && (
          <Card className="shadow-soft mt-3">
            <CardContent className="p-3">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredRequests.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </CardContent>
          </Card>
        )}
      </>
    )}
  </div>
));

// Desktop View Component
const DesktopView = memo(({
  paginatedRequests,
  filteredRequests,
  searchQuery,
  statusFilter,
  isAllSelected,
  toggleAll,
  isSelected,
  toggleSelection,
  sortConfig,
  handleSort,
  setSelectedRequest,
  setApprovalDialogOpen,
  setCommentsDialogOpen,
  handleDeleteClick,
  currentPage,
  setCurrentPage,
  totalPages,
  itemsPerPage,
  handleItemsPerPageChange,
}: any) => (
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
                {paginatedRequests.map((request: any) => (
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
                    <TableCell className="text-xs sm:text-sm">
                      <RequestStatusBadge status={request.status} />
                    </TableCell>
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
          </div>
          
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
      )}
    </CardContent>
  </Card>
));

Requests.displayName = 'Requests';
MobileView.displayName = 'MobileView';
DesktopView.displayName = 'DesktopView';

export default Requests;
