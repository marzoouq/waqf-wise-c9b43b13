import { useState } from "react";
import { MobileOptimizedLayout } from "@/components/layout/MobileOptimizedLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Filter, TrendingUp, TrendingDown, DollarSign, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { LoadingState } from "@/components/shared/LoadingState";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { format, arLocale as ar } from "@/lib/date";

interface UnifiedTransaction {
  source: string;
  source_name_ar: string;
  source_name_en: string;
  id: string;
  transaction_date: string;
  amount: number;
  party_name: string;
  transaction_type: string;
  payment_method: string;
  description: string;
  status: string;
  journal_entry_id: string | null;
  reference_number: string;
  created_at: string;
  beneficiary_id: string | null;
  contract_number: string | null;
}

export default function AllTransactions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["unified-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("unified_transactions_view")
        .select("*")
        .order("transaction_date", { ascending: false });

      if (error) throw error;
      return data as UnifiedTransaction[];
    },
  });

  // تصفية البيانات
  const filteredTransactions = transactions.filter((transaction) => {
    const matchSearch =
      searchTerm === "" ||
      transaction.party_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchSource = filterSource === "all" || transaction.source === filterSource;
    const matchType = filterType === "all" || transaction.transaction_type === filterType;
    const matchStatus = filterStatus === "all" || transaction.status === filterStatus;

    return matchSearch && matchSource && matchType && matchStatus;
  });

  // حساب الإحصائيات
  const stats = {
    totalIncome: filteredTransactions
      .filter((t) => t.transaction_type === "قبض")
      .reduce((sum, t) => sum + t.amount, 0),
    totalExpense: filteredTransactions
      .filter((t) => t.transaction_type === "صرف")
      .reduce((sum, t) => sum + t.amount, 0),
    totalTransactions: filteredTransactions.length,
    netAmount: 0,
  };

  stats.netAmount = stats.totalIncome - stats.totalExpense;

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  // تصدير إلى Excel
  const handleExportExcel = async () => {
    const { exportToExcel } = await import("@/lib/excel-helper");
    
    const exportData = filteredTransactions.map((t) => ({
      "التاريخ": format(new Date(t.transaction_date), "dd/MM/yyyy", { locale: ar }),
      "المصدر": t.source_name_ar,
      "النوع": t.transaction_type,
      "الطرف": t.party_name,
      "المبلغ": t.amount,
      "طريقة الدفع": t.payment_method,
      "البيان": t.description,
      "المرجع": t.reference_number,
      "الحالة": t.status,
    }));

    await exportToExcel(exportData, `جميع_المعاملات_${format(new Date(), "yyyy-MM-dd")}`, "المعاملات");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
      "مدفوع": { label: "مدفوع", variant: "default" },
      "معلق": { label: "معلق", variant: "secondary" },
      "معتمد": { label: "معتمد", variant: "outline" },
      "completed": { label: "مكتمل", variant: "default" },
      "pending": { label: "معلق", variant: "secondary" },
    };

    const config = variants[status] || { label: status, variant: "secondary" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <PageErrorBoundary pageName="جميع المعاملات">
      <MobileOptimizedLayout>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">جميع المعاملات المالية</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              عرض موحد لجميع المدفوعات والمقبوضات والإيجارات والتوزيعات
            </p>
          </div>
          <Button onClick={handleExportExcel} className="gap-2" size="sm">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">تصدير Excel</span>
            <span className="sm:hidden">تصدير</span>
          </Button>
        </div>

        {/* إحصائيات */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الوارد</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {stats.totalIncome.toLocaleString("ar-SA")} ريال
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الصادر</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {stats.totalExpense.toLocaleString("ar-SA")} ريال
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الصافي</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.netAmount >= 0 ? "text-success" : "text-destructive"}`}>
                {stats.netAmount.toLocaleString("ar-SA")} ريال
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">عدد المعاملات</CardTitle>
              <FileText className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTransactions}</div>
            </CardContent>
          </Card>
        </div>

        {/* الفلاتر */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-5">
              <div className="md:col-span-2">
                <Input
                  placeholder="بحث بالاسم أو البيان أو المرجع..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select value={filterSource} onValueChange={setFilterSource}>
                <SelectTrigger>
                  <SelectValue placeholder="المصدر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المصادر</SelectItem>
                  <SelectItem value="payment">سندات قبض/صرف</SelectItem>
                  <SelectItem value="rental">إيجارات</SelectItem>
                  <SelectItem value="distribution">توزيعات</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="قبض">قبض</SelectItem>
                  <SelectItem value="صرف">صرف</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="مدفوع">مدفوع</SelectItem>
                  <SelectItem value="معلق">معلق</SelectItem>
                  <SelectItem value="معتمد">معتمد</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* جدول المعاملات */}
        <Card>
          <CardHeader>
            <CardTitle>سجل المعاملات ({filteredTransactions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">المصدر</TableHead>
                    <TableHead className="text-right">النوع</TableHead>
                    <TableHead className="text-right">الطرف</TableHead>
                    <TableHead className="text-right">المبلغ</TableHead>
                    <TableHead className="text-right">طريقة الدفع</TableHead>
                    <TableHead className="text-right">البيان</TableHead>
                    <TableHead className="text-right">المرجع</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground">
                        لا توجد معاملات
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedTransactions.map((transaction) => (
                      <TableRow key={`${transaction.source}-${transaction.id}`}>
                        <TableCell>
                          {format(new Date(transaction.transaction_date), "dd/MM/yyyy", {
                            locale: ar,
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{transaction.source_name_ar}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={transaction.transaction_type === "قبض" ? "default" : "secondary"}
                          >
                            {transaction.transaction_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{transaction.party_name}</TableCell>
                        <TableCell className="font-semibold">
                          <span
                            className={
                              transaction.transaction_type === "قبض"
                                ? "text-success"
                                : "text-destructive"
                            }
                          >
                            {transaction.amount.toLocaleString("ar-SA")} ريال
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {transaction.payment_method}
                        </TableCell>
                        <TableCell className="text-sm max-w-xs truncate">
                          {transaction.description}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {transaction.reference_number}
                        </TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 px-2">
                <div className="text-sm text-muted-foreground">
                  عرض {startIndex + 1} إلى {Math.min(endIndex, filteredTransactions.length)} من {filteredTransactions.length} معاملة
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                    السابق
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    التالي
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
}
