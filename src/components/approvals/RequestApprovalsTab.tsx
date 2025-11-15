import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useState } from "react";
import { RequestWithBeneficiary, StatusConfigMap } from "@/types/approvals";

export function RequestApprovalsTab() {
  const [selectedRequest, setSelectedRequest] = useState<RequestWithBeneficiary | null>(null);

  const { data: requests, isLoading } = useQuery<RequestWithBeneficiary[]>({
    queryKey: ["requests_with_approvals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("beneficiary_requests")
        .select(`
          *,
          beneficiaries(full_name, national_id),
          request_types(name_ar, name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as RequestWithBeneficiary[];
    },
  });

  const getStatusBadge = (status: string) => {
    const config: StatusConfigMap = {
      "قيد المراجعة": { label: "قيد المراجعة", variant: "secondary", icon: Clock },
      "موافق عليه": { label: "موافق عليه", variant: "default", icon: CheckCircle },
      "مرفوض": { label: "مرفوض", variant: "destructive", icon: XCircle },
    };
    const c = config[status] || config["قيد المراجعة"];
    const Icon = c.icon;
    return (
      <Badge variant={c.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {c.label}
      </Badge>
    );
  };

  const getApprovalProgress = (approvals: { status: string }[] | undefined) => {
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
    <div className="space-y-4">
      {requests?.map((request) => (
        <Card key={request.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{request.request_number}</CardTitle>
              {getStatusBadge(request.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">نوع الطلب</p>
                <p className="text-base font-semibold">{request.request_types?.name_ar}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">المستفيد</p>
                <p className="text-base">{request.beneficiaries?.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">تاريخ الطلب</p>
                <p className="text-base">
                  {format(new Date(request.submitted_at), "dd MMM yyyy", { locale: ar })}
                </p>
              </div>
            <div>
              <p className="text-sm text-muted-foreground">تقدم الموافقات</p>
              <p className="text-lg font-semibold">قيد المعالجة</p>
            </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-1">الوصف:</p>
              <p className="text-sm">{request.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}

      {requests?.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">لا توجد طلبات بحاجة للموافقة</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}