import { useState } from "react";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Send, Mail, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useBeneficiaries } from "@/hooks/useBeneficiaries";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

interface AdminSendMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminSendMessageDialog({
  open,
  onOpenChange,
}: AdminSendMessageDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { beneficiaries } = useBeneficiaries();
  const [isLoading, setIsLoading] = useState(false);
  const [isBroadcast, setIsBroadcast] = useState(false);
  const [selectedBeneficiaries, setSelectedBeneficiaries] = useState<string[]>([]);
  const [message, setMessage] = useState({
    subject: "",
    body: "",
  });

  // فلترة المستفيدين الذين لديهم صلاحية تسجيل الدخول
  const beneficiariesWithAccounts = beneficiaries.filter(b => b.can_login);

  const handleToggleBeneficiary = (beneficiaryId: string) => {
    setSelectedBeneficiaries(prev =>
      prev.includes(beneficiaryId)
        ? prev.filter(id => id !== beneficiaryId)
        : [...prev, beneficiaryId]
    );
  };

  const handleSelectAll = () => {
    if (selectedBeneficiaries.length === beneficiariesWithAccounts.length) {
      setSelectedBeneficiaries([]);
    } else {
      setSelectedBeneficiaries(beneficiariesWithAccounts.map(b => b.id));
    }
  };

  const handleSendMessage = async () => {
    if (!message.subject || !message.body) {
      toast({
        title: "خطأ",
        description: "الرجاء ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }

    const recipientBeneficiaries = isBroadcast
      ? beneficiariesWithAccounts
      : beneficiariesWithAccounts.filter(b => selectedBeneficiaries.includes(b.id));

    if (recipientBeneficiaries.length === 0) {
      toast({
        title: "خطأ",
        description: "الرجاء اختيار مستفيد واحد على الأقل",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // فلترة المستفيدين الذين لديهم user_id فقط
      const recipientsWithAccounts = recipientBeneficiaries.filter(b => b.user_id);
      
      if (recipientsWithAccounts.length === 0) {
        toast({
          title: "تنبيه",
          description: "المستفيدون المحددون لم يتم تفعيل حساباتهم بعد. يرجى تفعيل تسجيل الدخول لهم أولاً من صفحة المستفيدين.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const messages = recipientsWithAccounts.map(b => ({
        sender_id: user?.id || "",
        receiver_id: b.user_id!,
        subject: message.subject,
        body: message.body,
      }));

      const { error } = await supabase
        .from("internal_messages")
        .insert(messages);

      if (error) throw error;

      const skippedCount = recipientBeneficiaries.length - recipientsWithAccounts.length;
      
      toast({
        title: "تم الإرسال بنجاح",
        description: skippedCount > 0 
          ? `تم إرسال الرسالة إلى ${recipientsWithAccounts.length} مستفيد. تم تجاهل ${skippedCount} مستفيد لعدم تفعيل حساباتهم.`
          : `تم إرسال الرسالة إلى ${recipientsWithAccounts.length} مستفيد`,
      });

      setMessage({ subject: "", body: "" });
      setSelectedBeneficiaries([]);
      setIsBroadcast(false);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "خطأ في الإرسال",
        description: "حدث خطأ أثناء إرسال الرسائل",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="إرسال رسالة للمستفيدين"
      description="إرسال رسالة لمستفيد محدد أو رسالة جماعية"
      size="lg"
    >
      <div className="space-y-4">
        {/* خيار الرسالة الجماعية */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Checkbox
                id="broadcast"
                checked={isBroadcast}
                onCheckedChange={(checked) => {
                  setIsBroadcast(checked as boolean);
                  if (checked) {
                    setSelectedBeneficiaries([]);
                  }
                }}
              />
              <label
                htmlFor="broadcast"
                className="text-sm font-medium cursor-pointer flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                إرسال رسالة جماعية لجميع المستفيدين ({beneficiariesWithAccounts.length})
              </label>
            </div>
          </CardContent>
        </Card>

        {/* اختيار المستفيدين */}
        {!isBroadcast && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">اختيار المستفيدين</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedBeneficiaries.length === beneficiariesWithAccounts.length
                  ? "إلغاء الكل"
                  : "اختيار الكل"}
              </Button>
            </div>
            <ScrollArea className="h-[200px] border rounded-lg p-2">
              <div className="space-y-2">
                {beneficiariesWithAccounts.map((beneficiary) => (
                  <div
                    key={beneficiary.id}
                    className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-md"
                  >
                    <Checkbox
                      id={beneficiary.id}
                      checked={selectedBeneficiaries.includes(beneficiary.id)}
                      onCheckedChange={() => handleToggleBeneficiary(beneficiary.id)}
                    />
                    <label
                      htmlFor={beneficiary.id}
                      className="text-sm cursor-pointer flex-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{beneficiary.full_name}</span>
                        {!beneficiary.user_id && (
                          <Badge variant="outline" className="text-xs">
                            لم يُفعّل
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {beneficiary.beneficiary_number}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
            {selectedBeneficiaries.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                تم اختيار {selectedBeneficiaries.length} مستفيد
              </p>
            )}
          </div>
        )}

        {/* موضوع الرسالة */}
        <div>
          <label className="text-sm font-medium mb-1 block">الموضوع</label>
          <Input
            placeholder="موضوع الرسالة"
            value={message.subject}
            onChange={(e) => setMessage({ ...message, subject: e.target.value })}
          />
        </div>

        {/* محتوى الرسالة */}
        <div>
          <label className="text-sm font-medium mb-1 block">الرسالة</label>
          <Textarea
            placeholder="اكتب رسالتك هنا..."
            value={message.body}
            onChange={(e) => setMessage({ ...message, body: e.target.value })}
            rows={8}
          />
        </div>

        {/* زر الإرسال */}
        <Button
          onClick={handleSendMessage}
          className="w-full"
          disabled={isLoading}
        >
          <Send className="h-4 w-4 ml-2" />
          {isLoading ? "جاري الإرسال..." : "إرسال الرسالة"}
        </Button>
      </div>
    </ResponsiveDialog>
  );
}
