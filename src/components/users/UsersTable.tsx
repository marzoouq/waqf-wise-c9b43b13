/**
 * UsersTable Component
 * جدول عرض المستخدمين مع الإجراءات
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Shield, Edit, Trash2, CheckCircle, XCircle, Key, Mail } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ROLE_LABELS, ROLE_COLORS, type AppRole } from "@/types/roles";
import type { UserProfile } from "@/hooks/useUsersManagement";

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
                              className={ROLE_COLORS[role] + " text-xs whitespace-nowrap"}
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
                          onCheckedChange={(checked) => onStatusChange(user.user_id, checked)}
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
                              onShowNotAvailableToast();
                              return;
                            }
                            onEditRoles(user);
                          }}
                          title={user.user_id ? "تعديل الأدوار" : "غير متاح - لا يوجد حساب"}
                          disabled={!user.user_id}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {canEditEmail && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (!user.user_id) {
                                onShowNotAvailableToast();
                                return;
                              }
                              onEditEmail(user);
                            }}
                            title={user.user_id ? "تعديل البريد الإلكتروني" : "غير متاح - لا يوجد حساب"}
                            disabled={!user.user_id}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (!user.user_id) {
                              onShowNotAvailableToast();
                              return;
                            }
                            onResetPassword(user);
                          }}
                          title={user.user_id ? "تعيين كلمة مرور مؤقتة" : "غير متاح - لا يوجد حساب"}
                          disabled={!user.user_id}
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(user)}
                          title="حذف المستخدم"
                          className="text-destructive hover:text-destructive"
                          disabled={
                            user.user_id === currentUserId ||
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
  );
}
