import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebouncedSearch } from "@/hooks/ui/useDebouncedSearch";

interface PaymentsFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function PaymentsFilters({ searchQuery, onSearchChange }: PaymentsFiltersProps) {
  const { value, onChange } = useDebouncedSearch(searchQuery, onSearchChange, 300);

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          name="payments-search"
          placeholder="بحث بالرقم، الاسم، أو الوصف..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-10"
        />
      </div>
    </div>
  );
}
