/**
 * Users Page
 * صفحة إدارة المستخدمين - مُحسّنة مع UsersContext
 * @version 2.9.11
 */

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { Button } from "@/components/ui/button";
import { Shield, Download } from "lucide-react";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { usePermissions } from "@/hooks/usePermissions";
import { useUsersRealtime } from "@/hooks/users/useUsersRealtime";
import { UsersProvider, useUsersContext } from "@/contexts/UsersContext";
import { exportUsersToCSV } from "@/utils/export-users";
import type { AppRole } from "@/types/roles";
import type { UserProfile } from "@/types/auth";

// Components
import { UsersFilters } from "@/components/users/UsersFilters";
import { UsersTable } from "@/components/users/UsersTable";
import { EditRolesDialog } from "@/components/users/EditRolesDialog";
import { ResetPasswordDialog } from "@/components/users/ResetPasswordDialog";
import { EditUserEmailDialog } from "@/components/users/EditUserEmailDialog";

const UsersContent = () => {
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  
  // Realtime updates
  useUsersRealtime();
  
  // Context
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
  
  // Dialog State
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>([]);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [selectedUserForReset, setSelectedUserForReset] = useState<UserProfile | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [editEmailDialogOpen, setEditEmailDialogOpen] = useState(false);
  const [selectedUserForEmail, setSelectedUserForEmail] = useState<UserProfile | null>(null);

  const canEditEmail = hasPermission("admin.edit_user_email");

  // Export
  const handleExport = () => {
    exportUsersToCSV({ users: filteredUsers });
    toast({
      title: "تم التصدير",
      description: `تم تصدير ${filteredUsers.length} مستخدم بنجاح`,
    });
  };

  // Handlers
  const handleDeleteClick = (user: UserProfile) => {
    if (user.user_id === currentUserId) {
      toast({ title: "تحذير", description: "لا يمكنك حذف حسابك الخاص", variant: "destructive" });
      return;
    }
    if (user.user_roles?.some(r => r.role === "nazer")) {
      toast({ title: "تحذير", description: "لا يمكن حذف حساب الناظر", variant: "destructive" });
      return;
    }
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      deleteUser(userToDelete);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleEditRoles = (user: UserProfile) => {
    setSelectedUser(user);
    setSelectedRoles(user.user_roles?.map(r => r.role as AppRole) || ["user"]);
    setEditDialogOpen(true);
  };

  const handleSaveRoles = () => {
    if (selectedUser?.user_id && selectedRoles.length > 0) {
      updateRoles(selectedUser.user_id, selectedRoles);
      setEditDialogOpen(false);
    } else if (!selectedUser?.user_id) {
      toast({ title: "خطأ", description: "هذا المستخدم ليس لديه حساب مفعّل في النظام", variant: "destructive" });
    }
  };

  const toggleRole = (role: AppRole) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter(r => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleResetPassword = () => {
    if (selectedUserForReset?.user_id) {
      resetPassword(selectedUserForReset.user_id, newPassword);
      setResetPasswordDialogOpen(false);
      setNewPassword("");
      setSelectedUserForReset(null);
    }
  };

  if (isLoading) {
    return <LoadingState message="جاري تحميل المستخدمين..." />;
  }

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
          <Button onClick={handleExport} variant="outline" size="sm">
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

      <UsersTable
        users={filteredUsers}
        currentUserId={currentUserId}
        canEditEmail={canEditEmail}
        onEditRoles={handleEditRoles}
        onEditEmail={(user) => {
          setSelectedUserForEmail(user);
          setEditEmailDialogOpen(true);
        }}
        onResetPassword={(user) => {
          setSelectedUserForReset(user);
          setResetPasswordDialogOpen(true);
        }}
        onDelete={handleDeleteClick}
        onStatusChange={(userId, isActive) => updateStatus(userId, isActive)}
        onShowNotAvailableToast={showNotAvailableToast}
      />

      <EditRolesDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        user={selectedUser}
        selectedRoles={selectedRoles}
        onToggleRole={toggleRole}
        onSave={handleSaveRoles}
        isSaving={isUpdatingRoles}
      />

      <ResetPasswordDialog
        open={resetPasswordDialogOpen}
        onOpenChange={setResetPasswordDialogOpen}
        user={selectedUserForReset}
        password={newPassword}
        onPasswordChange={setNewPassword}
        onReset={handleResetPassword}
        isResetting={isResettingPassword}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="حذف المستخدم"
        description="هل أنت متأكد من حذف هذا المستخدم؟ سيتم حذف جميع البيانات المرتبطة به بشكل نهائي."
        itemName={userToDelete ? `${userToDelete.full_name} (${userToDelete.email})` : ""}
        isLoading={isDeleting}
      />

      <EditUserEmailDialog
        open={editEmailDialogOpen}
        onOpenChange={setEditEmailDialogOpen}
        user={selectedUserForEmail}
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
          <UsersContent />
        </UsersProvider>
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
};

export default Users;
