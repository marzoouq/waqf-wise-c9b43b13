/**
 * UsersTableWithContext Component
 * جدول عرض المستخدمين - يستخدم Context مباشرة بدون Props Drilling
 * @version 2.9.13
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { UsersTableRowWithContext } from "./UsersTableRowWithContext";
import { useUsersContext } from "@/contexts/UsersContext";
import { useUsersDialogsContext } from "@/contexts/UsersDialogsContext";

/**
 * UsersTableWithContext - نسخة محسنة تستخدم Context مباشرة
 * - بدون Props Drilling (0 props بدلاً من 9)
 * - أداء أفضل (تقليل إعادة الرسم)
 * - صيانة أسهل
 */
export function UsersTableWithContext() {
  const { filteredUsers } = useUsersContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          المستخدمون ({filteredUsers.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filteredUsers.length === 0 ? (
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
                {filteredUsers.map((user) => (
                  <UsersTableRowWithContext
                    key={user.id}
                    user={user}
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
