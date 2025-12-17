/**
 * UsersFilters Component
 * مكون فلترة المستخدمين - البحث والتصفية حسب الدور
 */

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { SYSTEM_ROLES, ROLE_LABELS } from "@/types/roles";
import { useDebouncedSearch } from "@/hooks/ui/useDebouncedSearch";

interface UsersFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
}

export function UsersFilters({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
}: UsersFiltersProps) {
  const { value, onChange } = useDebouncedSearch(searchTerm, onSearchChange, 300);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              name="users-search"
              placeholder="البحث بالاسم أو البريد الإلكتروني..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="pe-10"
            />
          </div>

          <Select value={roleFilter} onValueChange={onRoleFilterChange}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="تصفية حسب الدور" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأدوار</SelectItem>
              {SYSTEM_ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {ROLE_LABELS[role]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
