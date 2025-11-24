import { useState, useMemo } from "react";
import { Search, FileText, Calendar, User, Edit, Eye, Trash2, Printer } from "lucide-react";
import { useContracts } from "@/hooks/useContracts";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { type Contract } from "@/hooks/useContracts";
import { ExportButton } from "@/components/shared/ExportButton";
import { usePrint } from "@/hooks/usePrint";
import { ContractPrintTemplate } from "@/components/contracts/ContractPrintTemplate";
import { ContractStatusBadge } from "@/components/contracts/ContractStatusBadge";
import { ContractExpiryAlert } from "@/components/contracts/ContractExpiryAlert";

interface Props {
  onEdit: (contract: Contract) => void;
}

export const ContractsTab = ({ onEdit }: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [printContract, setPrintContract] = useState<Contract | null>(null);
  const { contracts, isLoading, deleteContract } = useContracts();
  const { printWithData } = usePrint();

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا العقد؟ سيتم حذف جميع الدفعات المرتبطة به.")) {
      deleteContract.mutateAsync(id);
    }
  };

  const handlePrintContract = (contract: Contract) => {
    setPrintContract(contract);
    setTimeout(() => {
      printWithData(contract, (data) => <ContractPrintTemplate contract={data} />);
      setPrintContract(null);
    }, 100);
  };

  const filteredContracts = useMemo(() => {
    if (!searchQuery) return contracts;
    
    const query = searchQuery.toLowerCase();
    return contracts?.filter(
      (c) =>
        c.contract_number.toLowerCase().includes(query) ||
        c.tenant_name.toLowerCase().includes(query) ||
        c.properties?.name.toLowerCase().includes(query)
    ) || [];
  }, [contracts, searchQuery]);

  const exportData = filteredContracts.map(c => ({
    'رقم العقد': c.contract_number,
    'العقار': c.properties?.name || '-',
    'المستأجر': c.tenant_name,
    'رقم الهوية': c.tenant_id_number,
    'الهاتف': c.tenant_phone,
    'النوع': c.contract_type,
    'تاريخ البداية': format(new Date(c.start_date), 'yyyy/MM/dd'),
    'تاريخ النهاية': format(new Date(c.end_date), 'yyyy/MM/dd'),
    'الإيجار الشهري': Number(c.monthly_rent).toLocaleString(),
    'التأمين': Number(c.security_deposit || 0).toLocaleString(),
    'الحالة': c.status,
  }));

  const getStatusBadge = (status: string) => {
    const styles = {
      "نشط": "bg-success/10 text-success",
      "منتهي": "bg-muted text-muted-foreground",
      "ملغي": "bg-destructive/10 text-destructive",
      "متأخر": "bg-warning/10 text-warning",
      "مسودة": "bg-primary/10 text-primary",
    };
    return styles[status as keyof typeof styles] || "bg-muted";
  };

  return (
    <div className="space-y-6">
      {/* Contract Expiry Alerts */}
      <ContractExpiryAlert contracts={contracts} />

      {/* Search and Export */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="البحث عن عقد..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
        <ExportButton
          data={exportData}
          filename="العقود"
          title="العقود"
          headers={['رقم العقد', 'العقار', 'المستأجر', 'رقم الهوية', 'الهاتف', 'النوع', 'تاريخ البداية', 'تاريخ النهاية', 'الإيجار الشهري', 'التأمين', 'الحالة']}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">إجمالي العقود</div>
          <div className="text-2xl font-bold">{contracts?.length || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">عقود نشطة</div>
          <div className="text-2xl font-bold text-success">
            {contracts?.filter(c => c.status === 'نشط').length || 0}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">عقود منتهية</div>
          <div className="text-2xl font-bold text-warning">
            {contracts?.filter(c => c.status === 'منتهي').length || 0}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">الإيرادات السنوية</div>
          <div className="text-2xl font-bold text-primary">
            {(contracts?.reduce((sum, c) => {
              const rent = Number(c.monthly_rent);
              return sum + (c.payment_frequency === 'سنوي' ? rent : rent * 12);
            }, 0) || 0).toLocaleString()} ر.س
          </div>
        </Card>
      </div>

      {/* Contracts Table */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>
      ) : filteredContracts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">لا توجد عقود</div>
      ) : (
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-right text-xs sm:text-sm font-semibold whitespace-nowrap py-3 px-4">رقم العقد</TableHead>
                <TableHead className="text-right text-xs sm:text-sm font-semibold whitespace-nowrap py-3 px-4 hidden lg:table-cell">العقار</TableHead>
                <TableHead className="text-right text-xs sm:text-sm font-semibold whitespace-nowrap py-3 px-4">المستأجر</TableHead>
                <TableHead className="text-right text-xs sm:text-sm font-semibold whitespace-nowrap py-3 px-4 hidden md:table-cell">النوع</TableHead>
                <TableHead className="text-right text-xs sm:text-sm font-semibold whitespace-nowrap py-3 px-4 hidden lg:table-cell">تاريخ البداية</TableHead>
                <TableHead className="text-right text-xs sm:text-sm font-semibold whitespace-nowrap py-3 px-4 hidden lg:table-cell">تاريخ النهاية</TableHead>
                <TableHead className="text-right text-xs sm:text-sm font-semibold whitespace-nowrap py-3 px-4">الإيجار الشهري</TableHead>
                <TableHead className="text-right text-xs sm:text-sm font-semibold whitespace-nowrap py-3 px-4">الحالة</TableHead>
                <TableHead className="text-right text-xs sm:text-sm font-semibold whitespace-nowrap py-3 px-4">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContracts.map((contract, index) => (
                <TableRow 
                  key={contract.id}
                  className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}
                >
                  <TableCell className="font-medium text-xs sm:text-sm whitespace-nowrap py-3 px-4">{contract.contract_number}</TableCell>
                  <TableCell className="text-xs sm:text-sm py-3 px-4 hidden lg:table-cell">{contract.properties?.name || '-'}</TableCell>
                  <TableCell className="text-xs sm:text-sm py-3 px-4">{contract.tenant_name}</TableCell>
                  <TableCell className="text-xs sm:text-sm py-3 px-4 hidden md:table-cell">{contract.contract_type}</TableCell>
                  <TableCell className="text-xs sm:text-sm py-3 px-4 hidden lg:table-cell whitespace-nowrap">
                    {format(new Date(contract.start_date), 'yyyy/MM/dd', { locale: ar })}
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm py-3 px-4 hidden lg:table-cell whitespace-nowrap">
                    {format(new Date(contract.end_date), 'yyyy/MM/dd', { locale: ar })}
                  </TableCell>
                  <TableCell className="font-bold text-primary text-xs sm:text-sm whitespace-nowrap py-3 px-4">
                    {Number(contract.monthly_rent).toLocaleString()} ر.س
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm py-3 px-4">
                    <ContractStatusBadge 
                      startDate={contract.start_date}
                      endDate={contract.end_date}
                      status={contract.status}
                    />
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm py-3 px-4">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePrintContract(contract)}
                        title="طباعة"
                        className="hover:bg-primary/10"
                      >
                        <Printer className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(contract)}
                        title="تعديل"
                        className="hover:bg-primary/10"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(contract.id)}
                        title="حذف"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};