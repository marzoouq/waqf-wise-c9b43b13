/**
 * Users Page
 * صفحة إدارة المستخدمين - مُحسّنة مع UsersContext و UsersDialogsContext
 * @version 2.9.12
 */

import { useToast } from "@/hooks/use-toast";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { Button } from "@/components/ui/button";
import { Shield, Download } from "lucide-react";
import { ErrorState } from "@/components/shared/ErrorState";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { usePermissions } from "@/hooks/usePermissions";
import { useUsersRealtime } from "@/hooks/users/useUsersRealtime";
import { UsersProvider, useUsersContext } from "@/contexts/UsersContext";
import { UsersDialogsProvider, useUsersDialogsContext } from "@/contexts/UsersDialogsContext";
import { exportUsersToCSV } from "@/utils/export-users";

// Components
import { UsersFilters } from "@/components/users/UsersFilters";
import { UsersTable } from "@/components/users/UsersTable";
import { UsersTableSkeleton } from "@/components/users/UsersTableSkeleton";
import { EditRolesDialog } from "@/components/users/EditRolesDialog";
import { ResetPasswordDialog } from "@/components/users/ResetPasswordDialog";
import { EditUserEmailDialog } from "@/components/users/EditUserEmailDialog";

const UsersContent = () => {
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  
  // Realtime updates
  useUsersRealtime();
  
  // Users Context
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
    updateStatus,
    resetPassword,
    isDeleting,
    isUpdatingRoles,
    isResettingPassword,
    currentUserId,
    showNotAvailableToast,
  } = useUsersContext();
  
  // Dialogs Context
  const {
    editRolesDialog,
    selectedRoles,
    openEditRolesDialog,
    closeEditRolesDialog,
    toggleRole,
    
    resetPasswordDialog,
    newPassword,
    setNewPassword,
    openResetPasswordDialog,
    closeResetPasswordDialog,
    
    deleteDialog,
    openDeleteDialog,
    closeDeleteDialog,
    
    editEmailDialog,
    openEditEmailDialog,
    closeEditEmailDialog,
  } = useUsersDialogsContext();

  const canEditEmail = hasPermission("admin.edit_user_email");

  // Export
  const handleExport = () => {
    exportUsersToCSV({ users: filteredUsers });
    toast({
      title: "تم التصدير",
      description: `تم تصدير ${filteredUsers.length} مستخدم بنجاح`,
    });
  };

  // Delete Handler (موحد - يستخدم Context فقط)
  const handleDeleteClick = (user: typeof filteredUsers[0]) => {
    if (user.user_id === currentUserId) {
      toast({ title: "تحذير", description: "لا يمكنك حذف حسابك الخاص", variant: "destructive" });
      return;
    }
    if (user.user_roles?.some(r => r.role === "nazer")) {
      toast({ title: "تحذير", description: "لا يمكن حذف حساب الناظر", variant: "destructive" });
      return;
    }
    openDeleteDialog(user);
  };

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
            <Download className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
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

      {isLoading ? (
        <UsersTableSkeleton rows={5} />
      ) : (
        <UsersTable
          users={filteredUsers}
          currentUserId={currentUserId}
          canEditEmail={canEditEmail}
          onEditRoles={openEditRolesDialog}
          onEditEmail={openEditEmailDialog}
          onResetPassword={openResetPasswordDialog}
          onDelete={handleDeleteClick}
          onStatusChange={(userId, isActive) => updateStatus(userId, isActive)}
          onShowNotAvailableToast={showNotAvailableToast}
        />
      )}

      <EditRolesDialog
        open={editRolesDialog.open}
        onOpenChange={(open) => !open && closeEditRolesDialog()}
        user={editRolesDialog.data}
        selectedRoles={selectedRoles}
        onToggleRole={toggleRole}
        onSave={handleSaveRoles}
        isSaving={isUpdatingRoles}
      />

      <ResetPasswordDialog
        open={resetPasswordDialog.open}
        onOpenChange={(open) => !open && closeResetPasswordDialog()}
        user={resetPasswordDialog.data}
        password={newPassword}
        onPasswordChange={setNewPassword}
        onReset={handleResetPassword}
        isResetting={isResettingPassword}
      />

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => !open && closeDeleteDialog()}
        onConfirm={handleDeleteConfirm}
        title="حذف المستخدم"
        description="هل أنت متأكد من حذف هذا المستخدم؟ سيتم حذف جميع البيانات المرتبطة به بشكل نهائي."
        itemName={deleteDialog.data ? `${deleteDialog.data.full_name} (${deleteDialog.data.email})` : ""}
        isLoading={isDeleting}
      />

      <EditUserEmailDialog
        open={editEmailDialog.open}
        onOpenChange={(open) => !open && closeEditEmailDialog()}
        user={editEmailDialog.data}
        onSuccess={() => refetch()}
      />
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
