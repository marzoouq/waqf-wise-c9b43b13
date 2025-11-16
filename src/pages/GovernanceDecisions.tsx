import { useState } from "react";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Vote } from "lucide-react";
import { CreateDecisionDialog } from "@/components/governance/CreateDecisionDialog";
import { DecisionCard } from "@/components/governance/DecisionCard";
import { useGovernanceDecisions } from "@/hooks/useGovernanceDecisions";
import { LoadingState } from "@/components/shared/LoadingState";
import { EnhancedEmptyState } from "@/components/shared/EnhancedEmptyState";

export default function GovernanceDecisions() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { decisions, isLoading } = useGovernanceDecisions();

  const activeDecisions = decisions.filter(d => 
    d.decision_status === 'قيد التصويت' || d.decision_status === 'قيد التنفيذ'
  );
  const completedDecisions = decisions.filter(d => 
    d.decision_status === 'معتمد' || d.decision_status === 'منفذ'
  );
  const rejectedDecisions = decisions.filter(d => 
    d.decision_status === 'مرفوض' || d.decision_status === 'ملغي'
  );

  return (
    <MobileOptimizedLayout>
      <MobileOptimizedHeader
        title="القرارات والتصويت"
        actions={
          <Button onClick={() => setDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 ml-2" />
            قرار جديد
          </Button>
        }
      />

      <div className="p-4">
        {isLoading ? (
          <LoadingState message="جاري تحميل القرارات..." />
        ) : decisions.length === 0 ? (
          <EnhancedEmptyState 
            icon={Vote}
            title="لا توجد قرارات"
            description="ابدأ بإنشاء قرار جديد وحدد من له حق التصويت"
            action={{
              label: "إنشاء قرار جديد",
              onClick: () => setDialogOpen(true)
            }}
          />
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">نشطة ({activeDecisions.length})</TabsTrigger>
              <TabsTrigger value="completed">منفذة ({completedDecisions.length})</TabsTrigger>
              <TabsTrigger value="rejected">مرفوضة ({rejectedDecisions.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="mt-4 space-y-4">
              {activeDecisions.length === 0 ? (
                <EnhancedEmptyState icon={Vote} title="لا توجد قرارات نشطة" description="القرارات النشطة ستظهر هنا" />
              ) : (
                activeDecisions.map(decision => <DecisionCard key={decision.id} decision={decision} />)
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="mt-4 space-y-4">
              {completedDecisions.length === 0 ? (
                <EnhancedEmptyState icon={Vote} title="لا توجد قرارات منفذة" description="القرارات المنفذة ستظهر هنا" />
              ) : (
                completedDecisions.map(decision => <DecisionCard key={decision.id} decision={decision} />)
              )}
            </TabsContent>
            
            <TabsContent value="rejected" className="mt-4 space-y-4">
              {rejectedDecisions.length === 0 ? (
                <EnhancedEmptyState icon={Vote} title="لا توجد قرارات مرفوضة" description="القرارات المرفوضة ستظهر هنا" />
              ) : (
                rejectedDecisions.map(decision => <DecisionCard key={decision.id} decision={decision} />)
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <CreateDecisionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </MobileOptimizedLayout>
  );
}
