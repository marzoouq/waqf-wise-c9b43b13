import { useState, useEffect } from "react";
import { Building2, MapPin, TrendingUp, DollarSign, Home, Link2, CalendarDays, CalendarRange, Calculator, Receipt, Wallet, TrendingDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "@/lib/date";
import type { WaqfUnit } from "@/hooks/distributions/useWaqfUnits";
import { useWaqfRevenueByFiscalYear } from "@/hooks/reports/useWaqfRevenueByFiscalYear";
import { useWaqfUnitProperties } from "@/hooks/waqf/useWaqfProperties";
import { LinkPropertyDialog } from "./LinkPropertyDialog";

interface WaqfUnitDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  waqfUnit: WaqfUnit | null;
  selectedFiscalYearId?: string;
  onRefresh?: () => void;
}

export function WaqfUnitDetailsDialog({
  open,
  onOpenChange,
  waqfUnit,
  selectedFiscalYearId,
  onRefresh,
}: WaqfUnitDetailsDialogProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [currentFiscalYearId, setCurrentFiscalYearId] = useState<string | undefined>(selectedFiscalYearId);

  // جلب عقارات قلم الوقف
  const { data: properties = [], isLoading, refetch: refetchProperties } = useWaqfUnitProperties(waqfUnit?.id);

  // جلب بيانات الإيرادات حسب السنة المالية
  const { revenueData, fiscalYears, activeFiscalYear } = useWaqfRevenueByFiscalYear(
    waqfUnit?.id,
    currentFiscalYearId
  );

  // تحديث السنة المالية عند فتح الحوار
  useEffect(() => {
    if (open) {
      setCurrentFiscalYearId(selectedFiscalYearId || activeFiscalYear?.id);
    }
  }, [open, selectedFiscalYearId, activeFiscalYear?.id]);

  const handlePropertyLinked = () => {
    refetchProperties();
    onRefresh?.();
  };

  if (!waqfUnit) return null;

  // حساب الإيرادات من العقود النشطة
  const calculateRevenues = () => {
    let monthlyFromContracts = 0;
    let annualFromContracts = 0;

    properties.forEach((property) => {
      const activeContracts = property.contracts?.filter(c => c.status === 'نشط') || [];
      activeContracts.forEach((contract) => {
        if (contract.payment_frequency === 'شهري') {
          monthlyFromContracts += contract.monthly_rent || 0;
        } else if (contract.payment_frequency === 'سنوي') {
          annualFromContracts += contract.monthly_rent || 0;
        }
      });
    });

    const totalYearlyIncome = (monthlyFromContracts * 12) + annualFromContracts;

    return {
      monthlyRevenue: monthlyFromContracts,
      annualRevenue: annualFromContracts,
      totalYearlyIncome,
    };
  };

  const revenues = calculateRevenues();
  const totalUnits = properties.reduce((sum, p) => sum + (p.units || 0), 0);
  const totalOccupied = properties.reduce((sum, p) => sum + (p.occupied || 0), 0);
  const occupancyRate = totalUnits > 0 ? Math.round((totalOccupied / totalUnits) * 100) : 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              تفاصيل قلم الوقف - {waqfUnit.name}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">المعلومات الأساسية</TabsTrigger>
              <TabsTrigger value="properties">
                العقارات المرتبطة ({properties.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4 mt-4">
              {/* Basic Info Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Building2 className="h-4 w-4" />
                    <span className="text-xs">الكود</span>
                  </div>
                  <p className="font-semibold">{waqfUnit.code}</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <MapPin className="h-4 w-4" />
                    <span className="text-xs">الموقع</span>
                  </div>
                  <p className="font-semibold">{waqfUnit.location || "-"}</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-xs">القيمة الحالية</span>
                  </div>
                  <p className="font-semibold text-primary">
                    {(waqfUnit.current_value || 0).toLocaleString("ar-SA")} ريال
                  </p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-xs">العائد السنوي</span>
                  </div>
                  <p className="font-semibold text-success">
                    {(waqfUnit.annual_return || 0).toLocaleString("ar-SA")} ريال
                  </p>
                </Card>
              </div>

              {/* Description */}
              {waqfUnit.description && (
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">الوصف</h4>
                  <p className="text-muted-foreground">{waqfUnit.description}</p>
                </Card>
              )}

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 className="font-semibold mb-3">معلومات الاستحواذ</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">تاريخ الاستحواذ:</span>
                      <span>
                        {waqfUnit.acquisition_date
                          ? format(new Date(waqfUnit.acquisition_date), "dd/MM/yyyy")
                          : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">قيمة الاستحواذ:</span>
                      <span>
                        {(waqfUnit.acquisition_value || 0).toLocaleString("ar-SA")} ريال
                      </span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3">ملخص العقارات</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">عدد العقارات:</span>
                      <span>{properties.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">نسبة الإشغال:</span>
                      <span>{occupancyRate}%</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Fiscal Year Selector */}
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    <span className="font-semibold">إيرادات السنة المالية</span>
                  </div>
                  <Select 
                    value={currentFiscalYearId || ''} 
                    onValueChange={setCurrentFiscalYearId}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="اختر السنة المالية" />
                    </SelectTrigger>
                    <SelectContent>
                      {fiscalYears.map((fy) => (
                        <SelectItem key={fy.id} value={fy.id}>
                          {fy.name} {fy.is_active && "(نشطة)"} {fy.is_closed && "(مغلقة)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </Card>

              {/* Revenue Cards - Based on Fiscal Year */}
              {revenueData ? (
                revenueData.isClosed ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-4 border-success/30 bg-success/5">
                      <div className="flex items-center gap-2 text-success mb-2">
                        <Wallet className="h-5 w-5" />
                        <span className="font-semibold">إجمالي الإيرادات</span>
                      </div>
                      <p className="text-2xl font-bold text-success">
                        {revenueData.totalCollected.toLocaleString("ar-SA")} ريال
                      </p>
                      <Badge variant="secondary" className="mt-2">سنة مغلقة</Badge>
                    </Card>

                    <Card className="p-4 border-destructive/30 bg-destructive/5">
                      <div className="flex items-center gap-2 text-destructive mb-2">
                        <TrendingDown className="h-5 w-5" />
                        <span className="font-semibold">المصروفات</span>
                      </div>
                      <p className="text-2xl font-bold text-destructive">
                        {(revenueData.totalExpenses || 0).toLocaleString("ar-SA")} ريال
                      </p>
                    </Card>

                    <Card className="p-4 border-primary/30 bg-primary/5">
                      <div className="flex items-center gap-2 text-primary mb-2">
                        <Calculator className="h-5 w-5" />
                        <span className="font-semibold">صافي الدخل</span>
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        {(revenueData.netIncome || 0).toLocaleString("ar-SA")} ريال
                      </p>
                    </Card>

                    <Card className="p-4 border-warning/30 bg-warning/5">
                      <div className="flex items-center gap-2 text-warning mb-2">
                        <TrendingUp className="h-5 w-5" />
                        <span className="font-semibold">رقبة الوقف</span>
                      </div>
                      <p className="text-2xl font-bold text-warning">
                        {(revenueData.waqfCorpus || 0).toLocaleString("ar-SA")} ريال
                      </p>
                    </Card>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-4 border-info/30 bg-info/5">
                      <div className="flex items-center gap-2 text-info mb-2">
                        <CalendarDays className="h-5 w-5" />
                        <span className="font-semibold">المحصّل الشهري</span>
                      </div>
                      <p className="text-2xl font-bold text-info">
                        {revenueData.monthlyCollected.toLocaleString("ar-SA")} ريال
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">من عقود شهرية</p>
                    </Card>

                    <Card className="p-4 border-success/30 bg-success/5">
                      <div className="flex items-center gap-2 text-success mb-2">
                        <CalendarRange className="h-5 w-5" />
                        <span className="font-semibold">المحصّل السنوي</span>
                      </div>
                      <p className="text-2xl font-bold text-success">
                        {revenueData.annualCollected.toLocaleString("ar-SA")} ريال
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">من عقود سنوية</p>
                    </Card>

                    <Card className="p-4 border-warning/30 bg-warning/5">
                      <div className="flex items-center gap-2 text-warning mb-2">
                        <Receipt className="h-5 w-5" />
                        <span className="font-semibold">الضريبة</span>
                      </div>
                      <p className="text-2xl font-bold text-warning">
                        {revenueData.totalTax.toLocaleString("ar-SA")} ريال
                      </p>
                    </Card>

                    <Card className="p-4 border-primary/30 bg-primary/5">
                      <div className="flex items-center gap-2 text-primary mb-2">
                        <Calculator className="h-5 w-5" />
                        <span className="font-semibold">صافي الإيراد</span>
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        {revenueData.netRevenue.toLocaleString("ar-SA")} ريال
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">بعد خصم الضريبة</p>
                    </Card>
                  </div>
                )
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 border-info/30 bg-info/10">
                    <div className="flex items-center gap-2 text-info mb-2">
                      <CalendarDays className="h-5 w-5" />
                      <span className="font-semibold">الإيراد الشهري</span>
                    </div>
                    <p className="text-2xl font-bold text-info">
                      {revenues.monthlyRevenue.toLocaleString("ar-SA")} ريال
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">من العقود الشهرية النشطة</p>
                  </Card>

                  <Card className="p-4 border-success/30 bg-success/10">
                    <div className="flex items-center gap-2 text-success mb-2">
                      <CalendarRange className="h-5 w-5" />
                      <span className="font-semibold">الإيراد السنوي</span>
                    </div>
                    <p className="text-2xl font-bold text-success">
                      {revenues.annualRevenue.toLocaleString("ar-SA")} ريال
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">من العقود السنوية النشطة</p>
                  </Card>

                  <Card className="p-4 border-primary/30 bg-primary/5">
                    <div className="flex items-center gap-2 text-primary mb-2">
                      <Calculator className="h-5 w-5" />
                      <span className="font-semibold">إجمالي الدخل السنوي</span>
                    </div>
                    <p className="text-2xl font-bold text-primary">
                      {revenues.totalYearlyIncome.toLocaleString("ar-SA")} ريال
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">(الشهري × 12) + السنوي</p>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="properties" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">العقارات المرتبطة</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLinkDialogOpen(true)}
                  className="gap-2"
                >
                  <Link2 className="h-4 w-4" />
                  ربط عقار
                </Button>
              </div>

              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  جاري التحميل...
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-8 border rounded-lg bg-muted/50">
                  <Home className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">لا توجد عقارات مرتبطة</p>
                  <Button
                    variant="link"
                    onClick={() => setLinkDialogOpen(true)}
                    className="mt-2"
                  >
                    ربط عقار جديد
                  </Button>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">العقار</TableHead>
                        <TableHead className="text-right">النوع</TableHead>
                        <TableHead className="text-right">الموقع</TableHead>
                        <TableHead className="text-right">الوحدات</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {properties.map((property) => (
                        <TableRow key={property.id}>
                          <TableCell className="font-medium">
                            {property.name}
                          </TableCell>
                          <TableCell>{property.type}</TableCell>
                          <TableCell>{property.location}</TableCell>
                          <TableCell>
                            {property.occupied}/{property.units}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                property.status === "نشط"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {property.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <LinkPropertyDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        waqfUnitId={waqfUnit.id}
        onSuccess={handlePropertyLinked}
      />
    </>
  );
}
