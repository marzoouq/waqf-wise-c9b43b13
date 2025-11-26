import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BankIntegration, PaymentGateway, GovernmentIntegration } from "@/types/integrations";
import { Building2, CreditCard, Shield, Settings } from "lucide-react";

export default function IntegrationsManagement() {
  const { data: bankIntegrations = [] } = useQuery({
    queryKey: ["bank-integrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_integrations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BankIntegration[];
    },
  });

  const { data: paymentGateways = [] } = useQuery({
    queryKey: ["payment-gateways"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_gateways")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as PaymentGateway[];
    },
  });

  const { data: governmentIntegrations = [] } = useQuery({
    queryKey: ["government-integrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("government_integrations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as GovernmentIntegration[];
    },
  });

  return (
    <div className="container-custom py-6 space-y-6">
      <PageHeader
        title="التكاملات الخارجية"
        description="إدارة تكاملات البنوك والدفع والأنظمة الحكومية"
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
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
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
                  <Badge variant={gateway.is_active ? "default" : "secondary"}>
                    {gateway.is_active ? "نشط" : "غير نشط"}
                  </Badge>
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
                  <Switch checked={service.is_active} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
