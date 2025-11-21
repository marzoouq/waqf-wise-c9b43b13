import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Save } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export interface SearchFilters {
  name?: string;
  nationalId?: string;
  tribe?: string;
  category?: string;
  status?: string;
  gender?: string;
  relationship?: string;
  familyName?: string;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
}

export function AdvancedSearch({ onSearch, onClear }: AdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters({});
    onClear();
  };

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <div className="flex items-center gap-2">
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm">
            <Search className="ml-2 h-4 w-4" />
            بحث متقدم
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="mt-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم</Label>
              <Input
                id="name"
                placeholder="ابحث بالاسم..."
                value={filters.name || ""}
                onChange={(e) => updateFilter("name", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationalId">رقم الهوية</Label>
              <Input
                id="nationalId"
                placeholder="رقم الهوية الوطنية"
                value={filters.nationalId || ""}
                onChange={(e) => updateFilter("nationalId", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="familyName">اسم العائلة</Label>
              <Input
                id="familyName"
                placeholder="ابحث باسم العائلة..."
                value={filters.familyName || ""}
                onChange={(e) => updateFilter("familyName", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tribe">القبيلة</Label>
              <Input
                id="tribe"
                placeholder="اسم القبيلة"
                value={filters.tribe || ""}
                onChange={(e) => updateFilter("tribe", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">الفئة</Label>
              <Select
                value={filters.category || ""}
                onValueChange={(value) => updateFilter("category", value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="الدرجة الأولى">الدرجة الأولى</SelectItem>
                  <SelectItem value="الدرجة الثانية">الدرجة الثانية</SelectItem>
                  <SelectItem value="الدرجة الثالثة">الدرجة الثالثة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">الحالة</Label>
              <Select
                value={filters.status || ""}
                onValueChange={(value) => updateFilter("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="نشط">نشط</SelectItem>
                  <SelectItem value="متوقف مؤقتاً">متوقف مؤقتاً</SelectItem>
                  <SelectItem value="متوفى">متوفى</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">الجنس</Label>
              <Select
                value={filters.gender || ""}
                onValueChange={(value) => updateFilter("gender", value)}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="اختر الجنس" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ذكر">ذكر</SelectItem>
                  <SelectItem value="أنثى">أنثى</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship">صلة القرابة</Label>
              <Select
                value={filters.relationship || ""}
                onValueChange={(value) => updateFilter("relationship", value)}
              >
                <SelectTrigger id="relationship">
                  <SelectValue placeholder="اختر صلة القرابة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ابن">ابن</SelectItem>
                  <SelectItem value="ابنة">ابنة</SelectItem>
                  <SelectItem value="زوجة">زوجة</SelectItem>
                  <SelectItem value="حفيد">حفيد</SelectItem>
                  <SelectItem value="حفيدة">حفيدة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleClear}>
              <X className="ml-2 h-4 w-4" />
              مسح
            </Button>
            <Button size="sm" onClick={handleSearch}>
              <Search className="ml-2 h-4 w-4" />
              بحث
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
