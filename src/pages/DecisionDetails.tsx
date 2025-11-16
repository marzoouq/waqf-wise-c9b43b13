import { useParams, useNavigate } from "react-router-dom";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Edit, Trash2, CheckCircle2, XCircle, Users, Calendar, FileText } from "lucide-react";
import { VotingInterface } from "@/components/governance/VotingInterface";
import { useGovernanceDecisions } from "@/hooks/useGovernanceDecisions";
import { useGovernanceVoting } from "@/hooks/useGovernanceVoting";
import { useAuth } from "@/hooks/useAuth";
import { LoadingState } from "@/components/shared/LoadingState";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function DecisionDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isClosing, setIsClosing] = useState(false);
  
  const { decisions, closeVoting } = useGovernanceDecisions();
  const decision = decisions.find(d => d.id === id);
  const { votes } = useGovernanceVoting(id || '');

  if (!decision) {
    return (
      <MobileOptimizedLayout>
        <MobileOptimizedHeader title="تفاصيل القرار" />
        <div className="p-4">
          <LoadingState />
        </div>
      </MobileOptimizedLayout>
    );
  }

  const handleCloseVoting = async (status: 'معتمد' | 'مرفوض') => {
    if (!id) return;
    
    setIsClosing(true);
    try {
      await closeVoting({ decisionId: id, status });
      toast({
        title: "تم إغلاق التصويت",
        description: `تم تحديد حالة القرار إلى: ${status}`,
      });
    } catch (error) {
      toast({
        title: "حدث خطأ",
        description: "تعذر إغلاق التصويت",
        variant: "destructive",
      });
    } finally {
      setIsClosing(false);
    }
  };

  const canVote = true; // سيتم التحقق من RLS في الـ backend
  const isNazer = user?.role === 'nazer' || user?.role === 'admin';

  const percentage = decision.total_votes > 0 
    ? ((decision.votes_for / decision.total_votes) * 100).toFixed(1)
    : '0';
  const isPassed = parseFloat(percentage) >= decision.pass_threshold;

  return (
    <MobileOptimizedLayout>
      <MobileOptimizedHeader
        title="تفاصيل القرار"
        icon={
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/governance/decisions')}
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
        }
        actions={
          isNazer && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )
        }
      />

      <div className="p-4 space-y-4">
        {/* معلومات القرار الأساسية */}
        <Card>
          <CardHeader>
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">
                  {decision.decision_number}
                </span>
                <Badge variant={decision.decision_status === 'معتمد' ? 'default' : 'secondary'}>
                  {decision.decision_status}
                </Badge>
              </div>
              
              <CardTitle className="text-xl md:text-2xl">
                {decision.decision_title}
              </CardTitle>

              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(decision.decision_date), 'dd MMMM yyyy', { locale: ar })}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {decision.decision_type}
                </span>
                {decision.voting_participants_type !== 'nazer_only' && (
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {decision.voting_participants_type === 'board_only' && 'المجلس فقط'}
                    {decision.voting_participants_type === 'first_class_beneficiaries' && 'الفئة الأولى'}
                    {decision.voting_participants_type === 'board_and_beneficiaries' && 'المجلس + المستفيدين'}
                    {decision.voting_participants_type === 'custom' && 'اختيار مخصص'}
                  </span>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">نص القرار</h4>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {decision.decision_text}
              </p>
            </div>

            {decision.notes && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">ملاحظات</h4>
                  <p className="text-muted-foreground text-sm">
                    {decision.notes}
                  </p>
                </div>
              </>
            )}

            {decision.responsible_person_name && (
              <>
                <Separator />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">المسؤول عن التنفيذ:</span>
                    <p className="font-semibold mt-1">{decision.responsible_person_name}</p>
                  </div>
                  {decision.implementation_deadline && (
                    <div>
                      <span className="text-muted-foreground">موعد التنفيذ:</span>
                      <p className="font-semibold mt-1">
                        {format(new Date(decision.implementation_deadline), 'dd MMMM yyyy', { locale: ar })}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* نظام التصويت */}
        {decision.requires_voting && decision.voting_participants_type !== 'nazer_only' && (
          <VotingInterface
            decisionId={decision.id}
            canVote={canVote}
            votingCompleted={decision.voting_completed}
            votesFor={decision.votes_for}
            votesAgainst={decision.votes_against}
            votesAbstain={decision.votes_abstain}
            totalVotes={decision.total_votes}
          />
        )}

        {/* نتيجة التصويت */}
        {decision.total_votes > 0 && !decision.voting_completed && (
          <Card className={isPassed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">
                    {isPassed ? '✅ القرار في طريقه للقبول' : '❌ القرار في طريقه للرفض'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    نسبة الموافقة الحالية: {percentage}% (المطلوب: {decision.pass_threshold}%)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* إدارة القرار (للناظر) */}
        {isNazer && !decision.voting_completed && decision.total_votes > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">إدارة التصويت</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                يمكنك إغلاق التصويت واعتماد القرار أو رفضه
              </p>
              <div className="flex gap-2">
                <Button
                  className="flex-1 gap-2"
                  disabled={isClosing}
                  onClick={() => handleCloseVoting('معتمد')}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  اعتماد القرار
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 gap-2"
                  disabled={isClosing}
                  onClick={() => handleCloseVoting('مرفوض')}
                >
                  <XCircle className="h-4 w-4" />
                  رفض القرار
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* قائمة المصوتين (للناظر) */}
        {isNazer && votes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">سجل الأصوات ({votes.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {votes.map((vote) => (
                  <div
                    key={vote.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex-1">
                      <p className="font-semibold">{vote.voter_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {vote.voter_type === 'beneficiary' && 'مستفيد'}
                        {vote.voter_type === 'board_member' && 'عضو مجلس'}
                        {vote.voter_type === 'nazer' && 'ناظر'}
                      </p>
                    </div>
                    <Badge
                      variant={
                        vote.vote === 'موافق' 
                          ? 'default' 
                          : vote.vote === 'معارض' 
                          ? 'destructive' 
                          : 'secondary'
                      }
                    >
                      {vote.vote}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MobileOptimizedLayout>
  );
}
