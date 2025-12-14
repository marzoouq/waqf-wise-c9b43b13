/**
 * Users Page
 * صفحة إدارة المستخدمين - مُعاد هيكلتها إلى مكونات فرعية
 */

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { Button } from "@/components/ui/button";
import { Shield, Download } from "lucide-react";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { format, arLocale as ar } from "@/lib/date";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABELS, type AppRole } from "@/types/roles";
import { useUsersManagement, type UserProfile } from "@/hooks/useUsersManagement";
import { usePermissions } from "@/hooks/usePermissions";
import { useUsersRealtime } from "@/hooks/users/useUsersRealtime";

// Components
import { UsersFilters } from "@/components/users/UsersFilters";
import { UsersTable } from "@/components/users/UsersTable";
import { EditRolesDialog } from "@/components/users/EditRolesDialog";
import { ResetPasswordDialog } from "@/components/users/ResetPasswordDialog";
import { EditUserEmailDialog } from "@/components/users/EditUserEmailDialog";

const Users = () => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const { hasPermission } = usePermissions();
  
  // Realtime updates
  useUsersRealtime();
  
  const {
    users,
    isLoading,
    error,
    refetch,
    deleteUser: deleteUserMutation,
    updateRoles: updateRolesMutation,
    updateStatus: updateStatusMutation,
    resetPassword: resetPasswordMutation,
  } = useUsersManagement();
  
  // State
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
  const [editEmailDialogOpen, setEditEmailDialogOpen] = useState(false);
  const [selectedUserForEmail, setSelectedUserForEmail] = useState<UserProfile | null>(null);

  const canEditEmail = hasPermission("admin.edit_user_email");

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

  // Handlers
  const handleDeleteClick = (user: UserProfile) => {
    if (user.user_id === currentUser?.id) {
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
        onSuccess: () => setEditDialogOpen(false)
      });
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
  };

  const showNotAvailableToast = () => {
    toast({ title: "غير متاح", description: "هذا المستخدم ليس لديه حساب مفعّل في النظام", variant: "destructive" });
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

        <UsersFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
        />

        <UsersTable
          users={filteredUsers}
          currentUserId={currentUser?.id}
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
          onStatusChange={(userId, isActive) => updateStatusMutation.mutate({ userId, isActive })}
          onShowNotAvailableToast={showNotAvailableToast}
        />

        <EditRolesDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          user={selectedUser}
          selectedRoles={selectedRoles}
          onToggleRole={toggleRole}
          onSave={handleSaveRoles}
          isSaving={updateRolesMutation.isPending}
        />

        <ResetPasswordDialog
          open={resetPasswordDialogOpen}
          onOpenChange={setResetPasswordDialogOpen}
          user={selectedUserForReset}
          password={newPassword}
          onPasswordChange={setNewPassword}
          onReset={handleResetPassword}
          isResetting={resetPasswordMutation.isPending}
        />

        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          title="حذف المستخدم"
          description="هل أنت متأكد من حذف هذا المستخدم؟ سيتم حذف جميع البيانات المرتبطة به بشكل نهائي."
          itemName={userToDelete ? `${userToDelete.full_name} (${userToDelete.email})` : ""}
          isLoading={deleteUserMutation.isPending}
        />

        <EditUserEmailDialog
          open={editEmailDialogOpen}
          onOpenChange={setEditEmailDialogOpen}
          user={selectedUserForEmail}
          onSuccess={() => refetch()}
        />
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
};

export default Users;
