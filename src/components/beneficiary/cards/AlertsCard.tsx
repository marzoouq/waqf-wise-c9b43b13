/**
 * AlertsCard Component
 * بطاقة التنبيهات الهامة
 */

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText, 
  ArrowLeft,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface AlertsCardProps {
  beneficiaryId: string;
}

export function AlertsCard({ beneficiaryId }: AlertsCardProps) {
  const navigate = useNavigate();

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['beneficiary-alerts', beneficiaryId],
    queryFn: async () => {
      // جلب الطلبات المعلقة للمستفيد
      const { data: pendingRequests } = await supabase
        .from('beneficiary_requests')
        .select('id, status, request_number, created_at')
        .eq('beneficiary_id', beneficiaryId)
        .in('status', ['قيد المراجعة', 'معلق', 'pending'])
        .limit(5);

      // جلب user_id للمستفيد أولاً
      const { data: beneficiaryData } = await supabase
        .from('beneficiaries')
        .select('user_id')
        .eq('id', beneficiaryId)
        .maybeSingle();

      let unreadNotifications = 0;

      // جلب الإشعارات غير المقروءة للمستفيد فقط
      if (beneficiaryData?.user_id) {
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', beneficiaryData.user_id)
          .eq('is_read', false);
        
        unreadNotifications = count || 0;
      }

      return {
        pendingRequests: pendingRequests || [],
        unreadNotifications
      };
    },
    staleTime: 30000,
    enabled: !!beneficiaryId
  });

  const alertItems = useMemo(() => {
    const items = [];
    
    if (alerts?.pendingRequests && alerts.pendingRequests.length > 0) {
      items.push({
        id: 'pending-requests',
        icon: Clock,
        title: `${alerts.pendingRequests.length} طلب قيد المراجعة`,
        description: "طلباتك قيد المراجعة من الإدارة",
        type: 'warning' as const,
        action: () => navigate('/beneficiary-portal?tab=requests')
      });
    }

    if (alerts?.unreadNotifications && alerts.unreadNotifications > 0) {
      items.push({
        id: 'unread-notifications',
        icon: Bell,
        title: `${alerts.unreadNotifications} إشعار غير مقروء`,
        description: "لديك إشعارات جديدة",
        type: 'info' as const,
        action: () => navigate('/notifications')
      });
    }

    return items;
  }, [alerts, navigate]);

  if (isLoading) {
    return (
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (alertItems.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="border-success/30 bg-gradient-to-br from-success/5 to-background">
          <CardContent className="p-6 text-center">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-success/10 mb-3">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h3 className="font-semibold text-lg mb-1">لا توجد تنبيهات</h3>
            <p className="text-muted-foreground text-sm">كل شيء على ما يرام!</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className="border-warning/30 bg-gradient-to-br from-warning/5 to-background overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-lg bg-warning/10">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            تنبيهات هامة
            <Badge variant="secondary" className="bg-warning/20 text-warning border-0 ms-auto">
              {alertItems.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {alertItems.map((alert, index) => {
            const AlertIcon = alert.icon;
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`
                  p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md
                  ${alert.type === 'warning' 
                    ? 'bg-warning/5 border-warning/20 hover:border-warning/40' 
                    : 'bg-info/5 border-info/20 hover:border-info/40'
                  }
                `}
                onClick={alert.action}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      alert.type === 'warning' ? 'bg-warning/10' : 'bg-info/10'
                    }`}>
                      <AlertIcon className={`h-5 w-5 ${
                        alert.type === 'warning' ? 'text-warning' : 'text-info'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{alert.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
                    </div>
                  </div>
                  <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}
