/**
 * Requests Management Page
 * صفحة إدارة الطلبات - مُحسّنة ومقسّمة
 */
import { memo } from 'react';
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { ExportButton } from '@/components/shared/ExportButton';
import { BulkActionsBar } from '@/components/shared/BulkActionsBar';
import { getRequestTypeName, getBeneficiaryName } from '@/types/request.types';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

// Modular Components
import { RequestsStatsCards } from '@/components/requests/RequestsStatsCards';
import { RequestsFilters } from '@/components/requests/RequestsFilters';
import { RequestsDesktopView } from '@/components/requests/RequestsDesktopView';
import { RequestsMobileView } from '@/components/requests/RequestsMobileView';
import { RequestsDialogs } from '@/components/requests/RequestsDialogs';
import { useRequestsPage } from '@/hooks/useRequestsPage';

const Requests = memo(() => {
  const isMobile = useIsMobile();
  const {
    filteredRequests,
    paginatedRequests,
    stats,
    isLoading,
    error,
    refetch,
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

  if (error) {
    return (
      <ErrorState 
        title="فشل تحميل الطلبات" 
        message="حدث خطأ أثناء تحميل طلبات المستفيدين"
        onRetry={refetch}
        fullScreen
      />
    );
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
        <RequestsStatsCards stats={stats} />

        {/* Filters */}
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

        {/* Requests View - Mobile or Desktop */}
        {isMobile ? (
          <RequestsMobileView
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
          <RequestsDesktopView
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
        <RequestsDialogs
          selectedRequest={selectedRequest}
          approvalDialogOpen={approvalDialogOpen}
          setApprovalDialogOpen={setApprovalDialogOpen}
          commentsDialogOpen={commentsDialogOpen}
          setCommentsDialogOpen={setCommentsDialogOpen}
          deleteDialogOpen={deleteDialogOpen}
          setDeleteDialogOpen={setDeleteDialogOpen}
          requestToDelete={requestToDelete}
          handleDeleteConfirm={handleDeleteConfirm}
          isDeleting={deleteRequest.isPending}
        />
      </div>
    </PageErrorBoundary>
  );
});

Requests.displayName = 'Requests';

export default Requests;
