import { memo } from 'react';
import { Plus, Users, MoreVertical, Edit, Trash2, Eye, Download } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/shared/LoadingState';
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import FamilyDialog from '@/components/families/FamilyDialog';
import { FamiliesErrorState } from '@/components/families/FamiliesErrorState';
import { FamilyMembersDialog } from '@/components/families/FamilyMembersDialog';
import { FamilyMobileCard } from '@/components/families/FamilyMobileCard';
import { FamiliesStatsCards } from '@/components/families/FamiliesStatsCards';
import { FamiliesFilters } from '@/components/families/FamiliesFilters';
import { MobileOptimizedLayout, MobileOptimizedHeader } from '@/components/layout/MobileOptimizedLayout';
import { Pagination } from '@/components/shared/Pagination';
import { EnhancedEmptyState } from '@/components/shared';
import { ExportButton } from '@/components/shared/ExportButton';
import { SortableTableHeader } from '@/components/shared/SortableTableHeader';
import { BulkActionsBar } from '@/components/shared/BulkActionsBar';
import { AdvancedFiltersDialog, FilterConfig } from '@/components/shared/AdvancedFiltersDialog';
import { useFamiliesPage, FamilyWithHead } from '@/hooks/useFamiliesPage';
import { useIsMobile } from '@/hooks/use-mobile';

