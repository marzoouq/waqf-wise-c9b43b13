import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { Shield, Search, Plus, Trash2, UserCog, History } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AppRole } from "@/hooks/useUserRole";

interface UserWithRoles {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  roles: AppRole[];
  roles_array: AppRole[];
  roles_count: number;
}

const ROLE_LABELS: Record<AppRole, string> = {
  admin: "المشرف",
  nazer: "الناظر",
  accountant: "المحاسب",
  cashier: "موظف الصرف",
  archivist: "الأرشيفي",
  beneficiary: "مستفيد",
  user: "مستخدم",
};

const ROLE_COLORS: Record<AppRole, string> = {
  admin: "bg-destructive text-destructive-foreground",
  nazer: "bg-primary text-primary-foreground",
  accountant: "bg-success text-success-foreground",
  cashier: "bg-warning text-warning-foreground",
  archivist: "bg-info text-info-foreground",
  beneficiary: "bg-accent text-accent-foreground",
  user: "bg-muted text-muted-foreground",
};

const RolesManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [addRoleDialogOpen, setAddRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [newRole, setNewRole] = useState<AppRole>("user");
  const [auditDialogOpen, setAuditDialogOpen] = useState(false);

  // جلب المستخدمين مع أدوارهم
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users-with-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("users_with_roles").select("*");
      if (error) throw error;
      return (data || []).map(u => ({
        id: u.id,
        user_id: u.id,
        full_name: u.full_name || '',
        email: u.email || '',
        avatar_url: '',
        roles: Array.isArray(u.roles) ? u.roles : [],
        roles_array: Array.isArray(u.roles) ? u.roles : [],
        roles_count: Array.isArray(u.roles) ? u.roles.length : 0,
      })) as UserWithRoles[];
    },
  });

  // جلب سجل الأدوار
  const { data: auditLogs = [] } = useQuery({
    queryKey: ["user-roles-audit"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles_audit")
        .select("*")
        .order("changed_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  // إضافة دور
  const addRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });
      queryClient.invalidateQueries({ queryKey: ["user-roles-audit"] });
      toast({
        title: "تمت الإضافة",
        description: "تم إضافة الدور بنجاح",
      });
      setAddRoleDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشلت إضافة الدور",
        variant: "destructive",
      });
    },
  });

  // حذف دور
  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });
      queryClient.invalidateQueries({ queryKey: ["user-roles-audit"] });
      toast({
        title: "تم الحذف",
        description: "تم حذف الدور بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل حذف الدور",
        variant: "destructive",
      });
    },
  });

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole =
      roleFilter === "all" || user.roles_array?.includes(roleFilter as AppRole);
    return matchesSearch && matchesRole;
  });

  return (
    <PageErrorBoundary pageName="إدارة الأدوار">
      <MobileOptimizedLayout>
        <MobileOptimizedHeader
          title="إدارة الأدوار والصلاحيات"
          description="عرض وإدارة أدوار المستخدمين والصلاحيات"
          icon={<Shield className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />}
        />

        {/* الفلاتر */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث بالاسم أو البريد الإلكتروني..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="فلترة حسب الدور" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأدوار</SelectItem>
                  {Object.entries(ROLE_LABELS).map(([role, label]) => (
                    <SelectItem key={role} value={role}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => setAuditDialogOpen(true)}
              >
                <History className="h-4 w-4 ml-2" />
                سجل التغييرات
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* جدول المستخدمين */}
        <Card>
          <CardHeader>
            <CardTitle>المستخدمون ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المستخدم</TableHead>
                    <TableHead>البريد الإلكتروني</TableHead>
                    <TableHead>الأدوار</TableHead>
                    <TableHead className="text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        جاري التحميل...
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        لا توجد نتائج
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <UserCog className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{user.full_name || "غير محدد"}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            {user.roles_array && user.roles_array.length > 0 ? (
                              user.roles_array.map((role) => (
                                <Badge key={role} className={ROLE_COLORS[role]}>
                                  {ROLE_LABELS[role]}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground">لا توجد أدوار</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedUser(user);
                                setAddRoleDialogOpen(true);
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Dialog إضافة دور */}
        <Dialog open={addRoleDialogOpen} onOpenChange={setAddRoleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة دور جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>المستخدم</Label>
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <p className="font-medium">{selectedUser?.full_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
                </div>
              </div>
              <div>
                <Label>الأدوار الحالية</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedUser?.roles_array && selectedUser.roles_array.length > 0 ? (
                    selectedUser.roles_array.map((role) => (
                      <Badge
                        key={role}
                        className={ROLE_COLORS[role]}
                        variant="outline"
                      >
                        {ROLE_LABELS[role]}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-4 w-4 p-0 mr-2 hover:bg-transparent"
                          onClick={() =>
                            removeRoleMutation.mutate({
                              userId: selectedUser.id,
                              role,
                            })
                          }
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">لا توجد أدوار حالية</span>
                  )}
                </div>
              </div>
              <div>
                <Label>إضافة دور جديد</Label>
                <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_LABELS)
                      .filter(([role]) => !selectedUser?.roles_array?.includes(role as AppRole))
                      .map(([role, label]) => (
                        <SelectItem key={role} value={role}>
                          {label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddRoleDialogOpen(false)}>
                إلغاء
              </Button>
              <Button
                onClick={() => {
                  if (selectedUser) {
                    addRoleMutation.mutate({
                      userId: selectedUser.id,
                      role: newRole,
                    });
                  }
                }}
                disabled={addRoleMutation.isPending}
              >
                إضافة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog سجل التغييرات */}
        <Dialog open={auditDialogOpen} onOpenChange={setAuditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>سجل تغييرات الأدوار</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {auditLogs.map((log: any) => (
                <div
                  key={log.id}
                  className="p-4 border rounded-lg flex items-start gap-3"
                >
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      log.action === "added" ? "bg-success/10" : "bg-destructive/10"
                    }`}
                  >
                    {log.action === "added" ? (
                      <Plus className="h-4 w-4 text-success" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {log.action === "added" ? "إضافة" : "حذف"} دور{" "}
                      <Badge className={ROLE_COLORS[log.role as AppRole]}>
                        {ROLE_LABELS[log.role as AppRole]}
                      </Badge>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      بواسطة: {log.changed_by_name || "النظام"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.changed_at).toLocaleString("ar-SA")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
};

export default RolesManagement;
