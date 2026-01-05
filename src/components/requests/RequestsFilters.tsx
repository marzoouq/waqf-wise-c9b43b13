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
import { useQuery } from '@tanstack/react-query';
import { RequestService } from '@/services/request.service';

interface RequestType {
  id: string;
  name_ar: string;
}

interface RequestsFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  requestTypeFilter: string;
  onRequestTypeChange: (value: string) => void;
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
  requestTypeFilter,
  onRequestTypeChange,
  advancedFilters,
  onAdvancedFiltersChange,
}: RequestsFiltersProps) {
  // جلب أنواع الطلبات
  const { data: requestTypes = [] } = useQuery<RequestType[]>({
    queryKey: ['request-types'],
    queryFn: () => RequestService.getRequestTypes(),
  });

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-wrap">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="بحث في الطلبات..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pe-10 text-sm"
        />
      </div>
      
      {/* فلتر الحالة */}
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-[160px] text-sm">
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

      {/* فلتر نوع الطلب */}
      <Select value={requestTypeFilter} onValueChange={onRequestTypeChange}>
        <SelectTrigger className="w-full sm:w-[180px] text-sm">
          <SelectValue placeholder="نوع الطلب" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">جميع الأنواع</SelectItem>
          {requestTypes.map(type => (
            <SelectItem key={type.id} value={type.id}>
              {type.name_ar}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* الفلاتر المتقدمة */}
      <AdvancedFiltersDialog
        filters={filterConfigs}
        activeFilters={advancedFilters}
        onApplyFilters={onAdvancedFiltersChange}
        onClearFilters={() => onAdvancedFiltersChange({})}
      />
    </div>
  );
}
