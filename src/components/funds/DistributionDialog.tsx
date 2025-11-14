import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { DialogFooter } from "@/components/ui/dialog";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Calculator } from "lucide-react";
import { useDistributions } from "@/hooks/useDistributions";

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
  const { simulateDistribution } = useDistributions();
  const [showSimulation, setShowSimulation] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);

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

  const handleSimulate = async () => {
    const values = form.getValues();
    if (values.totalAmount > 0 && values.beneficiaries > 0) {
      const result = await simulateDistribution(values.totalAmount, values.beneficiaries);
      setSimulationResult(result);
      setShowSimulation(true);
    }
  };

  const handleSubmit = (data: DistributionFormValues) => {
    onDistribute(data);
    toast({
      title: "تم إنشاء التوزيع بنجاح",
      description: `تم إنشاء توزيع ${data.month} بمبلغ ${data.totalAmount.toLocaleString()} ر.س`,
    });
    form.reset();
    setShowSimulation(false);
    setSimulationResult(null);
    onOpenChange(false);
  };

  return (
    <ResponsiveDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title="إنشاء توزيع جديد"
      description="قم بإدخال بيانات التوزيع الشهري للمستفيدين"
      size="md"
    >
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

            {/* محاكاة التوزيع */}
            {showSimulation && simulationResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    معاينة التوزيع
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">المبلغ الإجمالي:</span>
                        <p className="font-semibold">{simulationResult.totalAmount.toLocaleString()} ر.س</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">نصيب كل مستفيد:</span>
                        <p className="font-semibold">{simulationResult.perBeneficiary.toFixed(2)} ر.س</p>
                      </div>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>المستفيد</TableHead>
                          <TableHead className="text-left">المبلغ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {simulationResult.distribution.map((item: any) => (
                          <TableRow key={item.beneficiaryNumber}>
                            <TableCell>مستفيد {item.beneficiaryNumber}</TableCell>
                            <TableCell className="text-left">{item.amount.toFixed(2)} ر.س</TableCell>
                          </TableRow>
                        ))}
                        {simulationResult.beneficiariesCount > 10 && (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center text-muted-foreground">
                              ... وعدد {simulationResult.beneficiariesCount - 10} مستفيد آخرين
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                إلغاء
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleSimulate}
              >
                <Calculator className="h-4 w-4 ml-2" />
                محاكاة التوزيع
              </Button>
              <Button type="submit">إنشاء التوزيع</Button>
            </DialogFooter>
          </form>
        </Form>
    </ResponsiveDialog>
  );
}
