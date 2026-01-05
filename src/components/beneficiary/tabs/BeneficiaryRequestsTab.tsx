/**
 * صفحة طلبات المستفيد - تصميم متجاوب
 * @version 2.0.0
 * - إحصائيات سريعة قابلة للنقر للفلترة
 * - عرض بطاقات للجوال
 * - جدول للشاشات الكبيرة
 * - زر عائم للجوال
 */

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, FileText, RefreshCw } from "lucide-react";
import { RequestSubmissionDialog } from "../RequestSubmissionDialog";
import { RequestDetailsDialog } from "../RequestDetailsDialog";
import { useBeneficiaryRequestsTab } from "@/hooks/beneficiary/useBeneficiaryTabsData";
import {
  BeneficiaryRequestsStatsCards,
  BeneficiaryRequestMobileCard,
  BeneficiaryRequestsDesktopTable,
  FloatingActionButton,
} from "./requests";

interface BeneficiaryRequestsTabProps {
  beneficiaryId: string;
}

interface RequestType {
  name_ar: string;
  requires_amount?: boolean;
}

interface BeneficiaryRequest {
  id: string;
  request_number: string | null;
  description: string;
  status: string | null;
  priority: string | null;
  amount: number | null;
  created_at: string | null;
  sla_due_at: string | null;
  attachments_count: number | null;
  is_overdue: boolean | null;
  request_types: RequestType | null;
}

export function BeneficiaryRequestsTab({ beneficiaryId }: BeneficiaryRequestsTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const { data: rawRequests = [], isLoading, refetch } = useBeneficiaryRequestsTab(beneficiaryId);
  
  // تحويل البيانات للنوع المتوقع
  const requests = useMemo(() => {
    return rawRequests.map((r) => ({
      ...r,
      request_types: r.request_types as RequestType | null,
    })) as BeneficiaryRequest[];
  }, [rawRequests]);

  // حساب الإحصائيات
  const stats = useMemo(() => {
    const pending = requests.filter((r) => 
      r.status === "معلق" || r.status === "قيد المراجعة"
    ).length;
    const approved = requests.filter((r) => r.status === "معتمد").length;
    const rejected = requests.filter((r) => r.status === "مرفوض").length;
    const overdue = requests.filter((r) => r.is_overdue).length;

    return {
      total: requests.length,
      pending,
      approved,
      rejected,
      overdue,
    };
  }, [requests]);

  // فلترة الطلبات
  const filteredRequests = useMemo(() => {
    let result = requests;

    // فلترة حسب الحالة
    switch (activeFilter) {
      case "pending":
        result = result.filter((r) => 
          r.status === "معلق" || r.status === "قيد المراجعة"
        );
        break;
      case "approved":
        result = result.filter((r) => r.status === "معتمد");
        break;
      case "rejected":
        result = result.filter((r) => r.status === "مرفوض");
        break;
      case "overdue":
        result = result.filter((r) => r.is_overdue);
        break;
    }

    // فلترة حسب البحث
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((r) =>
        (r.request_number?.toLowerCase().includes(query)) ||
        (r.description?.toLowerCase().includes(query)) ||
        (r.request_types?.name_ar?.toLowerCase().includes(query))
      );
    }

    return result;
  }, [requests, activeFilter, searchQuery]);

  const handleViewDetails = useCallback((requestId: string) => {
    setSelectedRequestId(requestId);
  }, []);

  const handleFilterChange = useCallback((filter: string) => {
    setActiveFilter(filter);
  }, []);

  return (
    <div className="space-y-4">
      {/* إحصائيات سريعة */}
      <BeneficiaryRequestsStatsCards
        stats={stats}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
      />

      {/* البطاقة الرئيسية */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                طلباتي
                {filteredRequests.length !== requests.length && (
                  <span className="text-sm font-normal text-muted-foreground">
                    ({filteredRequests.length} من {requests.length})
                  </span>
                )}
              </CardTitle>
              <CardDescription className="mt-1">
                جميع الطلبات المقدمة مع حالتها الحالية
              </CardDescription>
            </div>
            
            {/* أزرار الإجراءات - مخفية على الجوال */}
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ms-1 ${isLoading ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 ms-2" />
                طلب جديد
              </Button>
            </div>
          </div>

          {/* شريط البحث */}
          <div className="relative mt-3">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث برقم الطلب أو النوع أو الوصف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-9"
            />
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* عرض الجوال - بطاقات */}
          <div className="md:hidden space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  جاري التحميل...
                </div>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  {searchQuery || activeFilter !== "all"
                    ? "لا توجد طلبات تطابق معايير البحث"
                    : "لا توجد طلبات مقدمة بعد"}
                </p>
                {!searchQuery && activeFilter === "all" && (
                  <Button
                    variant="link"
                    onClick={() => setIsDialogOpen(true)}
                    className="mt-2"
                  >
                    قدم طلبك الأول
                  </Button>
                )}
              </div>
            ) : (
              filteredRequests.map((request) => (
                <BeneficiaryRequestMobileCard
                  key={request.id}
                  request={request}
                  onViewDetails={handleViewDetails}
                />
              ))
            )}
          </div>

          {/* عرض الديسكتوب - جدول */}
          <BeneficiaryRequestsDesktopTable
            requests={filteredRequests}
            isLoading={isLoading}
            onViewDetails={handleViewDetails}
          />
        </CardContent>
      </Card>

      {/* زر عائم للجوال */}
      <FloatingActionButton onClick={() => setIsDialogOpen(true)} />

      {/* مربعات الحوار */}
      <RequestSubmissionDialog 
        beneficiaryId={beneficiaryId}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />

      {selectedRequestId && (
        <RequestDetailsDialog
          requestId={selectedRequestId}
          isOpen={!!selectedRequestId}
          onClose={() => setSelectedRequestId(null)}
        />
      )}
    </div>
  );
}
