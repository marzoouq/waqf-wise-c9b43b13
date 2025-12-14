import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, DollarSign, Calendar, Percent, TrendingUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LoanScheduleItem {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export function LoanCalculator() {
  const [principal, setPrincipal] = useState<number>(100000);
  const [rate, setRate] = useState<number>(0);
  const [months, setMonths] = useState<number>(12);
  const [schedule, setSchedule] = useState<LoanScheduleItem[]>([]);

  const calculateLoan = () => {
    let monthlyPayment: number;
    
    if (rate === 0) {
      monthlyPayment = principal / months;
    } else {
      const monthlyRate = rate / 12 / 100;
      monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                       (Math.pow(1 + monthlyRate, months) - 1);
    }

    let remainingBalance = principal;
    const calculatedSchedule = [];

    for (let i = 1; i <= months; i++) {
      const interestPayment = remainingBalance * (rate / 12 / 100);
      const principalPayment = monthlyPayment - interestPayment;
      remainingBalance -= principalPayment;

      calculatedSchedule.push({
        month: i,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, remainingBalance),
      });
    }

    setSchedule(calculatedSchedule);
  };

  const totalInterest = schedule.reduce((sum, s) => sum + s.interest, 0);
  const totalPayment = principal + totalInterest;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            حاسبة القروض
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="principal">مبلغ القرض (ر.س)</Label>
              <Input
                id="principal"
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(parseFloat(e.target.value) || 0)}
                placeholder="100000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">معدل الفائدة السنوي (%)</Label>
              <Input
                id="rate"
                type="number"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="months">مدة القرض (شهر)</Label>
              <Input
                id="months"
                type="number"
                value={months}
                onChange={(e) => setMonths(parseInt(e.target.value) || 1)}
                placeholder="12"
              />
            </div>
          </div>

          <Button onClick={calculateLoan} className="w-full">
            <Calculator className="h-4 w-4 ms-2" />
            احسب الجدول
          </Button>

          {schedule.length > 0 && (
            <>
              {/* الملخص */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">القسط الشهري</p>
                  <p className="text-xl font-bold text-primary">
                    {schedule[0].payment.toLocaleString('ar-SA', { maximumFractionDigits: 2 })} ر.س
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">إجمالي الفوائد</p>
                  <p className="text-xl font-bold text-warning">
                    {totalInterest.toLocaleString('ar-SA', { maximumFractionDigits: 2 })} ر.س
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">إجمالي المدفوع</p>
                  <p className="text-xl font-bold text-info">
                    {totalPayment.toLocaleString('ar-SA', { maximumFractionDigits: 2 })} ر.س
                  </p>
                </div>
              </div>

              {/* جدول الأقساط */}
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead className="text-center">الشهر</TableHead>
                        <TableHead className="text-center">القسط</TableHead>
                        <TableHead className="text-center">الأصل</TableHead>
                        <TableHead className="text-center">الفائدة</TableHead>
                        <TableHead className="text-center">الرصيد</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schedule.map((item) => (
                        <TableRow key={item.month}>
                          <TableCell className="text-center font-medium">
                            {item.month}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.payment.toLocaleString('ar-SA', { maximumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-center text-info">
                            {item.principal.toLocaleString('ar-SA', { maximumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-center text-warning">
                            {item.interest.toLocaleString('ar-SA', { maximumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-center font-medium">
                            {item.balance.toLocaleString('ar-SA', { maximumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))}
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
