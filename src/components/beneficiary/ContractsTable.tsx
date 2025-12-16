import { useContracts } from "@/hooks/property/useContracts";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileText, EyeOff } from "lucide-react";
import { UnifiedDataTable, type Column } from "@/components/unified/UnifiedDataTable";
import { format, arLocale as ar } from "@/lib/date";
import { useFiscalYearPublishInfo } from "@/hooks/fiscal-years";

interface Contract {
  id: string;
  contract_number: string;
  tenant_name: string;
  properties?: { name: string };
  start_date: string;
  end_date: string;
  monthly_rent: number;
  status: string;
}

export function ContractsTable() {
  const { contracts, isLoading } = useContracts();
  const { isCurrentYearPublished, isLoading: publishStatusLoading } = useFiscalYearPublishInfo();

  // إذا لم تكن السنة منشورة، نعرض رسالة
  if (!publishStatusLoading && !isCurrentYearPublished) {
    return (
      <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
        <EyeOff className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800 dark:text-amber-200">العقود مخفية</AlertTitle>
        <AlertDescription className="text-amber-700 dark:text-amber-300">
          بيانات عقود الإيجار مخفية حتى يتم اعتمادها ونشرها من قبل الناظر
        </AlertDescription>
      </Alert>
    );
  }

  const columns: Column<Contract>[] = [
    {
      key: "contract_number",
      label: "رقم العقد",
      render: (value: string) => <span className="font-medium">{value}</span>
    },
    {
      key: "tenant_name",
      label: "اسم المستأجر"
    },
    {
      key: "properties",
      label: "العقار",
      hideOnMobile: true,
      render: (_: unknown, row: Contract) => row.properties?.name ?? 'غير محدد'
    },
    {
      key: "start_date",
      label: "تاريخ البدء",
      hideOnTablet: true,
      render: (value: string) => (
        <span className="whitespace-nowrap text-xs sm:text-sm">
          {format(new Date(value), 'dd/MM/yyyy', { locale: ar })}
        </span>
      )
    },
    {
      key: "end_date",
      label: "تاريخ الانتهاء",
      hideOnTablet: true,
      render: (value: string) => (
        <span className="whitespace-nowrap text-xs sm:text-sm">
          {format(new Date(value), 'dd/MM/yyyy', { locale: ar })}
        </span>
      )
    },
    {
      key: "monthly_rent",
      label: "الإيجار الشهري",
      render: (value: number) => (
        <span className="font-bold whitespace-nowrap">
          {(value || 0).toLocaleString()} ر.س
        </span>
      )
    },
    {
      key: "status",
      label: "الحالة",
      render: (value: string) => (
        <Badge variant={value === 'نشط' ? 'default' : 'secondary'}>
          {value}
        </Badge>
      )
    }
  ];

  return (
    <UnifiedDataTable
      columns={columns}
      data={contracts || []}
      loading={isLoading}
      emptyMessage="لا توجد عقود"
      showMobileScrollHint={true}
    />
  );
}
