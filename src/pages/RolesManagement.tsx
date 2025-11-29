import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useRolesManagement } from "@/hooks/useRolesManagement";

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
  const {
    filteredUsers,
    auditLogs,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    addRoleDialogOpen,
    selectedUser,
    newRole,
    setNewRole,
    openAddRoleDialog,
    closeAddRoleDialog,
    auditDialogOpen,
    setAuditDialogOpen,
    isLoading,
    isAddingRole,
    addRole,
    removeRole,
  } = useRolesManagement();

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
              <Button variant="outline" onClick={() => setAuditDialogOpen(true)}>
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
                              onClick={() => openAddRoleDialog(user)}
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
        <Dialog open={addRoleDialogOpen} onOpenChange={(open) => !open && closeAddRoleDialog()}>
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
                      <Badge key={role} className={ROLE_COLORS[role]} variant="outline">
                        {ROLE_LABELS[role]}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-4 w-4 p-0 mr-2 hover:bg-transparent"
                          onClick={() => removeRole(selectedUser.id, role)}
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
              <Button variant="outline" onClick={closeAddRoleDialog}>
                إلغاء
              </Button>
              <Button onClick={addRole} disabled={isAddingRole}>
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
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 border rounded-lg flex items-start gap-3">
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
