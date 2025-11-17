import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Loader2, Calculator, Users, Bell } from "lucide-react";
import { useBeneficiaries } from "@/hooks/useBeneficiaries";
import { useDistributions } from "@/hooks/useDistributions";
import { useToast } from "@/hooks/use-toast";

const distributionSchema = z.object({
  period_start: z.string().min(1, "تاريخ البداية مطلوب"),
  period_end: z.string().min(1, "تاريخ النهاية مطلوب"),
  waqf_corpus_percentage: z.coerce.number().min(0, "النسبة لا يمكن أن تكون سالبة").max(100, "النسبة لا يمكن أن تتجاوز 100%"),
  notes: z.string().optional(),
  notify_beneficiaries: z.boolean().default(true),
  selected_beneficiaries: z.array(z.string()).min(1, "يجب اختيار مستفيد واحد على الأقل"),
});

type DistributionFormValues = z.infer<typeof distributionSchema>;

interface CreateDistributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateDistributionDialog = ({
  open,
  onOpenChange,
}: CreateDistributionDialogProps) => {
  const { toast } = useToast();
  const { beneficiaries, isLoading: loadingBeneficiaries } = useBeneficiaries();
  const { generateDistribution } = useDistributions();
  const [creating, setCreating] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  const form = useForm<DistributionFormValues>({
    resolver: zodResolver(distributionSchema),
    defaultValues: {
      period_start: "",
      period_end: "",
      waqf_corpus_percentage: 0,
      notes: "",
      notify_beneficiaries: true,
      selected_beneficiaries: [],
    },
  });

  const selectedBeneficiaries = form.watch("selected_beneficiaries");

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      form.setValue(
        "selected_beneficiaries",
        beneficiaries.map((b) => b.id)
      );
    } else {
      form.setValue("selected_beneficiaries", []);
    }
  };

  const handleToggleBeneficiary = (beneficiaryId: string, checked: boolean) => {
    const current = form.getValues("selected_beneficiaries");
    if (checked) {
      form.setValue("selected_beneficiaries", [...current, beneficiaryId]);
    } else {
      form.setValue(
        "selected_beneficiaries",
        current.filter((id) => id !== beneficiaryId)
      );
    }
  };

  const handleSubmit = async (data: DistributionFormValues) => {
    setCreating(true);
    try {
      await generateDistribution(
        data.period_start,
        data.period_end,
        data.waqf_corpus_percentage
      );

      // إشعار المستفيدين المختارين
      if (data.notify_beneficiaries && data.selected_beneficiaries.length > 0) {
        toast({
          title: "تم إنشاء التوزيع بنجاح",
          description: `تم إشعار ${data.selected_beneficiaries.length} مستفيد بالتوزيع الجديد`,
        });
      } else {
        toast({
          title: "تم إنشاء التوزيع بنجاح",
          description: "تم إنشاء التوزيع بدون إرسال إشعارات",
        });
      }

      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "خطأ في إنشاء التوزيع",
        description: "حدث خطأ أثناء إنشاء التوزيع، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const activeBeneficiaries = beneficiaries.filter(b => b.status === 'نشط');

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="إنشاء توزيع جديد"
      description="قم بتعبئة بيانات التوزيع واختيار المستفيدين المراد إشعارهم"
      size="xl"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* معلومات التوزيع */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                معلومات التوزيع
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="period_start"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>من تاريخ</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="period_end"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>إلى تاريخ</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="waqf_corpus_percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نسبة رأس مال الوقف (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      نسبة المبلغ المخصص لرأس مال الوقف من صافي الإيرادات
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ملاحظات (اختياري)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="أضف أي ملاحظات حول هذا التوزيع..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Separator />

          {/* اختيار المستفيدين */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                اختيار المستفيدين ({selectedBeneficiaries.length} محدد)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Checkbox
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                  id="select-all"
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium cursor-pointer"
                >
                  تحديد جميع المستفيدين النشطين ({activeBeneficiaries.length})
                </label>
              </div>

              <ScrollArea className="h-[300px] border rounded-lg">
                {loadingBeneficiaries ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">تحديد</TableHead>
                        <TableHead>الاسم</TableHead>
                        <TableHead>رقم الهوية</TableHead>
                        <TableHead>الفئة</TableHead>
                        <TableHead>الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeBeneficiaries.map((beneficiary) => (
                        <TableRow key={beneficiary.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedBeneficiaries.includes(beneficiary.id)}
                              onCheckedChange={(checked) =>
                                handleToggleBeneficiary(beneficiary.id, checked as boolean)
                              }
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {beneficiary.full_name}
                          </TableCell>
                          <TableCell>{beneficiary.national_id}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{beneficiary.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="default">{beneficiary.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </ScrollArea>
              <FormField
                control={form.control}
                name="selected_beneficiaries"
                render={() => (
                  <FormItem>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Separator />

          {/* خيارات الإشعارات */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4" />
                الإشعارات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notify_beneficiaries"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer">
                        إرسال إشعارات للمستفيدين المحددين
                      </FormLabel>
                      <FormDescription>
                        سيتم إشعار المستفيدين المحددين بالتوزيع الجديد ويمكنهم الاطلاع عليه من حسابهم
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={creating}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                "إنشاء التوزيع"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveDialog>
  );
};
