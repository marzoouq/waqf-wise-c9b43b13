import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Vote, 
  Clock, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  Users,
  ChevronLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGovernanceDecisions } from "@/hooks/useGovernanceDecisions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function GovernanceSection() {
  const navigate = useNavigate();
  const { decisions, isLoading } = useGovernanceDecisions();

  // حساب إحصائيات سريعة
  const activeDecisions = (decisions as any[]).filter(d => 
    d.decision_status === 'قيد التصويت'
  ).length;
  
  const pendingVotes = (decisions as any[]).filter(d => 
    d.decision_status === 'قيد التصويت' && !d.voting_completed
  ).length;

  // جلب آخر القرارات النشطة
  const { data: recentDecisions = [] } = useQuery({
    queryKey: ["recent-governance-decisions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("governance_decisions")
        .select("*")
        .eq("decision_status", "قيد التصويت")
        .order("created_at", { ascending: false })
        .limit(3);
      return data || [];
    },
  });

  const stats = [
    { 
      label: "قرارات نشطة", 
      value: activeDecisions, 
      icon: Vote,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    { 
      label: "بانتظار التصويت", 
      value: pendingVotes, 
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Vote className="h-5 w-5 text-primary" />
            الحوكمة والقرارات
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/governance/decisions")}
          >
            عرض الكل
            <ChevronLeft className="h-4 w-4 mr-2" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* الإحصائيات السريعة */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.label}
                className={`${stat.bg} rounded-lg p-4 border border-border/50`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* آخر القرارات */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">آخر القرارات النشطة</h4>
          {recentDecisions.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">
              <Vote className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>لا توجد قرارات نشطة حالياً</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentDecisions.map((decision: any) => (
                <div 
                  key={decision.id}
                  className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/governance/decisions/${decision.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{decision.decision_title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {decision.decision_number}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {decision.total_votes || 0} صوت
                      </span>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 text-xs"
                  >
                    نشط
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* زر إنشاء قرار جديد */}
        <Button 
          className="w-full"
          onClick={() => navigate("/governance/decisions")}
        >
          <Vote className="h-4 w-4 ml-2" />
          إدارة القرارات والتصويت
        </Button>
      </CardContent>
    </Card>
  );
}
