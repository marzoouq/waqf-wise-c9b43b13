/**
 * UsersTableRow Component
 * صف واحد في جدول المستخدمين
 * @version 2.9.11
 */

import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Edit, Trash2, CheckCircle, XCircle, Key, Mail } from "lucide-react";
import { ROLE_LABELS, ROLE_COLORS, type AppRole } from "@/types/roles";
import type { UserProfile } from "@/types/auth";

interface UsersTableRowProps {
  user: UserProfile;
  currentUserId?: string;
  canEditEmail: boolean;
  onEditRoles: () => void;
  onEditEmail: () => void;
  onResetPassword: () => void;
  onDelete: () => void;
  onStatusChange: (isActive: boolean) => void;
}

export function UsersTableRow({
  user,
  currentUserId,
  canEditEmail,
  onEditRoles,
  onEditEmail,
  onResetPassword,
  onDelete,
  onStatusChange,
}: UsersTableRowProps) {
  const isCurrentUser = user.user_id === currentUserId;
  const isNazer = user.user_roles?.some(r => r.role === "nazer");
  const hasUserId = !!user.user_id;

  return (
    <TableRow>
      <TableCell className="font-medium text-xs sm:text-sm">
        {user.full_name}
      </TableCell>
      <TableCell className="text-xs sm:text-sm">{user.email}</TableCell>
      <TableCell className="hidden md:table-cell text-xs sm:text-sm">
        {user.phone || "-"}
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {user.user_roles?.map((roleObj, idx) => {
            const role = roleObj.role as AppRole;
            return (
              <Badge
                key={idx}
                variant="outline"
                className={`${ROLE_COLORS[role]} text-xs whitespace-nowrap`}
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
            onCheckedChange={onStatusChange}
            disabled={!hasUserId}
          />
          {user.is_active ? (
            <CheckCircle className="h-4 w-4 text-status-success" />
          ) : (
            <XCircle className="h-4 w-4 text-destructive" />
          )}
        </div>
      </TableCell>
      <TableCell className="hidden lg:table-cell text-xs sm:text-sm">
        {user.last_login_at
          ? new Date(user.last_login_at).toLocaleDateString("ar-SA")
          : "-"}
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEditRoles}
            title={hasUserId ? "تعديل الأدوار" : "غير متاح"}
            disabled={!hasUserId}
          >
            <Edit className="h-4 w-4" />
          </Button>
          {canEditEmail && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEditEmail}
              title={hasUserId ? "تعديل البريد" : "غير متاح"}
              disabled={!hasUserId}
            >
              <Mail className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetPassword}
            title={hasUserId ? "تعيين كلمة مرور" : "غير متاح"}
            disabled={!hasUserId}
          >
            <Key className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            title="حذف المستخدم"
            className="text-destructive hover:text-destructive"
            disabled={isCurrentUser || isNazer || !hasUserId}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
