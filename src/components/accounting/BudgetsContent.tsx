import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Calculator, FileSpreadsheet } from "lucide-react";
import { useBudgets, Budget } from "@/hooks/useBudgets";
import { useFiscalYears } from "@/hooks/useFiscalYears";
import { LoadingState } from "@/components/shared/LoadingState";
import { BudgetDialog } from "@/components/budgets/BudgetDialog";
import { BudgetAnalysisCard } from "@/components/budgets/BudgetAnalysisCard";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { EmptyAccountingState } from "./EmptyAccountingState";
import { AccountingErrorState } from "./AccountingErrorState";
import { toast } from "sonner";
import { UnifiedDataTable, type Column } from "@/components/unified/UnifiedDataTable";
import { productionLogger } from '@/lib/logger/production-logger';

export function BudgetsContent() {
  const { fiscalYears } = useFiscalYears();
  const activeFiscalYear = fiscalYears.find(fy => fy.is_active);
  
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(activeFiscalYear?.id || "");
  const { budgets, isLoading, addBudget, updateBudget, deleteBudget, calculateVariances, error, refetch } = 
    useBudgets(selectedFiscalYear);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  if (isLoading) {
    return <LoadingState message="جاري تحميل الميزانيات..." />;
  }

  if (error) {
    return <AccountingErrorState error={error as Error} onRetry={refetch} />;
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
    try {
      // Dynamic import for XLSX
      const XLSX = await import('xlsx');
      
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

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "الميزانيات");
      XLSX.writeFile(wb, `budgets-${format(new Date(), "yyyyMMdd")}.xlsx`);
      
      toast.success("تم تصدير الميزانيات بنجاح");
    } catch (error) {
      toast.error("فشل تصدير الميزانيات");
      productionLogger.error("Excel export error", error);
    }
  };

  const getVarianceColor = (variance: number | null) => {
    if (!variance) return "text-muted-foreground";
    return variance >= 0 ? "text-success" : "text-destructive";
  };

  const columns: Column<Budget>[] = [
    {
      key: "account",
      label: "الحساب",
      render: (_, budget) => (
        <div>
          <div className="text-sm font-medium">{budget.accounts?.name_ar}</div>
          <div className="text-xs text-muted-foreground">{budget.accounts?.code}</div>
        </div>
      ),
    },
    {
      key: "period",
      label: "الفترة",
      render: (_, budget) => (
        <span className="text-xs sm:text-sm">
          {budget.period_type} {budget.period_number}
        </span>
      ),
    },
    {
      key: "budgeted_amount",
      label: "المقدّر",
      render: (_, budget) => (
        <span className="text-xs sm:text-sm">{formatCurrency(budget.budgeted_amount)}</span>
      ),
    },
    {
      key: "actual_amount",
      label: "الفعلي",
      render: (_, budget) => (
        <span className="text-xs sm:text-sm">{formatCurrency(budget.actual_amount || 0)}</span>
      ),
    },
    {
      key: "variance_amount",
      label: "الانحراف",
      render: (_, budget) => (
        <span className={`text-xs sm:text-sm ${getVarianceColor(budget.variance_amount)}`}>
          {formatCurrency(Math.abs(budget.variance_amount || 0))}
          {budget.variance_amount !== null && (
            <Badge variant={budget.variance_amount >= 0 ? "default" : "destructive"} className="mr-2 text-xs">
              {budget.variance_amount >= 0 ? "توفير" : "تجاوز"}
            </Badge>
          )}
        </span>
      ),
    },
    {
      key: "utilization",
      label: "نسبة التنفيذ",
      render: (_, budget) => {
        const utilization = budget.budgeted_amount > 0 
          ? ((budget.actual_amount || 0) / budget.budgeted_amount * 100)
          : 0;
        return (
          <Badge variant={utilization > 100 ? "destructive" : utilization > 80 ? "secondary" : "default"}>
            {utilization.toFixed(1)}%
          </Badge>
        );
      },
    },
  ];

  return (
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
                <Calculator className="h-4 w-4 ml-2" />
                حساب الانحرافات
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <FileSpreadsheet className="h-4 w-4 ml-2" />
                تصدير Excel
              </Button>
              <Button size="sm" onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 ml-2" />
                إضافة ميزانية
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {budgets.length === 0 ? (
            <EmptyAccountingState
              icon={<FileSpreadsheet className="h-12 w-12" />}
              title="لا توجد ميزانيات"
              description="ابدأ بإضافة أول ميزانية للمراقبة والتحكم في المصروفات"
              actionLabel="إضافة ميزانية"
              onAction={() => handleOpenDialog()}
            />
          ) : (
            <UnifiedDataTable
              columns={columns}
              data={budgets}
              loading={isLoading}
              actions={(budget) => (
                <div className="flex gap-2 justify-end">
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
              )}
            />
          )}
        </CardContent>
      </Card>

      <BudgetDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        budget={editingBudget}
        onSave={handleSave}
      />
    </div>
  );
}
