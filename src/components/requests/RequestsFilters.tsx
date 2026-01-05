import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdvancedFiltersDialog, FilterConfig, FiltersRecord } from '@/components/shared/AdvancedFiltersDialog';
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '@/lib/request-constants';

interface RequestsFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  advancedFilters: FiltersRecord;
  onAdvancedFiltersChange: (filters: FiltersRecord) => void;
}

const filterConfigs: FilterConfig[] = [
  {
    key: 'priority',
    label: 'الأولوية',
    type: 'select',
    options: PRIORITY_OPTIONS,
  },
  {
    key: 'overdue',
    label: 'متأخر',
    type: 'select',
    options: [
      { value: 'true', label: 'نعم' },
      { value: 'false', label: 'لا' },
    ],
  },
];

export function RequestsFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  advancedFilters,
  onAdvancedFiltersChange,
}: RequestsFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
      <div className="relative flex-1">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="بحث في الطلبات..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pe-10 text-sm"
        />
      </div>
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-[180px] text-sm">
          <Filter className="h-4 w-4 ms-2" />
          <SelectValue placeholder="الحالة" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <AdvancedFiltersDialog
        filters={filterConfigs}
        activeFilters={advancedFilters}
        onApplyFilters={onAdvancedFiltersChange}
        onClearFilters={() => onAdvancedFiltersChange({})}
      />
    </div>
  );
}
