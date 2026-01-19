import { useState } from "react";
import { Plus, Search, Building2, DollarSign, TrendingUp, AlertCircle, Eye, CalendarDays, Trash2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWaqfUnits, type WaqfUnit } from "@/hooks/distributions/useWaqfUnits";
import { useFiscalYears } from "@/hooks/accounting/useFiscalYears";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EnhancedEmptyState } from "@/components/shared";
import { WaqfUnitDialog } from "@/components/waqf/WaqfUnitDialog";
import { WaqfUnitDetailsDialog } from "@/components/waqf/WaqfUnitDetailsDialog";
import { ExportButton } from "@/components/shared/ExportButton";
import { SortableTableHeader } from "@/components/shared/SortableTableHeader";
import { BulkActionsBar } from "@/components/shared/BulkActionsBar";
import { AdvancedFiltersDialog, FilterConfig, FiltersRecord } from "@/components/shared/AdvancedFiltersDialog";
import { useTableSort } from "@/hooks/ui/useTableSort";
import { useBulkSelection } from "@/hooks/ui/useBulkSelection";
import { format, arLocale as ar } from "@/lib/date";
import { toast } from "sonner";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";

export default function WaqfUnits() {
  const { waqfUnits, isLoading, error, refetch, deleteWaqfUnit } = useWaqfUnits();
  const { fiscalYears } = useFiscalYears();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>("all");
  const [selectedUnit, setSelectedUnit] = useState<WaqfUnit | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedDetailsUnit, setSelectedDetailsUnit] = useState<WaqfUnit | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<WaqfUnit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // فلاتر متقدمة - is_active: 'true' | 'false'
  const [advancedFilters, setAdvancedFilters] = useState<FiltersRecord>({});
  
  // الحصول على السنة المالية النشطة
  const activeFiscalYear = fiscalYears.find(fy => fy.is_active);

  // Filter waqf units
  const filteredUnits = waqfUnits.filter((unit) => {
    const matchesSearch =
      unit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.location?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === "all" || unit.waqf_type === typeFilter;
    const matchesActive = advancedFilters.is_active === undefined || 
      unit.is_active === (advancedFilters.is_active === 'true');

    return matchesSearch && matchesType && matchesActive;
  });

  const { sortedData, sortConfig, handleSort } = useTableSort({
    data: filteredUnits,
    defaultSortKey: 'name',
    defaultDirection: 'asc',
  });

  const {
    selectedIds,
    selectedCount,
    isSelected,
    isAllSelected,
    toggleSelection,
    toggleAll,
    clearSelection,
  } = useBulkSelection(sortedData);

  const filterConfigs: FilterConfig[] = [
    {
      key: 'is_active',
      label: 'الحالة',
      type: 'select',
      options: [
        { value: 'true', label: 'نشط' },
        { value: 'false', label: 'غير نشط' },
      ],
    },
  ];

  const handleBulkExport = () => {
    const selectedUnits = waqfUnits.filter(u => selectedIds.includes(u.id));
    toast.success(`جاري تصدير ${selectedCount} قلم وقف...`);
  };

  const handleDelete = async () => {
    if (!unitToDelete) return;
    setIsDeleting(true);
    try {
      await deleteWaqfUnit(unitToDelete.id);
      setDeleteDialogOpen(false);
      setUnitToDelete(null);
    } catch (error) {
      // الخطأ يُعالج في الـ Hook
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate statistics - تشمل الأرصدة المالية الفعلية
  const stats = {
    total: waqfUnits.length,
    active: waqfUnits.filter((u) => u.is_active).length,
    totalValue: waqfUnits.reduce((sum, u) => sum + (u.current_value || 0), 0),
    totalReturn: waqfUnits.reduce((sum, u) => sum + (u.annual_return || 0), 0),
    // أرصدة مالية فعلية من السندات والقيود
    totalBalance: waqfUnits.reduce((sum, u) => sum + (u.current_balance || 0), 0),
    totalIncome: waqfUnits.reduce((sum, u) => sum + (u.total_income || 0), 0),
    totalExpenses: waqfUnits.reduce((sum, u) => sum + (u.total_expenses || 0), 0),
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      "عقار": { label: "عقار", variant: "default" as const, icon: Building2 },
      "نقدي": { label: "نقدي", variant: "outline" as const, icon: DollarSign },
      "أسهم": { label: "أسهم", variant: "secondary" as const, icon: TrendingUp },
      "مشروع": { label: "مشروع", variant: "default" as const, icon: AlertCircle },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig["عقار"];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return <LoadingState message="جاري تحميل أقلام الوقف..." />;
  }

  if (error) {
    return (
      <ErrorState 
        title="فشل تحميل أقلام الوقف" 
        message="حدث خطأ أثناء تحميل بيانات أقلام الوقف"
        onRetry={refetch}
        fullScreen
      />
    );
  }

  return (
    <PageErrorBoundary pageName="أقلام الوقف">
      <MobileOptimizedLayout>
      <MobileOptimizedHeader
        title="أقلام الوقف"
        description="إدارة ومتابعة أقلام الوقف وأصوله"
        icon={<Building2 className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />}
        actions={
          <div className="flex gap-2">
          {filteredUnits.length > 0 && (
            <ExportButton
              data={filteredUnits.map(u => ({
                'الكود': u.code,
                'الاسم': u.name,
                'النوع': u.waqf_type,
                'الموقع': u.location || '-',
                'قيمة الاستحواذ': u.acquisition_value?.toLocaleString('ar-SA') || '0',
                'القيمة الحالية': u.current_value?.toLocaleString('ar-SA') || '0',
                'العائد السنوي': u.annual_return?.toLocaleString('ar-SA') || '0',
                'تاريخ الاستحواذ': u.acquisition_date ? format(new Date(u.acquisition_date), 'dd/MM/yyyy') : '-',
                'الحالة': u.is_active ? 'نشط' : 'غير نشط',
              }))}
              filename="أقلام_الوقف"
              title="تقرير أقلام الوقف"
              headers={['الكود', 'الاسم', 'النوع', 'الموقع', 'قيمة الاستحواذ', 'القيمة الحالية', 'العائد السنوي', 'تاريخ الاستحواذ', 'الحالة']}
            />
          )}
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2" size="sm">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">إضافة قلم وقف</span>
            <span className="sm:hidden">إضافة</span>
          </Button>
        </div>
        }
      />

      {/* Statistics Cards - تشمل الأرصدة المالية الفعلية */}
      <UnifiedStatsGrid columns={4}>
        <UnifiedKPICard
          title="إجمالي الأقلام"
          value={stats.total}
          icon={Building2}
          variant="default"
        />
        <UnifiedKPICard
          title="أقلام نشطة"
          value={stats.active}
          icon={AlertCircle}
          variant="success"
        />
        <UnifiedKPICard
          title="الرصيد الحالي"
          value={`${stats.totalBalance.toLocaleString('ar-SA')} ريال`}
          icon={Wallet}
          variant="primary"
          subtitle="من السندات والقيود"
        />
        <UnifiedKPICard
          title="إجمالي المحصّل"
          value={`${stats.totalIncome.toLocaleString('ar-SA')} ريال`}
          icon={TrendingUp}
          variant="success"
        />
      </UnifiedStatsGrid>

      <UnifiedStatsGrid columns={3}>
        <UnifiedKPICard
          title="إجمالي المصروفات"
          value={`${stats.totalExpenses.toLocaleString('ar-SA')} ريال`}
          icon={DollarSign}
          variant="danger"
        />
        <UnifiedKPICard
          title="قيمة الأصول"
          value={`${stats.totalValue.toLocaleString('ar-SA')} ريال`}
          icon={DollarSign}
          variant="default"
        />
        <UnifiedKPICard
          title="العائد السنوي"
          value={`${stats.totalReturn.toLocaleString('ar-SA')} ريال`}
          icon={TrendingUp}
          variant="info"
        />
      </UnifiedStatsGrid>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute start-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="بحث بالاسم، الكود، أو الموقع..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-10"
            />
          </div>
          <AdvancedFiltersDialog
            filters={filterConfigs}
            activeFilters={advancedFilters}
            onApplyFilters={setAdvancedFilters}
            onClearFilters={() => setAdvancedFilters({})}
          />
          <Select value={selectedFiscalYear} onValueChange={setSelectedFiscalYear}>
            <SelectTrigger className="w-full md:w-56">
              <CalendarDays className="h-4 w-4 ms-2" />
              <SelectValue placeholder="السنة المالية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع السنوات</SelectItem>
              {fiscalYears.map((fy) => (
                <SelectItem key={fy.id} value={fy.id}>
                  {fy.name} {fy.is_active && "(نشطة)"} {fy.is_closed && "(مغلقة)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="نوع الوقف" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأنواع</SelectItem>
              <SelectItem value="عقار">عقار</SelectItem>
              <SelectItem value="نقدي">نقدي</SelectItem>
              <SelectItem value="أسهم">أسهم</SelectItem>
              <SelectItem value="مشروع">مشروع</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Waqf Units Table */}
      {sortedData.length === 0 ? (
        <EnhancedEmptyState
          icon={Building2}
          title="لا توجد أقلام وقف"
          description={
            searchQuery || typeFilter !== 'all'
              ? 'لا توجد نتائج مطابقة لبحثك. جرب تغيير معايير البحث.'
              : 'لم يتم إضافة أي أقلام وقف بعد. ابدأ بإضافة قلم وقف جديد الآن.'
          }
          action={!searchQuery && typeFilter === 'all' ? {
            label: "إضافة قلم وقف",
            onClick: () => setIsDialogOpen(true)
          } : undefined}
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={toggleAll}
                      aria-label="تحديد الكل"
                    />
                  </TableHead>
                  <SortableTableHeader
                    label="الكود"
                    sortKey="code"
                    currentSort={sortConfig}
                    onSort={handleSort}
                    className="whitespace-nowrap"
                  />
                  <SortableTableHeader
                    label="الاسم"
                    sortKey="name"
                    currentSort={sortConfig}
                    onSort={handleSort}
                    className="whitespace-nowrap"
                  />
                  <TableHead className="text-right whitespace-nowrap">النوع</TableHead>
                  <TableHead className="text-right whitespace-nowrap hidden md:table-cell">الموقع</TableHead>
                  {/* عمود الرصيد المالي الفعلي */}
                  <SortableTableHeader
                    label="الرصيد"
                    sortKey="current_balance"
                    currentSort={sortConfig}
                    onSort={handleSort}
                    className="whitespace-nowrap"
                  />
                  <SortableTableHeader
                    label="الإيرادات"
                    sortKey="total_income"
                    currentSort={sortConfig}
                    onSort={handleSort}
                    className="hidden md:table-cell whitespace-nowrap"
                  />
                  <SortableTableHeader
                    label="المصروفات"
                    sortKey="total_expenses"
                    currentSort={sortConfig}
                    onSort={handleSort}
                    className="hidden lg:table-cell whitespace-nowrap"
                  />
                  <SortableTableHeader
                    label="قيمة الأصل"
                    sortKey="current_value"
                    currentSort={sortConfig}
                    onSort={handleSort}
                    className="hidden lg:table-cell whitespace-nowrap"
                  />
                  <TableHead className="text-right whitespace-nowrap">الحالة</TableHead>
                  <TableHead className="text-right whitespace-nowrap">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell>
                      <Checkbox
                        checked={isSelected(unit.id)}
                        onCheckedChange={() => toggleSelection(unit.id)}
                        aria-label={`تحديد ${unit.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-xs sm:text-sm">{unit.code}</TableCell>
                    <TableCell className="min-w-[150px]">
                      <div>
                        <p className="font-medium text-xs sm:text-sm">{unit.name}</p>
                        {unit.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {unit.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(unit.waqf_type)}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs sm:text-sm">{unit.location || "-"}</TableCell>
                    {/* الرصيد المالي الفعلي */}
                    <TableCell className="font-bold text-primary text-xs sm:text-sm whitespace-nowrap">
                      {(unit.current_balance || 0).toLocaleString('ar-SA')} ريال
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-semibold text-success text-xs sm:text-sm whitespace-nowrap">
                      {(unit.total_income || 0).toLocaleString('ar-SA')} ريال
                    </TableCell>
                    <TableCell className="hidden lg:table-cell font-semibold text-destructive text-xs sm:text-sm whitespace-nowrap">
                      {(unit.total_expenses || 0).toLocaleString('ar-SA')} ريال
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs sm:text-sm whitespace-nowrap">
                      {(unit.current_value || 0).toLocaleString('ar-SA')} ريال
                    </TableCell>
                    <TableCell>
                      <Badge variant={unit.is_active ? "outline" : "secondary"} className="text-xs whitespace-nowrap">
                        {unit.is_active ? "نشط" : "غير نشط"}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedDetailsUnit(unit as WaqfUnit);
                          setDetailsDialogOpen(true);
                        }}
                        className="text-xs sm:text-sm gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        عرض
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUnit(unit as WaqfUnit);
                          setIsDialogOpen(true);
                        }}
                        className="text-xs sm:text-sm"
                      >
                        تعديل
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setUnitToDelete(unit as WaqfUnit);
                          setDeleteDialogOpen(true);
                        }}
                        className="text-xs sm:text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Dialog */}
      <WaqfUnitDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedUnit(null);
        }}
        waqfUnit={selectedUnit}
      />

      {/* Details Dialog */}
      <WaqfUnitDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        waqfUnit={selectedDetailsUnit}
        selectedFiscalYearId={selectedFiscalYear !== 'all' ? selectedFiscalYear : activeFiscalYear?.id}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="حذف قلم الوقف"
        description={`هل أنت متأكد من حذف قلم الوقف "${unitToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedCount}
        onClearSelection={clearSelection}
        onExport={handleBulkExport}
      />
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
}
