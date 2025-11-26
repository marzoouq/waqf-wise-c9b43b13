import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SLAIndicator } from "./SLAIndicator";
import { RequestAttachmentsUploader } from "./RequestAttachmentsUploader";
import {
  FileText,
  MessageSquare,
  Clock,
  User,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface RequestDetailsDialogProps {
  requestId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function RequestDetailsDialog({
  requestId,
  isOpen,
  onClose,
}: RequestDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("details");

  // Fetch request details
  const { data: request, isLoading } = useQuery({
    queryKey: ["request-details", requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("beneficiary_requests")
        .select(
          `
          *,
          request_types (name_ar, icon, description),
          beneficiaries (full_name, national_id)
        `
        )
        .eq("id", requestId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: isOpen && !!requestId,
  });

  // Fetch related messages
  const { data: messages = [] } = useQuery({
    queryKey: ["request-messages", requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("internal_messages")
        .select("*")
        .eq("request_id", requestId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: isOpen && !!requestId,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "معتمد":
      case "مكتمل":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "مرفوض":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "قيد المراجعة":
      case "قيد المعالجة":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      "قيد المراجعة": "secondary",
      "قيد المعالجة": "default",
      معتمد: "default",
      مرفوض: "destructive",
      مكتمل: "default",
    };

    return (
      <Badge variant={variants[status] || "default"} className="gap-1">
        {getStatusIcon(status)}
        <span>{status}</span>
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string | null) => {
    if (!priority) return null;

    const colors: Record<string, string> = {
      عاجل: "text-red-600 border-red-200 bg-red-50",
      مهم: "text-orange-600 border-orange-200 bg-orange-50",
      عادية: "text-blue-600 border-blue-200 bg-blue-50",
    };

    return (
      <Badge variant="outline" className={colors[priority]}>
        {priority}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">جاري التحميل...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>تفاصيل الطلب #{request.request_number}</span>
            {getStatusBadge(request.status)}
            {getPriorityBadge(request.priority)}
          </DialogTitle>
          <DialogDescription>
            {(request as any).request_types?.name_ar} • تم التقديم في{" "}
            {new Date(request.submitted_at).toLocaleDateString("ar-SA")}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">التفاصيل</TabsTrigger>
            <TabsTrigger value="attachments">
              المرفقات ({request.attachments_count || 0})
            </TabsTrigger>
            <TabsTrigger value="messages">
              الرسائل ({messages.length})
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[500px] mt-4">
            <TabsContent value="details" className="space-y-6 px-1">
              {/* SLA Indicator */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">حالة SLA:</span>
                </div>
                <SLAIndicator
                  slaDueAt={request.sla_due_at}
                  status={request.status}
                  showLabel={true}
                />
              </div>

              {/* Request Info */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">المستفيد</p>
                      <p className="font-medium">
                        {request.beneficiaries?.full_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">تاريخ التقديم</p>
                      <p className="font-medium">
                        {new Date(request.submitted_at).toLocaleDateString("ar-SA")}
                      </p>
                    </div>
                  </div>
                </div>

                {request.amount && (
                  <div className="flex items-center gap-2 p-4 bg-primary/5 rounded-lg">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">المبلغ المطلوب</p>
                      <p className="text-xl font-bold text-primary">
                        {request.amount.toLocaleString("ar-SA")} ريال
                      </p>
                    </div>
                  </div>
                )}

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    تفاصيل الطلب
                  </h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {request.description}
                  </p>
                </div>

                {request.decision_notes && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">ملاحظات القرار</h4>
                      <p className="text-sm text-muted-foreground">
                        {request.decision_notes}
                      </p>
                    </div>
                  </>
                )}

                {request.rejection_reason && (
                  <>
                    <Separator />
                    <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                      <h4 className="font-semibold mb-2 text-destructive">
                        سبب الرفض
                      </h4>
                      <p className="text-sm">{request.rejection_reason}</p>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="attachments" className="px-1">
              <div className="flex justify-center py-4">
                <RequestAttachmentsUploader
                  requestId={requestId}
                  attachmentsCount={request.attachments_count || 0}
                />
              </div>
            </TabsContent>

            <TabsContent value="messages" className="px-1">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">لا توجد رسائل متعلقة بهذا الطلب</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className="p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{message.subject}</h4>
                        <Badge variant={message.is_read ? "secondary" : "default"}>
                          {message.is_read ? "مقروءة" : "جديدة"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {message.body}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleString("ar-SA")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            إغلاق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
