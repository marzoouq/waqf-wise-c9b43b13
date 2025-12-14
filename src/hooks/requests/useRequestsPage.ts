import { useState, useMemo, useCallback } from 'react';
import { useRequests } from './useRequests';
import { useTableSort } from '@/hooks/ui/useTableSort';
import { useBulkSelection } from '@/hooks/ui/useBulkSelection';
import { FiltersRecord } from '@/components/shared/AdvancedFiltersDialog';
import { toast } from 'sonner';
import type { FullRequest } from '@/types/request.types';

// Re-export for backwards compatibility
export type RequestData = FullRequest;

export function useRequestsPage() {
  const { requests, isLoading, error, refetch, deleteRequest } = useRequests();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<FullRequest | null>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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

  const bulkSelection = useBulkSelection(sortedData);

  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'معلق').length,
    inProgress: requests.filter(r => r.status === 'قيد المعالجة').length,
    approved: requests.filter(r => r.status === 'موافق').length,
    rejected: requests.filter(r => r.status === 'مرفوض').length,
    overdue: requests.filter(r => r.is_overdue).length,
  };

  const handleDeleteClick = (request: FullRequest) => {
    setRequestToDelete(request);
    setDeleteDialogOpen(true);
  };

  const handleBulkDelete = async () => {
    if (bulkSelection.selectedCount === 0) return;
    
    const confirmed = window.confirm(`هل تريد حذف ${bulkSelection.selectedCount} طلب؟`);
    if (!confirmed) return;

    try {
      await Promise.all(bulkSelection.selectedIds.map(id => deleteRequest.mutateAsync(id)));
      toast.success(`تم حذف ${bulkSelection.selectedCount} طلب بنجاح`);
      bulkSelection.clearSelection();
    } catch (error) {
      toast.error('فشل حذف بعض الطلبات');
    }
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
    advancedFilters,
    setAdvancedFilters,
    
    // Sorting
    sortConfig,
    handleSort,
    
    // Bulk Selection
    bulkSelection,
    handleBulkDelete,
    handleBulkExport,
    
    // Dialog States
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
  };
}
