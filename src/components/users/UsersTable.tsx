/**
 * UsersTable Component
 * جدول عرض المستخدمين مع الإجراءات - مُحسّن
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { UsersTableRow } from "./UsersTableRow";
import type { UserProfile } from "@/types/auth";

interface UsersTableProps {
  users: UserProfile[];
  currentUserId?: string;
  canEditEmail: boolean;
  onEditRoles: (user: UserProfile) => void;
  onEditEmail: (user: UserProfile) => void;
  onResetPassword: (user: UserProfile) => void;
  onDelete: (user: UserProfile) => void;
  onStatusChange: (userId: string, isActive: boolean) => void;
  onShowNotAvailableToast: () => void;
}

export function UsersTable({
  users,
  currentUserId,
  canEditEmail,
  onEditRoles,
  onEditEmail,
  onResetPassword,
  onDelete,
  onStatusChange,
  onShowNotAvailableToast,
}: UsersTableProps) {
  const handleAction = (user: UserProfile, action: () => void) => {
    if (!user.user_id) {
      onShowNotAvailableToast();
      return;
    }
    action();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          المستخدمون ({users.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
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
                {users.map((user) => (
                  <UsersTableRow
                    key={user.id}
                    user={user}
                    currentUserId={currentUserId}
                    canEditEmail={canEditEmail}
                    onEditRoles={() => handleAction(user, () => onEditRoles(user))}
                    onEditEmail={() => handleAction(user, () => onEditEmail(user))}
                    onResetPassword={() => handleAction(user, () => onResetPassword(user))}
                    onDelete={() => onDelete(user)}
                    onStatusChange={(isActive) => onStatusChange(user.user_id, isActive)}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
