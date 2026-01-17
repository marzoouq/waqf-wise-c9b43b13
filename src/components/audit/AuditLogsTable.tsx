import { useState, useMemo } from "react";
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
import { 
  Filter, 
  Download, 
  Shield, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  Search,
  Eye,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { 
  useAuditLogsEnhanced, 
  useAuditLogTables,
  useAuditLogUsers,
  type EnhancedAuditLog,
  type EnhancedAuditFilters
} from "@/hooks/system/useAuditLogsEnhanced";
import { format } from "@/lib/date";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { usePagination } from "@/hooks/ui/usePagination";
import { AuditLogDetailsDialog } from "./AuditLogDetailsDialog";
import { AuditStatsCards } from "./AuditStatsCards";
import { AuditAlertsCard } from "./AuditAlertsCard";
import { AuditDashboardCharts } from "./AuditDashboardCharts";
import { AuditCategoryFilter, CATEGORY_TABLES } from "./AuditCategoryFilter";
import { cn } from "@/lib/utils";

const severityConfig: Record<string, { label: string; icon: typeof Info; color: string }> = {
  info: { label: "معلومة", icon: Info, color: "bg-info/10 text-info" },
  warning: { label: "تحذير", icon: AlertTriangle, color: "bg-warning/10 text-warning" },
  error: { label: "خطأ", icon: AlertCircle, color: "bg-destructive/10 text-destructive" },
  critical: { label: "حرج", icon: Shield, color: "bg-destructive text-destructive-foreground" },
};

const actionTypeLabels: Record<string, string> = {
  INSERT: "إضافة",
  UPDATE: "تحديث",
  DELETE: "حذف",
  VIEW_ACCESS: "عرض",
  LOGIN: "تسجيل دخول",
  LOGOUT: "تسجيل خروج",
};

const tableNameLabels: Record<string, string> = {
  beneficiaries: "المستفيدون",
  families: "العائلات",
  properties: "العقارات",
  property_units: "الوحدات",
  funds: "الصناديق",
  journal_entries: "القيود",
  journal_entry_lines: "سطور القيود",
  payment_vouchers: "سندات الصرف",
  distributions: "التوزيعات",
  loans: "القروض",
  contracts: "العقود",
  tenants: "المستأجرين",
  user_roles: "الأدوار",
  governance_decisions: "قرارات الحوكمة",
  bank_accounts: "الحسابات البنكية",
  bank_transfers: "التحويلات",
};

export function AuditLogsTable() {
  const [filters, setFilters] = useState<EnhancedAuditFilters>({});
  const [selectedLog, setSelectedLog] = useState<EnhancedAuditLog | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: logs = [], isLoading, error, refetch, isFetching } = useAuditLogsEnhanced(filters);
  const { data: availableTables = [] } = useAuditLogTables();
  const { data: availableUsers = [] } = useAuditLogUsers();

  // فلترة السجلات حسب الفئة - يجب أن تكون قبل usePagination
  const filteredLogs = useMemo(() => {
    if (!selectedCategory) return logs;
    const categoryTables = CATEGORY_TABLES[selectedCategory] || [];
    return logs.filter(log => categoryTables.includes(log.table_name || ""));
  }, [logs, selectedCategory]);

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
  } = usePagination(filteredLogs, {
    initialPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  });

  const dateRange = useMemo(() => {
    if (filters.startDate && filters.endDate) {
      return { start: filters.startDate, end: filters.endDate };
    }
    return undefined;
  }, [filters.startDate, filters.endDate]);

  const exportLogs = () => {
    if (!filteredLogs || filteredLogs.length === 0) return;

    const csvHeaders = ["التاريخ", "المستخدم", "الدور", "نوع العملية", "الجدول", "الوصف", "الخطورة"];
    const csvData = filteredLogs.map(log => [
      format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss"),
      log.user_email || "-",
      log.user_role || "-",
      actionTypeLabels[log.action_type] || log.action_type,
      tableNameLabels[log.table_name || ""] || log.table_name || "-",
      log.description || "-",
      severityConfig[log.severity]?.label || log.severity
    ]);

    const csv = [csvHeaders, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `audit_logs_${format(new Date(), "yyyy-MM-dd_HH-mm")}.csv`;
    link.click();
  };

  const clearFilters = () => {
    setFilters({});
    setSelectedCategory(null);
  };

  const hasActiveFilters = Object.values(filters).some(v => v) || selectedCategory;

  if (isLoading) {
    return <LoadingState message="جاري تحميل سجلات التدقيق..." />;
  }

  if (error) {
    return (
      <ErrorState 
        title="فشل تحميل السجلات" 
        message="حدث خطأ أثناء تحميل سجلات التدقيق"
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* الرسوم البيانية */}
      <AuditDashboardCharts />

      {/* الإحصائيات */}
      <AuditStatsCards dateRange={dateRange} />

      {/* فلاتر الفئات */}
      <AuditCategoryFilter 
        selectedCategory={selectedCategory} 
        onCategoryChange={setSelectedCategory} 
      />

      {/* التنبيهات + الفلاتر */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* التنبيهات */}
        <div className="lg:col-span-1">
          <AuditAlertsCard maxAlerts={5} />
        </div>

        {/* الفلاتر */}
        <Card className="lg:col-span-2 p-4">
          <div 
            className="flex items-center justify-between cursor-pointer mb-4"
            onClick={() => setShowFilters(!showFilters)}
          >
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-semibold">الفلاتر</h2>
              {hasActiveFilters && (
                <Badge variant="secondary" className="text-xs">نشط</Badge>
              )}
            </div>
            {showFilters ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>

          {showFilters && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* البحث */}
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="بحث في الوصف..."
                    value={filters.search || ""}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pe-10"
                  />
                </div>

                {/* الجدول */}
                <Select
                  value={filters.tableName || "all"}
                  onValueChange={(value) =>
                    setFilters({ ...filters, tableName: value === "all" ? undefined : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="الجدول" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الجداول</SelectItem>
                    {availableTables.map((table) => (
                      <SelectItem key={table} value={table}>
                        {tableNameLabels[table] || table}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* نوع العملية */}
                <Select
                  value={filters.actionType || "all"}
                  onValueChange={(value) =>
                    setFilters({ ...filters, actionType: value === "all" ? undefined : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="نوع العملية" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع العمليات</SelectItem>
                    <SelectItem value="INSERT">إضافة</SelectItem>
                    <SelectItem value="UPDATE">تحديث</SelectItem>
                    <SelectItem value="DELETE">حذف</SelectItem>
                  </SelectContent>
                </Select>

                {/* الخطورة */}
                <Select
                  value={filters.severity || "all"}
                  onValueChange={(value) =>
                    setFilters({ ...filters, severity: value === "all" ? undefined : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="الخطورة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المستويات</SelectItem>
                    <SelectItem value="info">معلومة</SelectItem>
                    <SelectItem value="warning">تحذير</SelectItem>
                    <SelectItem value="error">خطأ</SelectItem>
                    <SelectItem value="critical">حرج</SelectItem>
                  </SelectContent>
                </Select>

                {/* من تاريخ */}
                <Input
                  type="date"
                  value={filters.startDate || ""}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  placeholder="من تاريخ"
                />

                {/* إلى تاريخ */}
                <Input
                  type="date"
                  value={filters.endDate || ""}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  placeholder="إلى تاريخ"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={clearFilters} disabled={!hasActiveFilters}>
                  مسح الفلاتر
                </Button>
                <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
                  <RefreshCw className={cn("h-4 w-4 ms-2", isFetching && "animate-spin")} />
                  تحديث
                </Button>
                <Button variant="outline" onClick={exportLogs} disabled={logs.length === 0}>
                  <Download className="h-4 w-4 ms-2" />
                  تصدير CSV
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* جدول السجلات */}
      <Card className="overflow-hidden">
        {logs.length === 0 ? (
          <EmptyState
            icon={Shield}
            title="لا توجد سجلات"
            description="لم يتم العثور على أي سجلات بناءً على الفلاتر المحددة"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[160px]">التاريخ</TableHead>
                    <TableHead className="min-w-[150px]">المستخدم</TableHead>
                    <TableHead className="w-[100px]">العملية</TableHead>
                    <TableHead className="w-[120px] hidden md:table-cell">الجدول</TableHead>
                    <TableHead className="hidden lg:table-cell">الوصف</TableHead>
                    <TableHead className="w-[90px]">الخطورة</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((log) => {
                    const config = severityConfig[log.severity] || severityConfig.info;
                    const SeverityIcon = config.icon;
                    
                    return (
                      <TableRow 
                        key={log.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedLog(log)}
                      >
                        <TableCell className="font-mono text-xs whitespace-nowrap">
                          {format(new Date(log.created_at), "MM/dd HH:mm:ss")}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm truncate max-w-[150px]">
                              {log.user_email || "غير معروف"}
                            </span>
                            {log.user_role && (
                              <span className="text-xs text-muted-foreground">
                                {log.user_role}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs",
                              log.action_type === 'DELETE' && "border-destructive/50 text-destructive",
                              log.action_type === 'INSERT' && "border-status-success/50 text-status-success",
                              log.action_type === 'UPDATE' && "border-info/50 text-info"
                            )}
                          >
                            {actionTypeLabels[log.action_type] || log.action_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="secondary" className="text-xs">
                            {tableNameLabels[log.table_name || ""] || log.table_name || "-"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell max-w-xs truncate text-xs">
                          {log.description}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(config.color, "text-xs gap-1")}>
                            <SeverityIcon className="h-3 w-3" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLog(log);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

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

      {/* حوار التفاصيل */}
      <AuditLogDetailsDialog
        log={selectedLog}
        open={!!selectedLog}
        onOpenChange={(open) => !open && setSelectedLog(null)}
      />
    </div>
  );
}
