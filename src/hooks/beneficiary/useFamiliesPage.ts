import { useState, useMemo, useCallback } from 'react';
import { useFamilies } from './useFamilies';
import { useTableSort } from '@/hooks/ui/useTableSort';
import { useBulkSelection } from '@/hooks/ui/useBulkSelection';
import { Family } from '@/types';
import { toast } from 'sonner';
import type { FiltersRecord } from '@/components/shared/AdvancedFiltersDialog';

export type FamilyWithHead = Family & {
  head_of_family?: {
    full_name: string;
  };
};

export function useFamiliesPage() {
  const { families, isLoading, error, refetch, addFamily, updateFamily, deleteFamily } = useFamilies();
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [familyToDelete, setFamilyToDelete] = useState<Family | null>(null);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [selectedFamilyForMembers, setSelectedFamilyForMembers] = useState<Family | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);
  const [advancedFilters, setAdvancedFilters] = useState<FiltersRecord>({});

  const handleItemsPerPageChange = useCallback((items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  }, []);

  const filteredFamilies = useMemo(() => {
    return families.filter(family => {
      const matchesSearch = 
        family.family_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        family.tribe?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = !advancedFilters.status || family.status === advancedFilters.status;
      const matchesTribe = !advancedFilters.tribe || family.tribe === advancedFilters.tribe;
      
      return matchesSearch && matchesStatus && matchesTribe;
    });
  }, [families, searchQuery, advancedFilters]);

  const { sortedData, sortConfig, handleSort } = useTableSort({
    data: filteredFamilies,
    defaultSortKey: 'family_name',
    defaultDirection: 'asc',
  });

  const bulkSelection = useBulkSelection(sortedData);

  const paginatedFamilies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const stats = {
    total: families.length,
    active: families.filter(f => f.status === 'نشط' || f.status === 'active').length,
    totalMembers: families.reduce((sum, f) => sum + f.total_members, 0),
  };

  const handleAddFamily = () => {
    setSelectedFamily(null);
    setDialogOpen(true);
  };

  const handleEditFamily = (family: Family) => {
    setSelectedFamily(family);
    setDialogOpen(true);
  };

  const handleDeleteClick = (family: Family) => {
    setFamilyToDelete(family);
    setDeleteDialogOpen(true);
  };

  const handleViewMembers = (family: Family) => {
    setSelectedFamilyForMembers(family);
    setMembersDialogOpen(true);
  };

  const handleBulkDelete = async () => {
    if (bulkSelection.selectedCount === 0) return;
    
    const confirmed = window.confirm(`هل تريد حذف ${bulkSelection.selectedCount} عائلة؟`);
    if (!confirmed) return;

    try {
      await Promise.all(bulkSelection.selectedIds.map(id => deleteFamily.mutateAsync(id)));
      toast.success(`تم حذف ${bulkSelection.selectedCount} عائلة بنجاح`);
      bulkSelection.clearSelection();
    } catch (error) {
      toast.error('فشل حذف بعض العائلات');
    }
  };

  const handleBulkExport = () => {
    toast.success(`جاري تصدير ${bulkSelection.selectedCount} عائلة...`);
  };

  const handleDeleteConfirm = async () => {
    if (familyToDelete) {
      deleteFamily.mutate(familyToDelete.id, {
        onSuccess: () => {
          toast.success('تم حذف العائلة بنجاح');
          setDeleteDialogOpen(false);
          setFamilyToDelete(null);
        },
        onError: () => {
          toast.error('فشل حذف العائلة');
        }
      });
    }
  };

  const handleSaveFamily = async (data: Partial<Family>) => {
    if (selectedFamily) {
      updateFamily.mutate({ id: selectedFamily.id, updates: data }, {
        onSuccess: () => {
          toast.success('تم تحديث بيانات العائلة بنجاح');
          setDialogOpen(false);
          setSelectedFamily(null);
        },
        onError: () => {
          toast.error('فشل تحديث العائلة');
        }
      });
    } else {
      addFamily.mutate(data as Omit<Family, "created_at" | "id" | "total_members" | "updated_at">, {
        onSuccess: () => {
          toast.success('تم إضافة العائلة بنجاح');
          setDialogOpen(false);
          setSelectedFamily(null);
        },
        onError: () => {
          toast.error('فشل إضافة العائلة');
        }
      });
    }
  };

  return {
    // Data
    families,
    filteredFamilies,
    paginatedFamilies,
    sortedData,
    stats,
    isLoading,
    error,
    refetch,
    
    // Pagination
    currentPage,
    setCurrentPage,
    itemsPerPage,
    handleItemsPerPageChange,
    totalPages,
    
    // Filters
    searchQuery,
    setSearchQuery,
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
    dialogOpen,
    setDialogOpen,
    selectedFamily,
    deleteDialogOpen,
    setDeleteDialogOpen,
    familyToDelete,
    membersDialogOpen,
    setMembersDialogOpen,
    selectedFamilyForMembers,
    
    // Handlers
    handleAddFamily,
    handleEditFamily,
    handleDeleteClick,
    handleViewMembers,
    handleDeleteConfirm,
    handleSaveFamily,
  };
}
