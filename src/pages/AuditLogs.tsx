import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Filter, Download, Shield, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useAuditLogs } from "@/hooks/system/useAuditLogs";
import { format, arLocale as ar } from "@/lib/date";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { usePagination } from "@/hooks/ui/usePagination";
import { cleanFilters } from '@/lib/utils/cleanFilters';

const AuditLogs = () => {
  const [filters, setFilters] = useState({
    tableName: "",
    actionType: "",
    severity: "",
    startDate: "",
    endDate: "",
  });

  const { data: logs = [], isLoading, error, refetch } = useAuditLogs(cleanFilters(filters));

  // استخدام Pagination
  const {
    paginatedData,
    pagination,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    setPageSize,
    pageSizeOptions,
    canGoNext,
    canGoPrev,
    startIndex,
    endIndex,
  } = usePagination(logs, {
    initialPageSize: 15,
    pageSizeOptions: [10, 15, 25, 50, 100],
  });

  const exportLogs = () => {
    if (!logs || logs.length === 0) {
      return;
    }

    const csvHeaders = ["التاريخ", "المستخدم", "نوع العملية", "الجدول", "الوصف", "الخطورة"];
    const csvData = logs.map(log => [
      format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: ar }),
      log.user_email || "-",
      actionTypeLabels[log.action_type] || log.action_type,
      tableNameLabels[log.table_name || ""] || log.table_name || "-",
      log.description || "-",
      severityConfig[log.severity]?.label || log.severity
    ]);

    const csv = [csvHeaders, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `audit_logs_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  const severityConfig: Record<string, { label: string; icon: typeof Info; color: string }> = {
    info: { label: "معلومة", icon: Info, color: "bg-info-light text-info" },
    warning: { label: "تحذير", icon: AlertTriangle, color: "bg-warning-light text-warning" },
    error: { label: "خطأ", icon: AlertCircle, color: "bg-destructive-light text-destructive" },
    critical: { label: "حرج", icon: Shield, color: "bg-destructive-light text-destructive" },
  };

  const actionTypeLabels: Record<string, string> = {
    INSERT: "إضافة",
    UPDATE: "تحديث",
    DELETE: "حذف",
    LOGIN: "تسجيل دخول",
    LOGOUT: "تسجيل خروج",
  };

  const tableNameLabels: Record<string, string> = {
    beneficiaries: "المستفيدون",
    families: "العائلات",
    properties: "العقارات",
    funds: "الأموال",
    journal_entries: "القيود",
    users: "المستخدمون",
  };

  if (isLoading) {
    return <LoadingState message="جاري تحميل سجل العمليات..." />;
  }

  if (error) {
    return (
      <ErrorState 
        title="فشل تحميل السجلات" 
        message="حدث خطأ أثناء تحميل سجل العمليات"
        onRetry={() => refetch()}
        fullScreen
      />
    );
  }

  return (
    <PageErrorBoundary pageName="سجل العمليات">
      <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              سجل العمليات
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              تتبع جميع العمليات والأنشطة في النظام ({logs.length} سجل)
            </p>
          </div>
          <Button variant="outline" onClick={exportLogs} size="sm" className="gap-2 self-start sm:self-auto">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">تصدير</span>
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-3 sm:p-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            <h2 className="text-base sm:text-lg font-semibold">الفلاتر</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <Select
              value={filters.tableName || "all"}
              onValueChange={(value) =>
                setFilters({ ...filters, tableName: value === "all" ? "" : value })
              }
            >
              <SelectTrigger aria-label="اختر الجدول">
                <SelectValue placeholder="الجدول" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="beneficiaries">المستفيدون</SelectItem>
                <SelectItem value="families">العائلات</SelectItem>
                <SelectItem value="properties">العقارات</SelectItem>
                <SelectItem value="funds">الأموال</SelectItem>
                <SelectItem value="journal_entries">القيود</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.actionType || "all"}
              onValueChange={(value) =>
                setFilters({ ...filters, actionType: value === "all" ? "" : value })
              }
            >
              <SelectTrigger aria-label="اختر نوع العملية">
                <SelectValue placeholder="نوع العملية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="INSERT">إضافة</SelectItem>
                <SelectItem value="UPDATE">تحديث</SelectItem>
                <SelectItem value="DELETE">حذف</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.severity || "all"}
              onValueChange={(value) =>
                setFilters({ ...filters, severity: value === "all" ? "" : value })
              }
            >
              <SelectTrigger aria-label="اختر مستوى الخطورة">
                <SelectValue placeholder="مستوى الخطورة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="info">معلومة</SelectItem>
                <SelectItem value="warning">تحذير</SelectItem>
                <SelectItem value="error">خطأ</SelectItem>
                <SelectItem value="critical">حرج</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
              placeholder="من تاريخ"
            />

            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
              placeholder="إلى تاريخ"
            />
          </div>

          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setFilters({
                  tableName: "",
                  actionType: "",
                  severity: "",
                  startDate: "",
                  endDate: "",
                })
              }
            >
              مسح الفلاتر
            </Button>
          </div>
        </Card>

        {/* Logs Table */}
        <Card className="overflow-hidden">
          {!logs || logs.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="لا توجد عمليات"
              description="لم يتم العثور على أي عمليات بناءً على الفلاتر المحددة"
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">التاريخ والوقت</TableHead>
                      <TableHead className="whitespace-nowrap">المستخدم</TableHead>
                      <TableHead className="whitespace-nowrap">نوع العملية</TableHead>
                      <TableHead className="whitespace-nowrap hidden md:table-cell">الجدول</TableHead>
                      <TableHead className="whitespace-nowrap hidden lg:table-cell">الوصف</TableHead>
                      <TableHead className="whitespace-nowrap">الخطورة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((log) => {
                      const config = severityConfig[log.severity] || severityConfig.info;
                      const SeverityIcon = config.icon;
                      return (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-xs sm:text-sm whitespace-nowrap">
                            {format(new Date(log.created_at), "yyyy-MM-dd HH:mm", {
                              locale: ar,
                            })}
                          </TableCell>
                          <TableCell className="min-w-[120px]">
                            <div className="flex flex-col">
                              <span className="font-medium text-xs sm:text-sm truncate">{log.user_email || "غير معروف"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs whitespace-nowrap">
                              {actionTypeLabels[log.action_type] || log.action_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant="secondary" className="text-xs whitespace-nowrap">
                              {tableNameLabels[log.table_name || ""] || log.table_name}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell max-w-md truncate text-xs sm:text-sm">
                            {log.description}
                          </TableCell>
                          <TableCell>
                            <Badge className={config.color + " text-xs whitespace-nowrap"}>
                              <SeverityIcon className="h-3 w-3 ml-1" />
                              {config.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              <PaginationControls
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                pageSize={pagination.pageSize}
                pageSizeOptions={pageSizeOptions}
                startIndex={startIndex}
                endIndex={endIndex}
                canGoNext={canGoNext}
                canGoPrev={canGoPrev}
                onPageChange={goToPage}
                onPageSizeChange={setPageSize}
                onNext={nextPage}
                onPrev={prevPage}
                onFirst={firstPage}
                onLast={lastPage}
              />
            </>
          )}
        </Card>
      </div>
    </PageErrorBoundary>
  );
};

export default AuditLogs;
