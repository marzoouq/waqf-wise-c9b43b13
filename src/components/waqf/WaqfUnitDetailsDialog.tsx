import { useState, useEffect } from "react";
import { Building2, MapPin, Calendar, TrendingUp, DollarSign, Home, Link2, CalendarDays, CalendarRange, Calculator } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { format } from "@/lib/date";
import type { WaqfUnit } from "@/hooks/useWaqfUnits";
import { LinkPropertyDialog } from "./LinkPropertyDialog";

interface ContractInfo {
  monthly_rent: number;
  payment_frequency: string;
  status: string;
}

interface Property {
  id: string;
  name: string;
  type: string;
  location: string;
  units: number;
  occupied: number;
  monthly_revenue: number;
  status: string;
  contracts?: ContractInfo[];
}

interface WaqfUnitDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  waqfUnit: WaqfUnit | null;
  onRefresh?: () => void;
}

export function WaqfUnitDetailsDialog({
  open,
  onOpenChange,
  waqfUnit,
  onRefresh,
}: WaqfUnitDetailsDialogProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);

  useEffect(() => {
    if (open && waqfUnit) {
      fetchProperties();
    }
  }, [open, waqfUnit?.id]);

  const fetchProperties = async () => {
    if (!waqfUnit) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("properties")
        .select(`
          id, name, type, location, units, occupied, monthly_revenue, status,
          contracts!contracts_property_id_fkey(
            monthly_rent, 
            payment_frequency, 
            status
          )
        `)
        .eq("waqf_unit_id", waqfUnit.id);

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePropertyLinked = () => {
    fetchProperties();
    onRefresh?.();
  };

  if (!waqfUnit) return null;

  // حساب الإيرادات من العقود النشطة
  const calculateRevenues = () => {
    let monthlyFromContracts = 0; // إيرادات من عقود شهرية
    let annualFromContracts = 0; // إيرادات من عقود سنوية

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

    // إجمالي الإيرادات السنوية = (الشهري × 12) + السنوي
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

              {/* Revenue Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                    <CalendarDays className="h-5 w-5" />
                    <span className="font-semibold">الإيراد الشهري</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {revenues.monthlyRevenue.toLocaleString("ar-SA")} ريال
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    من العقود الشهرية النشطة
                  </p>
                </Card>

                <Card className="p-4 border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                    <CalendarRange className="h-5 w-5" />
                    <span className="font-semibold">الإيراد السنوي</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {revenues.annualRevenue.toLocaleString("ar-SA")} ريال
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    من العقود السنوية النشطة
                  </p>
                </Card>

                <Card className="p-4 border-primary/30 bg-primary/5">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <Calculator className="h-5 w-5" />
                    <span className="font-semibold">إجمالي الإيرادات السنوية</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    {revenues.totalYearlyIncome.toLocaleString("ar-SA")} ريال
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    (الشهري × 12) + السنوي
                  </p>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="properties" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">العقارات المرتبطة بقلم الوقف</h4>
                <Button
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
                <Card className="p-8 text-center">
                  <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h4 className="font-semibold mb-2">لا توجد عقارات مرتبطة</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    لم يتم ربط أي عقارات بقلم الوقف هذا بعد
                  </p>
                  <Button onClick={() => setLinkDialogOpen(true)} className="gap-2">
                    <Link2 className="h-4 w-4" />
                    ربط عقار
                  </Button>
                </Card>
              ) : (
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">العقار</TableHead>
                        <TableHead className="text-right">النوع</TableHead>
                        <TableHead className="text-right">الموقع</TableHead>
                        <TableHead className="text-right">الوحدات</TableHead>
                        <TableHead className="text-right">نوع الدفع</TableHead>
                        <TableHead className="text-right">قيمة الإيجار</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {properties.map((property) => {
                        const activeContract = property.contracts?.find(c => c.status === 'نشط');
                        const paymentType = activeContract?.payment_frequency || '-';
                        const rentAmount = activeContract?.monthly_rent || 0;
                        
                        return (
                          <TableRow key={property.id}>
                            <TableCell className="font-medium">{property.name}</TableCell>
                            <TableCell>{property.type}</TableCell>
                            <TableCell>{property.location}</TableCell>
                            <TableCell>
                              {property.occupied}/{property.units}
                            </TableCell>
                            <TableCell>
                              <Badge variant={paymentType === 'شهري' ? 'default' : paymentType === 'سنوي' ? 'secondary' : 'outline'}>
                                {paymentType}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-primary font-semibold">
                              {rentAmount.toLocaleString("ar-SA")} ريال
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  property.status === "مؤجر"
                                    ? "default"
                                    : property.status === "شاغر"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {property.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Card>
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
