import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Search,
  Building2,
  Home,
  Maximize2,
  BedDouble,
  Droplet,
  Car,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2
} from "lucide-react";
import { usePropertyUnits } from "@/hooks/usePropertyUnits";
import { PropertyUnitDialog } from "./PropertyUnitDialog";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EnhancedEmptyState } from "@/components/shared";
import { ScrollableTableWrapper } from "@/components/shared/ScrollableTableWrapper";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type DbPropertyUnit = Database['public']['Tables']['property_units']['Row'];

interface PropertyUnitsManagementProps {
  propertyId?: string;
}

export function PropertyUnitsManagement({ propertyId = '' }: PropertyUnitsManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<DbPropertyUnit | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<DbPropertyUnit | null>(null);
  
  const { units, isLoading, deleteUnit, error, refetch } = usePropertyUnits(propertyId);
  const { toast } = useToast();

  // Show message if no propertyId selected
  if (!propertyId) {
    return (
      <Card>
        <CardContent className="py-12">
          <EnhancedEmptyState
            icon={Building2}
            title="إدارة الوحدات العقارية"
            description="اختر عقاراً من القائمة أعلاه لإدارة وحداته"
          />
        </CardContent>
      </Card>
    );
  }

  const filteredUnits = (units || []).filter(unit =>
    unit.unit_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    unit.unit_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (unit: DbPropertyUnit) => {
    setSelectedUnit(unit);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setSelectedUnit(undefined);
    setDialogOpen(false);
  };

  const handleDeleteClick = (unit: DbPropertyUnit) => {
    setUnitToDelete(unit);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!unitToDelete) return;
    
    try {
      await deleteUnit(unitToDelete.id);
      toast({
        title: "تم الحذف",
        description: `تم حذف الوحدة ${unitToDelete.unit_number} بنجاح`,
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف الوحدة",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setUnitToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      'متاح': 'bg-success/10 text-success border-success/30',
      'مشغول': 'bg-info/10 text-info border-info/30',
      'صيانة': 'bg-warning/10 text-warning border-warning/30',
      'غير متاح': 'bg-muted text-muted-foreground border-border',
    };
    return (
      <Badge variant="outline" className={statusColors[status] || ''}>
        {status}
      </Badge>
    );
  };

  const getOccupancyBadge = (status: string | null) => {
    if (status === 'مشغول') {
      return <Badge variant="outline" className="bg-info/10 text-info">مشغول</Badge>;
    }
    return <Badge variant="outline" className="bg-success/10 text-success">شاغر</Badge>;
  };

  if (isLoading) {
    return <LoadingState message="جاري تحميل الوحدات..." />;
  }

  if (error) {
    return <ErrorState title="خطأ في تحميل الوحدات" message={(error as Error).message} onRetry={refetch} />;
  }

  const occupiedCount = units.filter(u => u.occupancy_status === 'مشغول').length;
  const availableCount = units.filter(u => u.status === 'متاح').length;
  const maintenanceCount = units.filter(u => u.status === 'صيانة').length;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              إدارة الوحدات
              <Badge variant="secondary">{units.length} وحدة</Badge>
            </CardTitle>
            <Button onClick={() => setDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 ml-2" />
              إضافة وحدة
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* بحث */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث برقم أو اسم الوحدة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>

          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-accent/30 rounded-lg p-3 border">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">إجمالي</span>
              </div>
              <p className="text-xl font-bold">{units.length}</p>
            </div>
            <div className="bg-success/10 rounded-lg p-3 border border-success/30">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-xs text-muted-foreground">متاح</span>
              </div>
              <p className="text-xl font-bold">{availableCount}</p>
            </div>
            <div className="bg-info/10 rounded-lg p-3 border border-info/30">
              <div className="flex items-center gap-2 mb-1">
                <Home className="h-4 w-4 text-info" />
                <span className="text-xs text-muted-foreground">مشغول</span>
              </div>
              <p className="text-xl font-bold">{occupiedCount}</p>
            </div>
            <div className="bg-warning/10 rounded-lg p-3 border border-warning/30">
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="h-4 w-4 text-warning" />
                <span className="text-xs text-muted-foreground">صيانة</span>
              </div>
              <p className="text-xl font-bold">{maintenanceCount}</p>
            </div>
          </div>

          {/* جدول الوحدات */}
          {filteredUnits.length === 0 ? (
            <EnhancedEmptyState
              icon={Building2}
              title="لا توجد وحدات"
              description="ابدأ بإضافة الوحدات للعقار"
              action={{
                label: "إضافة وحدة جديدة",
                onClick: () => setDialogOpen(true)
              }}
            />
          ) : (
            <ScrollableTableWrapper>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">رقم الوحدة</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden lg:table-cell">الاسم</TableHead>
                    <TableHead className="text-xs sm:text-sm">النوع</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden md:table-cell">الطابق</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden lg:table-cell">المساحة</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden lg:table-cell">الغرف</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden md:table-cell">الإيجار</TableHead>
                    <TableHead className="text-xs sm:text-sm">الحالة</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden md:table-cell">الإشغال</TableHead>
                    <TableHead className="text-center text-xs sm:text-sm">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUnits.map((unit) => (
                    <TableRow key={unit.id}>
                      <TableCell className="font-medium text-xs sm:text-sm">{unit.unit_number}</TableCell>
                      <TableCell className="text-xs sm:text-sm hidden lg:table-cell">{unit.unit_name || '-'}</TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <Badge variant="outline">{unit.unit_type}</Badge>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm hidden md:table-cell">{unit.floor_number || '-'}</TableCell>
                      <TableCell className="text-xs sm:text-sm hidden lg:table-cell">
                        {unit.area ? (
                          <span className="flex items-center gap-1">
                            <Maximize2 className="h-3 w-3" />
                            {unit.area} م²
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <BedDouble className="h-3 w-3" />
                            {unit.rooms}
                          </span>
                          <span className="flex items-center gap-1">
                            <Droplet className="h-3 w-3" />
                            {unit.bathrooms}
                          </span>
                          {unit.has_parking && (
                            <span className="flex items-center gap-1">
                              <Car className="h-3 w-3" />
                              {unit.parking_spaces}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm hidden md:table-cell whitespace-nowrap">
                        {unit.monthly_rent ? (
                          <span className="font-medium">
                            {unit.monthly_rent.toLocaleString()} ر.س
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">{getStatusBadge(unit.status)}</TableCell>
                      <TableCell className="text-xs sm:text-sm hidden md:table-cell">
                        {getOccupancyBadge(unit.occupancy_status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEdit(unit)}
                            title="تعديل"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteClick(unit)}
                            title="حذف"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollableTableWrapper>
          )}
        </CardContent>
      </Card>

      <PropertyUnitDialog
        open={dialogOpen}
        onOpenChange={handleClose}
        propertyId={propertyId}
        unit={selectedUnit}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف الوحدة "{unitToDelete?.unit_number}"؟ 
              لا يمكن التراجع عن هذا الإجراء.
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
    </>
  );
}
