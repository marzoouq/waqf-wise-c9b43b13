import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Calculator, FileSpreadsheet } from "lucide-react";
import { useBudgets } from "@/hooks/accounting/useBudgets";
import { useFiscalYears } from "@/hooks/accounting/useFiscalYears";
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
import { useDeleteConfirmation } from "@/hooks/shared/useDeleteConfirmation";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";

export default function Budgets() {
  const { fiscalYears } = useFiscalYears();
  const activeFiscalYear = fiscalYears.find(fy => fy.is_active);
  
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(activeFiscalYear?.id || "");
  const { budgets, isLoading, error, refetch, addBudget, updateBudget, deleteBudget, calculateVariances } = 
    useBudgets(selectedFiscalYear);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const {
    confirmDelete,
    isOpen: deleteDialogOpen,
    onOpenChange: setDeleteDialogOpen,
    executeDelete,
    isDeleting,
    itemName,
  } = useDeleteConfirmation({
    onDelete: deleteBudget,
    successMessage: "تم حذف الميزانية بنجاح",
    errorMessage: "حدث خطأ أثناء حذف الميزانية",
    title: "حذف الميزانية",
    description: "هل أنت متأكد من حذف هذه الميزانية؟",
  });

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
            {budgets.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد ميزانيات. قم بإضافة ميزانية جديدة للبدء.</p>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {budgets.map((budget) => {
                    const utilization = budget.budgeted_amount > 0 
                      ? ((budget.actual_amount || 0) / budget.budgeted_amount * 100)
                      : 0;
                    return (
                      <Card key={budget.id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-sm">{budget.accounts?.name_ar}</p>
                            <p className="text-xs text-muted-foreground">{budget.accounts?.code}</p>
                          </div>
                          <Badge variant={utilization > 100 ? "destructive" : utilization > 80 ? "secondary" : "default"} className="text-xs">
                            {utilization.toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                          <div>
                            <span className="text-muted-foreground text-xs">المقدّر:</span>
                            <p className="font-semibold">{formatCurrency(budget.budgeted_amount)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-xs">الفعلي:</span>
                            <p className="font-semibold">{formatCurrency(budget.actual_amount || 0)}</p>
                          </div>
                        </div>
                        {budget.variance_amount !== null && (
                          <div className={`text-sm mb-3 ${getVarianceColor(budget.variance_amount)}`}>
                            الانحراف: {formatCurrency(Math.abs(budget.variance_amount || 0))}
                            <Badge variant={budget.variance_amount >= 0 ? "default" : "destructive"} className="me-2 text-xs">
                              {budget.variance_amount >= 0 ? "توفير" : "تجاوز"}
                            </Badge>
                          </div>
                        )}
                        <div className="flex gap-2 pt-2 border-t">
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenDialog(budget)}>
                            <Pencil className="h-4 w-4 ms-1" />
                            تعديل
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive" onClick={() => confirmDelete(budget.id, budget.accounts?.name_ar)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">الحساب</TableHead>
                        <TableHead className="text-xs sm:text-sm">الفترة</TableHead>
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
                            <TableCell className="text-xs sm:text-sm">
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
                                <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(budget)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => confirmDelete(budget.id, budget.accounts?.name_ar)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <BudgetDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        budget={editingBudget}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={executeDelete}
        title="حذف الميزانية"
        description="هل أنت متأكد من حذف هذه الميزانية؟"
        itemName={itemName}
        isLoading={isDeleting}
      />
    </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
}
