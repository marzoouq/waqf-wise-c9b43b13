import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Vote, CheckCircle2, XCircle, Clock, FileText, Users } from "lucide-react";
import { CreateDecisionDialog } from "@/components/governance/CreateDecisionDialog";
import { useGovernanceDecisions } from "@/hooks/useGovernanceDecisions";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import type { GovernanceDecision } from "@/types/governance";

export default function GovernanceDecisions() {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { decisions, isLoading } = useGovernanceDecisions();

  const getStatusBadge = (decision: GovernanceDecision) => {
    const statusConfig = {
      'قيد التصويت': { variant: 'default' as const, icon: Clock },
      'معتمد': { variant: 'default' as const, icon: CheckCircle2 },
      'مرفوض': { variant: 'destructive' as const, icon: XCircle },
      'قيد التنفيذ': { variant: 'secondary' as const, icon: Clock },
      'منفذ': { variant: 'default' as const, icon: CheckCircle2 },
      'ملغي': { variant: 'outline' as const, icon: XCircle },
    };

    const config = statusConfig[decision.decision_status] || statusConfig['قيد التصويت'];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {decision.decision_status}
      </Badge>
    );
  };

  const getVotingTypeBadge = (type: GovernanceDecision['voting_participants_type']) => {
    const typeLabels = {
      'board_only': 'المجلس فقط',
      'first_class_beneficiaries': 'الفئة الأولى',
      'board_and_beneficiaries': 'المجلس + المستفيدين',
      'custom': 'اختيار مخصص',
      'nazer_only': 'قرار الناظر',
    };

    return (
      <Badge variant="outline" className="gap-1">
        <Users className="h-3 w-3" />
        {typeLabels[type]}
      </Badge>
    );
  };

  const DecisionCard = ({ decision }: { decision: GovernanceDecision }) => {
    const percentage = decision.total_votes > 0 
      ? ((decision.votes_for / decision.total_votes) * 100).toFixed(0)
      : 0;

    return (
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => navigate(`/governance/decisions/${decision.id}`)}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">
                  {decision.decision_number}
                </span>
                {getStatusBadge(decision)}
                {getVotingTypeBadge(decision.voting_participants_type)}
              </div>
              <CardTitle className="text-lg">{decision.decision_title}</CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {decision.decision_text}
              </p>
            </div>
            <Vote className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          </div>
        </CardHeader>
        
        {decision.requires_voting && decision.voting_participants_type !== 'nazer_only' && (
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">نتائج التصويت</span>
                <span className="font-semibold">
                  {decision.total_votes} صوت
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-green-600">
                    {decision.votes_for}
                  </div>
                  <div className="text-xs text-muted-foreground">موافق</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-red-600">
                    {decision.votes_against}
                  </div>
                  <div className="text-xs text-muted-foreground">معارض</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-gray-600">
                    {decision.votes_abstain}
                  </div>
                  <div className="text-xs text-muted-foreground">ممتنع</div>
                </div>
              </div>

              {decision.total_votes > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-green-600 h-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="font-semibold text-green-600">{percentage}%</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                <span>
                  📅 {format(new Date(decision.decision_date), 'dd MMMM yyyy', { locale: ar })}
                </span>
                {decision.voting_completed && (
                  <Badge variant="secondary" className="text-xs">
                    مغلق
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  const activeDecisions = decisions.filter(d => d.decision_status === 'قيد التصويت');
  const approvedDecisions = decisions.filter(d => d.decision_status === 'معتمد');
  const completedDecisions = decisions.filter(d => ['منفذ', 'قيد التنفيذ'].includes(d.decision_status));
  const rejectedDecisions = decisions.filter(d => ['مرفوض', 'ملغي'].includes(d.decision_status));

  if (isLoading) {
    return (
      <MobileOptimizedLayout>
        <MobileOptimizedHeader title="القرارات والتصويت" />
        <div className="p-4">
          <LoadingState />
        </div>
      </MobileOptimizedLayout>
    );
  }

  return (
    <MobileOptimizedLayout>
      <MobileOptimizedHeader
        title="القرارات والتصويت"
        description={`${decisions.length} قرار`}
        icon={<Vote className="h-6 w-6" />}
        actions={
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">قرار جديد</span>
          </Button>
        }
      />

      <div className="p-4 space-y-4">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="w-full grid grid-cols-4 mb-4">
            <TabsTrigger value="active" className="gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">النشطة</span>
              <span className="sm:hidden">نشط</span>
              {activeDecisions.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeDecisions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span className="hidden sm:inline">المعتمدة</span>
              <span className="sm:hidden">معتمد</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">المنفذة</span>
              <span className="sm:hidden">منفذ</span>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2">
              <XCircle className="h-4 w-4" />
              <span className="hidden sm:inline">المرفوضة</span>
              <span className="sm:hidden">مرفوض</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeDecisions.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="لا توجد قرارات نشطة"
                description="القرارات قيد التصويت ستظهر هنا"
              />
            ) : (
              activeDecisions.map(decision => (
                <DecisionCard key={decision.id} decision={decision as any} />
              ))
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedDecisions.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="لا توجد قرارات معتمدة"
                description="القرارات المعتمدة ستظهر هنا"
              />
            ) : (
              approvedDecisions.map(decision => (
                <DecisionCard key={decision.id} decision={decision as any} />
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedDecisions.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="لا توجد قرارات منفذة"
                description="القرارات المنفذة ستظهر هنا"
              />
            ) : (
              completedDecisions.map(decision => (
                <DecisionCard key={decision.id} decision={decision as any} />
              ))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedDecisions.length === 0 ? (
              <EmptyState
                icon={XCircle}
                title="لا توجد قرارات مرفوضة"
                description="القرارات المرفوضة ستظهر هنا"
              />
            ) : (
              rejectedDecisions.map(decision => (
                <DecisionCard key={decision.id} decision={decision as any} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <CreateDecisionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </MobileOptimizedLayout>
  );
}
