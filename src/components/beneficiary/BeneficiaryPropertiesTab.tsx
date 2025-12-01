import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Building2, Home, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
import { MaskedValue } from "@/components/shared/MaskedValue";
import { useIsMobile } from "@/hooks/useIsMobile";
import { MobilePropertyCard } from "./MobilePropertyCard";
import { MobileContractCard } from "./MobileContractCard";

// نوع العقد مع بيانات العقار
interface ContractWithProperty {
  id: string;
  contract_number: string;
  tenant_name: string;
  monthly_rent: number;
  start_date: string;
  end_date: string;
  status: string;
  properties?: {
    name: string;
    type: string;
    location: string;
  } | null;
}

export function BeneficiaryPropertiesTab() {
  const { settings } = useVisibilitySettings();
  const isMobile = useIsMobile();
  
  // جلب العقارات
  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ["properties-for-beneficiary"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // جلب العقود النشطة
  const { data: contracts = [], isLoading: contractsLoading } = useQuery<ContractWithProperty[]>({
    queryKey: ["contracts-for-beneficiary"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts")
        .select(`
          *,
          properties (
            name,
            type,
            location
          )
        `)
        .eq("status", "نشط")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ContractWithProperty[];
    },
  });

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

  const isLoading = propertiesLoading || contractsLoading;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">إجمالي العقارات</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{properties.length}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">عقارات الوقف</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">الوحدات المؤجرة</CardTitle>
            <Home className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{contracts.length}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">عقود نشطة</p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">الإيرادات الشهرية</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {settings?.show_property_revenues ? (
              <>
                <div className="text-xl sm:text-2xl font-bold">
                  <MaskedValue
                    value={contracts.reduce((sum, c) => sum + Number(c.monthly_rent || 0), 0).toLocaleString("ar-SA")}
                    type="amount"
                    masked={settings?.mask_exact_amounts || false}
                  /> <span className="text-sm sm:text-base">ريال</span>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">من الإيجارات</p>
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
          <CardTitle className="text-base sm:text-lg">عقارات الوقف</CardTitle>
          <CardDescription className="text-xs sm:text-sm">جميع العقارات التابعة للوقف</CardDescription>
        </CardHeader>
        <CardContent>
          {isMobile ? (
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
              ) : properties.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  لا توجد عقارات مسجلة
                </div>
              ) : (
                properties.map((property) => (
                  <MobilePropertyCard key={property.id} property={property} />
                ))
              )}
            </div>
          ) : (
            <ScrollArea className="w-full">
              <div className="rounded-md border">
                <Table>
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
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">جاري التحميل...</TableCell>
                      </TableRow>
                    ) : properties.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          لا توجد عقارات مسجلة
                        </TableCell>
                      </TableRow>
                    ) : (
                      properties.map((property) => (
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
                      ))
                    )}
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
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">عقود الإيجار النشطة</CardTitle>
            <CardDescription className="text-xs sm:text-sm">العقود الحالية مع المستأجرين</CardDescription>
          </CardHeader>
          <CardContent>
            {isMobile ? (
              <div className="space-y-3">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
                ) : contracts.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    لا توجد عقود نشطة حالياً
                  </div>
                ) : (
                  contracts.map((contract) => (
                    <MobileContractCard key={contract.id} contract={contract} />
                  ))
                )}
              </div>
            ) : (
              <ScrollArea className="w-full">
                <div className="rounded-md border">
                  <Table>
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
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center">جاري التحميل...</TableCell>
                        </TableRow>
                      ) : contracts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            لا توجد عقود نشطة حالياً
                          </TableCell>
                        </TableRow>
                      ) : (
                        contracts.map((contract) => (
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
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
