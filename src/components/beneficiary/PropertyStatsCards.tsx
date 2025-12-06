import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatsCard } from "./StatsCard";
import { Building2, Home, TrendingUp, DollarSign, Package, MapPin, CheckCircle, Landmark, Receipt, Wallet, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatCurrency } from "@/lib/utils";
import { useFiscalYearPublishStatus } from "@/hooks/useFiscalYearPublishStatus";

interface RentalPaymentWithContract {
  amount_paid: number | null;
  tax_amount: number | null;
  contracts: {
    payment_frequency: string | null;
  } | null;
}

export function PropertyStatsCards() {
  const { isCurrentYearPublished, isLoading: publishStatusLoading } = useFiscalYearPublishStatus();
  
  // جلب بيانات العقارات
  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: ["properties-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select(`
          id,
          name,
          location,
          total_units,
          occupied_units,
          status
        `)
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  // جلب المدفوعات الفعلية مع نوع الدفع من العقود
  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ["rental-payments-collected"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rental_payments")
        .select(`
          amount_paid,
          tax_amount,
          contracts!inner (
            payment_frequency
          )
        `)
        .eq("status", "مدفوع");

      if (error) throw error;
      return (data || []) as RentalPaymentWithContract[];
    },
  });

  const isLoading = propertiesLoading || paymentsLoading || publishStatusLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  // إحصائيات العقارات
  const totalProperties = properties?.length || 0;
  const totalUnits = properties?.reduce((sum, p) => sum + (p.total_units || 0), 0) || 0;
  const occupiedUnits = properties?.reduce((sum, p) => sum + (p.occupied_units || 0), 0) || 0;
  const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

  // فصل المدفوعات حسب نوع الدفع (سنوي/شهري)
  const annualPayments = payments?.filter(p => p.contracts?.payment_frequency === 'سنوي') || [];
  const monthlyPayments = payments?.filter(p => p.contracts?.payment_frequency === 'شهري') || [];

  // حساب الإيجارات المحصلة
  const totalAnnualCollected = annualPayments.reduce((sum, p) => sum + (p.amount_paid || 0), 0);
  const totalMonthlyCollected = monthlyPayments.reduce((sum, p) => sum + (p.amount_paid || 0), 0);
  const totalCollected = totalAnnualCollected + totalMonthlyCollected;

  // الضريبة المستقطعة
  const totalTax = payments?.reduce((sum, p) => sum + (p.tax_amount || 0), 0) || 0;

  // صافي الإيرادات
  const netRevenue = totalCollected - totalTax;

  return (
    <div className="space-y-6">
      {/* إحصائيات العقارات */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          إحصائيات العقارات
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <StatsCard
            title="إجمالي العقارات"
            value={totalProperties}
            icon={Building2}
            colorClass="text-info"
          />
          <StatsCard
            title="إجمالي الوحدات"
            value={totalUnits}
            colorClass="text-info"
            icon={Home}
          />
          <StatsCard
            title="الوحدات المشغولة"
            value={occupiedUnits}
            colorClass="text-success"
            icon={CheckCircle}
          />
          <StatsCard
            title="معدل الإشغال"
            value={`${occupancyRate.toFixed(1)}%`}
            icon={TrendingUp}
            colorClass="text-warning"
          />
        </div>
      </div>

      {/* الإيرادات المحصلة - مخفية حتى النشر */}
      {isCurrentYearPublished ? (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            الإيرادات المحصلة
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <StatsCard
              title="المبلغ المحصل"
              value={formatCurrency(totalCollected)}
              icon={DollarSign}
              colorClass="text-success"
            />
            <StatsCard
              title="الإيجارات السنوية"
              value={formatCurrency(totalAnnualCollected)}
              icon={Receipt}
              colorClass="text-primary"
              trend={annualPayments.length > 0 ? `${annualPayments.length} دفعة` : undefined}
            />
            <StatsCard
              title="الإيجارات الشهرية"
              value={formatCurrency(totalMonthlyCollected)}
              icon={Receipt}
              colorClass="text-accent"
              trend={monthlyPayments.length > 0 ? `${monthlyPayments.length} دفعة` : undefined}
            />
            <StatsCard
              title="صافي الإيرادات"
              value={formatCurrency(netRevenue)}
              icon={TrendingUp}
              colorClass="text-success"
              trend="بعد الضريبة"
            />
          </div>
        </div>
      ) : (
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <EyeOff className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800 dark:text-amber-200">الإيرادات مخفية</AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            بيانات الإيرادات والإيجارات مخفية حتى يتم اعتمادها ونشرها من قبل الناظر
          </AlertDescription>
        </Alert>
      )}

      {/* الاستقطاعات الحكومية - مخفية حتى النشر */}
      {isCurrentYearPublished && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Landmark className="h-4 w-4" />
            الاستقطاعات الحكومية
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <StatsCard
              title="ضريبة القيمة المضافة"
              value={formatCurrency(totalTax)}
              icon={Landmark}
              colorClass="text-destructive"
              trend="هيئة الزكاة والضريبة والجمارك"
            />
            <StatsCard
              title="الزكاة"
              value={formatCurrency(0)}
              icon={Landmark}
              colorClass="text-muted-foreground"
              trend="لم يتم احتسابها"
            />
          </div>
        </div>
      )}

      {/* نظرة سريعة على العقارات */}
      <Card className="border-primary/20">
        <CardHeader className="bg-gradient-to-br from-primary/5 to-background pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5 text-primary" />
            نظرة سريعة على العقارات
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {properties && properties.length > 0 ? (
            <Accordion type="single" collapsible className="space-y-3">
              {properties.map((property) => (
                <AccordionItem
                  key={property.id}
                  value={property.id}
                  className="border border-border/50 rounded-lg overflow-hidden"
                >
                  <AccordionTrigger className="px-3 sm:px-4 hover:no-underline hover:bg-muted/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full pr-3 sm:pr-4 gap-2 sm:gap-0">
                      <div className="text-left flex-1 min-w-0">
                        <h4 className="font-semibold text-xs sm:text-sm lg:text-base truncate">{property.name}</h4>
                        <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1 mt-0.5 sm:mt-1 truncate">
                          <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
                          {property.location}
                        </p>
                      </div>
                      <div className="flex gap-1.5 sm:gap-2 flex-wrap shrink-0">
                        <Badge variant="outline" className="text-[10px] sm:text-xs">
                          {property.total_units || 0} وحدة
                        </Badge>
                        <Badge className="bg-success-light text-success border-success text-[10px] sm:text-xs">
                          {property.occupied_units || 0} مشغول
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] sm:text-xs">
                          {(property.total_units || 0) - (property.occupied_units || 0)} شاغر
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 sm:px-4 pb-3 sm:pb-4">
                    <PropertyUnitsDisplay propertyId={property.id} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">لا توجد عقارات متاحة</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// مكون فرعي لعرض وحدات العقار
function PropertyUnitsDisplay({ propertyId }: { propertyId: string }) {
  const { data: units, isLoading } = useQuery({
    queryKey: ["property-units", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("property_units")
        .select(`
          id,
          unit_number,
          unit_type,
          floor_number,
          area,
          annual_rent,
          occupancy_status,
          current_contract_id
        `)
        .eq("property_id", propertyId)
        .order("unit_number");

      if (error) throw error;
      return data || [];
    },
  });

  const { data: contracts } = useQuery({
    queryKey: ["property-contracts", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts")
        .select("id, tenant_name, monthly_rent")
        .eq("property_id", propertyId)
        .eq("status", "نشط");

      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  if (!units || units.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        لا توجد وحدات مسجلة لهذا العقار
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mt-2">
      {units.map((unit) => {
        const contract = contracts?.find((c) => c.id === unit.current_contract_id);
        const isOccupied = unit.occupancy_status === "مشغول";

        return (
          <Card
            key={unit.id}
            className={`border-l-4 ${
              isOccupied ? "border-l-success" : "border-l-border"
            }`}
          >
            <CardContent className="p-2 sm:p-3">
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h5 className="font-semibold text-xs sm:text-sm truncate flex-1 min-w-0">{unit.unit_number}</h5>
                  <Badge
                    variant={isOccupied ? "default" : "secondary"}
                    className="text-[10px] sm:text-xs shrink-0"
                  >
                    {unit.occupancy_status}
                  </Badge>
                </div>
                <div className="space-y-0.5 sm:space-y-1 text-[10px] sm:text-xs text-muted-foreground">
                  <p className="truncate">النوع: {unit.unit_type || "غير محدد"}</p>
                  {unit.floor_number && <p>الطابق: {unit.floor_number}</p>}
                  {unit.area && <p>المساحة: {unit.area} م²</p>}
                  {unit.annual_rent && (
                    <p className="text-primary font-medium truncate">
                      {formatCurrency(unit.annual_rent / 12)}/شهر
                    </p>
                  )}
                  {contract && (
                    <div className="pt-1 border-t mt-1.5 sm:mt-2">
                      <p className="font-medium text-foreground truncate">
                        المستأجر: {contract.tenant_name}
                      </p>
                     <p className="text-success font-medium truncate">
                        {formatCurrency(contract.monthly_rent)}/شهر
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
