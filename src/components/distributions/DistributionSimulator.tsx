import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calculator,
  Play,
  CheckCircle2,
  AlertCircle,
  PieChart,
  TrendingUp,
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBeneficiaries } from "@/hooks/useBeneficiaries";

interface SimulationResult {
  beneficiary_id: string;
  beneficiary_name: string;
  category: string;
  allocation_percentage: number;
  allocated_amount: number;
  deductions: {
    nazer: number;
    reserve: number;
    development: number;
    maintenance: number;
  };
  net_amount: number;
}

export function DistributionSimulator() {
  const { toast } = useToast();
  const { beneficiaries } = useBeneficiaries();
  const [totalAmount, setTotalAmount] = useState<number>(100000);
  const [nazerPercentage, setNazerPercentage] = useState<number>(5);
  const [reservePercentage, setReservePercentage] = useState<number>(10);
  const [developmentPercentage, setDevelopmentPercentage] = useState<number>(5);
  const [maintenancePercentage, setMaintenancePercentage] = useState<number>(5);
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  const activeBeneficiaries = beneficiaries.filter(b => b.status === 'نشط');

  const runSimulation = () => {
    if (totalAmount <= 0) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى إدخال مبلغ صحيح للتوزيع",
      });
      return;
    }

    setIsSimulating(true);

    // حساب الاستقطاعات الإجمالية
    const totalDeductionPercentage = nazerPercentage + reservePercentage + 
                                     developmentPercentage + maintenancePercentage;

    if (totalDeductionPercentage >= 100) {
      toast({
        variant: "destructive",
        title: "خطأ في النسب",
        description: "مجموع الاستقطاعات يجب أن يكون أقل من 100%",
      });
      setIsSimulating(false);
      return;
    }

    // المبلغ المتاح للتوزيع بعد الاستقطاعات
    const deductionsAmount = totalAmount * (totalDeductionPercentage / 100);
    const availableForDistribution = totalAmount - deductionsAmount;

    // تجميع المستفيدين حسب الفئة
    interface Beneficiary { id: string; full_name: string; category: string; status: string; }
    const categoryGroups: Record<string, Beneficiary[]> = {};
    activeBeneficiaries.forEach(b => {
      if (!categoryGroups[b.category]) {
        categoryGroups[b.category] = [];
      }
      categoryGroups[b.category].push(b);
    });

    // نسب التوزيع حسب الفئة (يمكن تخصيصها)
    const categoryWeights: Record<string, number> = {
      'الفئة الأولى': 0.5,
      'الفئة الثانية': 0.3,
      'الفئة الثالثة': 0.2,
    };

    const simulationResults: SimulationResult[] = [];

    Object.entries(categoryGroups).forEach(([category, beneficiariesInCategory]) => {
      const categoryAmount = availableForDistribution * (categoryWeights[category] || 0.3);
      const perBeneficiaryAmount = categoryAmount / beneficiariesInCategory.length;

      beneficiariesInCategory.forEach(b => {
        const deductions = {
          nazer: perBeneficiaryAmount * (nazerPercentage / 100),
          reserve: perBeneficiaryAmount * (reservePercentage / 100),
          development: perBeneficiaryAmount * (developmentPercentage / 100),
          maintenance: perBeneficiaryAmount * (maintenancePercentage / 100),
        };

        const totalBeneficiaryDeductions = Object.values(deductions).reduce((a, b) => a + b, 0);

        simulationResults.push({
          beneficiary_id: b.id,
          beneficiary_name: b.full_name,
          category: b.category,
          allocation_percentage: (perBeneficiaryAmount / totalAmount) * 100,
          allocated_amount: perBeneficiaryAmount,
          deductions,
          net_amount: perBeneficiaryAmount - totalBeneficiaryDeductions,
        });
      });
    });

    setResults(simulationResults);
    setIsSimulating(false);

    toast({
      title: "اكتملت المحاكاة",
      description: `تم توزيع ${totalAmount.toLocaleString()} ر.س على ${simulationResults.length} مستفيد`,
    });
  };

  const totalDeductions = results.reduce((sum, r) => 
    sum + Object.values(r.deductions).reduce((a, b) => a + b, 0), 0
  );
  const totalNetDistributed = results.reduce((sum, r) => sum + r.net_amount, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            محاكاة توزيع الغلة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* إدخال البيانات */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total-amount">إجمالي المبلغ (ر.س)</Label>
              <Input
                id="total-amount"
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)}
                placeholder="100000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nazer">استقطاع الناظر (%)</Label>
              <Input
                id="nazer"
                type="number"
                step="0.1"
                value={nazerPercentage}
                onChange={(e) => setNazerPercentage(parseFloat(e.target.value) || 0)}
                placeholder="5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reserve">الاحتياطي (%)</Label>
              <Input
                id="reserve"
                type="number"
                step="0.1"
                value={reservePercentage}
                onChange={(e) => setReservePercentage(parseFloat(e.target.value) || 0)}
                placeholder="10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="development">التطوير (%)</Label>
              <Input
                id="development"
                type="number"
                step="0.1"
                value={developmentPercentage}
                onChange={(e) => setDevelopmentPercentage(parseFloat(e.target.value) || 0)}
                placeholder="5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maintenance">الصيانة (%)</Label>
              <Input
                id="maintenance"
                type="number"
                step="0.1"
                value={maintenancePercentage}
                onChange={(e) => setMaintenancePercentage(parseFloat(e.target.value) || 0)}
                placeholder="5"
              />
            </div>
          </div>

          <Button onClick={runSimulation} className="w-full" disabled={isSimulating}>
            <Play className="h-4 w-4 ml-2" />
            {isSimulating ? "جاري المحاكاة..." : "تشغيل المحاكاة"}
          </Button>

          {/* الملخص */}
          {results.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">المبلغ الإجمالي</p>
                  <p className="text-lg font-bold text-primary">
                    {totalAmount.toLocaleString('ar-SA')} ر.س
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">الاستقطاعات</p>
                  <p className="text-lg font-bold text-amber-600">
                    {totalDeductions.toLocaleString('ar-SA', { maximumFractionDigits: 2 })} ر.س
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">صافي الموزع</p>
                  <p className="text-lg font-bold text-green-600">
                    {totalNetDistributed.toLocaleString('ar-SA', { maximumFractionDigits: 2 })} ر.س
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">عدد المستفيدين</p>
                  <p className="text-lg font-bold text-blue-600">
                    {results.length}
                  </p>
                </div>
              </div>

              {/* جدول النتائج */}
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead>المستفيد</TableHead>
                        <TableHead>الفئة</TableHead>
                        <TableHead className="text-center">المبلغ المخصص</TableHead>
                        <TableHead className="text-center">الاستقطاعات</TableHead>
                        <TableHead className="text-center">الصافي</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((result) => {
                        const totalDeduction = Object.values(result.deductions).reduce((a, b) => a + b, 0);
                        return (
                          <TableRow key={result.beneficiary_id}>
                            <TableCell className="font-medium">
                              {result.beneficiary_name}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{result.category}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              {result.allocated_amount.toLocaleString('ar-SA', { maximumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="text-center text-amber-600">
                              {totalDeduction.toLocaleString('ar-SA', { maximumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="text-center font-bold text-green-600">
                              {result.net_amount.toLocaleString('ar-SA', { maximumFractionDigits: 2 })}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
