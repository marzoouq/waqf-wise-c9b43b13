import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { StatsCard } from "./StatsCard";
import { Building2, Home, TrendingUp, DollarSign, Package, MapPin, CheckCircle, Landmark, Receipt, Wallet, EyeOff, ArrowLeft, ChevronLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatCurrency } from "@/lib/utils";
import { useFiscalYearPublishInfo } from "@/hooks/fiscal-years";
import { usePropertyStats } from "@/hooks/beneficiary/useBeneficiaryTabsData";
import { ErrorState } from "@/components/shared/ErrorState";
import { motion } from "framer-motion";

const MAX_PROPERTIES_DISPLAY = 5;

export function PropertyStatsCards() {
  const navigate = useNavigate();
  const { isCurrentYearPublished, isLoading: publishStatusLoading } = useFiscalYearPublishInfo();
  const { data, isLoading: dataLoading, error, refetch } = usePropertyStats();

  const isLoading = dataLoading || publishStatusLoading;
  const properties = data?.properties || [];
  const payments = data?.payments || [];

  // عرض أول 5 عقارات فقط مرتبة حسب الإشغال
  const displayProperties = useMemo(() => {
    return [...properties]
      .sort((a, b) => (b.occupied_units || 0) - (a.occupied_units || 0))
      .slice(0, MAX_PROPERTIES_DISPLAY);
  }, [properties]);

  const hasMoreProperties = properties.length > MAX_PROPERTIES_DISPLAY;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return <ErrorState title="خطأ في التحميل" message="فشل تحميل إحصائيات العقارات" onRetry={refetch} />;
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

  const handleViewAllProperties = () => {
    navigate("/beneficiary-portal?tab=properties");
  };

  return (
    <div className="space-y-6">
      {/* إحصائيات العقارات */}
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

      {/* الإيرادات المحصلة */}
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

      {/* الاستقطاعات الحكومية */}
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

      {/* نظرة سريعة على العقارات - محسّنة */}
      <Card className="border-primary/20 overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-primary/5 to-background pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5 text-primary" />
              نظرة سريعة على العقارات
            </CardTitle>
            {hasMoreProperties && (
              <Badge variant="secondary" className="text-xs">
                {properties.length} عقار
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {displayProperties.length > 0 ? (
            <div className="space-y-3">
              {/* قائمة العقارات المبسطة */}
              <div className="grid gap-2">
                {displayProperties.map((property, index) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-gradient-to-l from-muted/30 to-transparent hover:border-primary/30 hover:bg-muted/50 transition-all"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-sm truncate">{property.name}</h4>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {property.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-left">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {property.total_units || 0} وحدة
                          </Badge>
                          <Badge className="bg-success/10 text-success border-success/30 text-[10px] px-1.5 py-0">
                            {property.occupied_units || 0} مشغول
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* زر عرض جميع العقارات */}
              {hasMoreProperties && (
                <Button
                  variant="outline"
                  className="w-full mt-4 group hover:border-primary hover:bg-primary/5"
                  onClick={handleViewAllProperties}
                >
                  <span>عرض جميع العقارات ({properties.length})</span>
                  <ChevronLeft className="h-4 w-4 me-2 group-hover:-translate-x-1 transition-transform" />
                </Button>
              )}
            </div>
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