const Families = memo(() => {
  const isMobile = useIsMobile();
  const {
    families,
    filteredFamilies,
    paginatedFamilies,
    stats,
    isLoading,
    error,
    refetch,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    handleItemsPerPageChange,
    totalPages,
    searchQuery,
    setSearchQuery,
    advancedFilters,
    setAdvancedFilters,
    sortConfig,
    handleSort,
    bulkSelection,
    handleBulkDelete,
    handleBulkExport,
    dialogOpen,
    setDialogOpen,
    selectedFamily,
    deleteDialogOpen,
    setDeleteDialogOpen,
    familyToDelete,
    membersDialogOpen,
    setMembersDialogOpen,
    selectedFamilyForMembers,
    handleAddFamily,
    handleEditFamily,
    handleDeleteClick,
    handleViewMembers,
    handleDeleteConfirm,
    handleSaveFamily,
  } = useFamiliesPage();

  const filterConfigs: FilterConfig[] = [
    {
      key: 'status',
      label: 'الحالة',
      type: 'select',
      options: [
        { value: 'نشط', label: 'نشط' },
        { value: 'غير نشط', label: 'غير نشط' },
      ],
    },
    {
      key: 'tribe',
      label: 'القبيلة',
      type: 'select',
      options: Array.from(new Set(families.map(f => f.tribe).filter(Boolean))).map(tribe => ({
        value: tribe!,
        label: tribe!,
      })),
    },
  ];

  if (isLoading) {
    return <LoadingState size="lg" />;
  }

  if (error) {
    return <FamiliesErrorState error={error as Error} onRetry={() => refetch()} />;
  }

  return (
    <PageErrorBoundary pageName="العائلات">
      <MobileOptimizedLayout>
        <MobileOptimizedHeader
          title="سجل العائلات"
          description="إدارة العائلات وربط أفرادها ببعضهم البعض"
          icon={<Users className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />}
          actions={
            <div className="flex gap-2">
              <AdvancedFiltersDialog
                filters={filterConfigs}
                activeFilters={advancedFilters}
                onApplyFilters={setAdvancedFilters}
                onClearFilters={() => setAdvancedFilters({})}
              />
              {filteredFamilies.length > 0 && (
                <ExportButton
                  data={filteredFamilies.map(f => ({
                    'اسم العائلة': f.family_name,
                    'رب الأسرة': (f as FamilyWithHead).head_of_family?.full_name || '-',
                    'القبيلة': f.tribe || '-',
                    'عدد الأفراد': f.total_members,
                    'الحالة': f.status,
                    'تاريخ التسجيل': new Date(f.created_at).toLocaleDateString('ar-SA'),
                  }))}
                  filename="العائلات"
                  title="تقرير العائلات"
                  headers={['اسم العائلة', 'رب الأسرة', 'القبيلة', 'عدد الأفراد', 'الحالة', 'تاريخ التسجيل']}
                />
              )}
              <Button onClick={handleAddFamily} className="w-full sm:w-auto gap-2 text-sm sm:text-base" size="sm">
                <Plus className="h-4 w-4" />
                إضافة عائلة
              </Button>
            </div>
          }
        />

        <FamiliesStatsCards stats={stats} />
        <FamiliesFilters searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <Card>
          <CardHeader>
            <CardTitle>قائمة العائلات</CardTitle>
            <CardDescription>عرض جميع العائلات المسجلة ({filteredFamilies.length})</CardDescription>
          </CardHeader>
          <CardContent>
            {paginatedFamilies.length === 0 ? (
              <EnhancedEmptyState
                icon={Users}
                title="لا توجد عائلات"
                description={searchQuery ? 'لا توجد نتائج مطابقة لبحثك.' : 'لم يتم إضافة أي عائلات بعد.'}
                action={!searchQuery ? { label: "إضافة عائلة جديدة", onClick: handleAddFamily } : undefined}
              />
            ) : isMobile ? (
              <div className="space-y-3">
                {paginatedFamilies.map((family) => (
                  <FamilyMobileCard
                    key={family.id}
                    family={family as FamilyWithHead}
                    isSelected={bulkSelection.isSelected(family.id)}
                    onToggleSelection={() => bulkSelection.toggleSelection(family.id)}
                    onEdit={() => handleEditFamily(family)}
                    onDelete={() => handleDeleteClick(family)}
                    onViewMembers={() => handleViewMembers(family)}
                  />
                ))}
                <div className="pt-4 border-t">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredFamilies.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={handleItemsPerPageChange}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={bulkSelection.isAllSelected}
                            onCheckedChange={bulkSelection.toggleAll}
                            aria-label="تحديد الكل"
                          />
                        </TableHead>
                        <SortableTableHeader label="اسم العائلة" sortKey="family_name" currentSort={sortConfig} onSort={handleSort} />
                        <TableHead className="text-right">رب الأسرة</TableHead>
                        <SortableTableHeader label="القبيلة" sortKey="tribe" currentSort={sortConfig} onSort={handleSort} className="hidden md:table-cell" />
                        <SortableTableHeader label="عدد الأفراد" sortKey="total_members" currentSort={sortConfig} onSort={handleSort} />
                        <SortableTableHeader label="الحالة" sortKey="status" currentSort={sortConfig} onSort={handleSort} className="hidden lg:table-cell" />
                        <SortableTableHeader label="تاريخ التسجيل" sortKey="created_at" currentSort={sortConfig} onSort={handleSort} className="hidden lg:table-cell" />
                        <TableHead className="text-right w-[100px]">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedFamilies.map((family) => (
                        <TableRow key={family.id} className="hover:bg-muted/50">
                          <TableCell>
                            <Checkbox
                              checked={bulkSelection.isSelected(family.id)}
                              onCheckedChange={() => bulkSelection.toggleSelection(family.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium text-xs sm:text-sm">{family.family_name}</TableCell>
                          <TableCell className="text-xs sm:text-sm">{(family as FamilyWithHead).head_of_family?.full_name || '-'}</TableCell>
                          <TableCell className="hidden md:table-cell text-xs sm:text-sm">{family.tribe || '-'}</TableCell>
                          <TableCell><Badge variant="secondary" className="text-xs">{family.total_members} أفراد</Badge></TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Badge variant={family.status === 'نشط' ? 'default' : 'secondary'} className="text-xs">{family.status}</Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">
                            {new Date(family.created_at).toLocaleDateString('ar-SA')}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewMembers(family)}><Eye className="ml-2 h-4 w-4" />عرض الأفراد</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditFamily(family)}><Edit className="ml-2 h-4 w-4" />تعديل</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(family)}>
                                  <Trash2 className="ml-2 h-4 w-4" />حذف
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredFamilies.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <BulkActionsBar
          selectedCount={bulkSelection.selectedCount}
          onDelete={handleBulkDelete}
          onExport={handleBulkExport}
          onClearSelection={bulkSelection.clearSelection}
        />

        <FamilyDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          family={selectedFamily}
          onSave={handleSaveFamily}
        />

        <FamilyMembersDialog
          open={membersDialogOpen}
          onOpenChange={setMembersDialogOpen}
          familyId={selectedFamilyForMembers?.id || ''}
          familyName={selectedFamilyForMembers?.family_name || ''}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>حذف العائلة</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من حذف عائلة "{familyToDelete?.family_name}"؟ هذا الإجراء لا يمكن التراجع عنه.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">حذف</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
});

Families.displayName = 'Families';

export default Families;
