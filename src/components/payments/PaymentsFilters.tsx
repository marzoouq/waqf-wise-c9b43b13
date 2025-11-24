import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PaymentsFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function PaymentsFilters({ searchQuery, onSearchChange }: PaymentsFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="بحث بالرقم، الاسم، أو الوصف..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pr-10"
        />
      </div>
    </div>
  );
}
