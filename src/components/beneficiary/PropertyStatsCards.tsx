import { StatsCard } from "./StatsCard";
import { Building2, Home, TrendingUp, DollarSign, Package, MapPin, CheckCircle, Landmark, Receipt, Wallet, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatCurrency } from "@/lib/utils";
import { useFiscalYearPublishStatus } from "@/hooks/useFiscalYearPublishStatus";
import { usePropertyStats } from "@/hooks/beneficiary/useBeneficiaryTabsData";
import { PropertyUnitsDisplay } from "./properties/PropertyUnitsDisplay";

export function PropertyStatsCards() {
  const { isCurrentYearPublished, isLoading: publishStatusLoading } = useFiscalYearPublishStatus();
  const { data, isLoading: dataLoading } = usePropertyStats();

  const isLoading = dataLoading || publishStatusLoading;
  const properties = data?.properties || [];
  const payments = data?.payments || [];

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

  const totalProperties = properties.length;
  const totalUnits = properties.reduce((sum, p) => sum + (p.total_units || 0), 0);
  const occupiedUnits = properties.reduce((sum, p) => sum + (p.occupied_units || 0), 0);
  const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

  const annualPayments = payments.filter(p => p.contracts?.payment_frequency === 'سنوي');
  const monthlyPayments = payments.filter(p => p.contracts?.payment_frequency === 'شهري');

  const totalAnnualCollected = annualPayments.reduce((sum, p) => sum + (p.amount_paid || 0), 0);
  const totalMonthlyCollected = monthlyPayments.reduce((sum, p) => sum + (p.amount_paid || 0), 0);
  const totalCollected = totalAnnualCollected + totalMonthlyCollected;
  const totalTax = payments.reduce((sum, p) => sum + (p.tax_amount || 0), 0);
  const netRevenue = totalCollected - totalTax;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          إحصائيات العقارات
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <StatsCard title="إجمالي العقارات" value={totalProperties} icon={Building2} colorClass="text-info" />
          <StatsCard title="إجمالي الوحدات" value={totalUnits} colorClass="text-info" icon={Home} />
          <StatsCard title="الوحدات المشغولة" value={occupiedUnits} colorClass="text-success" icon={CheckCircle} />
          <StatsCard title="معدل الإشغال" value={`${occupancyRate.toFixed(1)}%`} icon={TrendingUp} colorClass="text-warning" />
        </div>
      </div>

      {isCurrentYearPublished ? (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            الإيرادات المحصلة
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <StatsCard title="المبلغ المحصل" value={formatCurrency(totalCollected)} icon={DollarSign} colorClass="text-success" />
            <StatsCard title="الإيجارات السنوية" value={formatCurrency(totalAnnualCollected)} icon={Receipt} colorClass="text-primary" trend={annualPayments.length > 0 ? `${annualPayments.length} دفعة` : undefined} />
            <StatsCard title="الإيجارات الشهرية" value={formatCurrency(totalMonthlyCollected)} icon={Receipt} colorClass="text-accent" trend={monthlyPayments.length > 0 ? `${monthlyPayments.length} دفعة` : undefined} />
            <StatsCard title="صافي الإيرادات" value={formatCurrency(netRevenue)} icon={TrendingUp} colorClass="text-success" trend="بعد الضريبة" />
          </div>
        </div>
      ) : (
        <Alert className="border-warning/30 bg-warning-light">
          <EyeOff className="h-4 w-4 text-warning" />
          <AlertTitle className="text-warning">الإيرادات مخفية</AlertTitle>
          <AlertDescription className="text-warning/80">
            بيانات الإيرادات والإيجارات مخفية حتى يتم اعتمادها ونشرها من قبل الناظر
          </AlertDescription>
        </Alert>
      )}

      {isCurrentYearPublished && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Landmark className="h-4 w-4" />
            الاستقطاعات الحكومية
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <StatsCard title="ضريبة القيمة المضافة" value={formatCurrency(totalTax)} icon={Landmark} colorClass="text-destructive" trend="هيئة الزكاة والضريبة والجمارك" />
            <StatsCard title="الزكاة" value={formatCurrency(0)} icon={Landmark} colorClass="text-muted-foreground" trend="لم يتم احتسابها" />
          </div>
        </div>
      )}

      <Card className="border-primary/20">
        <CardHeader className="bg-gradient-to-br from-primary/5 to-background pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5 text-primary" />
            نظرة سريعة على العقارات
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {properties.length > 0 ? (
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
