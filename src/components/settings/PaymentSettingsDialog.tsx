import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useToast } from "@/hooks/ui/use-toast";

interface PaymentSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PaymentSettingsDialog = ({ open, onOpenChange }: PaymentSettingsDialogProps) => {
  const { toast } = useToast();
  const [daysThreshold, setDaysThreshold] = useState(
    localStorage.getItem('paymentDaysThreshold') || '90'
  );

  const handleSave = () => {
    localStorage.setItem('paymentDaysThreshold', daysThreshold);
    toast({
      title: "تم الحفظ",
      description: "تم تحديث إعدادات عرض الدفعات بنجاح",
    });
    onOpenChange(false);
    window.location.reload(); // Reload to apply changes
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            إعدادات عرض الدفعات
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <Label className="text-base font-semibold">
              عرض الدفعات قبل موعد الاستحقاق بـ:
            </Label>
            <RadioGroup value={daysThreshold} onValueChange={setDaysThreshold}>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="30" id="30days" />
                <Label htmlFor="30days" className="cursor-pointer font-normal">
                  30 يوم (شهر واحد)
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="60" id="60days" />
                <Label htmlFor="60days" className="cursor-pointer font-normal">
                  60 يوم (شهرين)
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="90" id="90days" />
                <Label htmlFor="90days" className="cursor-pointer font-normal">
                  90 يوم (3 أشهر) - موصى به
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="120" id="120days" />
                <Label htmlFor="120days" className="cursor-pointer font-normal">
                  120 يوم (4 أشهر)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">📌 ملاحظة:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>سيتم إخفاء الدفعات البعيدة تلقائياً</li>
              <li>الدفعات المدفوعة والمتأخرة تظهر دائماً</li>
              <li>يمكنك عرض جميع الدفعات باستخدام زر "عرض الدفعات البعيدة"</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={handleSave}>
            حفظ التغييرات
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
