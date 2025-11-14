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
import { Progress } from "@/components/ui/progress";

const simulationSchema = z.object({
  availableAmount: z.coerce
    .number()
    .min(1, { message: "المبلغ المتاح يجب أن يكون أكبر من صفر" }),
  beneficiaries: z.coerce
    .number()
    .min(1, { message: "عدد المستفيدين يجب أن يكون 1 على الأقل" }),
  maintenanceFund: z.coerce
    .number()
    .min(0, { message: "نسبة صندوق الصيانة لا يمكن أن تكون سالبة" })
    .max(100, { message: "نسبة صندوق الصيانة لا يمكن أن تتجاوز 100%" }),
  reserveFund: z.coerce
    .number()
    .min(0, { message: "نسبة الاحتياطي لا يمكن أن تكون سالبة" })
    .max(100, { message: "نسبة الاحتياطي لا يمكن أن تتجاوز 100%" }),
});

type SimulationFormValues = z.infer<typeof simulationSchema>;

interface SimulationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SimulationDialog({ open, onOpenChange }: SimulationDialogProps) {
  const [results, setResults] = useState<any>(null);

  const form = useForm<SimulationFormValues>({
    resolver: zodResolver(simulationSchema),
    defaultValues: {
      availableAmount: 1730000,
      beneficiaries: 124,
      maintenanceFund: 15,
      reserveFund: 20,
    },
  });

  const handleSimulate = (data: SimulationFormValues) => {
    const maintenanceAmount = (data.availableAmount * data.maintenanceFund) / 100;
    const reserveAmount = (data.availableAmount * data.reserveFund) / 100;
    const distributionAmount = data.availableAmount - maintenanceAmount - reserveAmount;
    const perBeneficiary = distributionAmount / data.beneficiaries;

    setResults({
      total: data.availableAmount,
      maintenance: maintenanceAmount,
      reserve: reserveAmount,
      distribution: distributionAmount,
      perBeneficiary: perBeneficiary,
      beneficiaries: data.beneficiaries,
    });
  };

  return (
    <ResponsiveDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title="محاكاة التوزيع"
      description="قم بإدخال المعطيات لمحاكاة توزيع الأموال"
      size="lg"
    >
      <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSimulate)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="maintenanceFund"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نسبة صندوق الصيانة (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="100" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reserveFund"
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
            </div>

            <Button type="submit" className="w-full">
              تشغيل المحاكاة
            </Button>
          </form>
        </Form>

        {results && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-bold">نتائج المحاكاة</h3>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-base">التوزيع المالي</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">صندوق الصيانة:</span>
                    <span className="font-bold text-warning">
                      {results.maintenance.toLocaleString()} ر.س
                    </span>
                  </div>
                  <Progress
                    value={(results.maintenance / results.total) * 100}
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">الاحتياطي:</span>
                    <span className="font-bold text-success">
                      {results.reserve.toLocaleString()} ر.س
                    </span>
                  </div>
                  <Progress
                    value={(results.reserve / results.total) * 100}
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">التوزيع على المستفيدين:</span>
                    <span className="font-bold text-primary">
                      {results.distribution.toLocaleString()} ر.س
                    </span>
                  </div>
                  <Progress
                    value={(results.distribution / results.total) * 100}
                    className="h-2"
                  />
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between">
                    <span className="font-medium">نصيب كل مستفيد:</span>
                    <span className="text-xl font-bold text-primary">
                      {results.perBeneficiary.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      ر.س
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    ({results.beneficiaries} مستفيد)
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
    </ResponsiveDialog>
  );
}
