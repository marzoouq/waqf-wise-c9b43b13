import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { 
  ThumbsUp, 
  ThumbsDown, 
  Minus,
  Users,
  CheckCircle2
} from "lucide-react";
import { useGovernanceVoting } from "@/hooks/useGovernanceVoting";
import type { VoteType } from "@/types/governance";

interface VotingInterfaceProps {
  decisionId: string;
  canVote: boolean;
  votingCompleted: boolean;
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  totalVotes: number;
}

export function VotingInterface({ 
  decisionId,
  canVote,
  votingCompleted,
  votesFor,
  votesAgainst,
  votesAbstain,
  totalVotes
}: VotingInterfaceProps) {
  const { userVote, hasVoted, castVote } = useGovernanceVoting(decisionId);
  const [selectedVote, setSelectedVote] = useState<VoteType | null>(null);
  const [voteReason, setVoteReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVote = async () => {
    if (!selectedVote) return;
    
    setIsSubmitting(true);
    try {
      await castVote({ vote: selectedVote, reason: voteReason });
      setSelectedVote(null);
      setVoteReason("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const forPercentage = totalVotes > 0 ? (votesFor / totalVotes * 100).toFixed(1) : 0;
  const againstPercentage = totalVotes > 0 ? (votesAgainst / totalVotes * 100).toFixed(1) : 0;
  const abstainPercentage = totalVotes > 0 ? (votesAbstain / totalVotes * 100).toFixed(1) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            التصويت على القرار
          </span>
          {hasVoted && (
            <Badge variant="outline" className="bg-success-light">
              <CheckCircle2 className="h-4 w-4 ms-1" />
              صوّتَ بالفعل
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">حالة التصويت:</span>
          <Badge variant={votingCompleted ? "secondary" : "default"}>
            {votingCompleted ? "مغلق" : "مفتوح"}
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">إجمالي الأصوات</span>
            <span className="text-2xl font-bold">{totalVotes}</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <ThumbsUp className="h-4 w-4 text-success" />
                موافق
              </span>
              <span className="font-semibold">
                {votesFor} ({forPercentage}%)
              </span>
            </div>
            <Progress value={parseFloat(forPercentage.toString())} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <ThumbsDown className="h-4 w-4 text-destructive" />
                معارض
              </span>
              <span className="font-semibold">
                {votesAgainst} ({againstPercentage}%)
              </span>
            </div>
            <Progress value={parseFloat(againstPercentage.toString())} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Minus className="h-4 w-4 text-gray-600" />
                ممتنع
              </span>
              <span className="font-semibold">
                {votesAbstain} ({abstainPercentage}%)
              </span>
            </div>
            <Progress value={parseFloat(abstainPercentage.toString())} className="h-2" />
          </div>
        </div>

        {canVote && !hasVoted && !votingCompleted && (
          <div className="border-t pt-6 space-y-4">
            <h4 className="font-semibold">صوّت الآن</h4>
            
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant={selectedVote === 'موافق' ? 'default' : 'outline'}
                className="h-20 flex-col gap-2"
                onClick={() => setSelectedVote('موافق')}
              >
                <ThumbsUp className="h-6 w-6" />
                موافق
              </Button>
              
              <Button
                variant={selectedVote === 'معارض' ? 'destructive' : 'outline'}
                className="h-20 flex-col gap-2"
                onClick={() => setSelectedVote('معارض')}
              >
                <ThumbsDown className="h-6 w-6" />
                معارض
              </Button>
              
              <Button
                variant={selectedVote === 'ممتنع' ? 'secondary' : 'outline'}
                className="h-20 flex-col gap-2"
                onClick={() => setSelectedVote('ممتنع')}
              >
                <Minus className="h-6 w-6" />
                ممتنع
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">سبب التصويت (اختياري)</label>
              <Textarea
                value={voteReason}
                onChange={(e) => setVoteReason(e.target.value)}
                placeholder="يمكنك كتابة سبب اختيارك..."
                rows={3}
              />
            </div>

            <Button
              className="w-full"
              disabled={!selectedVote || isSubmitting}
              onClick={handleVote}
            >
              {isSubmitting ? "جاري التسجيل..." : "تأكيد التصويت"}
            </Button>
          </div>
        )}

        {hasVoted && userVote && (
          <div className="bg-success-light border border-success/30 rounded-lg p-4">
            <p className="text-sm font-medium text-success">
              ✅ تم تسجيل صوتك بنجاح
            </p>
            <div className="mt-2">
              <p className="text-sm text-success/80 mt-2">
                السبب: {userVote.vote_reason}
              </p>
            </div>
          </div>
        )}

        {!canVote && (
          <div className="bg-warning-light border border-warning/30 rounded-lg p-4">
            <p className="text-sm text-warning">
              ℹ️ ليس لديك صلاحية التصويت على هذا القرار
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
