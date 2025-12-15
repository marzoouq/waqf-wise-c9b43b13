import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useUserRole } from "@/hooks/useUserRole";
import { Shield, ArrowLeft, CheckCircle2 } from "lucide-react";
import { ROLE_LABELS, ROLE_COLORS, type AllRole } from "@/types/roles";

interface RolesSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ROLE_PERMISSIONS = {
  admin: [
    "إدارة جميع المستخدمين",
    "إدارة الأدوار والصلاحيات",
    "إعدادات النظام",
    "النسخ الاحتياطي",
  ],
  nazer: [
    "الموافقة على التوزيعات",
    "الموافقة على القروض",
    "عرض التقارير المالية",
    "إدارة الوقف",
  ],
  accountant: [
    "إدارة القيود المحاسبية",
    "إعداد التقارير المالية",
    "إدارة الميزانية",
    "التسوية البنكية",
  ],
  cashier: [
    "تنفيذ المدفوعات",
    "إصدار السندات",
    "إدارة الصندوق",
  ],
  archivist: [
    "إدارة الأرشيف",
    "رفع المستندات",
    "تصنيف الوثائق",
  ],
  beneficiary: [
    "عرض الحساب الشخصي",
    "تقديم الطلبات",
    "رفع المستندات",
  ],
  user: [
    "الوصول الأساسي للنظام",
  ],
};

export function RolesSettingsDialog({
  open,
  onOpenChange,
}: RolesSettingsDialogProps) {
  const navigate = useNavigate();
  const { roles, isAdmin, isNazer } = useUserRole();

  const handleManageRoles = () => {
    onOpenChange(false);
    navigate("/settings/roles");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            الأدوار والصلاحيات
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* الأدوار الحالية */}
          <Card className="p-4 bg-primary/5">
            <h3 className="font-semibold mb-3">أدوارك الحالية</h3>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => (
                  <Badge
                    key={role}
                    className={ROLE_COLORS[role as AllRole]}
                  >
                    {ROLE_LABELS[role as AllRole]}
                </Badge>
              ))}
            </div>
          </Card>

          {/* الصلاحيات */}
          <div className="space-y-4">
            <h3 className="font-semibold">الصلاحيات المتاحة لك</h3>
            {roles.map((role) => {
              const permissions =
                ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];
              return (
                <Card key={role} className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge
                      className={ROLE_COLORS[role as AllRole]}
                    >
                      {ROLE_LABELS[role as AllRole]}
                    </Badge>
                  </div>
                  <ul className="space-y-2">
                    {permissions.map((permission) => (
                      <li key={permission} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span>{permission}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>

          {/* إدارة الأدوار */}
          {(isAdmin || isNazer) && (
            <Button
              onClick={handleManageRoles}
              className="w-full"
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4 ms-2" />
              إدارة أدوار المستخدمين
            </Button>
          )}

          {/* ملاحظة أمنية */}
          <Card className="p-4 bg-warning/5 border-warning/20">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-warning">تنبيه:</span> لتغيير
              أدوارك، يرجى التواصل مع المشرف أو الناظر.
            </p>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
