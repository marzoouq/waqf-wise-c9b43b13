import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle2, XCircle, Clock, Users } from "lucide-react";
import type { GovernanceDecision } from "@/types/governance";
import { LoadingState } from "@/components/shared/LoadingState";
import { Json } from "@/integrations/supabase/types";

interface EligibleVoter {
  id: string;
  name: string;
  type: 'board_member' | 'beneficiary' | 'nazer';
  hasVoted?: boolean;
  vote?: 'approve' | 'reject' | 'abstain';
}

interface EligibleVotersListProps {
  decision: { 
    id: string; 
    voting_participants_type: string; 
    custom_voters?: Json | null;
    [key: string]: unknown;
  };
}

export function EligibleVotersList({ decision }: EligibleVotersListProps) {
  const { data: voters = [], isLoading } = useQuery({
    queryKey: ["eligible-voters", decision.id],
    queryFn: async () => {
      let eligibleVoters: EligibleVoter[] = [];

      // حسب نوع المصوتين
      switch (decision.voting_participants_type) {
        case 'board_only':
          // جلب المسؤولين والنظار فقط (بدون joins معقدة)
          const { data: boardUsers } = await supabase
            .from("user_roles")
            .select("user_id")
            .in("role", ["admin", "nazer"]);
          
          if (boardUsers) {
          eligibleVoters = boardUsers.map(u => ({
            id: u.user_id,
            name: 'عضو مجلس',
            type: 'board_member' as const
          }));
          }
          break;

        case 'first_class_beneficiaries':
          const { data: beneficiaries } = await supabase
            .from("beneficiaries")
            .select("id, full_name, user_id")
            .eq("category", "الفئة الأولى")
            .eq("can_login", true);
          eligibleVoters = beneficiaries?.map(b => ({
            id: b.user_id,
            name: b.full_name,
            type: 'beneficiary' as const
          })) || [];
          break;

        case 'board_and_beneficiaries':
          const { data: boardUsers2 } = await supabase
            .from("user_roles")
            .select("user_id")
            .in("role", ["admin", "nazer"]);
          const { data: beneficiaries2 } = await supabase
            .from("beneficiaries")
            .select("id, full_name, user_id")
            .eq("category", "الفئة الأولى")
            .eq("can_login", true);
          
          eligibleVoters = [
            ...(boardUsers2?.map(u => ({
              id: u.user_id,
              name: 'عضو مجلس',
              type: 'board_member' as const
            })) || []),
            ...(beneficiaries2?.map(b => ({
              id: b.user_id,
              name: b.full_name,
              type: 'beneficiary' as const
            })) || [])
          ];
          break;

        case 'custom':
          // Type assertion for custom_voters from Json to EligibleVoter[]
          eligibleVoters = (decision.custom_voters as unknown as EligibleVoter[] | null) || [];
          break;

        case 'nazer_only':
          // الناظر فقط
          const { data: nazerUser } = await supabase
            .from("user_roles")
            .select("user_id")
            .eq("role", "nazer")
            .limit(1)
            .maybeSingle();
          if (nazerUser) {
            eligibleVoters = [{
              id: nazerUser.user_id,
              name: 'الناظر',
              type: 'nazer' as const
            }];
          }
          break;
      }

      // جلب من صوّت
      const { data: votes } = await supabase
        .from("governance_votes")
        .select("voter_id, vote")
        .eq("decision_id", decision.id);

      // دمج البيانات
      return eligibleVoters.map(voter => {
        const vote = votes?.find(v => v.voter_id === voter.id);
        return {
          ...voter,
          hasVoted: !!vote,
          vote: vote?.vote
        };
      });
    },
    enabled: !!decision.id,
  });

  if (isLoading) {
    return <LoadingState message="جاري تحميل المصوتين..." />;
  }

  const votedCount = voters.filter(v => v.hasVoted).length;
  const totalCount = voters.length;
  const votedPercentage = totalCount > 0 ? (votedCount / totalCount * 100).toFixed(0) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            المصوتون المؤهلون
          </span>
          <Badge variant="secondary">
            {votedCount} / {totalCount} ({votedPercentage}%)
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {voters.map((voter) => (
            <div 
              key={voter.id} 
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {voter.name?.charAt(0) || "؟"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{voter.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {voter.type === 'board_member' && 'عضو مجلس'}
                    {voter.type === 'beneficiary' && 'مستفيد'}
                    {voter.type === 'nazer' && 'ناظر'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {voter.hasVoted ? (
                  <>
                    <Badge 
                      variant="outline" 
                      className={
                        voter.vote === 'موافق' 
                          ? 'bg-success-light text-success border-success/30' 
                          : voter.vote === 'معارض'
                          ? 'bg-destructive-light text-destructive border-destructive/30'
                          : 'bg-muted text-muted-foreground border-border'
                      }
                    >
                      {voter.vote}
                    </Badge>
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </>
                ) : (
                  <>
                    <Badge variant="outline" className="bg-warning-light text-warning border-warning/30">
                      لم يصوت
                    </Badge>
                    <Clock className="h-5 w-5 text-warning" />
                  </>
                )}
              </div>
            </div>
          ))}

          {voters.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>لا يوجد مصوتون مؤهلون</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
