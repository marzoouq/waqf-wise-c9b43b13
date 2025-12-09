import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, DollarSign, FileArchive, Home, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useBeneficiaryIntegrationStats } from "@/hooks/beneficiary/useBeneficiaryProfileData";

interface BeneficiaryIntegrationPanelProps {
  beneficiaryId: string;
}

export function BeneficiaryIntegrationPanel({ beneficiaryId }: BeneficiaryIntegrationPanelProps) {
  const navigate = useNavigate();

  const { data: stats } = useBeneficiaryIntegrationStats(beneficiaryId);

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
