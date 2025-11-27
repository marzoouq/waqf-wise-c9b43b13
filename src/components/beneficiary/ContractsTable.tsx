import { useContracts } from "@/hooks/useContracts";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { UnifiedDataTable, type Column } from "@/components/unified/UnifiedDataTable";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

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
