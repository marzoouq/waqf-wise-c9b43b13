import { useState, useMemo } from "react";
import { Search, MapPin, DollarSign, Home, Building, Edit, Trash2, Eye } from "lucide-react";
import { useProperties, type Property } from "@/hooks/property/useProperties";
import { usePropertiesStats } from "@/hooks/property/usePropertiesStats";
import { useTableSort } from "@/hooks/ui/useTableSort";
import { useBulkSelection } from "@/hooks/ui/useBulkSelection";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { StatCard } from "@/components/dashboard/DashboardStats";
import { UnifiedDataTable } from "@/components/unified/UnifiedDataTable";
import { useDeleteConfirmation } from "@/hooks/shared";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { ExportButton } from "@/components/shared/ExportButton";
import { BulkActionsBar } from "@/components/shared/BulkActionsBar";
import { AdvancedFiltersDialog, type FilterConfig, type FiltersRecord } from "@/components/shared/AdvancedFiltersDialog";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE } from "@/lib/pagination.types";
import { toast } from "sonner";

// تعريف الفلاتر
const propertiesFilterConfigs: FilterConfig[] = [
  {
    key: 'type',
    label: 'نوع العقار',
    type: 'select',
    options: [
      { value: 'سكني', label: 'سكني' },
      { value: 'تجاري', label: 'تجاري' },
      { value: 'مختلط', label: 'مختلط' },
    ],
  },
  {
    key: 'status',
    label: 'الحالة',
    type: 'select',
    options: [
      { value: 'مؤجر', label: 'مؤجر' },
      { value: 'شاغر', label: 'شاغر' },
      { value: 'صيانة', label: 'تحت الصيانة' },
    ],
  },
  { key: 'location', label: 'الموقع', type: 'text' },
];

interface Props {
  onEdit: (property: Property) => void;
  onSelectProperty?: (property: Property) => void;
}

