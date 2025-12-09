import { useEligibleVoters } from "@/hooks/governance/useGovernanceData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle2, XCircle, Clock, Users } from "lucide-react";
import { LoadingState } from "@/components/shared/LoadingState";
import { Json } from "@/integrations/supabase/types";

interface EligibleVotersListProps {
  decision: { 
    id: string; 
    voting_participants_type: string; 
    custom_voters?: Json | null;
    [key: string]: unknown;
  };
}

export function EligibleVotersList({ decision }: EligibleVotersListProps) {
  const { data: voters = [], isLoading } = useEligibleVoters(decision);

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
