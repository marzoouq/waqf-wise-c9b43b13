import { useState } from "react";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Building2, CreditCard, Shield, Settings, Link } from "lucide-react";
import { useIntegrationsData } from "@/hooks/system/useIntegrationsData";
import { IntegrationSettingsDialog } from "@/components/settings/IntegrationSettingsDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";

interface SelectedIntegration {
  id: string;
  type: "bank" | "payment" | "government";
  name: string;
  is_active: boolean;
  api_endpoint?: string;
  api_version?: string;
}

export default function IntegrationsManagement() {
  const queryClient = useQueryClient();
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<SelectedIntegration | null>(null);

  const { bankIntegrations, paymentGateways, governmentIntegrations } = useIntegrationsData();

  const handleOpenSettings = (integration: SelectedIntegration) => {
    setSelectedIntegration(integration);
    setSettingsDialogOpen(true);
  };

  const handleToggleIntegration = async (
    id: string,
    type: "bank" | "payment" | "government",
    currentStatus: boolean
  ) => {
    try {
      const tableName = type === "bank" 
        ? "bank_integrations" 
        : type === "payment" 
          ? "payment_gateways" 
          : "government_integrations";

      const { error } = await supabase
        .from(tableName)
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      // Invalidate queries
      const queryKey = type === "bank" 
        ? QUERY_KEYS.BANK_INTEGRATIONS 
        : type === "payment" 
          ? QUERY_KEYS.PAYMENT_GATEWAYS 
          : QUERY_KEYS.GOVERNMENT_INTEGRATIONS;

      queryClient.invalidateQueries({ queryKey });
      toast.success(`تم ${!currentStatus ? "تفعيل" : "تعطيل"} التكامل بنجاح`);
    } catch (error) {
      console.error("Error toggling integration:", error);
      toast.error("فشل في تحديث حالة التكامل");
    }
  };

  const handleUpdateIntegrations = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BANK_INTEGRATIONS });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PAYMENT_GATEWAYS });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GOVERNMENT_INTEGRATIONS });
  };

  return (
    <PageErrorBoundary pageName="التكاملات الخارجية">
      <MobileOptimizedLayout>
        <MobileOptimizedHeader
          title="التكاملات الخارجية"
          description="إدارة تكاملات البنوك والدفع والأنظمة الحكومية"
          icon={<Link className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />}
        />

        {/* تكاملات البنوك */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <CardTitle>تكاملات البنوك</CardTitle>
            </div>
            <CardDescription>ربط الحسابات البنكية للتحويلات والاستعلامات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bankIntegrations.map((bank) => (
                <div key={bank.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{bank.bank_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      التحويلات: {bank.supports_transfers ? "✓" : "✗"} | 
                      الاستعلام: {bank.supports_balance_inquiry ? "✓" : "✗"} | 
                      الكشوف: {bank.supports_statement ? "✓" : "✗"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={bank.is_active ? "default" : "secondary"}>
                      {bank.is_active ? "نشط" : "غير نشط"}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleOpenSettings({
                        id: bank.id,
                        type: "bank",
                        name: bank.bank_name,
                        is_active: bank.is_active ?? false,
                        api_endpoint: bank.api_endpoint ?? undefined,
                        api_version: bank.api_version ?? undefined,
                      })}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {bankIntegrations.length === 0 && (
                <p className="text-center text-muted-foreground py-4">لا توجد تكاملات بنكية</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* بوابات الدفع */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <CardTitle>بوابات الدفع</CardTitle>
            </div>
            <CardDescription>خدمات الدفع الإلكتروني</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {paymentGateways.map((gateway) => (
                <div key={gateway.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{gateway.gateway_name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant={gateway.is_active ? "default" : "secondary"}>
                        {gateway.is_active ? "نشط" : "غير نشط"}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleOpenSettings({
                          id: gateway.id,
                          type: "payment",
                          name: gateway.gateway_name,
                          is_active: gateway.is_active ?? false,
                        })}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {gateway.supported_methods.join(" • ")}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span>المعاملات: {gateway.total_transactions}</span>
                    {gateway.success_rate && (
                      <span>النجاح: {gateway.success_rate}%</span>
                    )}
                  </div>
                </div>
              ))}
              {paymentGateways.length === 0 && (
                <p className="text-center text-muted-foreground py-4 col-span-2">لا توجد بوابات دفع</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* التكامل الحكومي */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>التكامل الحكومي</CardTitle>
            </div>
            <CardDescription>الربط مع الأنظمة الحكومية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {governmentIntegrations.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{service.service_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      التزامن: {service.sync_frequency}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={service.is_active ? "default" : "secondary"}>
                      {service.is_active ? "نشط" : "غير نشط"}
                    </Badge>
                    <Switch 
                      checked={service.is_active ?? false} 
                      onCheckedChange={() => handleToggleIntegration(service.id, "government", service.is_active ?? false)}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleOpenSettings({
                        id: service.id,
                        type: "government",
                        name: service.service_name,
                        is_active: service.is_active ?? false,
                      })}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {governmentIntegrations.length === 0 && (
                <p className="text-center text-muted-foreground py-4">لا توجد تكاملات حكومية</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Settings Dialog */}
        <IntegrationSettingsDialog
          open={settingsDialogOpen}
          onOpenChange={setSettingsDialogOpen}
          integration={selectedIntegration}
          onUpdate={handleUpdateIntegrations}
        />
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
}
