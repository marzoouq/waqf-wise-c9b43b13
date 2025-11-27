import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { Shield, Search, Save, RotateCcw, CheckCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AppRole } from "@/hooks/useUserRole";
import { Permission } from "@/hooks/usePermissions";

const ROLE_LABELS: Record<AppRole, string> = {
  admin: "المشرف",
  nazer: "الناظر",
  accountant: "المحاسب",
  cashier: "موظف الصرف",
  archivist: "الأرشيفي",
  beneficiary: "مستفيد",
  user: "مستخدم",
};

const CATEGORY_LABELS: Record<string, string> = {
  funds: "المصارف",
  accounting: "المحاسبة",
  beneficiaries: "المستفيدين",
  properties: "العقارات",
  archive: "الأرشيف",
  reports: "التقارير",
  admin: "الإدارة"
};

interface RolePermissionState {
  permissionId: string;
  granted: boolean;
  modified: boolean;
}

const PermissionsManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<AppRole>("accountant");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [modifications, setModifications] = useState<Map<string, RolePermissionState>>(new Map());

  // Fetch all permissions
  const { data: allPermissions = [], isLoading: loadingPermissions } = useQuery({
    queryKey: ["all-permissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("permissions")
        .select("*")
        .order("category", { ascending: true })
        .order("name", { ascending: true });
      
      if (error) throw error;
      return data as Permission[];
    },
  });

  // Fetch role permissions
  const { data: rolePermissions = [], isLoading: loadingRolePerms } = useQuery({
    queryKey: ["role-permissions", selectedRole],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("role_permissions")
        .select("*")
        .eq("role", selectedRole);
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedRole,
  });

  // Update role permission mutation
  const updatePermissionMutation = useMutation({
    mutationFn: async ({ permissionId, granted }: { permissionId: string; granted: boolean }) => {
      const { error } = await supabase
        .from("role_permissions")
        .upsert({
          role: selectedRole,
          permission_id: permissionId,
          granted
        }, {
          onConflict: 'role,permission_id'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role-permissions"] });
      toast({
        title: "تم الحفظ",
        description: "تم تحديث الصلاحيات بنجاح",
      });
      setModifications(new Map());
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل تحديث الصلاحيات",
        variant: "destructive",
      });
    },
  });

  // Save all modifications
  const saveAllModifications = async () => {
    const updates: Array<{ permissionId: string; granted: boolean }> = [];
    modifications.forEach((state, permissionId) => {
      if (state.modified) {
        updates.push({ permissionId, granted: state.granted });
      }
    });

    for (const update of updates) {
      await updatePermissionMutation.mutateAsync(update);
    }
  };

  const isPermissionGranted = (permissionId: string): boolean => {
    // Check modifications first
    const modification = modifications.get(permissionId);
    if (modification !== undefined) {
      return modification.granted;
    }
    
    // Fall back to role permissions
    return rolePermissions.some(rp => rp.permission_id === permissionId && rp.granted);
  };

  const togglePermission = (permissionId: string, currentValue: boolean) => {
    const newValue = !currentValue;
    setModifications(prev => {
      const newMap = new Map(prev);
      newMap.set(permissionId, {
        permissionId,
        granted: newValue,
        modified: true
      });
      return newMap;
    });
  };

  const resetModifications = () => {
    setModifications(new Map());
  };

  const filteredPermissions = allPermissions.filter((perm) => {
    const matchesSearch = 
      perm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      perm.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || perm.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const groupedPermissions = filteredPermissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  const hasModifications = modifications.size > 0;

  return (
    <PageErrorBoundary pageName="إدارة الصلاحيات">
      <MobileOptimizedLayout>
        <MobileOptimizedHeader
          title="إدارة الصلاحيات التفصيلية"
          description="تخصيص صلاحيات دقيقة لكل دور"
          icon={<Shield className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />}
        />

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="اختر الدور" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_LABELS).map(([role, label]) => (
                    <SelectItem key={role} value={role}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="فلترة حسب الفئة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفئات</SelectItem>
                  {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
                    <SelectItem key={cat} value={cat}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex-1 relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث في الصلاحيات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            {hasModifications && (
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Button
                  onClick={saveAllModifications}
                  disabled={updatePermissionMutation.isPending}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  حفظ التغييرات ({modifications.size})
                </Button>
                <Button
                  variant="outline"
                  onClick={resetModifications}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  إلغاء
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Permissions Matrix */}
        <div className="space-y-6">
          {Object.entries(groupedPermissions).map(([category, permissions]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {CATEGORY_LABELS[category] || category}
                  <Badge variant="outline">{permissions.length}</Badge>
                </CardTitle>
                <CardDescription>
                  الصلاحيات المتعلقة بـ{CATEGORY_LABELS[category]}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">الصلاحية</TableHead>
                        <TableHead>الوصف</TableHead>
                        <TableHead className="text-center w-[100px]">الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingPermissions || loadingRolePerms ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8">
                            جاري التحميل...
                          </TableCell>
                        </TableRow>
                      ) : permissions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8">
                            لا توجد صلاحيات
                          </TableCell>
                        </TableRow>
                      ) : (
                        permissions.map((perm) => {
                          const isGranted = isPermissionGranted(perm.id);
                          const isModified = modifications.has(perm.id);
                          
                          return (
                            <TableRow key={perm.id} className={isModified ? "bg-muted/50" : ""}>
                              <TableCell className="font-mono text-xs">
                                {perm.name}
                                {isModified && (
                                  <Badge variant="outline" className="mr-2 text-[10px]">
                                    معدل
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {perm.description || "-"}
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <Switch
                                    checked={isGranted}
                                    onCheckedChange={() => togglePermission(perm.id, isGranted)}
                                  />
                                  {isGranted && <CheckCircle className="h-4 w-4 text-success" />}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPermissions.length === 0 && !loadingPermissions && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">لا توجد صلاحيات تطابق البحث</p>
            </CardContent>
          </Card>
        )}
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
};

export default PermissionsManagement;
