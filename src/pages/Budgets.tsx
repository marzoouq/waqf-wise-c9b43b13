import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Calculator, FileSpreadsheet } from "lucide-react";
import { useBudgets } from "@/hooks/useBudgets";
import { useFiscalYears } from "@/hooks/useFiscalYears";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { BudgetDialog } from "@/components/budgets/BudgetDialog";
import { BudgetAnalysisCard } from "@/components/budgets/BudgetAnalysisCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Budget } from "@/types/accounting";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { format } from "@/lib/date";
import { formatCurrency } from "@/lib/utils";

export default function Budgets() {
  const { fiscalYears } = useFiscalYears();
  const activeFiscalYear = fiscalYears.find(fy => fy.is_active);
  
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(activeFiscalYear?.id || "");
  const { budgets, isLoading, error, refetch, addBudget, updateBudget, deleteBudget, calculateVariances } = 
    useBudgets(selectedFiscalYear);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  if (isLoading) {
    return <LoadingState message="جاري تحميل الميزانيات..." />;
  }

  if (error) {
    return (
      <ErrorState 
        title="فشل تحميل الميزانيات" 
        message="حدث خطأ أثناء تحميل بيانات الميزانيات"
        onRetry={() => refetch()}
        fullScreen
      />
    );
  }

  const handleOpenDialog = (budget?: Budget) => {
    setEditingBudget(budget || null);
    setDialogOpen(true);
  };

  const handleSave = async (data: Budget) => {
    if (editingBudget) {
      await updateBudget(data);
    } else {
      await addBudget(data);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه الميزانية؟")) {
      await deleteBudget(id);
    }
  };

  const handleCalculateVariances = async () => {
    if (!selectedFiscalYear) {
      alert("الرجاء اختيار سنة مالية");
      return;
    }
    await calculateVariances(selectedFiscalYear);
  };

  const handleExport = async () => {
    const { exportToExcel } = await import("@/lib/excel-helper");
    
    const exportData = budgets.map(b => ({
      "الحساب": `${b.accounts?.code} - ${b.accounts?.name_ar}`,
      "نوع الفترة": b.period_type,
      "رقم الفترة": b.period_number,
      "المقدّر": b.budgeted_amount,
      "الفعلي": b.actual_amount || 0,
      "الانحراف": b.variance_amount || 0,
      "نسبة التنفيذ": b.budgeted_amount > 0 
        ? `${((b.actual_amount || 0) / b.budgeted_amount * 100).toFixed(1)}%` 
        : "0%",
    }));

    await exportToExcel(exportData, `budgets-${format(new Date(), "yyyyMMdd")}`, "الميزانيات");
  };

  const getVarianceColor = (variance: number | null) => {
    if (!variance) return "text-muted-foreground";
    return variance >= 0 ? "text-success" : "text-destructive";
  };

  return (
    <PageErrorBoundary pageName="إدارة الميزانيات">
      <MobileOptimizedLayout>
      <MobileOptimizedHeader
        title="إدارة الميزانيات"
        description="تخطيط ومراقبة الميزانيات ومقارنتها بالمصروفات الفعلية"
        icon={<FileSpreadsheet className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />}
      />

      <div className="space-y-6">
        <BudgetAnalysisCard budgets={budgets} />

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>قائمة الميزانيات</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Select value={selectedFiscalYear} onValueChange={setSelectedFiscalYear}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="السنة المالية" />
                  </SelectTrigger>
                  <SelectContent>
                    {fiscalYears.map((fy) => (
                      <SelectItem key={fy.id} value={fy.id}>
                        {fy.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={handleCalculateVariances}>
                  <Calculator className="h-4 w-4 ms-2" />
                  حساب الانحرافات
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <FileSpreadsheet className="h-4 w-4 ms-2" />
                  تصدير Excel
                </Button>
                <Button size="sm" onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4 ms-2" />
                  إضافة ميزانية
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">الحساب</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden md:table-cell">الفترة</TableHead>
                    <TableHead className="text-xs sm:text-sm">المقدّر</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden lg:table-cell">الفعلي</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden lg:table-cell">الانحراف</TableHead>
                    <TableHead className="text-xs sm:text-sm">نسبة التنفيذ</TableHead>
                    <TableHead className="text-xs sm:text-sm">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {budgets.map((budget) => {
                  const utilization = budget.budgeted_amount > 0 
                    ? ((budget.actual_amount || 0) / budget.budgeted_amount * 100)
                    : 0;

                  return (
                    <TableRow key={budget.id}>
                      <TableCell className="font-medium text-xs sm:text-sm">
                        <div>
                          <div className="text-xs sm:text-sm">{budget.accounts?.name_ar}</div>
                          <div className="text-xs text-muted-foreground">{budget.accounts?.code}</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs sm:text-sm">
                        {budget.period_type} {budget.period_number}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">{formatCurrency(budget.budgeted_amount)}</TableCell>
                      <TableCell className="hidden lg:table-cell text-xs sm:text-sm">{formatCurrency(budget.actual_amount || 0)}</TableCell>
                      <TableCell className={`hidden lg:table-cell text-xs sm:text-sm ${getVarianceColor(budget.variance_amount)}`}>
                        {formatCurrency(Math.abs(budget.variance_amount || 0))}
                        {budget.variance_amount !== null && (
                          <Badge variant={budget.variance_amount >= 0 ? "default" : "destructive"} className="me-2 text-xs">
                            {budget.variance_amount >= 0 ? "توفير" : "تجاوز"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <Badge variant={utilization > 100 ? "destructive" : utilization > 80 ? "secondary" : "default"} className="text-xs">
                          {utilization.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(budget)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(budget.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {budgets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      لا توجد ميزانيات. قم بإضافة ميزانية جديدة للبدء.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <BudgetDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        budget={editingBudget}
        onSave={handleSave}
      />
    </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
}
