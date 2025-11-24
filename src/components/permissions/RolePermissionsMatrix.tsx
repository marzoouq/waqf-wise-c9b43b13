import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Save, RotateCcw, CheckCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Permission } from "@/hooks/usePermissions";
import { AppRole } from "@/hooks/useUserRole";

interface RolePermissionsMatrixProps {
  role: AppRole;
  permissions: Permission[];
}

interface RolePermissionState {
  permissionId: string;
  granted: boolean;
  modified: boolean;
}

export function RolePermissionsMatrix({ role, permissions }: RolePermissionsMatrixProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [modifications, setModifications] = useState<Map<string, RolePermissionState>>(new Map());

  // Fetch role permissions
  const { data: rolePermissions = [], isLoading } = useQuery({
    queryKey: ["role-permissions", role],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("role_permissions")
        .select("*")
        .eq("role", role);
      
      if (error) throw error;
      return data;
    },
    enabled: !!role,
  });

  // Update role permission mutation
  const updatePermissionMutation = useMutation({
    mutationFn: async ({ permissionId, granted }: { permissionId: string; granted: boolean }) => {
      const { error } = await supabase
        .from("role_permissions")
        .upsert({
          role: role,
          permission_id: permissionId,
          granted
        }, {
          onConflict: 'role,permission_id'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role-permissions"] });
      queryClient.invalidateQueries({ queryKey: ["user-permissions"] });
      toast({
        title: "تم الحفظ",
        description: "تم تحديث الصلاحيات بنجاح",
      });
      setModifications(new Map());
    },
    onError: (error: any) => {
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
    const modification = modifications.get(permissionId);
    if (modification !== undefined) {
      return modification.granted;
    }
    
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

  const hasModifications = modifications.size > 0;

  // Group permissions by category
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">جاري التحميل...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {hasModifications && (
        <Card className="border-warning bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">لديك {modifications.size} تغيير غير محفوظ</p>
                <p className="text-sm text-muted-foreground">احفظ التغييرات أو ألغِها</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={saveAllModifications}
                  disabled={updatePermissionMutation.isPending}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  حفظ التغييرات
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
            </div>
          </CardContent>
        </Card>
      )}

      {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
        <Card key={category}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {getCategoryLabel(category)}
                </CardTitle>
                <CardDescription>
                  {categoryPermissions.length} صلاحية
                </CardDescription>
              </div>
              <Badge variant="outline">{categoryPermissions.length}</Badge>
            </div>
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
                  {categoryPermissions.map((perm) => {
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
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    funds: "المصارف",
    accounting: "المحاسبة",
    beneficiaries: "المستفيدين",
    properties: "العقارات",
    archive: "الأرشيف",
    reports: "التقارير",
    admin: "الإدارة"
  };
  return labels[category] || category;
}
