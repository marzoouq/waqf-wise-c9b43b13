import { useState, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Beneficiary } from "@/types/beneficiary";
import { useBeneficiaries } from "@/hooks/useBeneficiaries";
import { useSavedSearches } from "@/hooks/useSavedSearches";
import { useBeneficiariesFilters } from "@/hooks/useBeneficiariesFilters";
import BeneficiaryDialog from "@/components/beneficiaries/BeneficiaryDialog";
import { AdvancedSearchDialog, SearchCriteria } from "@/components/beneficiaries/AdvancedSearchDialog";
import { AttachmentsDialog } from "@/components/beneficiaries/AttachmentsDialog";
import { ActivityLogDialog } from "@/components/beneficiaries/ActivityLogDialog";
import { EnableLoginDialog } from "@/components/beneficiaries/EnableLoginDialog";
import { TribeManagementDialog } from "@/components/beneficiaries/TribeManagementDialog";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import {
  BeneficiariesHeader,
  BeneficiariesSearchBar,
  BeneficiariesStats,
  BeneficiariesTable,
} from "@/components/beneficiaries/list";
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
  
  // Use custom hook for filtering
  const { filteredBeneficiaries, stats } = useBeneficiariesFilters(
    beneficiaries,
    searchQuery,
    advancedCriteria
  );

  // Paginate filtered results
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
    try {
      if (selectedBeneficiary) {
        await updateBeneficiary({ id: selectedBeneficiary.id, ...data });
      } else {
        await addBeneficiary(data);
      }
      setDialogOpen(false);
    } catch (error) {
      // Error is handled by the mutation's onError callback
    }
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

  const handleViewProfile = (beneficiary: Beneficiary) => {
    navigate(`/beneficiaries/${beneficiary.id}`);
  };

  const handleViewAttachments = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setAttachmentsDialogOpen(true);
  };

  const handleViewActivity = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setActivityLogDialogOpen(true);
  };

  const handleLoadSavedSearch = (search: { search_criteria: unknown }) => {
    setAdvancedCriteria(search.search_criteria as SearchCriteria);
    setCurrentPage(1);
  };

  const handleEnableLogin = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setEnableLoginDialogOpen(true);
  };

  return (
    <PageErrorBoundary pageName="المستفيدون">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 md:p-8 lg:p-10 space-y-6 md:space-y-8">
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
          onViewProfile={handleViewProfile}
          onEdit={handleEditBeneficiary}
          onViewAttachments={handleViewAttachments}
          onViewActivity={handleViewActivity}
          onEnableLogin={handleEnableLogin}
          onDelete={handleDeleteBeneficiary}
        />

        {/* Beneficiary Dialog */}
        <BeneficiaryDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          beneficiary={selectedBeneficiary}
          onSave={handleSaveBeneficiary}
        />
        
        <AdvancedSearchDialog
          open={advancedSearchOpen}
          onOpenChange={setAdvancedSearchOpen}
          onSearch={handleAdvancedSearch}
        />

        {selectedBeneficiary && (
          <>
            <AttachmentsDialog
              open={attachmentsDialogOpen}
              onOpenChange={setAttachmentsDialogOpen}
              beneficiaryId={selectedBeneficiary.id}
              beneficiaryName={selectedBeneficiary.full_name}
            />

            <ActivityLogDialog
              open={activityLogDialogOpen}
              onOpenChange={setActivityLogDialogOpen}
              beneficiaryId={selectedBeneficiary.id}
              beneficiaryName={selectedBeneficiary.full_name}
            />

            <EnableLoginDialog
              open={enableLoginDialogOpen}
              onOpenChange={setEnableLoginDialogOpen}
              beneficiary={selectedBeneficiary}
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ["beneficiaries"] });
              }}
            />
            
            <TribeManagementDialog
              open={tribeManagementDialogOpen}
              onOpenChange={setTribeManagementDialogOpen}
            />
          </>
        )}
        </div>
      </div>
    </PageErrorBoundary>
  );
};

export default Beneficiaries;
