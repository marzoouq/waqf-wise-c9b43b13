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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useBeneficiaries } from "@/hooks/beneficiary/useBeneficiaries";
import { useDistributionEngine, SimulationResult } from "@/hooks/distributions/useDistributionEngine";
import { DistributionPatternSelector } from "./DistributionPatternSelector";
import { ScenarioComparison } from "../distributions/ScenarioComparison";
import { SmartRecommendations } from "../distributions/SmartRecommendations";
import { Loader2, TrendingUp } from "lucide-react";

const simulationSchema = z.object({
  availableAmount: z.coerce
    .number()
    .min(1, { message: "المبلغ المتاح يجب أن يكون أكبر من صفر" }),
  nazer_percentage: z.coerce.number().min(0).max(100).default(5),
  reserve_percentage: z.coerce.number().min(0).max(100).default(10),
  waqf_corpus_percentage: z.coerce.number().min(0).max(100).default(5),
  maintenance_percentage: z.coerce.number().min(0).max(100).default(3),
  development_percentage: z.coerce.number().min(0).max(100).default(2),
  pattern: z.enum(['shariah', 'equal', 'need_based', 'custom', 'hybrid']).default('shariah'),
});

type SimulationFormValues = z.infer<typeof simulationSchema>;

interface SimulationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SimulationDialog({ open, onOpenChange }: SimulationDialogProps) {
  const { beneficiaries, isLoading: loadingBeneficiaries } = useBeneficiaries();
  const { calculate, calculateMultipleScenarios, scenarios, isCalculating } = useDistributionEngine();
  const [activeTab, setActiveTab] = useState<'single' | 'comparison'>('single');
  const [singleResult, setSingleResult] = useState<SimulationResult | null>(null);

  const form = useForm<SimulationFormValues>({
    resolver: zodResolver(simulationSchema),
    defaultValues: {
      availableAmount: 1730000,
      nazer_percentage: 5,
      reserve_percentage: 10,
      waqf_corpus_percentage: 5,
      maintenance_percentage: 3,
      development_percentage: 2,
      pattern: 'shariah',
    },
  });

  const handleSimulate = async (data: SimulationFormValues) => {
    const activeBeneficiaries = beneficiaries.filter(b => b.status === 'نشط');
    
    if (activeBeneficiaries.length === 0) {
      return;
    }

    const result = await calculate({
      total_amount: data.availableAmount,
      beneficiaries: activeBeneficiaries,
      deductions: {
        nazer_percentage: data.nazer_percentage / 100,
        reserve_percentage: data.reserve_percentage / 100,
        waqf_corpus_percentage: data.waqf_corpus_percentage / 100,
        maintenance_percentage: data.maintenance_percentage / 100,
        development_percentage: data.development_percentage / 100,
      },
      pattern: data.pattern,
    });

    if (result) {
      setSingleResult(result);
    }
  };

  const handleCompareScenarios = async () => {
    const activeBeneficiaries = beneficiaries.filter(b => b.status === 'نشط');
    
    if (activeBeneficiaries.length === 0) {
      return;
    }

    const baseParams = {
      total_amount: form.getValues('availableAmount'),
      beneficiaries: activeBeneficiaries,
      deductions: {
        nazer_percentage: form.getValues('nazer_percentage') / 100,
        reserve_percentage: form.getValues('reserve_percentage') / 100,
        waqf_corpus_percentage: form.getValues('waqf_corpus_percentage') / 100,
        maintenance_percentage: form.getValues('maintenance_percentage') / 100,
        development_percentage: form.getValues('development_percentage') / 100,
      },
    };

    await calculateMultipleScenarios(baseParams, ['shariah', 'equal', 'need_based', 'hybrid']);
    setActiveTab('comparison');
  };

  const activeBeneficiariesCount = beneficiaries.filter(b => b.status === 'نشط').length;

  return (
    <ResponsiveDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title="محاكاة التوزيع الذكية"
      description="محاكاة توزيع متقدمة باستخدام 5 أنماط مختلفة"
      size="xl"
    >
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'single' | 'comparison')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single">محاكاة واحدة</TabsTrigger>
          <TabsTrigger value="comparison">مقارنة السيناريوهات</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSimulate)} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">معلومات التوزيع</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="availableAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المبلغ المتاح (ر.س) *</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="nazer_percentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نسبة الناظر (%)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" max="100" step="0.1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reserve_percentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نسبة الاحتياطي (%)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" max="100" step="0.1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="waqf_corpus_percentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نسبة رأس المال (%)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" max="100" step="0.1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maintenance_percentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نسبة الصيانة (%)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" max="100" step="0.1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="development_percentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نسبة التطوير (%)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" max="100" step="0.1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="pattern"
                    render={({ field }) => (
                      <FormItem>
                        <DistributionPatternSelector
                          value={field.value}
                          onChange={field.onChange}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button type="submit" disabled={isCalculating || loadingBeneficiaries} className="flex-1">
                  {isCalculating && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                  تشغيل المحاكاة
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCompareScenarios}
                  disabled={isCalculating || loadingBeneficiaries}
                >
                  <TrendingUp className="ms-2 h-4 w-4" />
                  مقارنة الأنماط
                </Button>
              </div>
            </form>
          </Form>

          {singleResult && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">نتائج المحاكاة</CardTitle>
                    <Badge>{singleResult.summary.pattern_used}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">إجمالي المبلغ</p>
                      <p className="text-lg font-bold">
                        {singleResult.summary.total_amount.toLocaleString()} ر.س
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">الموزع فعلياً</p>
                      <p className="text-lg font-bold text-emerald-600">
                        {singleResult.summary.total_distributed.toLocaleString()} ر.س
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">عدد المستفيدين</p>
                      <p className="text-lg font-bold">
                        {singleResult.summary.beneficiaries_count}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">الاستقطاعات</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>الناظر:</span>
                        <span className="font-medium">{singleResult.summary.deductions.nazer_share.toLocaleString()} ر.س</span>
                      </div>
                      <div className="flex justify-between">
                        <span>الاحتياطي:</span>
                        <span className="font-medium">{singleResult.summary.deductions.reserve.toLocaleString()} ر.س</span>
                      </div>
                      <div className="flex justify-between">
                        <span>رأس المال:</span>
                        <span className="font-medium">{singleResult.summary.deductions.waqf_corpus.toLocaleString()} ر.س</span>
                      </div>
                      <div className="flex justify-between">
                        <span>الصيانة:</span>
                        <span className="font-medium">{singleResult.summary.deductions.maintenance.toLocaleString()} ر.س</span>
                      </div>
                      <div className="flex justify-between">
                        <span>التطوير:</span>
                        <span className="font-medium">{singleResult.summary.deductions.development.toLocaleString()} ر.س</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          {scenarios.length > 0 ? (
            <>
              <SmartRecommendations 
                scenarios={scenarios} 
                onSelectScenario={(pattern) => {
                  form.setValue('pattern', pattern as 'shariah' | 'equal' | 'need_based' | 'custom' | 'hybrid');
                  setActiveTab('single');
                }}
              />
              <ScenarioComparison scenarios={scenarios} />
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-48">
                <p className="text-muted-foreground">
                  اضغط "مقارنة الأنماط" لحساب السيناريوهات المختلفة
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {loadingBeneficiaries && (
        <div className="text-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p className="text-sm">جاري تحميل المستفيدين...</p>
        </div>
      )}
    </ResponsiveDialog>
  );
}
