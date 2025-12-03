import { useState, useMemo, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Search, MoreVertical, Edit, Trash2, Eye, Download } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFamilies } from '@/hooks/useFamilies';
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
import { Family } from '@/types';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type FamilyWithHead = Family & {
  head_of_family?: {
    full_name: string;
  };
};
import { MobileOptimizedLayout, MobileOptimizedHeader } from '@/components/layout/MobileOptimizedLayout';
import { Pagination } from '@/components/shared/Pagination';
import { EnhancedEmptyState } from '@/components/shared';
import { ExportButton } from '@/components/shared/ExportButton';
import { SortableTableHeader } from '@/components/shared/SortableTableHeader';
import { BulkActionsBar } from '@/components/shared/BulkActionsBar';
import { AdvancedFiltersDialog, FilterConfig } from '@/components/shared/AdvancedFiltersDialog';
import { useTableSort } from '@/hooks/useTableSort';
import { useBulkSelection } from '@/hooks/useBulkSelection';
import { useIsMobile } from '@/hooks/use-mobile';

const Families = memo(() => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, any>>({});
  
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

  const {
    selectedIds,
    selectedCount,
    isSelected,
    isAllSelected,
    toggleSelection,
    toggleAll,
    clearSelection,
  } = useBulkSelection(sortedData);

  const paginatedFamilies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

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

  const handleBulkDelete = async () => {
    if (selectedCount === 0) return;
    
    const confirmed = window.confirm(`هل تريد حذف ${selectedCount} عائلة؟`);
    if (!confirmed) return;

    try {
      await Promise.all(selectedIds.map(id => deleteFamily.mutateAsync(id)));
      toast.success(`تم حذف ${selectedCount} عائلة بنجاح`);
      clearSelection();
    } catch (error) {
      toast.error('فشل حذف بعض العائلات');
    }
  };

  const handleBulkExport = () => {
    const selectedFamilies = families.filter(f => selectedIds.includes(f.id));
    // سيتم تصدير العائلات المحددة
    toast.success(`جاري تصدير ${selectedCount} عائلة...`);
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

  if (isLoading) {
    return <LoadingState size="lg" />;
  }

  if (error) {
    return <FamiliesErrorState error={error as Error} onRetry={() => refetch()} />;
  }

  return (
    <PageErrorBoundary pageName="العائلات">
      <MobileOptimizedLayout>
      {/* Header */}
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

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              إجمالي العائلات
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold">{families.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              العائلات النشطة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold text-primary">
              {families.filter(f => f.status === 'نشط').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              إجمالي الأفراد
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold">
              {families.reduce((sum, f) => sum + f.total_members, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>البحث والتصفية</CardTitle>
          <CardDescription>ابحث عن عائلة بالاسم أو القبيلة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث عن عائلة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Families Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة العائلات</CardTitle>
          <CardDescription>
            عرض جميع العائلات المسجلة ({filteredFamilies.length})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paginatedFamilies.length === 0 ? (
            <EnhancedEmptyState
              icon={Users}
              title="لا توجد عائلات"
              description={
                searchQuery
                  ? 'لا توجد نتائج مطابقة لبحثك. جرب تغيير معايير البحث.'
                  : 'لم يتم إضافة أي عائلات بعد. ابدأ بإضافة عائلة جديدة الآن.'
              }
              action={!searchQuery ? {
                label: "إضافة عائلة جديدة",
                onClick: handleAddFamily
              } : undefined}
            />
          ) : isMobile ? (
            // عرض بطاقات للجوال
            <div className="space-y-3">
              {paginatedFamilies.map((family) => (
                <FamilyMobileCard
                  key={family.id}
                  family={family as FamilyWithHead}
                  isSelected={isSelected(family.id)}
                  onToggleSelection={() => toggleSelection(family.id)}
                  onEdit={() => handleEditFamily(family)}
                  onDelete={() => handleDeleteClick(family)}
                  onViewMembers={() => {
                    setSelectedFamilyForMembers(family);
                    setMembersDialogOpen(true);
                  }}
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
            // عرض الجدول للشاشات الكبيرة
            <div className="space-y-4">
            <div className="rounded-md border overflow-x-auto">
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
                      label="اسم العائلة"
                      sortKey="family_name"
                      currentSort={sortConfig}
                      onSort={handleSort}
                      className="whitespace-nowrap"
                    />
                    <TableHead className="text-right whitespace-nowrap">رب الأسرة</TableHead>
                    <SortableTableHeader
                      label="القبيلة"
                      sortKey="tribe"
                      currentSort={sortConfig}
                      onSort={handleSort}
                      className="hidden md:table-cell whitespace-nowrap"
                    />
                    <SortableTableHeader
                      label="عدد الأفراد"
                      sortKey="total_members"
                      currentSort={sortConfig}
                      onSort={handleSort}
                      className="whitespace-nowrap"
                    />
                    <SortableTableHeader
                      label="الحالة"
                      sortKey="status"
                      currentSort={sortConfig}
                      onSort={handleSort}
                      className="hidden lg:table-cell whitespace-nowrap"
                    />
                    <SortableTableHeader
                      label="تاريخ التسجيل"
                      sortKey="created_at"
                      currentSort={sortConfig}
                      onSort={handleSort}
                      className="hidden lg:table-cell whitespace-nowrap"
                    />
                    <TableHead className="text-right whitespace-nowrap w-[100px]">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedFamilies.map((family) => (
                    <TableRow key={family.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Checkbox
                          checked={isSelected(family.id)}
                          onCheckedChange={() => toggleSelection(family.id)}
                          aria-label={`تحديد ${family.family_name}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-xs sm:text-sm">{family.family_name}</TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {(family as FamilyWithHead).head_of_family?.full_name || '-'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs sm:text-sm">{family.tribe || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs whitespace-nowrap">
                          {family.total_members} أفراد
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge
                          variant={family.status === 'نشط' ? 'default' : 'secondary'}
                          className="text-xs whitespace-nowrap"
                        >
                          {family.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-xs sm:text-sm whitespace-nowrap">
                        {new Date(family.created_at).toLocaleDateString('ar-SA')}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/families/${family.id}`)}>
                              <Eye className="ml-2 h-4 w-4" />
                              شجرة العائلة
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedFamilyForMembers(family);
                              setMembersDialogOpen(true);
                            }}>
                              <Users className="ml-2 h-4 w-4" />
                              عرض الأفراد ({family.total_members})
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditFamily(family)}>
                              <Edit className="ml-2 h-4 w-4" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClick(family)}
                              className="text-destructive"
                            >
                              <Trash2 className="ml-2 h-4 w-4" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              <div className="mt-4 pt-4 border-t">
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Family Dialog */}
      <FamilyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        family={selectedFamily}
        onSave={handleSaveFamily}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف عائلة "{familyToDelete?.family_name}"؟
              <br />
              <span className="text-destructive font-semibold">
                تحذير: سيتم حذف جميع أفراد العائلة ({familyToDelete?.total_members || 0} أفراد) أيضاً!
              </span>
              <br />
              هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedCount}
        onClearSelection={clearSelection}
        onDelete={handleBulkDelete}
        onExport={handleBulkExport}
        customActions={[
          {
            label: 'تصدير المحدد',
            icon: <Download className="h-4 w-4 ml-2" />,
            action: 'export',
            variant: 'outline',
          },
        ]}
        onCustomAction={(action) => {
          if (action === 'export') handleBulkExport();
        }}
      />

      {/* Family Members Dialog */}
      {selectedFamilyForMembers && (
        <FamilyMembersDialog
          open={membersDialogOpen}
          onOpenChange={setMembersDialogOpen}
          familyId={selectedFamilyForMembers.id}
          familyName={selectedFamilyForMembers.family_name}
        />
      )}
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
});

Families.displayName = 'Families';

export default Families;

