/**
 * AddRoleDialog Component
 * حوار إضافة دور جديد - مستخرج من RolesManagement
 * @version 2.9.13
 */

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_LABELS, ROLE_COLORS, type AppRole } from "@/types/roles";
import type { UserWithRoles } from "@/hooks/users/useRolesManagement";

interface AddRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: UserWithRoles | null;
  newRole: AppRole;
  onNewRoleChange: (role: AppRole) => void;
  onAddRole: () => void;
  onRemoveRole: (userId: string, role: string) => void;
  isAddingRole: boolean;
}

export function AddRoleDialog({
  open,
  onOpenChange,
  selectedUser,
  newRole,
  onNewRoleChange,
  onAddRole,
  onRemoveRole,
  isAddingRole,
}: AddRoleDialogProps) {
  return (
    <ResponsiveDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title="إضافة دور جديد"
    >
      <div className="space-y-4 py-4">
        <div>
          <Label>المستخدم</Label>
          <div className="mt-2 p-3 bg-muted rounded-md">
            <p className="font-medium">{selectedUser?.full_name}</p>
            <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
          </div>
        </div>
        <div>
          <Label>الأدوار الحالية</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedUser?.roles_array && selectedUser.roles_array.length > 0 ? (
              selectedUser.roles_array.map((role) => (
                <Badge key={role} className={ROLE_COLORS[role as AppRole]} variant="outline">
                  {ROLE_LABELS[role as AppRole]}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-5 w-5 p-0 mr-2 hover:bg-transparent"
                    onClick={() => onRemoveRole(selectedUser.id, role)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">لا توجد أدوار حالية</span>
            )}
          </div>
        </div>
        <div>
          <Label>إضافة دور جديد</Label>
          <Select value={newRole} onValueChange={(v) => onNewRoleChange(v as AppRole)}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ROLE_LABELS)
                .filter(([role]) => !selectedUser?.roles_array?.includes(role as AppRole))
                .map(([role, label]) => (
                  <SelectItem key={role} value={role}>
                    {label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter className="flex-col sm:flex-row gap-2">
        <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
          إلغاء
        </Button>
        <Button onClick={onAddRole} disabled={isAddingRole} className="w-full sm:w-auto">
          إضافة
        </Button>
      </DialogFooter>
    </ResponsiveDialog>
  );
}
