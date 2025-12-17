import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Calendar } from "lucide-react";
import { useDebouncedSearch } from "@/hooks/ui/useDebouncedSearch";

interface AccountingFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter?: string;
  onStatusChange?: (value: string) => void;
  dateFrom?: string;
  onDateFromChange?: (value: string) => void;
  dateTo?: string;
  onDateToChange?: (value: string) => void;
  statusOptions?: { value: string; label: string }[];
  showStatus?: boolean;
  showDate?: boolean;
}

export function AccountingFilters({
  searchQuery,
  onSearchChange,
  statusFilter = "all",
  onStatusChange,
  dateFrom = "",
  onDateFromChange,
  dateTo = "",
  onDateToChange,
  statusOptions = [
    { value: "all", label: "الكل" },
    { value: "draft", label: "مسودة" },
    { value: "posted", label: "مرحّل" },
    { value: "cancelled", label: "ملغي" },
  ],
  showStatus = true,
  showDate = true,
}: AccountingFiltersProps) {
  const { value, onChange } = useDebouncedSearch(searchQuery, onSearchChange, 300);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      <div className="space-y-2">
        <Label htmlFor="search">البحث</Label>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            name="accounting-search"
            placeholder="ابحث..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pe-10"
          />
        </div>
      </div>

      {showStatus && onStatusChange && (
        <div className="space-y-2">
          <Label htmlFor="status">الحالة</Label>
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {showDate && onDateFromChange && (
        <>
          <div className="space-y-2">
            <Label htmlFor="dateFrom">من تاريخ</Label>
            <div className="relative">
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => onDateFromChange(e.target.value)}
                className="pe-10"
              />
            </div>
          </div>
          {onDateToChange && (
            <div className="space-y-2">
              <Label htmlFor="dateTo">إلى تاريخ</Label>
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => onDateToChange(e.target.value)}
                  className="pe-10"
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
