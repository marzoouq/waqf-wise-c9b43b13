import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { Shield, Search, Plus, Trash2, UserCog, History, ChevronLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { type AppRole, ROLE_LABELS, ROLE_COLORS } from "@/types/roles";
import { useRolesManagement } from "@/hooks/users/useRolesManagement";
import { useIsMobile } from "@/hooks/use-mobile";

const RolesManagement = () => {
  const isMobile = useIsMobile();
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
          actions={
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setAuditDialogOpen(true)}
              className="gap-2"
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">سجل التغييرات</span>
            </Button>
          }
        />

        {/* الفلاتر */}
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث بالاسم أو البريد الإلكتروني..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full">
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
            </div>
          </CardContent>
        </Card>

        {/* قائمة المستخدمين - بطاقات للجوال */}
        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">المستخدمون ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">لا توجد نتائج</div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 sm:p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <UserCog className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm sm:text-base truncate">
                          {user.full_name || "غير محدد"}
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground truncate">
                          {user.email}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {user.roles_array && user.roles_array.length > 0 ? (
                            user.roles_array.map((role) => (
                              <Badge 
                                key={role} 
                                className={`${ROLE_COLORS[role]} text-[10px] sm:text-xs`}
                              >
                                {ROLE_LABELS[role]}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">لا توجد أدوار</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openAddRoleDialog(user)}
                      className="h-10 w-10 flex-shrink-0"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog إضافة دور */}
        <ResponsiveDialog 
          open={addRoleDialogOpen} 
          onOpenChange={(open) => !open && closeAddRoleDialog()}
          title="إضافة دور جديد"
        >
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
                        className="h-5 w-5 p-0 mr-2 hover:bg-transparent"
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
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={closeAddRoleDialog} className="w-full sm:w-auto">
              إلغاء
            </Button>
            <Button onClick={addRole} disabled={isAddingRole} className="w-full sm:w-auto">
              إضافة
            </Button>
          </DialogFooter>
        </ResponsiveDialog>

        {/* Dialog سجل التغييرات */}
        <ResponsiveDialog 
          open={auditDialogOpen} 
          onOpenChange={setAuditDialogOpen}
          title="سجل تغييرات الأدوار"
          size="lg"
        >
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {auditLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">لا توجد تغييرات</div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-3 sm:p-4 border rounded-lg flex items-start gap-3">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      log.action === "added" ? "bg-success/10" : "bg-destructive/10"
                    }`}
                  >
                    {log.action === "added" ? (
                      <Plus className="h-4 w-4 text-success" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base">
                      {log.action === "added" ? "إضافة" : "حذف"} دور{" "}
                      <Badge className={ROLE_COLORS[log.role as AppRole]}>
                        {ROLE_LABELS[log.role as AppRole]}
                      </Badge>
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      بواسطة: {log.changed_by_name || "النظام"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.changed_at).toLocaleString("ar-SA")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ResponsiveDialog>
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
};

export default RolesManagement;
