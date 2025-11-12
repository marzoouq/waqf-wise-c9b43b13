import { useState } from "react";
import { Plus, Search, DollarSign, Users, AlertCircle, CheckCircle2, Calendar, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLoans, type Loan } from "@/hooks/useLoans";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoanDialog } from "@/components/loans/LoanDialog";
import { InstallmentScheduleDialog } from "@/components/loans/InstallmentScheduleDialog";
import { LoanPaymentDialog } from "@/components/loans/LoanPaymentDialog";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function Loans() {
  const { loans, isLoading } = useLoans();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  // Filter loans
  const filteredLoans = loans.filter((loan) => {
    const matchesSearch =
      loan.loan_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.beneficiary?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.beneficiary?.national_id.includes(searchQuery);

    const matchesStatus = statusFilter === "all" || loan.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: loans.length,
    active: loans.filter((l) => l.status === "active").length,
    paid: loans.filter((l) => l.status === "paid").length,
    defaulted: loans.filter((l) => l.status === "defaulted").length,
    totalAmount: loans.reduce((sum, l) => sum + l.loan_amount, 0),
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "نشط", variant: "default" as const, icon: DollarSign },
      paid: { label: "مسدد", variant: "outline" as const, icon: CheckCircle2 },
      defaulted: { label: "متعثر", variant: "destructive" as const, icon: AlertCircle },
      cancelled: { label: "ملغي", variant: "secondary" as const, icon: AlertCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة القروض</h1>
          <p className="text-muted-foreground mt-2">
            إدارة ومتابعة القروض والأقساط
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة قرض جديد
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">إجمالي القروض</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">قروض نشطة</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">قروض مسددة</p>
              <p className="text-2xl font-bold">{stats.paid}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">قروض متعثرة</p>
              <p className="text-2xl font-bold">{stats.defaulted}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">إجمالي المبالغ</p>
              <p className="text-xl font-bold">
                {stats.totalAmount.toLocaleString('ar-SA')} ريال
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="بحث برقم القرض، اسم المستفيد، أو رقم الهوية..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="active">نشط</SelectItem>
              <SelectItem value="paid">مسدد</SelectItem>
              <SelectItem value="defaulted">متعثر</SelectItem>
              <SelectItem value="cancelled">ملغي</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Loans Table */}
      {filteredLoans.length === 0 ? (
        <EmptyState
          title="لا توجد قروض"
          description="ابدأ بإضافة قرض جديد"
          icon={DollarSign}
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم القرض</TableHead>
                <TableHead className="text-right">المستفيد</TableHead>
                <TableHead className="text-right">المبلغ</TableHead>
                <TableHead className="text-right">الفائدة</TableHead>
                <TableHead className="text-right">المدة</TableHead>
                <TableHead className="text-right">القسط الشهري</TableHead>
                <TableHead className="text-right">تاريخ البداية</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLoans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell className="font-medium">{loan.loan_number}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{loan.beneficiary?.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {loan.beneficiary?.national_id}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {loan.loan_amount.toLocaleString('ar-SA')} ريال
                  </TableCell>
                  <TableCell>{loan.interest_rate}%</TableCell>
                  <TableCell>{loan.term_months} شهر</TableCell>
                  <TableCell className="font-semibold">
                    {loan.monthly_installment?.toLocaleString('ar-SA') || 0} ريال
                  </TableCell>
                  <TableCell>
                    {format(new Date(loan.start_date), "dd/MM/yyyy", {
                      locale: ar,
                    })}
                  </TableCell>
                  <TableCell>{getStatusBadge(loan.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedLoan(loan);
                          setIsScheduleDialogOpen(true);
                        }}
                        className="gap-1"
                      >
                        <Calendar className="h-3 w-3" />
                        الأقساط
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedLoan(loan);
                          setIsPaymentDialogOpen(true);
                        }}
                        className="gap-1"
                        disabled={loan.status === "paid" || loan.status === "cancelled"}
                      >
                        <Receipt className="h-3 w-3" />
                        دفعة
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Dialogs */}
      <LoanDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        loan={selectedLoan}
      />

      {selectedLoan && (
        <>
          <InstallmentScheduleDialog
            open={isScheduleDialogOpen}
            onOpenChange={setIsScheduleDialogOpen}
            loanId={selectedLoan.id}
            loanNumber={selectedLoan.loan_number}
          />

          <LoanPaymentDialog
            open={isPaymentDialogOpen}
            onOpenChange={setIsPaymentDialogOpen}
            loanId={selectedLoan.id}
            loanNumber={selectedLoan.loan_number}
          />
        </>
      )}
    </div>
  );
}
