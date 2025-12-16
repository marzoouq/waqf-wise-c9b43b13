import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebouncedSearch } from '@/hooks/ui/useDebouncedSearch';

interface InvoicesFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
}

export function InvoicesFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
}: InvoicesFiltersProps) {
  const { value, onChange } = useDebouncedSearch(searchQuery, onSearchChange, 300);

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            name="invoices-search"
            placeholder="بحث برقم الفاتورة أو اسم العميل..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="جميع الحالات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="draft">مسودة</SelectItem>
              <SelectItem value="sent">مرسلة</SelectItem>
              <SelectItem value="paid">مدفوعة</SelectItem>
              <SelectItem value="overdue">متأخرة</SelectItem>
              <SelectItem value="cancelled">ملغاة</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            placeholder="من تاريخ"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
          />
          <Input
            type="date"
            placeholder="إلى تاريخ"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
