import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { useContractsPaginated } from "@/hooks/property/useContractsPaginated";
import { useBulkSelection } from "@/hooks/ui/useBulkSelection";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { format, arLocale as ar } from "@/lib/date";
import { type Contract } from "@/hooks/property/useContracts";
import { ExportButton } from "@/components/shared/ExportButton";
import { BulkActionsBar } from "@/components/shared/BulkActionsBar";
import { usePrint } from "@/hooks/ui/usePrint";
import { ContractPrintTemplate } from "@/components/contracts/ContractPrintTemplate";
import { ContractStatusBadge } from "@/components/contracts/ContractStatusBadge";
import { ContractExpiryAlert } from "@/components/contracts/ContractExpiryAlert";
import { ContractActionsMenu } from "@/components/contracts/ContractActionsMenu";
import { UnitHandoverDialog } from "@/components/contracts/UnitHandoverDialog";
import { ContractNotificationDialog } from "@/components/contracts/ContractNotificationDialog";
import { CancelAutoRenewDialog } from "@/components/contracts/CancelAutoRenewDialog";
import { RentAdjustmentDialog } from "@/components/contracts/RentAdjustmentDialog";
import { UnilateralTerminationDialog } from "@/components/contracts/UnilateralTerminationDialog";
import { EarlyTerminationDialog } from "@/components/contracts/EarlyTerminationDialog";
import { UnifiedDataTable } from "@/components/unified/UnifiedDataTable";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { PAGE_SIZE_OPTIONS } from "@/lib/pagination.types";
import { useDeleteConfirmation } from "@/hooks/shared";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { AdvancedFiltersDialog, type FilterConfig, type FiltersRecord } from "@/components/shared/AdvancedFiltersDialog";
import { toast } from "sonner";

// تعريف الفلاتر
const contractsFilterConfigs: FilterConfig[] = [
  {
    key: 'status',
    label: 'حالة العقد',
    type: 'select',
    options: [
      { value: 'نشط', label: 'نشط' },
      { value: 'منتهي', label: 'منتهي' },
      { value: 'ملغي', label: 'ملغي' },
    ],
  },
  {
    key: 'contract_type',
    label: 'نوع العقد',
    type: 'select',
    options: [
      { value: 'سكني', label: 'سكني' },
      { value: 'تجاري', label: 'تجاري' },
    ],
  },
  { key: 'start_date', label: 'تاريخ البداية (من)', type: 'date' },
  { key: 'end_date', label: 'تاريخ النهاية (إلى)', type: 'date' },
];

interface Props {
  onEdit: (contract: Contract) => void;
}

