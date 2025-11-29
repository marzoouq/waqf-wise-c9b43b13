import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Shield, Edit, Trash2, CheckCircle, XCircle, Download, Key, AlertCircle } from "lucide-react";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { Database } from "@/integrations/supabase/types";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABELS } from "@/lib/role-labels";
import { 
  useUsersManagement, 
  type UserProfile 
} from "@/hooks/useUsersManagement";

// Use Database enum for AppRole (DB only has 7 roles)
type AppRole = Database['public']['Enums']['app_role'];

const roleColors: Record<AppRole, string> = {
  nazer: "bg-primary/10 text-primary border-primary/30",
  admin: "bg-destructive/10 text-destructive border-destructive/30",
  accountant: "bg-info/10 text-info border-info/30",
  cashier: "bg-success/10 text-success border-success/30",
  archivist: "bg-warning/10 text-warning border-warning/30",
  beneficiary: "bg-accent/10 text-accent border-accent/30",
  user: "bg-muted/10 text-muted-foreground border-border/30",
};

const Users = () => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  
  // استخدام hook إدارة المستخدمين
  const {
    users,
    isLoading,
    deleteUser: deleteUserMutation,
    updateRoles: updateRolesMutation,
    updateStatus: updateStatusMutation,
    resetPassword: resetPasswordMutation,
  } = useUsersManagement();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>([]);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [selectedUserForReset, setSelectedUserForReset] = useState<UserProfile | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || 
                       user.user_roles?.some(r => r.role === roleFilter);

    return matchesSearch && matchesRole;
  });

  // Export users to CSV
  const exportUsers = () => {
    const csvHeaders = ["الاسم", "البريد الإلكتروني", "الهاتف", "المنصب", "الأدوار", "الحالة", "تاريخ الإنشاء"];
    const csvData = filteredUsers.map(user => [
      user.full_name,
      user.email,
      user.phone || "-",
      user.position || "-",
      user.user_roles?.map(r => ROLE_LABELS[r.role as AppRole]).join(", ") || "-",
      user.is_active ? "نشط" : "غير نشط",
      format(new Date(user.created_at), "dd/MM/yyyy", { locale: ar })
    ]);

    const csv = [csvHeaders, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `users_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();

    toast({
      title: "تم التصدير",
      description: `تم تصدير ${filteredUsers.length} مستخدم بنجاح`,
    });
  };

  const handleDeleteClick = (user: UserProfile) => {
    // منع حذف المستخدم الحالي
    if (user.user_id === currentUser?.id) {
      toast({
        title: "تحذير",
        description: "لا يمكنك حذف حسابك الخاص",
        variant: "destructive",
      });
      return;
    }

    // منع حذف الناظر
    if (user.user_roles?.some(r => r.role === "nazer")) {
      toast({
        title: "تحذير",
        description: "لا يمكن حذف حساب الناظر",
        variant: "destructive",
      });
      return;
    }

    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.user_id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setUserToDelete(null);
        }
      });
    }
  };

  const handleEditRoles = (user: UserProfile) => {
    setSelectedUser(user);
    setSelectedRoles(user.user_roles?.map(r => r.role as AppRole) || ["user"]);
    setEditDialogOpen(true);
  };

  const handleSaveRoles = () => {
    if (selectedUser?.user_id && selectedRoles.length > 0) {
      updateRolesMutation.mutate({
        userId: selectedUser.user_id,
        roles: selectedRoles,
      }, {
        onSuccess: () => {
          setEditDialogOpen(false);
        }
      });
    } else if (!selectedUser?.user_id) {
      toast({
        title: "خطأ",
        description: "هذا المستخدم ليس لديه حساب مفعّل في النظام",
        variant: "destructive",
      });
    }
  };

  const toggleRole = (role: AppRole) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter(r => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  if (isLoading) {
    return <LoadingState message="جاري تحميل المستخدمين..." />;
  }

  return (
    <PageErrorBoundary pageName="إدارة المستخدمين">
      <MobileOptimizedLayout>
      <MobileOptimizedHeader
        title="إدارة المستخدمين"
        description="إدارة المستخدمين والأدوار والصلاحيات"
        icon={<Shield className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />}
        actions={
          <Button onClick={exportUsers} variant="outline" size="sm">
            <Download className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
            <span className="hidden sm:inline">تصدير ({filteredUsers.length})</span>
            <span className="sm:hidden">تصدير</span>
          </Button>
        }
      />

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث بالاسم أو البريد الإلكتروني..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="تصفية حسب الدور" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأدوار</SelectItem>
                  <SelectItem value="nazer">الناظر</SelectItem>
                  <SelectItem value="admin">المشرف</SelectItem>
                  <SelectItem value="accountant">المحاسب</SelectItem>
                  <SelectItem value="cashier">موظف صرف</SelectItem>
                  <SelectItem value="archivist">أرشيفي</SelectItem>
                  <SelectItem value="beneficiary">مستفيد</SelectItem>
                  <SelectItem value="user">مستخدم</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              المستخدمون ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <EmptyState
                icon={Shield}
                title="لا يوجد مستخدمون"
                description="لا يوجد مستخدمون مطابقون للبحث"
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right whitespace-nowrap">الاسم</TableHead>
                      <TableHead className="text-right whitespace-nowrap">البريد الإلكتروني</TableHead>
                      <TableHead className="text-right whitespace-nowrap hidden md:table-cell">الهاتف</TableHead>
                      <TableHead className="text-right whitespace-nowrap">الأدوار</TableHead>
                      <TableHead className="text-right whitespace-nowrap hidden lg:table-cell">الحالة</TableHead>
                      <TableHead className="text-right whitespace-nowrap hidden lg:table-cell">آخر تسجيل دخول</TableHead>
                      <TableHead className="text-right whitespace-nowrap">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium text-xs sm:text-sm">{user.full_name}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{user.email}</TableCell>
                        <TableCell className="hidden md:table-cell text-xs sm:text-sm">{user.phone || "-"}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.user_roles?.map((roleObj, idx) => {
                              const role = roleObj.role as AppRole;
                              return (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className={roleColors[role] + " text-xs whitespace-nowrap"}
                                >
                                  {ROLE_LABELS[role as keyof typeof ROLE_LABELS] || role}
                                </Badge>
                              );
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={user.is_active}
                              onCheckedChange={(checked) =>
                                updateStatusMutation.mutate({
                                  userId: user.user_id,
                                  isActive: checked,
                                })
                              }
                            />
                            {user.is_active ? (
                              <CheckCircle className="h-4 w-4 text-success" />
                            ) : (
                              <XCircle className="h-4 w-4 text-destructive" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.last_login_at
                            ? new Date(user.last_login_at).toLocaleDateString("ar-SA")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (!user.user_id) {
                                  toast({
                                    title: "غير متاح",
                                    description: "هذا المستخدم ليس لديه حساب مفعّل في النظام",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                                handleEditRoles(user);
                              }}
                              title={user.user_id ? "تعديل الأدوار" : "غير متاح - لا يوجد حساب"}
                              disabled={!user.user_id}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (!user.user_id) {
                                  toast({
                                    title: "غير متاح",
                                    description: "هذا المستخدم ليس لديه حساب مفعّل في النظام",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                                setSelectedUserForReset(user);
                                setResetPasswordDialogOpen(true);
                              }}
                              title={user.user_id ? "تعيين كلمة مرور مؤقتة" : "غير متاح - لا يوجد حساب"}
                              disabled={!user.user_id}
                            >
                              <Key className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(user)}
                              title="حذف المستخدم"
                              className="text-destructive hover:text-destructive"
                              disabled={
                                user.user_id === currentUser?.id ||
                                user.user_roles?.some(r => r.role === "nazer")
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Roles Dialog */}
        <ResponsiveDialog 
          open={editDialogOpen} 
          onOpenChange={setEditDialogOpen}
          title="تعديل الأدوار"
          description={`تحديد أدوار المستخدم: ${selectedUser?.full_name}`}
          size="md"
        >
          <div className="space-y-4">
            {(Object.keys(ROLE_LABELS).filter(r => 
              ['nazer', 'admin', 'accountant', 'cashier', 'archivist', 'beneficiary', 'user'].includes(r)
            ) as AppRole[]).map((role) => (
              <div
                key={role}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => toggleRole(role)}
              >
                <div className="flex items-center gap-3">
                  <Switch
                    checked={selectedRoles.includes(role)}
                    onCheckedChange={() => toggleRole(role)}
                  />
                  <Label className="cursor-pointer">{ROLE_LABELS[role as keyof typeof ROLE_LABELS]}</Label>
                </div>
                <Badge variant="outline" className={roleColors[role]}>
                  {role}
                </Badge>
              </div>
            ))}
          </div>

          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleSaveRoles}
              disabled={selectedRoles.length === 0 || !selectedUser?.user_id || updateRolesMutation.isPending}
            >
              {updateRolesMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </div>
        </ResponsiveDialog>

        {/* Reset Password Dialog */}
        <ResponsiveDialog 
          open={resetPasswordDialogOpen} 
          onOpenChange={setResetPasswordDialogOpen}
          title="تعيين كلمة مرور مؤقتة"
          description={`تعيين كلمة مرور جديدة للمستخدم: ${selectedUserForReset?.full_name}`}
          size="sm"
        >
          <div className="space-y-4">
            <Alert className="border-warning/50 bg-warning/10">
              <AlertCircle className="h-4 w-4 text-warning" />
              <AlertTitle>تنبيه أمني</AlertTitle>
              <AlertDescription>
                سيتم إرسال إشعار للمستخدم بتغيير كلمة المرور. يُنصح بإخباره شخصياً.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="newPassword">كلمة المرور الجديدة *</Label>
              <Input
                id="newPassword"
                type="text"
                placeholder="أدخل كلمة المرور المؤقتة (8 أحرف على الأقل)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="text-left"
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground">
                مثال: User@123456
              </p>
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setResetPasswordDialogOpen(false);
                setNewPassword("");
              }}
            >
              إلغاء
            </Button>
            <Button
              onClick={() => {
                if (selectedUserForReset?.user_id) {
                  resetPasswordMutation.mutate({
                    userId: selectedUserForReset.user_id,
                    password: newPassword
                  }, {
                    onSuccess: () => {
                      setResetPasswordDialogOpen(false);
                      setNewPassword("");
                      setSelectedUserForReset(null);
                    }
                  });
                }
              }}
              disabled={newPassword.length < 8 || resetPasswordMutation.isPending || !selectedUserForReset?.user_id}
            >
              {resetPasswordMutation.isPending ? "جاري التحديث..." : "تعيين كلمة المرور"}
            </Button>
          </div>
        </ResponsiveDialog>

        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          title="حذف المستخدم"
          description="هل أنت متأكد من حذف هذا المستخدم؟ سيتم حذف جميع البيانات المرتبطة به بشكل نهائي."
          itemName={userToDelete ? `${userToDelete.full_name} (${userToDelete.email})` : ""}
          isLoading={deleteUserMutation.isPending}
        />
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
};

export default Users;
