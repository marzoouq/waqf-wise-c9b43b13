/**
 * EditRolesDialog Component
 * حوار تعديل أدوار المستخدم
 */

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { ROLE_LABELS, ROLE_COLORS, SYSTEM_ROLES, type AppRole } from "@/lib/role-labels";
import type { UserProfile } from "@/hooks/useUsersManagement";

const EDITABLE_ROLES: AppRole[] = SYSTEM_ROLES.filter(r => r !== 'waqf_heir') as AppRole[];

interface EditRolesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile | null;
  selectedRoles: AppRole[];
  onToggleRole: (role: AppRole) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function EditRolesDialog({
  open,
  onOpenChange,
  user,
  selectedRoles,
  onToggleRole,
  onSave,
  isSaving,
}: EditRolesDialogProps) {
  return (
    <ResponsiveDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title="تعديل الأدوار"
      description={`تحديد أدوار المستخدم: ${user?.full_name}`}
      size="md"
    >
      <div className="space-y-4">
        {EDITABLE_ROLES.map((role) => (
          <div
            key={role}
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={() => onToggleRole(role)}
          >
            <div className="flex items-center gap-3">
              <Switch
                checked={selectedRoles.includes(role)}
                onCheckedChange={() => onToggleRole(role)}
              />
              <Label className="cursor-pointer">{ROLE_LABELS[role as keyof typeof ROLE_LABELS]}</Label>
            </div>
            <Badge variant="outline" className={ROLE_COLORS[role]}>
              {role}
            </Badge>
          </div>
        ))}
      </div>

      <div className="flex gap-2 justify-end mt-4">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          إلغاء
        </Button>
        <Button
          onClick={onSave}
          disabled={selectedRoles.length === 0 || !user?.user_id || isSaving}
        >
          {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
        </Button>
      </div>
    </ResponsiveDialog>
  );
}
