/**
 * Export Users Utility
 * تصدير المستخدمين إلى CSV
 * @version 2.9.11
 */

import { format, arLocale as ar } from "@/lib/date";
import { ROLE_LABELS, type AppRole } from "@/types/roles";
import type { UserProfile } from "@/types/auth";

interface ExportUsersOptions {
  users: UserProfile[];
  filename?: string;
}

/**
 * تصدير المستخدمين إلى ملف CSV
 */
export function exportUsersToCSV({ users, filename }: ExportUsersOptions): void {
  const csvHeaders = [
    "الاسم",
    "البريد الإلكتروني",
    "الهاتف",
    "المنصب",
    "الأدوار",
    "الحالة",
    "تاريخ الإنشاء",
  ];

  const csvData = users.map((user) => [
    user.full_name || "-",
    user.email,
    user.phone || "-",
    user.position || "-",
    user.user_roles?.map((r) => ROLE_LABELS[r.role as AppRole]).join(", ") || "-",
    user.is_active ? "نشط" : "غير نشط",
    format(new Date(user.created_at), "dd/MM/yyyy", { locale: ar }),
  ]);

  const csv = [csvHeaders, ...csvData].map((row) => row.join(",")).join("\n");
  
  // إضافة BOM للدعم الصحيح للغة العربية
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename || `users_${format(new Date(), "yyyy-MM-dd")}.csv`;
  link.click();
  
  // تنظيف
  URL.revokeObjectURL(link.href);
}

/**
 * تصدير المستخدمين إلى JSON
 */
export function exportUsersToJSON({ users, filename }: ExportUsersOptions): void {
  const jsonData = users.map((user) => ({
    name: user.full_name,
    email: user.email,
    phone: user.phone,
    position: user.position,
    roles: user.user_roles?.map((r) => r.role) || [],
    isActive: user.is_active,
    createdAt: user.created_at,
  }));

  const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
    type: "application/json;charset=utf-8;",
  });
  
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename || `users_${format(new Date(), "yyyy-MM-dd")}.json`;
  link.click();
  
  URL.revokeObjectURL(link.href);
}
