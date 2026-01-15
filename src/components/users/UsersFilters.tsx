/**
 * UsersFilters Component
 * مكون فلترة المستخدمين - البحث والتصفية حسب الدور والنوع
 * @version 2.9.15
 * 
 * التحسينات:
 * - إضافة تبويبات لفصل المشرفين عن المستفيدين
 */

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Users, UserCheck } from "lucide-react";
import { ROLE_LABELS } from "@/types/roles";
import { useDebouncedSearch } from "@/hooks/ui/useDebouncedSearch";
import { STAFF_ROLES, BENEFICIARY_ROLES, type UserTypeFilter } from "@/hooks/users/useUsersFilter";

interface UsersFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  userTypeFilter: UserTypeFilter;
  onUserTypeFilterChange: (type: UserTypeFilter) => void;
  staffCount: number;
  beneficiariesCount: number;
}

export function UsersFilters({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  userTypeFilter,
  onUserTypeFilterChange,
  staffCount,
  beneficiariesCount,
}: UsersFiltersProps) {
  const { value, onChange } = useDebouncedSearch(searchTerm, onSearchChange, 300);

  // الأدوار المتاحة حسب التبويب المحدد
  const availableRoles = userTypeFilter === 'staff' ? STAFF_ROLES : BENEFICIARY_ROLES;

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {/* تبويبات فصل المشرفين عن المستفيدين */}
        <Tabs 
          value={userTypeFilter} 
          onValueChange={(val) => {
            onUserTypeFilterChange(val as UserTypeFilter);
            onRoleFilterChange("all"); // إعادة تعيين فلتر الدور عند تغيير التبويب
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="staff" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>المشرفين والموظفين</span>
              <Badge variant="secondary" className="ms-1">
                {staffCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="beneficiaries" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              <span>المستفيدين</span>
              <Badge variant="secondary" className="ms-1">
                {beneficiariesCount}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* فلاتر البحث والدور */}
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
              {availableRoles.map((role) => (
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
