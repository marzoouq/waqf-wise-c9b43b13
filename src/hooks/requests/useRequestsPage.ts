import { useState, useMemo, useCallback } from 'react';
import { useRequests } from './useRequests';
import { useTableSort } from '@/hooks/ui/useTableSort';
import { useBulkSelection } from '@/hooks/ui/useBulkSelection';
import { useDeleteConfirmation } from '@/hooks/shared';
import { FiltersRecord } from '@/components/shared/AdvancedFiltersDialog';
import { toast } from 'sonner';
import type { FullRequest } from '@/types/request.types';
import { REQUEST_STATUS } from '@/lib/request-constants';

// Re-export for backwards compatibility
export type RequestData = FullRequest;

export function useRequestsPage() {
  const { requests, isLoading, error, refetch, deleteRequest } = useRequests();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [requestTypeFilter, setRequestTypeFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<FullRequest | null>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<FullRequest | null>(null);
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
        request.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.request_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (request.beneficiary && 'full_name' in request.beneficiary && 
          request.beneficiary.full_name?.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      const matchesRequestType = requestTypeFilter === 'all' || request.request_type_id === requestTypeFilter;
      const matchesPriority = !advancedFilters.priority || request.priority === advancedFilters.priority;
      const matchesOverdue = advancedFilters.overdue === undefined || 
        (advancedFilters.overdue === 'true' ? request.is_overdue : !request.is_overdue);

      return matchesSearch && matchesStatus && matchesRequestType && matchesPriority && matchesOverdue;
    });
  }, [requests, searchQuery, statusFilter, requestTypeFilter, advancedFilters]);

  const { sortedData, sortConfig, handleSort } = useTableSort({
    data: filteredRequests,
    defaultSortKey: 'submitted_at',
    defaultDirection: 'desc',
  });

  const bulkSelection = useBulkSelection(sortedData);

  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // إحصائيات مُصحّحة لتتوافق مع الحالات الفعلية في قاعدة البيانات
  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter(r => r.status === REQUEST_STATUS.PENDING).length,
    inProgress: requests.filter(r => r.status === REQUEST_STATUS.IN_PROGRESS).length,
    approved: requests.filter(r => r.status === REQUEST_STATUS.APPROVED || r.status === REQUEST_STATUS.COMPLETED).length,
    rejected: requests.filter(r => r.status === REQUEST_STATUS.REJECTED).length,
    overdue: requests.filter(r => r.is_overdue).length,
  }), [requests]);

  const bulkDeleteConfirmation = useDeleteConfirmation<string[]>({
    onDelete: async (ids) => {
      await Promise.all(ids.map(id => deleteRequest.mutateAsync(id)));
      bulkSelection.clearSelection();
    },
    successMessage: `تم حذف ${bulkSelection.selectedCount} طلب بنجاح`,
    errorMessage: 'فشل حذف بعض الطلبات',
    title: 'حذف الطلبات',
    description: `هل تريد حذف ${bulkSelection.selectedCount} طلب؟`,
  });

  const handleDeleteClick = (request: FullRequest) => {
    setRequestToDelete(request);
    setDeleteDialogOpen(true);
  };

  const handleBulkDelete = () => {
    if (bulkSelection.selectedCount === 0) return;
    bulkDeleteConfirmation.confirmDelete(bulkSelection.selectedIds);
  };

  const handleBulkExport = () => {
    toast.success(`جاري تصدير ${bulkSelection.selectedCount} طلب...`);
  };

  const handleDeleteConfirm = () => {
    if (requestToDelete) {
      deleteRequest.mutate(requestToDelete.id);
      setDeleteDialogOpen(false);
      setRequestToDelete(null);
    }
  };

  const handleViewDetails = useCallback((request: FullRequest) => {
    setSelectedRequest(request);
    setDetailsDialogOpen(true);
  }, []);

  const handleOpenCreateDialog = useCallback(() => {
    setCreateDialogOpen(true);
  }, []);

  return {
    // Data
    requests,
    filteredRequests,
    paginatedRequests,
    sortedData,
    stats,
    isLoading,
    error,
    refetch,
    deleteRequest,
    
    // Pagination
    currentPage,
    setCurrentPage,
    itemsPerPage,
    handleItemsPerPageChange,
    totalPages,
    
    // Filters
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    requestTypeFilter,
    setRequestTypeFilter,
    advancedFilters,
    setAdvancedFilters,
    
    // Sorting
    sortConfig,
    handleSort,
    
    // Bulk Selection
    bulkSelection,
    handleBulkDelete,
    handleBulkExport,
    bulkDeleteConfirmation,
    
    // Dialog States
    selectedRequest,
    setSelectedRequest,
    approvalDialogOpen,
    setApprovalDialogOpen,
    commentsDialogOpen,
    setCommentsDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    detailsDialogOpen,
    setDetailsDialogOpen,
    createDialogOpen,
    setCreateDialogOpen,
    handleOpenCreateDialog,
    requestToDelete,
    handleDeleteClick,
    handleDeleteConfirm,
    handleViewDetails,
  };
}
