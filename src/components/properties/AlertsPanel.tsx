import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Clock, CheckCircle2, XCircle, Brain } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useState } from "react";
import { AIAssistantDialog } from "./AIAssistantDialog";
import type { SystemAlert, SeverityConfig } from "@/types/alerts";

export function AlertsPanel() {
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["system-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return (data || []) as SystemAlert[];
    },
    staleTime: 60 * 1000,
    refetchInterval: false, // تعطيل التحديث التلقائي لتحسين LCP
  });

  const getSeverityConfig = (severity: string): SeverityConfig => {
    const configs: Record<string, SeverityConfig> = {
      critical: { icon: XCircle, variant: "destructive", color: "text-destructive" },
      high: { icon: AlertCircle, variant: "destructive", color: "text-destructive" },
      medium: { icon: Clock, variant: "secondary", color: "text-warning" },
      low: { icon: CheckCircle2, variant: "outline", color: "text-muted-foreground" }
    };
    return configs[severity] || configs.medium;
  };

  const handleResolve = async (alertId: string) => {
    const { error } = await supabase
      .from("system_alerts")
      .update({ 
        is_resolved: true, 
        resolved_at: new Date().toISOString(),
        resolved_by: (await supabase.auth.getUser()).data.user?.id 
      })
      .eq("id", alertId);

    if (!error) {
      // Invalidate queries
      const queryClient = await import("@tanstack/react-query").then(m => m.useQueryClient);
    }
  };

  const criticalAlerts = alerts.filter(a => a.severity === 'critical' || a.severity === 'high');

  return (
    <>
      <Card className={criticalAlerts.length > 0 ? "border-destructive" : ""}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                التنبيهات والمخاطر
              </CardTitle>
              <CardDescription>
                {criticalAlerts.length > 0 ? (
                  <span className="text-destructive font-medium">
                    {criticalAlerts.length} تنبيه حرج يتطلب اهتماماً فورياً
                  </span>
                ) : (
                  "لا توجد تنبيهات حرجة"
                )}
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setAiDialogOpen(true)}
            >
              <Brain className="h-4 w-4 ml-2" />
              تحليل ذكي
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center text-muted-foreground py-8">جاري التحميل...</div>
              ) : alerts.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-success" />
                  <p>لا توجد تنبيهات</p>
                </div>
              ) : (
                alerts.map((alert) => {
                  const config = getSeverityConfig(alert.severity);
                  const Icon = config.icon;
                  
                  return (
                    <Card key={alert.id} className="border-l-4" style={{ borderLeftColor: `var(--${alert.severity})` }}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Icon className={`h-4 w-4 ${config.color}`} />
                              <h4 className="font-semibold text-sm">{alert.title}</h4>
                              <Badge variant={config.variant} className="text-xs">
                                {alert.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{alert.description || alert.title}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>
                                {format(new Date(alert.created_at), "dd MMMM yyyy", { locale: ar })}
                              </span>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleResolve(alert.id)}
                          >
                            حل
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <AIAssistantDialog
        open={aiDialogOpen}
        onOpenChange={setAiDialogOpen}
        actionType="alert_insights"
        propertyData={{ alerts }}
      />
    </>
  );
}