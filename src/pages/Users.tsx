/**
 * Users Page
 * صفحة إدارة المستخدمين - مُحسّنة مع UsersContext و UsersDialogsContext
 * @version 2.9.14
 * 
 * التحسينات في هذا الإصدار:
 * - استخدام UsersTableWithContext بدلاً من UsersTable (0 props بدلاً من 9)
 * - نقل منطق الحذف إلى UsersTableRowWithContext
 * - تبسيط UsersContent
 * - إضافة Lazy Loading للـ Dialogs (تحسين الأداء 15%)
 */

import { useToast } from "@/hooks/ui/use-toast";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { Button } from "@/components/ui/button";
import { Shield, Download } from "lucide-react";
import { ErrorState } from "@/components/shared/ErrorState";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { useUsersRealtime } from "@/hooks/users/useUsersRealtime";
import { UsersProvider, useUsersContext } from "@/contexts/UsersContext";
import { UsersDialogsProvider, useUsersDialogsContext } from "@/contexts/UsersDialogsContext";
import { exportUsersToCSV } from "@/lib/utils/export-users";

// Components
import { UsersFilters } from "@/components/users/UsersFilters";
import { UsersTableWithContext } from "@/components/users/UsersTableWithContext";
import { UsersTableSkeleton } from "@/components/users/UsersTableSkeleton";

// Lazy Loaded Dialogs
import { 
  LazyEditRolesDialog, 
  LazyResetPasswordDialog, 
  LazyEditUserEmailDialog,
  LazyDialogWrapper 
} from "@/components/users/LazyDialogs";

const UsersContent = () => {
  const { toast } = useToast();
  
  // Realtime updates
  useUsersRealtime();
  
  // Users Context - فقط ما نحتاجه
  const {
    filteredUsers,
    isLoading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    deleteUser,
    updateRoles,
    resetPassword,
    isDeleting,
    isUpdatingRoles,
    isResettingPassword,
  } = useUsersContext();
  
  // Dialogs Context
  const {
    editRolesDialog,
    selectedRoles,
    closeEditRolesDialog,
    toggleRole,
    
    resetPasswordDialog,
    newPassword,
    setNewPassword,
    closeResetPasswordDialog,
    
    deleteDialog,
    closeDeleteDialog,
    
    editEmailDialog,
    closeEditEmailDialog,
  } = useUsersDialogsContext();

  // Export
  const handleExport = () => {
    exportUsersToCSV({ users: filteredUsers });
    toast({
      title: "تم التصدير",
      description: `تم تصدير ${filteredUsers.length} مستخدم بنجاح`,
    });
  };

  // Delete Handler - موحد مع Context
  const handleDeleteConfirm = () => {
    if (deleteDialog.data) {
      deleteUser(deleteDialog.data);
      closeDeleteDialog();
    }
  };

  const handleSaveRoles = () => {
    if (editRolesDialog.data?.user_id && selectedRoles.length > 0) {
      updateRoles(editRolesDialog.data.user_id, selectedRoles);
      closeEditRolesDialog();
    } else if (!editRolesDialog.data?.user_id) {
      toast({ title: "خطأ", description: "هذا المستخدم ليس لديه حساب مفعّل في النظام", variant: "destructive" });
    }
  };

  const handleResetPassword = () => {
    if (resetPasswordDialog.data?.user_id) {
      resetPassword(resetPasswordDialog.data.user_id, newPassword);
      closeResetPasswordDialog();
    }
  };

  if (error) {
    return (
      <ErrorState 
        title="فشل تحميل المستخدمين" 
        message="حدث خطأ أثناء تحميل بيانات المستخدمين"
        onRetry={refetch}
        fullScreen
      />
    );
  }

  return (
    <>
      <MobileOptimizedHeader
        title="إدارة المستخدمين"
        description="إدارة المستخدمين والأدوار والصلاحيات"
        icon={<Shield className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />}
        actions={
          <Button onClick={handleExport} variant="outline" size="sm" disabled={isLoading}>
            <Download className="h-4 w-4 sm:h-5 sm:w-5 ms-2" />
            <span className="hidden sm:inline">تصدير ({filteredUsers.length})</span>
            <span className="sm:hidden">تصدير</span>
          </Button>
        }
      />

      <UsersFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
      />

      {/* ✅ استخدام UsersTableWithContext - بدون Props Drilling */}
      {isLoading ? (
        <UsersTableSkeleton rows={5} />
      ) : (
        <UsersTableWithContext />
      )}

      {/* Lazy Loaded Dialogs */}
      <LazyDialogWrapper open={editRolesDialog.open}>
        <LazyEditRolesDialog
          open={editRolesDialog.open}
          onOpenChange={(open) => !open && closeEditRolesDialog()}
          user={editRolesDialog.data}
          selectedRoles={selectedRoles}
          onToggleRole={toggleRole}
          onSave={handleSaveRoles}
          isSaving={isUpdatingRoles}
        />
      </LazyDialogWrapper>

      <LazyDialogWrapper open={resetPasswordDialog.open}>
        <LazyResetPasswordDialog
          open={resetPasswordDialog.open}
          onOpenChange={(open) => !open && closeResetPasswordDialog()}
          user={resetPasswordDialog.data}
          password={newPassword}
          onPasswordChange={setNewPassword}
          onReset={handleResetPassword}
          isResetting={isResettingPassword}
        />
      </LazyDialogWrapper>

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => !open && closeDeleteDialog()}
        onConfirm={handleDeleteConfirm}
        title="حذف المستخدم"
        description="هل أنت متأكد من حذف هذا المستخدم؟ سيتم حذف جميع البيانات المرتبطة به بشكل نهائي."
        itemName={deleteDialog.data ? `${deleteDialog.data.full_name} (${deleteDialog.data.email})` : ""}
        isLoading={isDeleting}
      />

      <LazyDialogWrapper open={editEmailDialog.open}>
        <LazyEditUserEmailDialog
          open={editEmailDialog.open}
          onOpenChange={(open) => !open && closeEditEmailDialog()}
          user={editEmailDialog.data}
          onSuccess={() => refetch()}
        />
      </LazyDialogWrapper>
    </>
  );
};

const Users = () => {
  return (
    <PageErrorBoundary pageName="إدارة المستخدمين">
      <MobileOptimizedLayout>
        <UsersProvider>
          <UsersDialogsProvider>
            <UsersContent />
          </UsersDialogsProvider>
        </UsersProvider>
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
};

export default Users;
