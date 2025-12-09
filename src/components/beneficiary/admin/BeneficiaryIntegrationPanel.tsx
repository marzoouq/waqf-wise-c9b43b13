import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, DollarSign, FileArchive, Home, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BeneficiaryIntegrationPanelProps {
  beneficiaryId: string;
}

export function BeneficiaryIntegrationPanel({ beneficiaryId }: BeneficiaryIntegrationPanelProps) {
  const navigate = useNavigate();

  // Get beneficiary statistics
  const { data: stats } = useQuery({
    queryKey: ["beneficiary-integration-stats", beneficiaryId],
    queryFn: async () => {
      // Get payments count
      const { count: paymentsCount } = await supabase
        .from("payments")
        .select("*", { count: "exact", head: true })
        .eq("beneficiary_id", beneficiaryId);

      // Get documents count
      const { count: documentsCount } = await supabase
        .from("beneficiary_attachments")
        .select("*", { count: "exact", head: true })
        .eq("beneficiary_id", beneficiaryId);

      // Get requests count
      const { count: requestsCount } = await supabase
        .from("beneficiary_requests")
        .select("*", { count: "exact", head: true })
        .eq("beneficiary_id", beneficiaryId);

      // Get active requests count
      const { count: activeRequestsCount } = await supabase
        .from("beneficiary_requests")
        .select("*", { count: "exact", head: true })
        .eq("beneficiary_id", beneficiaryId)
        .in("status", ["معلق", "قيد المعالجة", "قيد المراجعة"]);

      // Get family info
      const { data: beneficiary } = await supabase
        .from("beneficiaries")
        .select("family_name, is_head_of_family")
        .eq("id", beneficiaryId)
        .maybeSingle();

      return {
        paymentsCount: paymentsCount || 0,
        documentsCount: documentsCount || 0,
        requestsCount: requestsCount || 0,
        activeRequestsCount: activeRequestsCount || 0,
        familyName: beneficiary?.family_name || null,
        isHeadOfFamily: beneficiary?.is_head_of_family || false,
      };
    },
    staleTime: 30 * 1000,
  });

  const integrations = [
    {
      title: "المدفوعات",
      description: "عرض سجل المدفوعات والتوزيعات",
      icon: DollarSign,
      count: stats?.paymentsCount || 0,
      onClick: () => navigate(`/payments?beneficiary=${beneficiaryId}`),
      color: "text-success",
    },
    {
      title: "الطلبات",
      description: "عرض طلبات المستفيد وحالتها",
      icon: AlertCircle,
      count: stats?.requestsCount || 0,
      badge: stats?.activeRequestsCount ? { label: `${stats.activeRequestsCount} نشط`, variant: "destructive" as const } : undefined,
      onClick: () => navigate(`/requests?beneficiary=${beneficiaryId}`),
      color: "text-primary",
    },
    {
      title: "المستندات",
      description: "المرفقات والوثائق",
      icon: FileArchive,
      count: stats?.documentsCount || 0,
      onClick: () => navigate(`/archive?beneficiary=${beneficiaryId}`),
      color: "text-accent",
    },
    {
      title: "العائلة",
      description: stats?.familyName || "لا ينتمي لعائلة",
      icon: Home,
      count: stats?.isHeadOfFamily ? 1 : 0,
      badge: stats?.isHeadOfFamily ? { label: "رب الأسرة", variant: "default" as const } : undefined,
      onClick: () => stats?.familyName && navigate(`/families?search=${stats.familyName}`),
      color: "text-warning",
      disabled: !stats?.familyName,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          البيانات المرتبطة
        </CardTitle>
        <CardDescription>
          الوصول السريع لجميع بيانات المستفيد عبر الأنظمة
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {integrations.map((integration) => {
            const Icon = integration.icon;
            return (
              <Card
                key={integration.title}
                className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                  integration.disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={integration.disabled ? undefined : integration.onClick}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`rounded-lg bg-muted p-2 ${integration.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{integration.title}</h4>
                        {integration.badge && (
                          <Badge variant={integration.badge.variant} className="text-xs">
                            {integration.badge.label}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {integration.description}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {integration.count} {integration.title === "العائلة" ? "" : "عنصر"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
