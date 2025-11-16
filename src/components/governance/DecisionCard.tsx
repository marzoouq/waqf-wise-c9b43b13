import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Users, 
  ThumbsUp, 
  ThumbsDown, 
  Minus,
  ChevronLeft,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import type { GovernanceDecision } from "@/types/governance";

interface DecisionCardProps {
  decision: GovernanceDecision;
}

const statusColors: Record<string, string> = {
  'قيد التصويت': 'bg-blue-500/10 text-blue-700 border-blue-200',
  'معتمد': 'bg-green-500/10 text-green-700 border-green-200',
  'مرفوض': 'bg-red-500/10 text-red-700 border-red-200',
  'قيد التنفيذ': 'bg-amber-500/10 text-amber-700 border-amber-200',
  'منفذ': 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
  'ملغي': 'bg-gray-500/10 text-gray-700 border-gray-200',
};

const votingTypeLabels: Record<string, string> = {
  'board_only': 'أعضاء المجلس',
  'first_class_beneficiaries': 'المستفيدين - الفئة الأولى',
  'board_and_beneficiaries': 'المجلس + المستفيدين',
  'custom': 'اختيار مخصص',
  'nazer_only': 'الناظر فقط',
};

export function DecisionCard({ decision }: DecisionCardProps) {
  const navigate = useNavigate();

  const totalVotes = decision.total_votes || 0;
  const forPercentage = totalVotes > 0 ? (decision.votes_for / totalVotes * 100) : 0;
  const againstPercentage = totalVotes > 0 ? (decision.votes_against / totalVotes * 100) : 0;
  const abstainPercentage = totalVotes > 0 ? (decision.votes_abstain / totalVotes * 100) : 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {decision.decision_number}
              </Badge>
              <Badge className={statusColors[decision.decision_status]}>
                {decision.decision_status}
              </Badge>
            </div>
            <h3 className="font-bold text-lg mb-1 line-clamp-2">
              {decision.decision_title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {decision.decision_text}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* معلومات التصويت */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(decision.decision_date), 'dd MMM yyyy', { locale: ar })}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{votingTypeLabels[decision.voting_participants_type]}</span>
          </div>
        </div>

        {/* نتائج التصويت */}
        {decision.requires_voting && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">إجمالي الأصوات</span>
              <span className="font-bold">{totalVotes}</span>
            </div>

            {/* شريط موافق */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3 text-green-600" />
                  موافق
                </span>
                <span className="font-semibold">{decision.votes_for} ({forPercentage.toFixed(0)}%)</span>
              </div>
              <Progress value={forPercentage} className="h-1.5" />
            </div>

            {/* شريط معارض */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                  <ThumbsDown className="h-3 w-3 text-red-600" />
                  معارض
                </span>
                <span className="font-semibold">{decision.votes_against} ({againstPercentage.toFixed(0)}%)</span>
              </div>
              <Progress value={againstPercentage} className="h-1.5" />
            </div>

            {/* شريط ممتنع */}
            {decision.votes_abstain > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1">
                    <Minus className="h-3 w-3 text-gray-600" />
                    ممتنع
                  </span>
                  <span className="font-semibold">{decision.votes_abstain} ({abstainPercentage.toFixed(0)}%)</span>
                </div>
                <Progress value={abstainPercentage} className="h-1.5" />
              </div>
            )}
          </div>
        )}

        {/* زر التفاصيل */}
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => navigate(`/governance/decisions/${decision.id}`)}
        >
          عرض التفاصيل والتصويت
          <ChevronLeft className="h-4 w-4 mr-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
