import { useState, useMemo } from "react";
import { Search, Printer, Edit, Trash2 } from "lucide-react";
import { useContractsPaginated } from "@/hooks/property/useContractsPaginated";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format, arLocale as ar } from "@/lib/date";
import { type Contract } from "@/hooks/useContracts";
import { ExportButton } from "@/components/shared/ExportButton";
import { usePrint } from "@/hooks/usePrint";
import { ContractPrintTemplate } from "@/components/contracts/ContractPrintTemplate";
import { ContractStatusBadge } from "@/components/contracts/ContractStatusBadge";
import { ContractExpiryAlert } from "@/components/contracts/ContractExpiryAlert";
import { UnifiedDataTable } from "@/components/unified/UnifiedDataTable";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { PAGE_SIZE_OPTIONS } from "@/lib/pagination.types";

interface Props {
  onEdit: (contract: Contract) => void;
}

export const ContractsTab = ({ onEdit }: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [printContract, setPrintContract] = useState<Contract | null>(null);
  
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

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا العقد؟ سيتم حذف جميع الدفعات المرتبطة به.")) {
      deleteContract.mutateAsync(id);
    }
  };

  const handlePrintContract = (contract: Contract) => {
    setPrintContract(contract);
    setTimeout(() => {
      printWithData(contract, (data) => <ContractPrintTemplate contract={data} />);
      setPrintContract(null);
    }, 100);
  };

  // البحث المحلي في الصفحة الحالية
  const filteredContracts = useMemo(() => {
    if (!searchQuery) return contracts;
    
    const query = searchQuery.toLowerCase();
    return contracts?.filter(
      (c) =>
        c.contract_number.toLowerCase().includes(query) ||
        c.tenant_name.toLowerCase().includes(query) ||
        c.properties?.name?.toLowerCase().includes(query)
    ) || [];
  }, [contracts, searchQuery]);

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

      {/* Search and Export */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="البحث عن عقد..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
        <ExportButton
          data={exportData}
          filename="العقود"
          title="العقود"
          headers={['رقم العقد', 'العقار', 'المستأجر', 'رقم الهوية', 'الهاتف', 'النوع', 'تاريخ البداية', 'تاريخ النهاية', 'الإيجار الشهري', 'التأمين', 'الحالة']}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePrintContract(contract)}
              title="طباعة"
              className="hover:bg-primary/10"
            >
              <Printer className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(contract)}
              title="تعديل"
              className="hover:bg-primary/10"
            >
              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => handleDelete(contract.id)}
              title="حذف"
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
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
    </div>
  );
};