export const PropertiesTab = ({ onEdit, onSelectProperty }: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [advancedFilters, setAdvancedFilters] = useState<FiltersRecord>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const { properties, isLoading, deleteProperty } = useProperties();
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
      deleteProperty(id);
    },
    successMessage: 'تم حذف العقار بنجاح',
    errorMessage: 'فشل حذف العقار',
    title: 'حذف العقار',
    description: 'هل أنت متأكد من حذف هذا العقار؟',
  });

  const filteredProperties = useMemo(() => {
    let result = properties || [];
    
    // فلترة بالبحث
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.type.toLowerCase().includes(query) ||
          p.location.toLowerCase().includes(query)
      );
    }
    
    // فلترة بالفلاتر المتقدمة
    if (advancedFilters.type) {
      result = result.filter(p => p.type === advancedFilters.type);
    }
    if (advancedFilters.status) {
      result = result.filter(p => p.status === advancedFilters.status);
    }
    if (advancedFilters.location) {
      result = result.filter(p => 
        p.location.toLowerCase().includes(String(advancedFilters.location).toLowerCase())
      );
    }
    
    return result;
  }, [properties, searchQuery, advancedFilters]);

  // Sorting
  const { sortedData, sortConfig, handleSort } = useTableSort({
    data: filteredProperties,
    defaultSortKey: 'name',
    defaultDirection: 'asc',
  });

  // Pagination
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedData = sortedData.slice(startIndex, endIndex);

  // Bulk Selection - must be after paginatedData
  const {
    selectedIds,
    selectedCount,
    isSelected,
    isAllSelected,
    toggleSelection,
    toggleAll,
    clearSelection,
  } = useBulkSelection(paginatedData);

  // Bulk delete state
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  const handleBulkDelete = async () => {
    for (const id of selectedIds) {
      deleteProperty(id);
    }
    clearSelection();
    setBulkDeleteDialogOpen(false);
    toast.success(`تم حذف ${selectedIds.length} عقار بنجاح`);
  };

  const handleBulkExport = () => {
    const selectedData = paginatedData
      .filter(p => selectedIds.includes(p.id))
      .map(p => ({
        'اسم العقار': p.name,
        'النوع': p.type,
        'الموقع': p.location,
        'الوحدات الكلية': p.units,
        'الوحدات المشغولة': p.occupied,
        'الوحدات الشاغرة': p.units - p.occupied,
        'الإيراد الشهري': Number(p.monthly_revenue || 0).toLocaleString(),
        'الحالة': p.status,
      }));
    return selectedData;
  };

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, advancedFilters]);

  // استخدام الإحصائيات الموحدة من الـ hook الرئيسي
  const { data: unifiedStats } = usePropertiesStats();

  const stats = useMemo(() => {
    const totalUnits = properties?.reduce((sum, p) => sum + p.units, 0) || 0;
    const occupiedUnits = properties?.reduce((sum, p) => sum + p.occupied, 0) || 0;
    
    // استخدام الإيراد السنوي من العقود النشطة (مصدر الحقيقة الموحد)
    const totalAnnualRevenue = unifiedStats?.expectedAnnualRevenue || 0;

    return [
      {
        label: "إجمالي العقارات",
        value: properties?.length.toString() || "0",
        icon: Building,
        color: "text-primary",
      },
      {
        label: "الوحدات المؤجرة",
        value: (unifiedStats?.occupiedUnits || occupiedUnits).toString(),
        icon: Home,
        color: "text-success",
      },
      {
        label: "الوحدات الشاغرة",
        value: (unifiedStats?.vacantUnits || (totalUnits - occupiedUnits)).toString(),
        icon: MapPin,
        color: "text-warning",
      },
      {
        label: "الإيرادات السنوية",
        value: `${totalAnnualRevenue.toLocaleString()} ر.س`,
        icon: DollarSign,
        color: "text-accent",
      },
    ];
  }, [properties, unifiedStats]);

  const handleDelete = (id: string, name?: string) => {
    confirmDelete(id, name);
  };

  // بيانات التصدير
  const exportData = filteredProperties.map(p => ({
    'اسم العقار': p.name,
    'النوع': p.type,
    'الموقع': p.location,
    'الوحدات الكلية': p.units,
    'الوحدات المشغولة': p.occupied,
    'الوحدات الشاغرة': p.units - p.occupied,
    'الإيراد الشهري': Number(p.monthly_revenue || 0).toLocaleString(),
    'الحالة': p.status,
  }));

  return (
    <div className="space-y-6">
      {/* Search, Filters, and Export */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute end-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="البحث عن عقار..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pe-10"
          />
        </div>
        <AdvancedFiltersDialog
          filters={propertiesFilterConfigs}
          activeFilters={advancedFilters}
          onApplyFilters={setAdvancedFilters}
          onClearFilters={() => setAdvancedFilters({})}
        />
        <ExportButton
          data={exportData}
          filename="العقارات"
          title="العقارات"
          headers={['اسم العقار', 'النوع', 'الموقع', 'الوحدات الكلية', 'الوحدات المشغولة', 'الوحدات الشاغرة', 'الإيراد الشهري', 'الحالة']}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Properties Table */}
      <UnifiedDataTable
        title="العقارات"
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
            render: (_: unknown, row: Property) => (
              <Checkbox
                checked={isSelected(row.id)}
                onCheckedChange={() => toggleSelection(row.id)}
                aria-label={`تحديد ${row.name}`}
                onClick={(e) => e.stopPropagation()}
              />
            ),
          },
          {
            key: "name",
            label: "اسم العقار",
            render: (value: string) => (
              <span className="font-medium">{value}</span>
            )
          },
          {
            key: "type",
            label: "النوع",
            render: (value: string) => (
              <Badge variant="outline" className="border-primary/30">
                {value}
              </Badge>
            )
          },
          {
            key: "location",
            label: "الموقع",
            hideOnMobile: true,
            render: (value: string) => (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{value}</span>
              </div>
            )
          },
          {
            key: "units",
            label: "الوحدات",
            hideOnTablet: true,
            render: (_: unknown, row: Property) => (
              <span className="font-medium whitespace-nowrap">
                {row.occupied}/{row.units}
              </span>
            )
          },
          {
            key: "monthly_revenue",
            label: "الإيراد الشهري",
            render: (value: number) => (
              <span className="font-bold text-primary whitespace-nowrap">
                {Number(value || 0).toLocaleString()} ر.س
              </span>
            )
          },
          {
            key: "status",
            label: "الحالة",
            render: (value: string) => (
              <Badge
                className={
                  value === "مؤجر"
                    ? "bg-success/10 text-success border-success/30"
                    : value === "شاغر"
                    ? "bg-warning/10 text-warning border-warning/30"
                    : "bg-primary/10 text-primary border-primary/30"
                }
              >
                {value}
              </Badge>
            )
          }
        ]}
        data={paginatedData}
        loading={isLoading}
        emptyMessage="لا توجد عقارات"
        actions={(property: Property) => (
          <div className="flex gap-1">
            {onSelectProperty && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectProperty(property)}
                title="عرض الوحدات"
                className="hover:bg-info/10"
              >
                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(property)}
              title="تعديل"
              className="hover:bg-primary/10"
            >
              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => handleDelete(property.id, property.name)}
              title="حذف"
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        )}
        showMobileScrollHint={true}
      />

      {/* Pagination Controls */}
      {totalItems > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          startIndex={startIndex + 1}
          endIndex={endIndex}
          canGoNext={currentPage < totalPages}
          canGoPrev={currentPage > 1}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          onNext={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
          onPrev={() => setCurrentPage(p => Math.max(p - 1, 1))}
          onFirst={() => setCurrentPage(1)}
          onLast={() => setCurrentPage(totalPages)}
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
        title="حذف العقارات المحددة"
        description={`هل أنت متأكد من حذف ${selectedCount} عقار؟`}
        itemName={`${selectedCount} عقار`}
        isDestructive={true}
      />

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedCount}
        onClearSelection={clearSelection}
        onDelete={() => setBulkDeleteDialogOpen(true)}
        onExport={() => {
          const data = handleBulkExport();
          toast.success(`تم تجهيز ${data.length} عقار للتصدير`);
        }}
      />
    </div>
  );
};
