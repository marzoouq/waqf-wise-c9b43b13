/**
 * مكون البحث والفلترة للإعدادات
 * 
 * @version 2.8.91
 */
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  iconColor: string;
}

interface SettingsSearchFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  categories: SettingCategory[];
  totalSettings: number;
}

export function SettingsSearchFilter({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  totalSettings,
}: SettingsSearchFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={`بحث في ${totalSettings} إعداد...`}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pe-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-1 top-1/2 -translate-y-1/2 h-6 w-6"
            onClick={() => onSearchChange("")}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      <Select value={selectedCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <Filter className="h-4 w-4 ms-2" />
          <SelectValue placeholder="كل الفئات" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">كل الفئات</SelectItem>
          {categories.map(cat => (
            <SelectItem key={cat.id} value={cat.id}>
              <div className="flex items-center gap-2">
                <cat.icon className={cn("h-4 w-4", cat.iconColor)} />
                {cat.title}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
