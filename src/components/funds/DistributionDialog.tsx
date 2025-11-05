import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const distributionSchema = z.object({
  month: z.string().min(1, { message: "الشهر الهجري مطلوب" }),
  totalAmount: z.coerce
    .number()
    .min(1, { message: "المبلغ الإجمالي يجب أن يكون أكبر من صفر" }),
  beneficiaries: z.coerce
    .number()
    .min(1, { message: "عدد المستفيدين يجب أن يكون 1 على الأقل" }),
  notes: z.string().optional(),
});

type DistributionFormValues = z.infer<typeof distributionSchema>;

interface DistributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDistribute: (data: DistributionFormValues) => void;
}

export function DistributionDialog({
  open,
  onOpenChange,
  onDistribute,
}: DistributionDialogProps) {
  const { toast } = useToast();

  const form = useForm<DistributionFormValues>({
    resolver: zodResolver(distributionSchema),
    defaultValues: {
      month: "",
      totalAmount: 0,
      beneficiaries: 0,
      notes: "",
    },
  });

  const hijriMonths = [
    "محرم",
    "صفر",
    "ربيع الأول",
    "ربيع الثاني",
    "جمادى الأولى",
    "جمادى الآخرة",
    "رجب",
    "شعبان",
    "رمضان",
    "شوال",
    "ذو القعدة",
    "ذو الحجة",
  ];

  const handleSubmit = (data: DistributionFormValues) => {
    onDistribute(data);
    toast({
      title: "تم إنشاء التوزيع بنجاح",
      description: `تم إنشاء توزيع ${data.month} بمبلغ ${data.totalAmount.toLocaleString()} ر.س`,
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>إنشاء توزيع جديد</DialogTitle>
          <DialogDescription>
            قم بإدخال بيانات التوزيع الشهري للمستفيدين
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الشهر الهجري *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الشهر" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {hijriMonths.map((month) => (
                        <SelectItem key={month} value={month}>
                          {month} 1446
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="totalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المبلغ الإجمالي (ر.س) *</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="beneficiaries"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عدد المستفيدين *</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="أضف ملاحظات حول التوزيع (اختياري)"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                إلغاء
              </Button>
              <Button type="submit">إنشاء التوزيع</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
