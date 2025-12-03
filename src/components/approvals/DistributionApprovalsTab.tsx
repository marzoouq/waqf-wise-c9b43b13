import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Eye, Lock } from "lucide-react";
import { format, arLocale as ar } from "@/lib/date";
import { useState } from "react";
import { ApprovalFlowDialog } from "@/components/funds/ApprovalFlowDialog";
import { DistributionForApproval, calculateProgress, StatusConfigMap } from "@/types/approvals";
import { useApprovalPermissions } from "@/hooks/useApprovalPermissions";
import { useToast } from "@/hooks/use-toast";

export function DistributionApprovalsTab() {
  const [selectedDistribution, setSelectedDistribution] = useState<DistributionForApproval | null>(null);
  const [isFlowDialogOpen, setIsFlowDialogOpen] = useState(false);
  const { canApproveLevel, userRole } = useApprovalPermissions();
  const { toast } = useToast();

  const { data: distributions, isLoading } = useQuery<DistributionForApproval[]>({
    queryKey: ["distributions_with_approvals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("distributions")
        .select(`
          *,
          distribution_approvals(*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as DistributionForApproval[];
    },
  });

  const getStatusBadge = (status: string) => {
    const config: StatusConfigMap = {
      "معلق": { label: "معلق", variant: "secondary", icon: Clock },
      "معتمد": { label: "معتمد", variant: "default", icon: CheckCircle },
      "مرفوض": { label: "مرفوض", variant: "destructive", icon: XCircle },
    };
    const c = config[status] || config["معلق"];
    const Icon = c.icon;
    return (
      <Badge variant={c.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {c.label}
      </Badge>
    );
  };

  const getApprovalProgress = (approvals: Array<{ status: string }> | undefined) => {
    const total = 3;
    const approved = approvals?.filter((a) => a.status === "موافق").length || 0;
    return `${approved}/${total}`;
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {distributions?.map((dist) => (
          <Card key={dist.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">توزيع شهر {dist.month}</CardTitle>
                {getStatusBadge(dist.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">المبلغ الإجمالي</p>
                  <p className="text-lg font-semibold">
                    {dist.total_amount?.toLocaleString("ar-SA")} ريال
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">عدد المستفيدين</p>
                  <p className="text-lg font-semibold">{dist.beneficiaries_count}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ التوزيع</p>
                  <p className="text-lg font-semibold">
                    {format(new Date(dist.distribution_date), "dd MMM yyyy", { locale: ar })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">تقدم الموافقات</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold">
                      {getApprovalProgress(dist.distribution_approvals)}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedDistribution(dist);
                          setIsFlowDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 ml-1" />
                        عرض التفاصيل
                      </Button>
                      {userRole && (
                        <Badge variant="outline" className="text-xs">
                          <Lock className="h-3 w-3 ml-1" />
                          {userRole === 'nazer' ? 'ناظر' : userRole === 'accountant' ? 'محاسب' : userRole}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {distributions?.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد توزيعات بحاجة للموافقة</p>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedDistribution && (
        <ApprovalFlowDialog
          open={isFlowDialogOpen}
          onOpenChange={setIsFlowDialogOpen}
          distributionId={selectedDistribution.id}
          distributionMonth={selectedDistribution.month}
          distributionAmount={selectedDistribution.total_amount}
        />
      )}
    </>
  );
}