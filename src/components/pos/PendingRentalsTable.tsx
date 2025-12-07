import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, DollarSign, AlertTriangle } from 'lucide-react';
import { PendingRental } from '@/hooks/pos/usePendingRentals';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface PendingRentalsTableProps {
  rentals: PendingRental[];
  isLoading?: boolean;
  onCollect: (rental: PendingRental) => void;
  disabled?: boolean;
}

export function PendingRentalsTable({ rentals, isLoading, onCollect, disabled }: PendingRentalsTableProps) {
  const [search, setSearch] = useState('');

  const filteredRentals = rentals.filter((rental) =>
    rental.tenant_name.toLowerCase().includes(search.toLowerCase()) ||
    rental.property_name.toLowerCase().includes(search.toLowerCase()) ||
    rental.contract_number.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">جاري التحميل...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            الإيجارات المستحقة
            <Badge variant="secondary">{rentals.length}</Badge>
          </CardTitle>
          <div className="relative w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredRentals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {search ? 'لا توجد نتائج للبحث' : 'لا توجد إيجارات مستحقة'}
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>العقار</TableHead>
                  <TableHead>المستأجر</TableHead>
                  <TableHead>رقم العقد</TableHead>
                  <TableHead>تاريخ الاستحقاق</TableHead>
                  <TableHead className="text-left">المبلغ</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRentals.map((rental) => (
                  <TableRow key={rental.id}>
                    <TableCell className="font-medium">{rental.property_name}</TableCell>
                    <TableCell>{rental.tenant_name}</TableCell>
                    <TableCell className="font-mono text-sm">{rental.contract_number}</TableCell>
                    <TableCell>
                      {format(new Date(rental.due_date), 'dd MMM yyyy', { locale: ar })}
                    </TableCell>
                    <TableCell className="text-left font-bold">
                      {rental.amount_due.toLocaleString('ar-SA')} ر.س
                    </TableCell>
                    <TableCell>
                      {rental.is_overdue ? (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          متأخر {rental.days_overdue} يوم
                        </Badge>
                      ) : (
                        <Badge variant="secondary">معلق</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => onCollect(rental)}
                        disabled={disabled}
                      >
                        تحصيل
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
