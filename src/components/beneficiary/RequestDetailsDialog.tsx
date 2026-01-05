import { useState } from "react";
import { useRequestDetails } from "@/hooks/beneficiary/useBeneficiaryProfileData";
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

  const { request, messages, isLoading } = useRequestDetails(requestId, isOpen);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "معتمد":
      case "مكتمل":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "مرفوض":
        return <XCircle className="h-5 w-5 text-destructive" />;
      case "قيد المراجعة":
      case "قيد المعالجة":
        return <Clock className="h-5 w-5 text-warning" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
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
      عاجل: "text-destructive border-destructive/20 bg-destructive/10",
      مهم: "text-warning border-warning/20 bg-warning/10",
      عادية: "text-info border-info/20 bg-info/10",
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
          <DialogHeader>
            <DialogTitle>جاري التحميل...</DialogTitle>
          </DialogHeader>
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
            {request.request_types?.name_ar} • تم التقديم في{" "}
            {new Date(request.submitted_at || request.created_at).toLocaleDateString("ar-SA")}
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
              <RequestAttachmentsUploader
                requestId={requestId}
                attachmentsCount={request.attachments_count || 0}
                inline={true}
              />
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
