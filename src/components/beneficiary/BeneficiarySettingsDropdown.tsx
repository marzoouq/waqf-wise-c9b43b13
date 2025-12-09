import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Settings,
  User,
  Mail,
  Phone,
  Lock,
  Bell,
  Shield,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";
import { useTheme } from "next-themes";
import { AuthService } from "@/services";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { EditEmailDialog } from "./EditEmailDialog";
import { EditPhoneDialog } from "./EditPhoneDialog";
import { NotificationPreferences } from "./NotificationPreferences";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Beneficiary } from "@/types/beneficiary";
import { NotificationPreferences as NotificationPreferencesType } from "@/types/notifications";

interface BeneficiarySettingsDropdownProps {
  beneficiary: Beneficiary;
  onChangePassword: () => void;
}

export function BeneficiarySettingsDropdown({
  beneficiary,
  onChangePassword,
}: BeneficiarySettingsDropdownProps) {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [editEmailOpen, setEditEmailOpen] = useState(false);
  const [editPhoneOpen, setEditPhoneOpen] = useState(false);
  const [notificationSettingsOpen, setNotificationSettingsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      toast({
        title: "تم تسجيل الخروج",
        description: "نراك قريباً",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تسجيل الخروج",
        variant: "destructive",
      });
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            الإعدادات
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-background">
          <DropdownMenuLabel>حسابي</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setEditEmailOpen(true)}>
            <Mail className="ml-2 h-4 w-4" />
            تعديل الإيميل
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEditPhoneOpen(true)}>
            <Phone className="ml-2 h-4 w-4" />
            تعديل رقم الهاتف
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onChangePassword}>
            <Lock className="ml-2 h-4 w-4" />
            تغيير كلمة المرور
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuLabel>الإعدادات</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setNotificationSettingsOpen(true)}>
            <Bell className="ml-2 h-4 w-4" />
            إعدادات الإشعارات
          </DropdownMenuItem>
          <DropdownMenuItem onClick={toggleTheme}>
            {theme === "dark" ? (
              <Sun className="ml-2 h-4 w-4" />
            ) : (
              <Moon className="ml-2 h-4 w-4" />
            )}
            {theme === "dark" ? "الوضع النهاري" : "الوضع الليلي"}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleLogout} className="text-destructive">
            <LogOut className="ml-2 h-4 w-4" />
            تسجيل الخروج
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialogs */}
      <EditEmailDialog
        open={editEmailOpen}
        onOpenChange={setEditEmailOpen}
        beneficiaryId={beneficiary.id}
        currentEmail={beneficiary.email || ""}
      />
      <EditPhoneDialog
        open={editPhoneOpen}
        onOpenChange={setEditPhoneOpen}
        beneficiaryId={beneficiary.id}
        currentPhone={beneficiary.phone}
      />
      <Dialog open={notificationSettingsOpen} onOpenChange={setNotificationSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إعدادات الإشعارات</DialogTitle>
          </DialogHeader>
          <NotificationPreferences
            beneficiaryId={beneficiary.id}
            currentPreferences={(beneficiary.notification_preferences as NotificationPreferencesType | null) || undefined}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
