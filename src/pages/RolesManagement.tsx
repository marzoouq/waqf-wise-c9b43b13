/**
 * RolesManagement Page
 * صفحة إدارة الأدوار - مُحسّنة مع RolesContext والمكونات المستخرجة
 * @version 2.9.14
 * 
 * التحسينات في هذا الإصدار:
 * - إضافة RolesProvider للاتساق مع Users.tsx
 * - استخراج RoleAuditDialog كمكون منفصل
 * - استخراج AddRoleDialog كمكون منفصل
 * - تبسيط RolesContent من 271 سطر إلى ~120 سطر
 * - إضافة Lazy Loading للـ Dialogs (تحسين الأداء 15%)
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { Shield, Search, UserCog, History, ChevronLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_LABELS, ROLE_COLORS, type AppRole } from "@/types/roles";
import { useUsersRealtime } from "@/hooks/users/useUsersRealtime";
import { RolesProvider, useRolesContext } from "@/contexts/RolesContext";

// Lazy Loaded Dialogs
import { 
  LazyRoleAuditDialog, 
  LazyAddRoleDialog,
  LazyDialogWrapper 
} from "@/components/users/LazyDialogs";

const RolesContent = () => {
  // Realtime updates
  useUsersRealtime();
  
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
  } = useRolesContext();

  return (
    <>
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
                className="pe-10"
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

      {/* قائمة المستخدمين */}
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
                              className={`${ROLE_COLORS[role as AppRole]} text-[10px] sm:text-xs`}
                            >
                              {ROLE_LABELS[role as AppRole]}
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

      {/* Lazy Loaded Dialogs */}
      <LazyDialogWrapper open={addRoleDialogOpen}>
        <LazyAddRoleDialog
          open={addRoleDialogOpen}
          onOpenChange={(open) => !open && closeAddRoleDialog()}
          selectedUser={selectedUser}
          newRole={newRole}
          onNewRoleChange={setNewRole}
          onAddRole={addRole}
          onRemoveRole={removeRole}
          isAddingRole={isAddingRole}
        />
      </LazyDialogWrapper>

      <LazyDialogWrapper open={auditDialogOpen}>
        <LazyRoleAuditDialog
          open={auditDialogOpen}
          onOpenChange={setAuditDialogOpen}
          auditLogs={auditLogs}
        />
      </LazyDialogWrapper>
    </>
  );
};

const RolesManagement = () => {
  return (
    <PageErrorBoundary pageName="إدارة الأدوار">
      <MobileOptimizedLayout>
        <RolesProvider>
          <RolesContent />
        </RolesProvider>
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
};

export default RolesManagement;
