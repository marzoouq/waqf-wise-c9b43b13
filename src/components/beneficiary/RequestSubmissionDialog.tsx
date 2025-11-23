import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useRequestTypes } from "@/hooks/useRequests";
import { Plus, FileText } from "lucide-react";

interface RequestSubmissionDialogProps {
  beneficiaryId: string;
}

export function RequestSubmissionDialog({
  beneficiaryId,
}: RequestSubmissionDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { requestTypes } = useRequestTypes();
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("");

  const selectedTypeData = requestTypes.find((rt) => rt.id === selectedType);

  const submitRequest = useMutation({
    mutationFn: async (formData: {
      request_type_id: string;
      description: string;
      amount?: number;
      priority: string;
    }) => {
      const { error } = await supabase.from("beneficiary_requests").insert({
        beneficiary_id: beneficiaryId,
        ...formData,
        submitted_at: new Date().toISOString(),
        status: "قيد المراجعة",
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      setOpen(false);
      toast({
        title: "تم الإرسال",
        description: "تم تقديم الطلب بنجاح، سيتم مراجعته قريباً",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 ml-2" />
          تقديم طلب جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            تقديم طلب جديد
          </DialogTitle>
          <DialogDescription>
            املأ النموذج أدناه لتقديم طلبك. سيتم مراجعته من قبل المختصين.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const amount = formData.get("amount");

            submitRequest.mutate({
              request_type_id: formData.get("request_type_id") as string,
              description: formData.get("description") as string,
              amount: amount ? Number(amount) : undefined,
              priority: formData.get("priority") as string,
            });
          }}
          className="space-y-4"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="request_type_id">نوع الطلب *</Label>
              <Select
                name="request_type_id"
                value={selectedType}
                onValueChange={setSelectedType}
                required
              >
                <SelectTrigger id="request_type_id">
                  <SelectValue placeholder="اختر نوع الطلب" />
                </SelectTrigger>
                <SelectContent>
                  {requestTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTypeData?.description && (
                <p className="text-xs text-muted-foreground">
                  {selectedTypeData.description}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">الأولوية *</Label>
              <Select name="priority" defaultValue="متوسطة" required>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="عاجلة">عاجلة</SelectItem>
                  <SelectItem value="مهمة">مهمة</SelectItem>
                  <SelectItem value="متوسطة">متوسطة</SelectItem>
                  <SelectItem value="منخفضة">منخفضة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedTypeData?.requires_amount && (
            <div className="space-y-2">
              <Label htmlFor="amount">المبلغ المطلوب (ريال) *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                required={selectedTypeData.requires_amount}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">تفاصيل الطلب *</Label>
            <Textarea
              id="description"
              name="description"
              rows={6}
              placeholder="اشرح طلبك بالتفصيل..."
              required
            />
            <p className="text-xs text-muted-foreground">
              يرجى تقديم أكبر قدر من التفاصيل لتسهيل معالجة طلبك
            </p>
          </div>

          {selectedTypeData?.requires_attachments && (
            <div className="rounded-md border border-dashed p-4 text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                بعد تقديم الطلب، يمكنك رفع المستندات الداعمة من صفحة الطلبات
              </p>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={submitRequest.isPending}>
              {submitRequest.isPending ? "جاري التقديم..." : "تقديم الطلب"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
