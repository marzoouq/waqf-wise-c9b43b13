import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Search, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFamilies } from '@/hooks/useFamilies';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
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
import { Family } from '@/types';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type FamilyWithHead = Family & {
  head_of_family?: {
    full_name: string;
  };
};
import { ScrollableTableWrapper } from '@/components/shared/ScrollableTableWrapper';
import { MobileScrollHint } from '@/components/shared/MobileScrollHint';
import { MobileOptimizedLayout, MobileOptimizedHeader } from '@/components/layout/MobileOptimizedLayout';

const Families = () => {
  const navigate = useNavigate();
  const { families, isLoading, addFamily, updateFamily, deleteFamily } = useFamilies();
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [familyToDelete, setFamilyToDelete] = useState<Family | null>(null);

  const filteredFamilies = families.filter(family =>
    family.family_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    family.tribe?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground break-words">سجل العائلات</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
            إدارة العائلات وربط أفرادها ببعضهم البعض
          </p>
        </div>
        <Button onClick={handleAddFamily} className="w-full sm:w-auto gap-2 text-sm sm:text-base" size="sm">
          <Plus className="h-4 w-4" />
          إضافة عائلة
        </Button>
      </div>

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
          {filteredFamilies.length === 0 ? (
            <EmptyState
              icon={Users}
              title="لا توجد عائلات"
              description={
                searchQuery
                  ? 'لا توجد نتائج مطابقة لبحثك'
                  : 'لم يتم إضافة أي عائلات بعد'
              }
            />
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right whitespace-nowrap">اسم العائلة</TableHead>
                    <TableHead className="text-right whitespace-nowrap">رب الأسرة</TableHead>
                    <TableHead className="text-right whitespace-nowrap hidden md:table-cell">القبيلة</TableHead>
                    <TableHead className="text-right whitespace-nowrap">عدد الأفراد</TableHead>
                    <TableHead className="text-right whitespace-nowrap hidden lg:table-cell">الحالة</TableHead>
                    <TableHead className="text-right whitespace-nowrap hidden lg:table-cell">تاريخ التسجيل</TableHead>
                    <TableHead className="text-right whitespace-nowrap w-[100px]">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFamilies.map((family) => (
                    <TableRow key={family.id} className="hover:bg-muted/50">
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
                            <DropdownMenuItem onClick={() => navigate(`/beneficiaries?family=${family.id}`)}>
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
    </div>
  );
};

export default Families;

