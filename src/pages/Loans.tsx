import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoanCalculator } from "@/components/loans/LoanCalculator";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useLoans, type Loan } from "@/hooks/payments/useLoans";
import {
  Plus,
  Search,
  FileText,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  Percent,
  Calculator,
  Download,
} from "lucide-react";
import { format } from "@/lib/date";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollableTableWrapper } from "@/components/shared/ScrollableTableWrapper";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoanDialog } from "@/components/loans/LoanDialog";
import { InstallmentScheduleDialog } from "@/components/loans/InstallmentScheduleDialog";
import { LoanPaymentDialog } from "@/components/loans/LoanPaymentDialog";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";

// Skeleton loaders
const StatsSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    {[1, 2, 3, 4].map((i) => (
      <Card key={i} className="animate-pulse">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    ))}
  </div>
);

const TableSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4, 5].map((i) => (
      <Skeleton key={i} className="h-16 w-full" />
    ))}
  </div>
);

export default function Loans() {
  const { loans, isLoading } = useLoans();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  // Filter loans
  const filteredLoans = loans.filter((loan: Loan) => {
    const matchesSearch =
      loan.loan_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.beneficiary?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.beneficiary?.national_id?.includes(searchQuery);

    const matchesStatus = statusFilter === "all" || loan.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: loans.length,
    active: loans.filter((l: Loan) => l.status === "نشط" || l.status === "active").length,
    paid: loans.filter((l: Loan) => l.status === "مسدد" || l.status === "paid").length,
    defaulted: loans.filter((l: Loan) => l.status === "متعثر" || l.status === "defaulted").length,
    totalAmount: loans.reduce((sum: number, l: Loan) => sum + l.loan_amount, 0),
  };

  const getStatusBadge = (status: string) => {
    type BadgeVariant = "default" | "secondary" | "destructive" | "outline";
    type IconComponent = React.ComponentType<{ className?: string }>;
    const variants: Record<string, { variant: BadgeVariant; icon: IconComponent; label: string }> = {
      pending: {
        variant: "secondary",
        icon: Clock,
        label: "قيد المراجعة",
      },
      active: {
        variant: "default",
        icon: TrendingUp,
        label: "نشط",
      },
      paid: {
        variant: "outline",
        icon: CheckCircle,
        label: "مسدد",
      },
      defaulted: {
        variant: "destructive",
        icon: AlertCircle,
        label: "متعثر",
      },
      cancelled: {
        variant: "secondary",
        icon: XCircle,
        label: "ملغي",
      },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <PageErrorBoundary pageName="إدارة القروض">
      <MobileOptimizedLayout>
      {/* Header */}
      <MobileOptimizedHeader
        title="إدارة القروض"
        description="إدارة القروض وجداول الأقساط والمدفوعات"
        icon={<FileText className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />}
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={async () => {
                const { exportToExcel } = await import("@/lib/excel-helper");
                
                const exportData = filteredLoans.map((loan) => ({
                  "رقم القرض": loan.loan_number,
                  "المستفيد": loan.beneficiary?.full_name,
                  "الهوية الوطنية": loan.beneficiary?.national_id,
                  "مبلغ القرض": loan.loan_amount,
                  "نسبة الفائدة": loan.interest_rate + "%",
                  "المدة (شهر)": loan.term_months,
                  "القسط الشهري": loan.monthly_installment,
                  "تاريخ البداية": format(new Date(loan.start_date), "dd/MM/yyyy"),
                  "الحالة": loan.status,
                }));
                
                await exportToExcel(exportData, `قروض_${format(new Date(), "yyyy-MM-dd")}`, "القروض");
              }}
              className="gap-1"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">تصدير</span>
            </Button>
            <Button size="sm" onClick={() => setIsDialogOpen(true)} className="gap-1">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">إضافة قرض</span>
              <span className="sm:hidden">جديد</span>
            </Button>
          </div>
        }
      />

      {/* Statistics Cards */}
      {isLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                إجمالي القروض
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <FileText className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.active} قرض نشط
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                قروض نشطة
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-info-light flex items-center justify-center group-hover:bg-info/20 transition-colors">
                <TrendingUp className="h-4 w-4 text-info" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground mt-1">قيد السداد</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                قروض مسددة
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-success-light flex items-center justify-center group-hover:bg-success/20 transition-colors">
                <CheckCircle className="h-4 w-4 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.paid}</div>
              <p className="text-xs text-muted-foreground mt-1">مكتملة السداد</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                إجمالي المبالغ
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center group-hover:bg-warning/20 transition-colors">
                <DollarSign className="h-4 w-4 text-warning" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalAmount.toLocaleString("ar-SA")}
              </div>
              <p className="text-xs text-muted-foreground mt-1">ريال سعودي</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="البحث برقم القرض، اسم المستفيد، أو رقم الهوية..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="حالة القرض" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">قيد المراجعة</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="paid">مسدد</SelectItem>
                <SelectItem value="defaulted">متعثر</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loans Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة القروض ({filteredLoans.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : filteredLoans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">لا توجد قروض</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "لم يتم العثور على نتائج تطابق البحث"
                  : "ابدأ بإضافة قرض جديد"}
              </p>
            </div>
          ) : (
            <ScrollableTableWrapper>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">رقم القرض</TableHead>
                    <TableHead className="text-xs sm:text-sm">المستفيد</TableHead>
                    <TableHead className="text-xs sm:text-sm">مبلغ القرض</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden lg:table-cell">نسبة الفائدة</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden lg:table-cell">المدة</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden md:table-cell">القسط الشهري</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden lg:table-cell">تاريخ البداية</TableHead>
                    <TableHead className="text-xs sm:text-sm">الحالة</TableHead>
                    <TableHead className="text-xs sm:text-sm">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLoans.map((loan: Loan) => (
                    <TableRow key={loan.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium text-xs sm:text-sm">
                        {loan.loan_number}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <div>
                          <div className="font-medium">
                            {loan.beneficiary?.full_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {loan.beneficiary?.national_id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          <span className="font-semibold">
                            {loan.loan_amount.toLocaleString("ar-SA")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm hidden lg:table-cell">
                        <div className="flex items-center gap-1">
                          <Percent className="h-3 w-3 text-muted-foreground" />
                          <span>{loan.interest_rate}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm hidden lg:table-cell">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>{loan.term_months} شهر</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm hidden md:table-cell">
                        <span className="font-semibold text-primary">
                          {loan.monthly_installment.toLocaleString("ar-SA")}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm hidden lg:table-cell">
                        {new Date(loan.start_date).toLocaleDateString("ar-SA")}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">{getStatusBadge(loan.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedLoan(loan);
                              setIsScheduleDialogOpen(true);
                            }}
                          >
                            الأقساط
                          </Button>
                          {(loan.status === "نشط" || loan.status === "active") && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                setSelectedLoan(loan);
                                setIsPaymentDialogOpen(true);
                              }}
                            >
                              سداد
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollableTableWrapper>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {isDialogOpen && (
        <LoanDialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setSelectedLoan(null);
          }}
          loan={selectedLoan}
        />
      )}
      {isScheduleDialogOpen && selectedLoan && (
        <InstallmentScheduleDialog
          open={isScheduleDialogOpen}
          onOpenChange={(open) => {
            setIsScheduleDialogOpen(open);
            if (!open) setSelectedLoan(null);
          }}
          loanId={selectedLoan.id}
          loanNumber={selectedLoan.loan_number}
        />
      )}
      {isPaymentDialogOpen && selectedLoan && (
        <LoanPaymentDialog
          open={isPaymentDialogOpen}
          onOpenChange={(open) => {
            setIsPaymentDialogOpen(open);
            if (!open) setSelectedLoan(null);
          }}
          loanId={selectedLoan.id}
          loanNumber={selectedLoan.loan_number}
        />
      )}
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
}
