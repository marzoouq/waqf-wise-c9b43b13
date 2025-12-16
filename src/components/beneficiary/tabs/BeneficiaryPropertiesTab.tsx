import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Building2, Home, MapPin, Calendar, EyeOff } from "lucide-react";
import { format, arLocale as ar } from "@/lib/date";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
import { useFiscalYearPublishStatus } from "@/hooks/useFiscalYearPublishStatus";
import { MaskedValue } from "@/components/shared/MaskedValue";
import { useIsMobile } from "@/hooks/ui/use-mobile";
import { MobilePropertyCard } from "../cards/MobilePropertyCard";
import { MobileContractCard } from "../cards/MobileContractCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBeneficiaryProperties } from "@/hooks/beneficiary/useBeneficiaryProperties";

export function BeneficiaryPropertiesTab() {
  const { settings } = useVisibilitySettings();
  const { isCurrentYearPublished, isLoading: publishStatusLoading } = useFiscalYearPublishStatus();
  const isMobile = useIsMobile();
  
  const { properties, contracts, isLoading } = useBeneficiaryProperties(
    isCurrentYearPublished,
    publishStatusLoading
  );

  const getPropertyTypeBadge = (type: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "outline" }> = {
      "سكني": { variant: "default" },
      "تجاري": { variant: "secondary" },
      "زراعي": { variant: "outline" },
    };

    return <Badge variant={config[type]?.variant || "secondary"}>{type}</Badge>;
  };

  const getContractStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" }> = {
      "نشط": { variant: "default" },
      "منتهي": { variant: "destructive" },
      "معلق": { variant: "secondary" },
    };

    return <Badge variant={config[status]?.variant || "secondary"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي العقارات</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{properties.length}</div>
            <p className="text-xs text-muted-foreground mt-1">عقارات الوقف</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الوحدات المؤجرة</CardTitle>
            <Home className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            {isCurrentYearPublished ? (
              <>
                <div className="text-xl sm:text-2xl font-bold">{contracts.length}</div>
                <p className="text-xs text-muted-foreground mt-1">عقود نشطة</p>
              </>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <EyeOff className="h-4 w-4" />
                <span className="text-sm">ستظهر عند النشر</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الإيرادات الشهرية</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {!isCurrentYearPublished ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <EyeOff className="h-4 w-4" />
                <span className="text-sm">ستظهر عند النشر</span>
              </div>
            ) : settings?.show_property_revenues ? (
              <>
                <div className="text-xl sm:text-2xl font-bold">
                  <MaskedValue
                    value={contracts.reduce((sum, c) => sum + Number(c.monthly_rent || 0), 0).toLocaleString("ar-SA")}
                    type="amount"
                    masked={settings?.mask_exact_amounts || false}
                  /> ريال
                </div>
                <p className="text-xs text-muted-foreground mt-1">من الإيجارات</p>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">غير مصرح</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Properties Table/Cards */}
      <Card>
        <CardHeader>
          <CardTitle>عقارات الوقف</CardTitle>
          <CardDescription>جميع العقارات التابعة للوقف</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : properties.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              لا توجد عقارات مسجلة
            </div>
          ) : isMobile ? (
            // عرض البطاقات على الجوال
            <div className="grid gap-4">
              {properties.map((property) => (
                <MobilePropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            // عرض الجدول على الديسكتوب
            <ScrollArea className="w-full">
              <div className="rounded-md border">
                <Table className="min-w-max">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">اسم العقار</TableHead>
                      <TableHead className="text-right">النوع</TableHead>
                      <TableHead className="text-right">الموقع</TableHead>
                      <TableHead className="text-right">المساحة</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell className="font-medium flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {property.name}
                        </TableCell>
                        <TableCell>{getPropertyTypeBadge(property.type || "سكني")}</TableCell>
                        <TableCell className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {property.location}
                        </TableCell>
                        <TableCell>—</TableCell>
                        <TableCell>
                          <Badge variant="outline">{property.status || "نشط"}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Contracts Table/Cards */}
      {settings?.show_contracts_details && (
        <>
          {/* تنبيه إذا كانت السنة غير منشورة */}
          {!isCurrentYearPublished && (
            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <EyeOff className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700 dark:text-amber-300">
                تفاصيل العقود للسنة المالية الحالية مخفية حتى يتم نشرها من قبل الناظر
              </AlertDescription>
            </Alert>
          )}
          <Card>
          <CardHeader>
            <CardTitle>عقود الإيجار النشطة</CardTitle>
            <CardDescription>العقود الحالية مع المستأجرين</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">جاري التحميل...</div>
            ) : contracts.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                لا توجد عقود نشطة حالياً
              </div>
            ) : isMobile ? (
              // عرض البطاقات على الجوال
              <div className="grid gap-4">
                {contracts.map((contract) => (
                  <MobileContractCard
                    key={contract.id}
                    contract={contract}
                    masked={settings?.mask_exact_amounts || false}
                    showRevenue={settings?.show_property_revenues || false}
                    maskTenant={settings?.mask_tenant_info || false}
                  />
                ))}
              </div>
            ) : (
              // عرض الجدول على الديسكتوب
              <ScrollArea className="w-full">
                <div className="rounded-md border">
                  <Table className="min-w-max">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">رقم العقد</TableHead>
                        <TableHead className="text-right">العقار</TableHead>
                        <TableHead className="text-right">المستأجر</TableHead>
                        <TableHead className="text-right">الإيجار الشهري</TableHead>
                        <TableHead className="text-right">تاريخ البداية</TableHead>
                        <TableHead className="text-right">تاريخ الانتهاء</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contracts.map((contract) => (
                        <TableRow key={contract.id}>
                          <TableCell className="font-medium">{contract.contract_number}</TableCell>
                          <TableCell>
                            {contract.properties?.name || "—"}
                          </TableCell>
                          <TableCell>
                            {settings?.mask_tenant_info ? "مستأجر" : contract.tenant_name}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {settings?.show_property_revenues ? (
                              <>
                                <MaskedValue
                                  value={Number(contract.monthly_rent).toLocaleString("ar-SA")}
                                  type="amount"
                                  masked={settings?.mask_exact_amounts || false}
                                /> ريال
                              </>
                            ) : "—"}
                          </TableCell>
                          <TableCell>
                            {format(new Date(contract.start_date), "dd/MM/yyyy", { locale: ar })}
                          </TableCell>
                          <TableCell>
                            {format(new Date(contract.end_date), "dd/MM/yyyy", { locale: ar })}
                          </TableCell>
                          <TableCell>{getContractStatusBadge(contract.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            )}
          </CardContent>
        </Card>
        </>
      )}
    </div>
  );
}
