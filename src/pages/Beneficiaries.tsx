import { useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Beneficiary } from "@/types/beneficiary";
import { useBeneficiaries } from "@/hooks/beneficiary/useBeneficiaries";
import { useSavedSearches } from "@/hooks/ui/useSavedSearches";
import { useBeneficiariesFilters } from "@/hooks/beneficiary/useBeneficiariesFilters";
import { useBeneficiariesPageState } from "@/hooks/beneficiary/useBeneficiariesPageState";
import { SearchCriteria } from "@/components/beneficiary/admin/AdvancedSearchDialog";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { MobileOptimizedLayout } from "@/components/layout/MobileOptimizedLayout";
import {
  BeneficiariesHeader,
  BeneficiariesSearchBar,
  BeneficiariesStats,
  BeneficiariesTable,
} from "@/components/beneficiary/admin/list";
import { BeneficiariesDialogs } from "@/components/beneficiary/admin/BeneficiariesDialogs";
import { PAGINATION } from "@/lib/constants";
import { useDeleteConfirmation } from "@/hooks/shared";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";

const ITEMS_PER_PAGE = PAGINATION.BENEFICIARIES_PAGE_SIZE;

const Beneficiaries = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // ✅ استخدام Hook موحد لإدارة حالة الصفحة
  const {
    searchQuery,
    setSearchQuery,
    dialogOpen,
    setDialogOpen,
    advancedSearchOpen,
    setAdvancedSearchOpen,
    attachmentsDialogOpen,
    setAttachmentsDialogOpen,
    activityLogDialogOpen,
    setActivityLogDialogOpen,
    enableLoginDialogOpen,
    setEnableLoginDialogOpen,
    tribeManagementDialogOpen,
    setTribeManagementDialogOpen,
    selectedBeneficiary,
    setSelectedBeneficiary,
    currentPage,
    setCurrentPage,
    advancedCriteria,
    setAdvancedCriteria,
  } = useBeneficiariesPageState();

  const { beneficiaries, totalCount, isLoading, addBeneficiary, updateBeneficiary, deleteBeneficiary } = useBeneficiaries();
  const { searches } = useSavedSearches();
  
  const { filteredBeneficiaries, stats } = useBeneficiariesFilters(
    beneficiaries,
    searchQuery,
    advancedCriteria
  );

  const {
    confirmDelete,
    isOpen: isDeleteOpen,
    isDeleting,
    executeDelete,
    onOpenChange: onDeleteOpenChange,
    itemName,
    dialogTitle,
    dialogDescription,
  } = useDeleteConfirmation<string>({
    onDelete: async (id) => {
      await deleteBeneficiary(id);
    },
    successMessage: 'تم حذف المستفيد بنجاح',
    errorMessage: 'فشل حذف المستفيد',
    title: 'حذف المستفيد',
    description: 'هل أنت متأكد من حذف هذا المستفيد؟',
  });

  const paginatedBeneficiaries = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredBeneficiaries.slice(startIndex, endIndex);
  }, [filteredBeneficiaries, currentPage]);

  const totalPages = Math.ceil(filteredBeneficiaries.length / ITEMS_PER_PAGE);

  const handleAddBeneficiary = useCallback(() => {
    setSelectedBeneficiary(null);
    setDialogOpen(true);
  }, [setSelectedBeneficiary, setDialogOpen]);

  const handleEditBeneficiary = useCallback((beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setDialogOpen(true);
  }, [setSelectedBeneficiary, setDialogOpen]);

  const handleSaveBeneficiary = async (data: Omit<Beneficiary, 'id' | 'created_at' | 'updated_at'>) => {
    if (selectedBeneficiary) {
      await updateBeneficiary({ id: selectedBeneficiary.id, ...data });
    } else {
      await addBeneficiary(data);
    }
    setDialogOpen(false);
  };

  const handleDeleteBeneficiary = useCallback((id: string) => {
    confirmDelete(id);
  }, [confirmDelete]);

  const handleAdvancedSearch = (criteria: SearchCriteria) => {
    setAdvancedCriteria(criteria);
  };

  const handleLoadSavedSearch = (search: { search_criteria: unknown }) => {
    setAdvancedCriteria(search.search_criteria as SearchCriteria);
  };

  return (
    <PageErrorBoundary pageName="المستفيدون">
      <MobileOptimizedLayout>
          <BeneficiariesHeader
            filteredBeneficiaries={filteredBeneficiaries}
            onAddBeneficiary={handleAddBeneficiary}
            onImportSuccess={() => queryClient.invalidateQueries({ queryKey: ['beneficiaries'] })}
          />

          <BeneficiariesSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAdvancedSearchClick={() => setAdvancedSearchOpen(true)}
            onTribeManagementClick={() => setTribeManagementDialogOpen(true)}
            savedSearches={searches}
            onLoadSearch={handleLoadSavedSearch}
          />

          <BeneficiariesStats
            total={stats.total}
            active={stats.active}
            suspended={stats.suspended}
            families={stats.families}
          />

          <BeneficiariesTable
            beneficiaries={paginatedBeneficiaries}
            isLoading={isLoading}
            searchQuery={searchQuery}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredBeneficiaries.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
            onViewProfile={(b) => navigate(`/beneficiaries/${b.id}`)}
            onEdit={handleEditBeneficiary}
            onViewAttachments={(b) => { setSelectedBeneficiary(b); setAttachmentsDialogOpen(true); }}
            onViewActivity={(b) => { setSelectedBeneficiary(b); setActivityLogDialogOpen(true); }}
            onEnableLogin={(b) => { setSelectedBeneficiary(b); setEnableLoginDialogOpen(true); }}
            onDelete={handleDeleteBeneficiary}
          />

          <BeneficiariesDialogs
            dialogOpen={dialogOpen}
            setDialogOpen={setDialogOpen}
            advancedSearchOpen={advancedSearchOpen}
            setAdvancedSearchOpen={setAdvancedSearchOpen}
            attachmentsDialogOpen={attachmentsDialogOpen}
            setAttachmentsDialogOpen={setAttachmentsDialogOpen}
            activityLogDialogOpen={activityLogDialogOpen}
            setActivityLogDialogOpen={setActivityLogDialogOpen}
            enableLoginDialogOpen={enableLoginDialogOpen}
            setEnableLoginDialogOpen={setEnableLoginDialogOpen}
            tribeManagementDialogOpen={tribeManagementDialogOpen}
            setTribeManagementDialogOpen={setTribeManagementDialogOpen}
            selectedBeneficiary={selectedBeneficiary}
            onSaveBeneficiary={handleSaveBeneficiary}
            onAdvancedSearch={handleAdvancedSearch}
            onSuccessCallback={() => queryClient.invalidateQueries({ queryKey: ["beneficiaries"] })}
          />

          <DeleteConfirmDialog
            open={isDeleteOpen}
            onOpenChange={onDeleteOpenChange}
            onConfirm={executeDelete}
            title={dialogTitle}
            description={dialogDescription}
            itemName={itemName}
            isLoading={isDeleting}
            isDestructive={true}
          />
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
};

export default Beneficiaries;
