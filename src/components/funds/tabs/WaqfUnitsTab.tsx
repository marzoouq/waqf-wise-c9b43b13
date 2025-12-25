/**
 * WaqfUnitsTab - تبويب أقلام الوقف
 * يعرض بيانات أقلام الوقف من جدول waqf_units
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollableTableWrapper } from "@/components/shared/ScrollableTableWrapper";
import { MobileScrollHint } from "@/components/shared/MobileScrollHint";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingState } from "@/components/shared/LoadingState";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { Building2, MapPin, TrendingUp, Pencil, Trash2 } from "lucide-react";
import { useWaqfUnits, type WaqfUnit } from "@/hooks/distributions/useWaqfUnits";
import { WaqfUnitDialog } from "@/components/waqf/WaqfUnitDialog";

interface WaqfUnitData {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  waqf_type: string;
  location?: string | null;
  acquisition_date?: string | null;
  acquisition_value?: number | null;
  current_value?: number | null;
  annual_return?: number | null;
  is_active: boolean;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

interface WaqfUnitsTabProps {
  waqfUnits: WaqfUnitData[];
  isLoading: boolean;
}

export function WaqfUnitsTab({ waqfUnits, isLoading }: WaqfUnitsTabProps) {
  const { deleteWaqfUnit } = useWaqfUnits();
  const [editingUnit, setEditingUnit] = useState<WaqfUnitData | null>(null);
  const [deletingUnit, setDeletingUnit] = useState<WaqfUnitData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deletingUnit) return;
    setIsDeleting(true);
    try {
      await deleteWaqfUnit(deletingUnit.id);
      setDeletingUnit(null);
    } catch (error) {
      // Error handled by hook
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="جاري تحميل أقلام الوقف..." />;
  }

  if (waqfUnits.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="لا توجد أقلام وقف"
        description="ابدأ بإضافة قلم وقف جديد من صفحة أقلام الوقف"
      />
    );
  }

  const getTypeBadge = (type: string) => {
    const typeColors: Record<string, string> = {
      'عقار': 'bg-primary/10 text-primary',
      'نقدي': 'bg-success/10 text-success',
      'أسهم': 'bg-warning/10 text-warning',
      'مشروع': 'bg-secondary/10 text-secondary',
    };
    return <Badge className={typeColors[type] || 'bg-muted'}>{type}</Badge>;
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? <Badge variant="default" className="bg-success">نشط</Badge>
      : <Badge variant="secondary">غير نشط</Badge>;
  };

  return (
    <>
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            أقلام الوقف
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MobileScrollHint />
          <ScrollableTableWrapper>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">الكود</TableHead>
                  <TableHead className="whitespace-nowrap">الاسم</TableHead>
                  <TableHead className="whitespace-nowrap">النوع</TableHead>
                  <TableHead className="whitespace-nowrap hidden sm:table-cell">قيمة الاقتناء</TableHead>
                  <TableHead className="whitespace-nowrap hidden md:table-cell">القيمة الحالية</TableHead>
                  <TableHead className="whitespace-nowrap">العائد السنوي</TableHead>
                  <TableHead className="whitespace-nowrap">الحالة</TableHead>
                  <TableHead className="whitespace-nowrap text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {waqfUnits.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-mono text-sm">{unit.code}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{unit.name}</span>
                        {unit.location && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {unit.location}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(unit.waqf_type)}</TableCell>
                    <TableCell className="whitespace-nowrap hidden sm:table-cell">
                      {Number(unit.acquisition_value || 0).toLocaleString('ar-SA')} ر.س
                    </TableCell>
                    <TableCell className="whitespace-nowrap hidden md:table-cell">
                      {Number(unit.current_value || 0).toLocaleString('ar-SA')} ر.س
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span className="flex items-center gap-1 text-success">
                        <TrendingUp className="h-3 w-3" />
                        {Number(unit.annual_return || 0).toLocaleString('ar-SA')} ر.س
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(unit.is_active)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingUnit(unit)}
                          title="تعديل"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingUnit(unit)}
                          className="text-destructive hover:text-destructive"
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollableTableWrapper>

          {/* ملخص */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {waqfUnits.reduce((sum, u) => sum + Number(u.acquisition_value || 0), 0).toLocaleString('ar-SA')}
              </p>
              <p className="text-xs text-muted-foreground">إجمالي قيمة الاقتناء</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success">
                {waqfUnits.reduce((sum, u) => sum + Number(u.current_value || 0), 0).toLocaleString('ar-SA')}
              </p>
              <p className="text-xs text-muted-foreground">إجمالي القيمة الحالية</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">
                {waqfUnits.reduce((sum, u) => sum + Number(u.annual_return || 0), 0).toLocaleString('ar-SA')}
              </p>
              <p className="text-xs text-muted-foreground">إجمالي العائد السنوي</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* حوار التعديل */}
      <WaqfUnitDialog
        open={!!editingUnit}
        onOpenChange={(open) => !open && setEditingUnit(null)}
        waqfUnit={editingUnit as WaqfUnit | undefined}
      />

      {/* حوار تأكيد الحذف */}
      <DeleteConfirmDialog
        open={!!deletingUnit}
        onOpenChange={(open) => !open && setDeletingUnit(null)}
        onConfirm={handleDelete}
        title="حذف قلم الوقف"
        description={`هل أنت متأكد من حذف قلم الوقف "${deletingUnit?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        isLoading={isDeleting}
      />
    </>
  );
}