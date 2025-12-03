import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Loader2 } from "lucide-react";

interface EditUserEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    user_id: string;
    full_name: string;
    email: string;
  } | null;
  onSuccess?: () => void;
}

export function EditUserEmailDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: EditUserEmailDialogProps) {
  const { toast } = useToast();
  const [newEmail, setNewEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user?.user_id || !newEmail) return;

    // التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال بريد إلكتروني صحيح",
        variant: "destructive",
      });
      return;
    }

    if (newEmail === user.email) {
      toast({
        title: "تنبيه",
        description: "البريد الإلكتروني الجديد مطابق للبريد الحالي",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // استدعاء Edge Function لتحديث البريد
      const { data, error } = await supabase.functions.invoke("update-user-email", {
        body: {
          userId: user.user_id,
          newEmail: newEmail.trim().toLowerCase(),
        },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "تم بنجاح",
        description: `تم تحديث البريد الإلكتروني إلى ${newEmail}`,
      });

      setNewEmail("");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error updating email:", error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تحديث البريد الإلكتروني",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setNewEmail("");
    }
    onOpenChange(newOpen);
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="تعديل البريد الإلكتروني"
      description={`تغيير البريد الإلكتروني للمستخدم: ${user?.full_name || ""}`}
      size="sm"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>البريد الإلكتروني الحالي</Label>
          <Input value={user?.email || ""} disabled className="bg-muted" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="newEmail">البريد الإلكتروني الجديد</Label>
          <div className="relative">
            <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="newEmail"
              type="email"
              placeholder="أدخل البريد الإلكتروني الجديد"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="pr-10"
              dir="ltr"
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            إلغاء
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!newEmail || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                جاري التحديث...
              </>
            ) : (
              "حفظ التغييرات"
            )}
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  );
}
