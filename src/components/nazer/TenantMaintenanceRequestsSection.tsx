/**
 * قسم طلبات صيانة المستأجرين في لوحة الناظر
 * يعرض طلبات الصيانة المقدمة من المستأجرين عبر البوابة
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wrench, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Phone,
  MapPin,
  Calendar,
  User,
  ExternalLink
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { format, arLocale as ar } from "@/lib/date";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MaintenanceRequest {
  id: string;
  request_number: string;
  title: string;
  description: string | null;
  category: string | null;
  status: string | null;
  priority: string | null;
  created_at: string;
  requested_by: string | null;
  property_id: string | null;
  unit_id: string | null;
  contact_phone: string | null;
  properties?: {
    name: string;
  } | null;
  tenants?: {
    full_name: string;
    phone: string;
  } | null;
}

export function TenantMaintenanceRequestsSection() {
  const navigate = useNavigate();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['tenant-maintenance-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select(`
          id,
          request_number,
          title,
          description,
          category,
          status,
          priority,
          created_at,
          requested_by,
          property_id,
          unit_id,
          contact_phone,
          properties(name),
          tenants(full_name, phone)
        `)
        .in('status', ['جديد', 'معلق', 'قيد المراجعة', 'قيد التنفيذ'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as MaintenanceRequest[];
    },
    refetchInterval: 30000, // تحديث كل 30 ثانية
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'جديد': return 'bg-info text-info-foreground';
      case 'معلق': return 'bg-warning text-warning-foreground';
      case 'قيد المراجعة': return 'bg-secondary text-secondary-foreground';
      case 'قيد التنفيذ': return 'bg-primary text-primary-foreground';
      case 'مكتمل': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'عاجلة': return 'bg-destructive text-destructive-foreground';
      case 'عالية': return 'bg-warning text-warning-foreground';
      case 'عادية': return 'bg-secondary text-secondary-foreground';
      case 'منخفضة': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const newRequestsCount = requests.filter(r => r.status === 'جديد').length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3 p-3 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Wrench className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>طلبات صيانة المستأجرين</span>
            {newRequestsCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {newRequestsCount} جديد
              </Badge>
            )}
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/properties')}
            className="text-xs sm:text-sm gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            <span className="hidden sm:inline">عرض الكل</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0">
        {requests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Wrench className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>لا توجد طلبات صيانة حالية</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] sm:h-[400px]">
            <div className="space-y-3 pr-2">
              {requests.map((request) => (
                <div 
                  key={request.id}
                  className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/properties`)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs text-muted-foreground font-mono">
                          #{request.request_number}
                        </span>
                        <Badge className={`${getStatusColor(request.status)} text-[10px]`}>
                          {request.status}
                        </Badge>
                        <Badge className={`${getPriorityColor(request.priority)} text-[10px]`}>
                          {request.priority}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-sm truncate">{request.title}</h4>
                    </div>
                    {request.status === 'جديد' && (
                      <div className="shrink-0">
                        <AlertTriangle className="h-4 w-4 text-warning animate-pulse" />
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {request.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] sm:text-xs text-muted-foreground">
                    {request.properties?.name && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{request.properties.name}</span>
                        {request.unit_id && <span>- وحدة</span>}
                      </div>
                    )}
                    
                    {request.tenants?.full_name && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{request.tenants.full_name}</span>
                      </div>
                    )}

                    {(request.contact_phone || request.tenants?.phone) && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span dir="ltr">{request.contact_phone || request.tenants?.phone}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(request.created_at), 'dd/MM/yyyy HH:mm', { locale: ar })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
