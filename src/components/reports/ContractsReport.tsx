/**
 * تقارير العقود
 * يعرض تقرير شامل لجميع العقود مع إحصائيات
 */
import { memo } from "react";
import { matchesStatus } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, AlertTriangle } from "lucide-react";
import { useContractsPaginated } from "@/hooks/property/useContractsPaginated";
import { useContractsStats } from "@/hooks/contracts/useContractsStats";
import { ContractsStatsCards } from "@/components/contracts/ContractsStatsCards";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, arLocale as ar } from "@/lib/date";
import { toast } from "sonner";
import { type Contract } from "@/hooks/property/useContracts";

export const ContractsReport = memo(function ContractsReport() {
  const { contracts, isLoading } = useContractsPaginated();
  const stats = useContractsStats(contracts as Contract[]);

  const handleExportPDF = async () => {
    const { exportToPDF } = await import("@/lib/exportHelpers");
    const headers = ["رقم العقد", "المستأجر", "العقار", "نوع العقد", "تاريخ البداية", "تاريخ النهاية", "الإيجار", "الحالة"];
    const data = (contracts || []).map((c) => [
      c.contract_number,
      c.tenant_name,
      c.properties?.name || '-',
      c.contract_type,
      format(new Date(c.start_date), 'yyyy/MM/dd', { locale: ar }),
      format(new Date(c.end_date), 'yyyy/MM/dd', { locale: ar }),
      `${Number(c.monthly_rent).toLocaleString('ar-SA')} ريال`,
      c.status,
    ]);

    exportToPDF("تقرير العقود", headers, data, "contracts_report");
    toast.success("تم تصدير تقرير العقود بنجاح");
  };

  const handleExportExcel = async () => {
    const { exportToExcel } = await import("@/lib/exportHelpers");
    const data = (contracts || []).map((c) => ({
      "رقم العقد": c.contract_number,
      "المستأجر": c.tenant_name,
      "رقم الهوية": c.tenant_id_number,
      "الهاتف": c.tenant_phone,
      "العقار": c.properties?.name || '-',
      "نوع العقد": c.contract_type,
      "تاريخ البداية": format(new Date(c.start_date), 'yyyy/MM/dd', { locale: ar }),
      "تاريخ النهاية": format(new Date(c.end_date), 'yyyy/MM/dd', { locale: ar }),
      "الإيجار الشهري": Number(c.monthly_rent),
      "التأمين": Number(c.security_deposit || 0),
      "الحالة": c.status,
    }));

    exportToExcel(data, "contracts_report", "العقود");
    toast.success("تم تصدير تقرير العقود بنجاح");
  };

  if (isLoading) {
    return <LoadingState message="جاري تحميل تقرير العقود..." />;
  }

  if (!contracts || contracts.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="لا توجد عقود"
        description="لم يتم العثور على أي عقود في النظام"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* بطاقات الإحصائيات */}
      <ContractsStatsCards
        total={stats.total}
        active={stats.active}
        draft={stats.draft}
        readyForRenewal={stats.readyForRenewal}
        autoRenewing={stats.autoRenewing}
        expired={stats.expired}
      />

      {/* التنبيهات */}
      {stats.readyForRenewal > 0 && (
        <div className="flex items-center gap-2 p-4 bg-warning/10 border border-warning/30 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <span className="font-medium">
            يوجد {stats.readyForRenewal} عقد تنتهي صلاحيته خلال 60 يوم وتحتاج للتجديد
          </span>
        </div>
      )}

      {/* جدول العقود */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            تقرير العقود التفصيلي
          </CardTitle>
          <div className="flex gap-2">
            <Button onClick={handleExportPDF} variant="outline" size="sm">
              <Download className="h-4 w-4 ms-2" />
              PDF
            </Button>
            <Button onClick={handleExportExcel} variant="outline" size="sm">
              <Download className="h-4 w-4 ms-2" />
              Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم العقد</TableHead>
                  <TableHead>المستأجر</TableHead>
                  <TableHead className="hidden md:table-cell">العقار</TableHead>
                  <TableHead className="hidden sm:table-cell">نوع العقد</TableHead>
                  <TableHead className="hidden lg:table-cell">تاريخ البداية</TableHead>
                  <TableHead className="hidden lg:table-cell">تاريخ النهاية</TableHead>
                  <TableHead>الإيجار</TableHead>
                  <TableHead>الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">{contract.contract_number}</TableCell>
                    <TableCell>{contract.tenant_name}</TableCell>
                    <TableCell className="hidden md:table-cell">{contract.properties?.name || '-'}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline">{contract.contract_type}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell whitespace-nowrap">
                      {format(new Date(contract.start_date), 'yyyy/MM/dd', { locale: ar })}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell whitespace-nowrap">
                      {format(new Date(contract.end_date), 'yyyy/MM/dd', { locale: ar })}
                    </TableCell>
                    <TableCell className="font-mono whitespace-nowrap">
                      {Number(contract.monthly_rent).toLocaleString('ar-SA')} ر.س
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          matchesStatus(contract.status, 'active') ? "default" :
                          matchesStatus(contract.status, 'expired') ? "secondary" : "outline"
                        }
                      >
                        {contract.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row justify-between text-sm gap-2">
            <span className="text-muted-foreground">
              إجمالي العقود: {stats.total} | نشطة: {stats.active} | منتهية: {stats.expired}
            </span>
            <div className="space-x-4 rtl:space-x-reverse">
            <span className="font-semibold">
              الإيراد الشهري من العقود: {stats.totalMonthlyRevenue.toLocaleString('ar-SA')} ريال
            </span>
            <span className="font-semibold text-success">
              الإيراد السنوي المتوقع: {stats.totalAnnualRevenue.toLocaleString('ar-SA')} ريال
            </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
