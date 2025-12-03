import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface FamiliesFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function FamiliesFilters({ searchQuery, onSearchChange }: FamiliesFiltersProps) {
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
            placeholder="ابحث عن عائلة..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pr-10"
          />
        </div>
      </CardContent>
    </Card>
  );
}
