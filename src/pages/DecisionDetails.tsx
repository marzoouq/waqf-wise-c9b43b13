import { useParams, useNavigate } from "react-router-dom";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { LoadingState } from "@/components/shared/LoadingState";
import { VotingInterface } from "@/components/governance/VotingInterface";
import { EligibleVotersList } from "@/components/governance/EligibleVotersList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, User, FileText, ArrowRight } from "lucide-react";
import { format, arLocale as ar } from "@/lib/date";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { useGovernanceDecisionDetails } from "@/hooks/governance/useGovernanceDecisionDetails";

export default function DecisionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { decision, isLoading } = useGovernanceDecisionDetails(id);

  if (isLoading) return <LoadingState message="جاري تحميل تفاصيل القرار..." />;

  if (!decision) {
    return (
      <MobileOptimizedLayout>
        <MobileOptimizedHeader 
          title="خطأ"
          actions={
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowRight className="h-4 w-4 ml-2" />
              رجوع
            </Button>
          }
        />
        <div className="p-4 text-center"><p className="text-muted-foreground">القرار غير موجود</p></div>
      </MobileOptimizedLayout>
    );
  }

  const statusColors: Record<string, string> = {
    'قيد التصويت': 'bg-info-light text-info border-info/20',
    'معتمد': 'bg-success-light text-success border-success/20',
    'مرفوض': 'bg-destructive-light text-destructive border-destructive/20',
    'قيد التنفيذ': 'bg-warning-light text-warning border-warning/20',
    'منفذ': 'bg-success-light text-success border-success/20',
    'ملغي': 'bg-muted text-muted-foreground border-border',
  };

  return (
    <PageErrorBoundary pageName="تفاصيل القرار">
      <MobileOptimizedLayout>
      <MobileOptimizedHeader 
        title="تفاصيل القرار"
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowRight className="h-4 w-4 ml-2" />
            رجوع
          </Button>
        }
      />
      <div className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Badge variant="outline" className="mb-2">{decision.decision_number}</Badge>
                <CardTitle className="text-xl">{decision.decision_title}</CardTitle>
              </div>
              <Badge className={statusColors[decision.decision_status]}>{decision.decision_status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground/80 whitespace-pre-wrap">{decision.decision_text}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">التاريخ:</span>
                <span className="font-medium">{format(new Date(decision.decision_date), 'dd MMMM yyyy', { locale: ar })}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">النوع:</span>
                <span className="font-medium">{decision.decision_type}</span>
              </div>
              {decision.responsible_person_name && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">المسؤول:</span>
                  <span className="font-medium">{decision.responsible_person_name}</span>
                </div>
              )}
            </div>
            {decision.notes && (
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">ملاحظات:</p>
                <p className="text-sm text-muted-foreground">{decision.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="voting" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="voting">التصويت</TabsTrigger>
            <TabsTrigger value="voters">المصوتون</TabsTrigger>
          </TabsList>
          <TabsContent value="voting" className="mt-4">
            {decision.requires_voting ? (
              <VotingInterface 
                decisionId={decision.id}
                canVote={true}
                votingCompleted={decision.voting_completed}
                votesFor={decision.votes_for}
                votesAgainst={decision.votes_against}
                votesAbstain={decision.votes_abstain}
                totalVotes={decision.total_votes}
              />
            ) : (
              <Card><CardContent className="py-8 text-center"><p className="text-muted-foreground">هذا قرار مباشر من الناظر ولا يحتاج إلى تصويت</p></CardContent></Card>
            )}
          </TabsContent>
          <TabsContent value="voters" className="mt-4">
            <EligibleVotersList decision={decision} />
          </TabsContent>
        </Tabs>
      </div>
    </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
}
