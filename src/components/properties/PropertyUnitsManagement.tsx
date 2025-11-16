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
  Plus,
  Search,
  Building2,
  Home,
  DoorOpen,
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
import { EnhancedEmptyState } from "@/components/shared/EnhancedEmptyState";
import { ScrollableTableWrapper } from "@/components/shared/ScrollableTableWrapper";

interface PropertyUnitsManagementProps {
  propertyId?: string;
}

export function PropertyUnitsManagement({ propertyId = '' }: PropertyUnitsManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<any | undefined>();
  
  const { units, isLoading } = usePropertyUnits(propertyId);

  // Show message if no propertyId selected
  if (!propertyId) {
    return (
      <Card>
        <CardContent className="py-12">
          <EnhancedEmptyState
            icon={Building2}
            title="إدارة الوحدات العقارية"
            description="حدد عقاراً من تبويب العقارات لإدارة وحداته"
          />
        </CardContent>
      </Card>
    );
  }

  const filteredUnits = (units as any[]).filter(unit =>
    unit.unit_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    unit.unit_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (unit: any) => {
    setSelectedUnit(unit);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setSelectedUnit(undefined);
    setDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      'متاح': 'bg-green-50 text-green-700 border-green-200',
      'مشغول': 'bg-blue-50 text-blue-700 border-blue-200',
      'صيانة': 'bg-amber-50 text-amber-700 border-amber-200',
      'غير متاح': 'bg-gray-50 text-gray-700 border-gray-200',
    };
    return (
      <Badge variant="outline" className={statusColors[status] || ''}>
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return <LoadingState message="جاري تحميل الوحدات..." />;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              إدارة الوحدات
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
              <p className="text-xl font-bold">{(units as any[]).length}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-xs text-muted-foreground">متاح</span>
              </div>
              <p className="text-xl font-bold">
                {(units as any[]).filter(u => u.status === 'متاح').length}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <Home className="h-4 w-4 text-blue-600" />
                <span className="text-xs text-muted-foreground">مشغول</span>
              </div>
              <p className="text-xl font-bold">
                {(units as any[]).filter(u => u.occupancy_status === 'مشغول').length}
              </p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="h-4 w-4 text-amber-600" />
                <span className="text-xs text-muted-foreground">صيانة</span>
              </div>
              <p className="text-xl font-bold">
                {(units as any[]).filter(u => u.status === 'صيانة').length}
              </p>
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
                    <TableHead>رقم الوحدة</TableHead>
                    <TableHead>الاسم</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>الطابق</TableHead>
                    <TableHead>المساحة</TableHead>
                    <TableHead>الغرف</TableHead>
                    <TableHead>الإيجار</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead className="text-center">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUnits.map((unit) => (
                    <TableRow key={unit.id}>
                      <TableCell className="font-medium">{unit.unit_number}</TableCell>
                      <TableCell>{unit.unit_name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{unit.unit_type}</Badge>
                      </TableCell>
                      <TableCell>{unit.floor_number || '-'}</TableCell>
                      <TableCell>
                        {unit.area ? (
                          <span className="flex items-center gap-1">
                            <Maximize2 className="h-3 w-3" />
                            {unit.area} م²
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs">
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
                      <TableCell>
                        {unit.monthly_rent ? (
                          <span className="font-medium">
                            {unit.monthly_rent.toLocaleString()} ر.س
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(unit.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEdit(unit)}
                          >
                            <Edit className="h-4 w-4" />
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
    </>
  );
}
