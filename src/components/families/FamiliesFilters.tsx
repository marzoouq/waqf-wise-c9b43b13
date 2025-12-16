import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDebouncedSearch } from '@/hooks/ui/useDebouncedSearch';

interface FamiliesFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function FamiliesFilters({ searchQuery, onSearchChange }: FamiliesFiltersProps) {
  const { value, onChange } = useDebouncedSearch(searchQuery, onSearchChange, 300);

  return (
    <Card>
      <CardHeader>
        <CardTitle>البحث والتصفية</CardTitle>
        <CardDescription>ابحث عن عائلة بالاسم أو القبيلة</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            name="families-search"
            placeholder="ابحث عن عائلة..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pr-10"
          />
        </div>
      </CardContent>
    </Card>
  );
}
