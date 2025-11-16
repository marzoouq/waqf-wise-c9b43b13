import { useState, useMemo } from "react";
import { Search, FileText, Calendar, User, Edit, Eye } from "lucide-react";
import { useContracts } from "@/hooks/useContracts";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { type Contract } from "@/hooks/useContracts";

interface Props {
  onEdit: (contract: Contract) => void;
}

export const ContractsTab = ({ onEdit }: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { contracts, isLoading } = useContracts();

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
      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="البحث عن عقد..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
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
          <div className="text-sm text-muted-foreground">الإيرادات الشهرية</div>
          <div className="text-2xl font-bold text-primary">
            {(contracts?.reduce((sum, c) => sum + Number(c.monthly_rent), 0) || 0).toLocaleString()} ر.س
          </div>
        </Card>
      </div>

      {/* Contracts Table */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>
      ) : filteredContracts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">لا توجد عقود</div>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">رقم العقد</TableHead>
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">العقار</TableHead>
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">المستأجر</TableHead>
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">النوع</TableHead>
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">تاريخ البداية</TableHead>
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">تاريخ النهاية</TableHead>
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">الإيجار الشهري</TableHead>
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">الحالة</TableHead>
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium text-xs sm:text-sm whitespace-nowrap">{contract.contract_number}</TableCell>
                  <TableCell className="text-xs sm:text-sm hidden lg:table-cell">{contract.properties?.name || '-'}</TableCell>
                  <TableCell className="text-xs sm:text-sm">{contract.tenant_name}</TableCell>
                  <TableCell className="text-xs sm:text-sm hidden md:table-cell">{contract.contract_type}</TableCell>
                  <TableCell className="text-xs sm:text-sm hidden lg:table-cell whitespace-nowrap">
                    {format(new Date(contract.start_date), 'yyyy/MM/dd', { locale: ar })}
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm hidden lg:table-cell whitespace-nowrap">
                    {format(new Date(contract.end_date), 'yyyy/MM/dd', { locale: ar })}
                  </TableCell>
                  <TableCell className="font-bold text-primary text-xs sm:text-sm whitespace-nowrap">
                    {Number(contract.monthly_rent).toLocaleString()} ر.س
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    <Badge className={getStatusBadge(contract.status)}>
                      {contract.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(contract)}
                    >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
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