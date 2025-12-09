import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ResponsiveDialog, DialogFooter } from "@/components/shared/ResponsiveDialog";
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
import { Eye, Calculator, Loader2 } from "lucide-react";
import { EdgeFunctionService } from "@/services";
import { productionLogger } from "@/lib/logger/production-logger";

interface SimulationResult {
  success: boolean;
  summary: {
    total_revenues: number;
    deductions: {
      nazer_share: number;
      reserve: number;
      waqf_corpus: number;
      maintenance: number;
      development: number;
      total: number;
    };
    distributable_amount: number;
    beneficiaries_count: number;
    total_distributed: number;
  };
  details: Array<{
    beneficiary_id: string;
    beneficiary_name: string;
    beneficiary_number: string;
    priority_level: number;
    category: string;
    allocated_amount: number;
    iban: string | null;
    bank_name: string | null;
  }>;
  metadata?: {
    simulation_date: string;
    priority_levels: number[];
    loan_deductions_count: number;
  };
}

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
  const [showSimulation, setShowSimulation] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

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
    
    if (values.totalAmount <= 0) {
      toast({
        title: "خطأ",
        description: "المبلغ الإجمالي يجب أن يكون أكبر من صفر",
        variant: "destructive",
      });
      return;
    }

    setIsSimulating(true);

    try {
      productionLogger.info('Starting distribution simulation', {
        totalAmount: values.totalAmount,
        month: values.month,
      });

      const result = await EdgeFunctionService.invokeSimulateDistribution({
        totalAmount: values.totalAmount,
      });

      if (!result.success) {
        throw new Error(result.error || 'فشلت عملية المحاكاة');
      }

      const data = result.data;
      if (!data || !data.success) {
        throw new Error(data?.error || 'فشلت عملية المحاكاة');
      }

      setSimulationResult(data);
      setShowSimulation(true);

      productionLogger.success('Distribution simulation completed', {
        beneficiaries: data.summary.beneficiaries_count,
        distributed: data.summary.total_distributed,
      });

      toast({
        title: "تمت المحاكاة بنجاح",
        description: `سيتم توزيع ${data.summary.total_distributed.toLocaleString()} ر.س على ${data.summary.beneficiaries_count} مستفيد`,
      });
    } catch (error) {
      productionLogger.error('Distribution simulation failed', error);
      toast({
        title: "خطأ في المحاكاة",
        description: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
        variant: "destructive",
      });
    } finally {
      setIsSimulating(false);
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

          {/* محاكاة التوزيع المتقدمة */}
          {showSimulation && simulationResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  معاينة التوزيع المتقدمة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* الملخص المالي */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-muted rounded-lg">
                    <span className="text-muted-foreground block mb-1">الإيرادات الإجمالية</span>
                    <p className="font-bold text-lg">{simulationResult.summary.total_revenues.toLocaleString()} ر.س</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <span className="text-muted-foreground block mb-1">إجمالي الاستقطاعات</span>
                    <p className="font-bold text-lg text-orange-600">
                      {simulationResult.summary.deductions.total.toLocaleString()} ر.س
                    </p>
                  </div>
                </div>

                {/* تفاصيل الاستقطاعات */}
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">تفاصيل الاستقطاعات:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">نصيب الناظر (5%):</span>
                      <span>{simulationResult.summary.deductions.nazer_share.toLocaleString()} ر.س</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">احتياطي (10%):</span>
                      <span>{simulationResult.summary.deductions.reserve.toLocaleString()} ر.س</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">أصل الوقف (5%):</span>
                      <span>{simulationResult.summary.deductions.waqf_corpus.toLocaleString()} ر.س</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">صيانة (3%):</span>
                      <span>{simulationResult.summary.deductions.maintenance.toLocaleString()} ر.س</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">تطوير (2%):</span>
                      <span>{simulationResult.summary.deductions.development.toLocaleString()} ر.س</span>
                    </div>
                  </div>
                </div>

                {/* المبلغ القابل للتوزيع */}
                <div className="p-4 bg-primary/10 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">المبلغ القابل للتوزيع:</span>
                    <span className="text-2xl font-bold text-primary">
                      {simulationResult.summary.distributable_amount.toLocaleString()} ر.س
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <span className="text-muted-foreground">عدد المستفيدين:</span>
                    <span className="font-semibold">{simulationResult.summary.beneficiaries_count} مستفيد</span>
                  </div>
                </div>

                {/* جدول التوزيع */}
                <div>
                  <p className="font-semibold mb-2 text-sm">تفاصيل التوزيع (أول 10 مستفيدين):</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>المستفيد</TableHead>
                        <TableHead>الفئة</TableHead>
                        <TableHead>الأولوية</TableHead>
                        <TableHead className="text-left">المبلغ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {simulationResult.details.slice(0, 10).map((detail) => (
                        <TableRow key={detail.beneficiary_id}>
                          <TableCell className="font-medium">{detail.beneficiary_name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{detail.category}</TableCell>
                          <TableCell className="text-sm">{detail.priority_level}</TableCell>
                          <TableCell className="text-left font-semibold">
                            {detail.allocated_amount.toLocaleString()} ر.س
                          </TableCell>
                        </TableRow>
                      ))}
                      {simulationResult.summary.beneficiaries_count > 10 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            ... وعدد {simulationResult.summary.beneficiaries_count - 10} مستفيد آخرين
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
              disabled={isSimulating}
            >
              {isSimulating ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري المحاكاة...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 ml-2" />
                  محاكاة التوزيع
                </>
              )}
            </Button>
            <Button type="submit">إنشاء التوزيع</Button>
          </DialogFooter>
        </form>
      </Form>
    </ResponsiveDialog>
  );
}
