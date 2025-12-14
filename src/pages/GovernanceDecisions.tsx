import { useState } from "react";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Vote } from "lucide-react";
import { CreateDecisionDialog } from "@/components/governance/CreateDecisionDialog";
import { DecisionCard } from "@/components/governance/DecisionCard";
import { useGovernanceDecisionsPaginated } from "@/hooks/governance/useGovernanceDecisionsPaginated";
import { LoadingState } from "@/components/shared/LoadingState";
import { EnhancedEmptyState } from "@/components/shared";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Database } from "@/integrations/supabase/types";
import type { GovernanceDecision } from "@/types/governance";
import { useAuth } from "@/hooks/useAuth";
import { PAGE_SIZE_OPTIONS } from "@/lib/pagination.types";

type GovernanceDecisionRow = Database['public']['Tables']['governance_decisions']['Row'];

export default function GovernanceDecisions() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const { roles } = useAuth();
  
  const { 
    decisions, 
    isLoading, 
    error, 
    pagination,
    goToPage,
    nextPage,
    prevPage,
    changePageSize,
    canGoNext,
    canGoPrev,
  } = useGovernanceDecisionsPaginated();

  // فقط admin و nazer يمكنهم إنشاء قرارات
  const canCreateDecision = roles.includes('admin') || roles.includes('nazer');

  const typedDecisions = decisions as GovernanceDecisionRow[];
  
  // فلترة القرارات حسب الحالة بعد جلبها
  const activeDecisions = typedDecisions.filter(d => 
    d.decision_status === 'قيد التصويت' || d.decision_status === 'قيد التنفيذ'
  );
  const completedDecisions = typedDecisions.filter(d => 
    d.decision_status === 'معتمد' || d.decision_status === 'منفذ'
  );
  const rejectedDecisions = typedDecisions.filter(d => 
    d.decision_status === 'مرفوض' || d.decision_status === 'ملغي'
  );

  // تحديد القرارات المعروضة حسب التبويب النشط
  const getDisplayedDecisions = () => {
    switch (activeTab) {
      case "active": return activeDecisions;
      case "completed": return completedDecisions;
      case "rejected": return rejectedDecisions;
      default: return activeDecisions;
    }
  };

  const displayedDecisions = getDisplayedDecisions();

  return (
    <PageErrorBoundary pageName="القرارات والتصويت">
      <MobileOptimizedLayout>
      <MobileOptimizedHeader
        title="القرارات والتصويت"
        actions={
          canCreateDecision ? (
            <Button onClick={() => setDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 ml-2" />
              قرار جديد
            </Button>
          ) : undefined
        }
      />

      <div className="p-4">
        {isLoading ? (
          <LoadingState message="جاري تحميل القرارات..." />
        ) : error ? (
          <EnhancedEmptyState 
            icon={Vote}
            title="خطأ في تحميل القرارات"
            description="حدث خطأ أثناء تحميل القرارات، يرجى المحاولة مرة أخرى"
            action={{
              label: "إعادة المحاولة",
              onClick: () => window.location.reload()
            }}
          />
        ) : decisions.length === 0 ? (
          <EnhancedEmptyState 
            icon={Vote}
            title="لا توجد قرارات"
            description={canCreateDecision ? "ابدأ بإنشاء قرار جديد وحدد من له حق التصويت" : "لا توجد قرارات حالياً"}
            action={canCreateDecision ? {
              label: "إنشاء قرار جديد",
              onClick: () => setDialogOpen(true)
            } : undefined}
          />
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="active">نشطة ({activeDecisions.length})</TabsTrigger>
                <TabsTrigger value="completed">منفذة ({completedDecisions.length})</TabsTrigger>
                <TabsTrigger value="rejected">مرفوضة ({rejectedDecisions.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="active" className="mt-4 space-y-4">
                {activeDecisions.length === 0 ? (
                  <EnhancedEmptyState icon={Vote} title="لا توجد قرارات نشطة" description="القرارات النشطة ستظهر هنا" />
                ) : (
                  activeDecisions.map(decision => <DecisionCard key={decision.id} decision={decision as unknown as GovernanceDecision} />)
                )}
              </TabsContent>
              
              <TabsContent value="completed" className="mt-4 space-y-4">
                {completedDecisions.length === 0 ? (
                  <EnhancedEmptyState icon={Vote} title="لا توجد قرارات منفذة" description="القرارات المنفذة ستظهر هنا" />
                ) : (
                  completedDecisions.map(decision => <DecisionCard key={decision.id} decision={decision as unknown as GovernanceDecision} />)
                )}
              </TabsContent>
              
              <TabsContent value="rejected" className="mt-4 space-y-4">
                {rejectedDecisions.length === 0 ? (
                  <EnhancedEmptyState icon={Vote} title="لا توجد قرارات مرفوضة" description="القرارات المرفوضة ستظهر هنا" />
                ) : (
                  rejectedDecisions.map(decision => <DecisionCard key={decision.id} decision={decision as unknown as GovernanceDecision} />)
                )}
              </TabsContent>
            </Tabs>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <PaginationControls
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalCount}
                pageSize={pagination.pageSize}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                startIndex={(pagination.page - 1) * pagination.pageSize + 1}
                endIndex={Math.min(pagination.page * pagination.pageSize, pagination.totalCount)}
                canGoNext={canGoNext}
                canGoPrev={canGoPrev}
                onPageChange={goToPage}
                onPageSizeChange={changePageSize}
                onNext={nextPage}
                onPrev={prevPage}
                onFirst={() => goToPage(1)}
                onLast={() => goToPage(pagination.totalPages)}
                className="mt-4 rounded-lg border"
              />
            )}
          </>
        )}
      </div>

      {canCreateDecision && (
        <CreateDecisionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      )}
    </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
}
