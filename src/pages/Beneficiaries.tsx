import { useState, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Beneficiary } from "@/types/beneficiary";
import { useBeneficiaries } from "@/hooks/useBeneficiaries";
import { useSavedSearches } from "@/hooks/useSavedSearches";
import { useBeneficiariesFilters } from "@/hooks/useBeneficiariesFilters";
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

const ITEMS_PER_PAGE = PAGINATION.BENEFICIARIES_PAGE_SIZE;

const Beneficiaries = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
  const [attachmentsDialogOpen, setAttachmentsDialogOpen] = useState(false);
  const [activityLogDialogOpen, setActivityLogDialogOpen] = useState(false);
  const [enableLoginDialogOpen, setEnableLoginDialogOpen] = useState(false);
  const [tribeManagementDialogOpen, setTribeManagementDialogOpen] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [advancedCriteria, setAdvancedCriteria] = useState<SearchCriteria>({});

  const { beneficiaries, totalCount, isLoading, addBeneficiary, updateBeneficiary, deleteBeneficiary } = useBeneficiaries();
  const { searches } = useSavedSearches();
  
  const { filteredBeneficiaries, stats } = useBeneficiariesFilters(
    beneficiaries,
    searchQuery,
    advancedCriteria
  );

  const paginatedBeneficiaries = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredBeneficiaries.slice(startIndex, endIndex);
  }, [filteredBeneficiaries, currentPage]);

  const totalPages = Math.ceil(filteredBeneficiaries.length / ITEMS_PER_PAGE);

  const handleAddBeneficiary = useCallback(() => {
    setSelectedBeneficiary(null);
    setDialogOpen(true);
  }, []);

  const handleEditBeneficiary = useCallback((beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setDialogOpen(true);
  }, []);

  const handleSaveBeneficiary = async (data: Omit<Beneficiary, 'id' | 'created_at' | 'updated_at'>) => {
    if (selectedBeneficiary) {
      await updateBeneficiary({ id: selectedBeneficiary.id, ...data });
    } else {
      await addBeneficiary(data);
    }
    setDialogOpen(false);
  };

  const handleDeleteBeneficiary = useCallback(async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المستفيد؟")) {
      await deleteBeneficiary(id);
    }
  }, [deleteBeneficiary]);

  const handleAdvancedSearch = (criteria: SearchCriteria) => {
    setAdvancedCriteria(criteria);
    setCurrentPage(1);
  };

  const handleLoadSavedSearch = (search: { search_criteria: unknown }) => {
    setAdvancedCriteria(search.search_criteria as SearchCriteria);
    setCurrentPage(1);
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
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
};

export default Beneficiaries;