export const ContractsTab = ({ onEdit }: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [advancedFilters, setAdvancedFilters] = useState<FiltersRecord>({});
  const [printContract, setPrintContract] = useState<Contract | null>(null);
  
  // حالات الحوارات الجديدة
  const [handoverContract, setHandoverContract] = useState<Contract | null>(null);
  const [notificationContract, setNotificationContract] = useState<Contract | null>(null);
  const [cancelAutoRenewContract, setCancelAutoRenewContract] = useState<Contract | null>(null);
  const [rentAdjustmentContract, setRentAdjustmentContract] = useState<Contract | null>(null);
  const [rentAdjustmentType, setRentAdjustmentType] = useState<'increase' | 'decrease'>('increase');
  const [terminationRequestContract, setTerminationRequestContract] = useState<Contract | null>(null);
  const [earlyTerminationContract, setEarlyTerminationContract] = useState<Contract | null>(null);
  
  const { 
    contracts, 
    isLoading, 
    deleteContract,
    pagination,
    goToPage,
    nextPage,
    prevPage,
    changePageSize,
    canGoNext,
    canGoPrev,
  } = useContractsPaginated();
  
  const { printWithData } = usePrint();

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
      await deleteContract.mutateAsync(id);
    },
    successMessage: 'تم حذف العقد بنجاح',
    errorMessage: 'فشل حذف العقد',
    title: 'حذف العقد',
    description: 'هل أنت متأكد من حذف هذا العقد؟ سيتم حذف جميع الدفعات المرتبطة به.',
  });

  const handleDelete = (id: string, contractNumber?: string) => {
    confirmDelete(id, contractNumber);
  };

  const handlePrintContract = (contract: Contract) => {
    setPrintContract(contract);
    setTimeout(() => {
      printWithData(contract, (data) => <ContractPrintTemplate contract={data} />);
      setPrintContract(null);
    }, 100);
  };

  // البحث والفلترة المحلية
  const filteredContracts = useMemo(() => {
    let result = contracts || [];
    
    // فلترة بالبحث
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.contract_number.toLowerCase().includes(query) ||
          c.tenant_name.toLowerCase().includes(query) ||
          c.properties?.name?.toLowerCase().includes(query)
      );
    }
    
    // فلترة بالفلاتر المتقدمة
    if (advancedFilters.status) {
      result = result.filter(c => c.status === advancedFilters.status);
    }
    if (advancedFilters.contract_type) {
      result = result.filter(c => c.contract_type === advancedFilters.contract_type);
    }
    if (advancedFilters.start_date) {
      const startDate = new Date(String(advancedFilters.start_date));
      result = result.filter(c => new Date(c.start_date) >= startDate);
    }
    if (advancedFilters.end_date) {
      const endDate = new Date(String(advancedFilters.end_date));
      result = result.filter(c => new Date(c.end_date) <= endDate);
    }
    
    return result;
  }, [contracts, searchQuery, advancedFilters]);

  // Bulk Selection
  const {
    selectedIds,
    selectedCount,
    isSelected,
    isAllSelected,
    toggleSelection,
    toggleAll,
    clearSelection,
  } = useBulkSelection(filteredContracts as Contract[]);

  // Bulk delete state
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  const handleBulkDelete = async () => {
    for (const id of selectedIds) {
      await deleteContract.mutateAsync(id);
    }
    clearSelection();
    setBulkDeleteDialogOpen(false);
    toast.success(`تم حذف ${selectedIds.length} عقد بنجاح`);
  };

  const handleBulkExport = () => {
    const selectedData = (filteredContracts as Contract[])
      .filter(c => selectedIds.includes(c.id))
      .map(c => ({
        'رقم العقد': c.contract_number,
        'العقار': c.properties?.name || '-',
        'المستأجر': c.tenant_name,
        'النوع': c.contract_type,
        'تاريخ البداية': format(new Date(c.start_date), 'yyyy/MM/dd'),
        'تاريخ النهاية': format(new Date(c.end_date), 'yyyy/MM/dd'),
        'الإيجار الشهري': Number(c.monthly_rent).toLocaleString(),
        'الحالة': c.status,
      }));
    return selectedData;
  };

  const exportData = filteredContracts.map(c => ({
    'رقم العقد': c.contract_number,
    'العقار': c.properties?.name || '-',
    'المستأجر': c.tenant_name,
    'رقم الهوية': c.tenant_id_number,
    'الهاتف': c.tenant_phone,
    'النوع': c.contract_type,
    'تاريخ البداية': format(new Date(c.start_date), 'yyyy/MM/dd'),
    'تاريخ النهاية': format(new Date(c.end_date), 'yyyy/MM/dd'),
    'الإيجار الشهري': Number(c.monthly_rent).toLocaleString(),
    'التأمين': Number(c.security_deposit || 0).toLocaleString(),
    'الحالة': c.status,
  }));

  return (
    <div className="space-y-6">
      {/* Contract Expiry Alerts */}
      <ContractExpiryAlert contracts={contracts as Contract[]} />

      {/* Search, Filters, and Export */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute end-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="البحث عن عقد..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pe-10"
          />
        </div>
        <AdvancedFiltersDialog
          filters={contractsFilterConfigs}
          activeFilters={advancedFilters}
          onApplyFilters={setAdvancedFilters}
          onClearFilters={() => setAdvancedFilters({})}
        />
        <ExportButton
          data={exportData}
          filename="العقود"
          title="العقود"
          headers={['رقم العقد', 'العقار', 'المستأجر', 'رقم الهوية', 'الهاتف', 'النوع', 'تاريخ البداية', 'تاريخ النهاية', 'الإيجار الشهري', 'التأمين', 'الحالة']}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">إجمالي العقود</div>
          <div className="text-2xl font-bold">{pagination.totalCount}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">عقود نشطة</div>
          <div className="text-2xl font-bold text-success">
            {contracts?.filter(c => c.status === 'نشط').length || 0}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">عقود منتهية</div>
          <div className="text-2xl font-bold text-warning">
            {contracts?.filter(c => c.status === 'منتهي').length || 0}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">الإيرادات السنوية</div>
          <div className="text-2xl font-bold text-primary">
            {(contracts?.reduce((sum, c) => {
              const rent = Number(c.monthly_rent);
              return sum + (c.payment_frequency === 'سنوي' ? rent : rent * 12);
            }, 0) || 0).toLocaleString()} ر.س
          </div>
        </Card>
      </div>

      {/* Contracts Table */}
      <UnifiedDataTable
        title="العقود"
        columns={[
          {
            key: "select",
            label: (
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={toggleAll}
                aria-label="تحديد الكل"
              />
            ),
            render: (_: unknown, row: Contract) => (
              <Checkbox
                checked={isSelected(row.id)}
                onCheckedChange={() => toggleSelection(row.id)}
                aria-label={`تحديد ${row.contract_number}`}
                onClick={(e) => e.stopPropagation()}
              />
            ),
          },
          {
            key: "contract_number",
            label: "رقم العقد",
            render: (value: string) => <span className="font-medium">{value}</span>
          },
          {
            key: "properties",
            label: "العقار",
            hideOnTablet: true,
            render: (_: unknown, row: Contract) => row.properties?.name || '-'
          },
          {
            key: "tenant_name",
            label: "المستأجر"
          },
          {
            key: "contract_type",
            label: "النوع",
            hideOnMobile: true
          },
          {
            key: "start_date",
            label: "تاريخ البداية",
            hideOnTablet: true,
            render: (value: string) => (
              <span className="whitespace-nowrap">
                {format(new Date(value), 'yyyy/MM/dd', { locale: ar })}
              </span>
            )
          },
          {
            key: "end_date",
            label: "تاريخ النهاية",
            hideOnTablet: true,
            render: (value: string) => (
              <span className="whitespace-nowrap">
                {format(new Date(value), 'yyyy/MM/dd', { locale: ar })}
              </span>
            )
          },
          {
            key: "monthly_rent",
            label: "الإيجار الشهري",
            render: (value: number) => (
              <span className="font-bold text-primary whitespace-nowrap">
                {Number(value).toLocaleString()} ر.س
              </span>
            )
          },
          {
            key: "status",
            label: "الحالة",
            render: (_: unknown, row: Contract) => (
              <ContractStatusBadge 
                startDate={row.start_date}
                endDate={row.end_date}
                status={row.status}
              />
            )
          }
        ]}
        data={filteredContracts as Contract[]}
        loading={isLoading}
        emptyMessage="لا توجد عقود"
        actions={(contract: Contract) => (
          <ContractActionsMenu
            contract={contract}
            onPrint={handlePrintContract}
            onEdit={onEdit}
            onDelete={(c) => handleDelete(c.id, c.contract_number)}
            onHandover={setHandoverContract}
            onSendNotification={setNotificationContract}
            onCancelAutoRenew={setCancelAutoRenewContract}
            onUnilateralTermination={setTerminationRequestContract}
            onRentAdjustment={(c, type) => {
              setRentAdjustmentContract(c);
              setRentAdjustmentType(type);
            }}
            onEarlyTermination={setEarlyTerminationContract}
          />
        )}
        showMobileScrollHint={true}
      />

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <PaginationControls
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalCount}
          pageSize={pagination.pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          startIndex={(pagination.page - 1) * pagination.pageSize + 1}
          endIndex={Math.min(pagination.page * pagination.pageSize, pagination.totalCount)}
          canGoNext={canGoNext}
          canGoPrev={canGoPrev}
          onPageChange={goToPage}
          onPageSizeChange={changePageSize}
          onNext={nextPage}
          onPrev={prevPage}
          onFirst={() => goToPage(1)}
          onLast={() => goToPage(pagination.totalPages)}
          className="rounded-lg border"
        />
      )}

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

      {/* Bulk Delete Dialog */}
      <DeleteConfirmDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        onConfirm={handleBulkDelete}
        title="حذف العقود المحددة"
        description={`هل أنت متأكد من حذف ${selectedCount} عقد؟`}
        itemName={`${selectedCount} عقد`}
        isDestructive={true}
      />

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedCount}
        onClearSelection={clearSelection}
        onDelete={() => setBulkDeleteDialogOpen(true)}
        onExport={() => {
          const data = handleBulkExport();
          toast.success(`تم تجهيز ${data.length} عقد للتصدير`);
        }}
      />

      {/* الحوارات الجديدة */}
      <UnitHandoverDialog
        open={!!handoverContract}
        onOpenChange={(open) => !open && setHandoverContract(null)}
        contract={handoverContract}
      />
      <ContractNotificationDialog
        open={!!notificationContract}
        onOpenChange={(open) => !open && setNotificationContract(null)}
        contract={notificationContract}
      />
      <CancelAutoRenewDialog
        open={!!cancelAutoRenewContract}
        onOpenChange={(open) => !open && setCancelAutoRenewContract(null)}
        contract={cancelAutoRenewContract}
      />
      <RentAdjustmentDialog
        open={!!rentAdjustmentContract}
        onOpenChange={(open) => !open && setRentAdjustmentContract(null)}
        contract={rentAdjustmentContract}
        adjustmentType={rentAdjustmentType}
      />
      <UnilateralTerminationDialog
        open={!!terminationRequestContract}
        onOpenChange={(open) => !open && setTerminationRequestContract(null)}
        contract={terminationRequestContract}
      />
      <EarlyTerminationDialog
        open={!!earlyTerminationContract}
        onOpenChange={(open) => !open && setEarlyTerminationContract(null)}
        contract={earlyTerminationContract}
      />
    </div>
  );
};
