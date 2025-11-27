import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export type FilterValue = string | number | null | undefined;
export type FiltersRecord = Record<string, FilterValue>;

export interface FilterConfig {
  key: string;
  label: string;
  type: "select" | "text" | "number" | "date" | "dateRange";
  options?: Array<{ value: string; label: string }>;
}

interface AdvancedFiltersDialogProps {
  filters: FilterConfig[];
  activeFilters: FiltersRecord;
  onApplyFilters: (filters: FiltersRecord) => void;
  onClearFilters: () => void;
}

export function AdvancedFiltersDialog({
  filters,
  activeFilters,
  onApplyFilters,
  onClearFilters,
}: AdvancedFiltersDialogProps) {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FiltersRecord>(activeFilters);

  const activeFilterCount = Object.values(activeFilters).filter(
    (v) => v !== null && v !== undefined && v !== ""
  ).length;

  const handleApply = () => {
    onApplyFilters(localFilters);
    setOpen(false);
  };

  const handleClear = () => {
    setLocalFilters({});
    onClearFilters();
    setOpen(false);
  };

  const handleFilterChange = (key: string, value: FilterValue) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          فلاتر متقدمة
          {activeFilterCount > 0 && (
            <Badge variant="default" className="h-5 px-1.5">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>فلاتر متقدمة</DialogTitle>
          <DialogDescription>
            حدد المعايير لتصفية البيانات بدقة
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {filters.map((filter) => (
            <div key={filter.key} className="grid gap-2">
              <Label htmlFor={filter.key}>{filter.label}</Label>
              
              {filter.type === "select" && filter.options && (
                <Select
                  value={String(localFilters[filter.key] || "")}
                  onValueChange={(value) => handleFilterChange(filter.key, value)}
                >
                  <SelectTrigger id={filter.key}>
                    <SelectValue placeholder={`اختر ${filter.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {filter.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {filter.type === "text" && (
                <Input
                  id={filter.key}
                  type="text"
                  value={String(localFilters[filter.key] ?? "")}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  placeholder={`أدخل ${filter.label}`}
                />
              )}

              {filter.type === "number" && (
                <Input
                  id={filter.key}
                  type="number"
                  value={localFilters[filter.key] ?? ""}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  placeholder={`أدخل ${filter.label}`}
                />
              )}

              {filter.type === "date" && (
                <Input
                  id={filter.key}
                  type="date"
                  value={String(localFilters[filter.key] ?? "")}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClear}>
            <X className="h-4 w-4 ml-2" />
            مسح الفلاتر
          </Button>
          <Button onClick={handleApply}>
            <Filter className="h-4 w-4 ml-2" />
            تطبيق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
