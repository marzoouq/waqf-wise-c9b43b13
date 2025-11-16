import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { LoadingState } from "@/components/shared/LoadingState";
import { VotingInterface } from "@/components/governance/VotingInterface";
import { EligibleVotersList } from "@/components/governance/EligibleVotersList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, User, FileText } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import type { GovernanceDecision } from "@/types/governance";

export default function DecisionDetails() {
  const { id } = useParams();

  const { data: decision, isLoading } = useQuery({
    queryKey: ["governance-decision", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("governance_decisions")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data as GovernanceDecision;
    },
    enabled: !!id,
  });

  if (isLoading) return <LoadingState message="جاري تحميل تفاصيل القرار..." />;

  if (!decision) {
    return (
      <MobileOptimizedLayout>
        <MobileOptimizedHeader title="خطأ" showBack />
        <div className="p-4 text-center"><p className="text-muted-foreground">القرار غير موجود</p></div>
      </MobileOptimizedLayout>
    );
  }

  const statusColors: Record<string, string> = {
    'قيد التصويت': 'bg-blue-500/10 text-blue-700 border-blue-200',
    'معتمد': 'bg-green-500/10 text-green-700 border-green-200',
    'مرفوض': 'bg-red-500/10 text-red-700 border-red-200',
    'قيد التنفيذ': 'bg-amber-500/10 text-amber-700 border-amber-200',
    'منفذ': 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
    'ملغي': 'bg-gray-500/10 text-gray-700 border-gray-200',
  };

  return (
    <MobileOptimizedLayout>
      <MobileOptimizedHeader title="تفاصيل القرار" showBack />
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
              <VotingInterface decision={decision} canVote={true} />
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
  );
}
