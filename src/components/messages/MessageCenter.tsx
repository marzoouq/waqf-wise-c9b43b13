import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useMessages, type Message } from "@/hooks/messages/useMessages";
import { useAvailableUsers } from "@/hooks/messages/useAvailableUsers";
import { useToast } from "@/hooks/ui/use-toast";
import { format, arLocale as ar } from "@/lib/date";
import {
  Mail,
  MailOpen,
  Send,
  AlertCircle,
  Info,
  AlertTriangle,
  Reply,
  Inbox,
  SendHorizontal,
  PenSquare,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function MessageCenter() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { messages, isLoading, unreadCount, markAsRead, sendMessage } = useMessages();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [receiverId, setReceiverId] = useState<string>("");
  const [activeTab, setActiveTab] = useState("inbox");
  
  const { data: availableUsers = [] } = useAvailableUsers();

  // تقسيم الرسائل إلى واردة وصادرة
  const inboxMessages = messages.filter(m => m.receiver_id === user?.id);
  const sentMessages = messages.filter(m => m.sender_id === user?.id);

  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
    if (!message.is_read && message.receiver_id === user?.id) {
      markAsRead.mutate(message.id);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // التحقق من اختيار المستلم
    if (!receiverId) {
      toast({
        title: "خطأ",
        description: "يجب اختيار المستلم أولاً",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData(e.currentTarget);
    const subject = formData.get("subject") as string;
    const body = formData.get("body") as string;

    if (!subject?.trim() || !body?.trim()) {
      toast({
        title: "خطأ",
        description: "يجب ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    sendMessage.mutate(
      {
        receiver_id: receiverId,
        subject: subject.trim(),
        body: body.trim(),
        priority: formData.get("priority") as string || "عادي",
      },
      {
        onSuccess: () => {
          setIsComposing(false);
          setReceiverId("");
          setActiveTab("sent");
          (e.target as HTMLFormElement).reset();
        },
      }
    );
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) priority = "عادي";
    const config: Record<
      string,
      { icon: React.ComponentType<{ className?: string }>; variant: "default" | "secondary" | "destructive" }
    > = {
      عاجل: { icon: AlertCircle, variant: "destructive" },
      مهم: { icon: AlertTriangle, variant: "default" },
      عادي: { icon: Info, variant: "secondary" },
    };

    const p = config[priority] || config["عادي"];
    const Icon = p.icon;

    return (
      <Badge variant={p.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {priority}
      </Badge>
    );
  };

  const renderMessageList = (messageList: Message[], isInbox: boolean) => {
    if (messageList.length === 0) {
      return (
        <div className="p-8 text-center text-muted-foreground">
          <Mail className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>{isInbox ? "لا توجد رسائل واردة" : "لا توجد رسائل مرسلة"}</p>
        </div>
      );
    }

    return messageList.map((message) => (
      <div key={message.id}>
        <button
          onClick={() => handleSelectMessage(message)}
          className={`w-full p-4 text-right hover:bg-accent transition-colors ${
            selectedMessage?.id === message.id ? "bg-accent" : ""
          } ${
            !message.is_read && isInbox ? "font-semibold bg-primary/5" : ""
          }`}
        >
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              {isInbox ? (
                message.is_read ? (
                  <MailOpen className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Mail className="h-4 w-4 text-primary" />
                )
              ) : (
                <Send className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm">
                {isInbox
                  ? message.sender_name || "مرسل غير معروف"
                  : message.receiver_name || "مستقبل غير معروف"}
              </span>
            </div>
            {getPriorityBadge(message.priority)}
          </div>
          <div className="text-sm font-medium truncate">
            {message.subject}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {format(new Date(message.created_at), "dd MMMM yyyy - HH:mm", {
              locale: ar,
            })}
          </div>
        </button>
        <Separator />
      </div>
    ));
  };

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-[350px_1fr]">
      {/* قائمة الرسائل مع التبويبات */}
      <Card className="lg:col-span-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between mb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="h-5 w-5" />
                صندوق الرسائل
              </CardTitle>
              <Button 
                size="sm" 
                variant="default"
                onClick={() => setIsComposing(true)}
              >
                <PenSquare className="h-4 w-4 ms-2" />
                رسالة جديدة
              </Button>
            </div>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="inbox" className="flex items-center gap-2">
                <Inbox className="h-4 w-4" />
                الوارد
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent" className="flex items-center gap-2">
                <SendHorizontal className="h-4 w-4" />
                المرسل
                <Badge variant="secondary" className="text-xs">
                  {sentMessages.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          
          <CardContent className="p-0">
            <TabsContent value="inbox" className="m-0">
              <ScrollArea className="h-[450px]">
                {renderMessageList(inboxMessages, true)}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="sent" className="m-0">
              <ScrollArea className="h-[450px]">
                {renderMessageList(sentMessages, false)}
              </ScrollArea>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* محتوى الرسالة */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>
            {selectedMessage ? selectedMessage.subject : "اختر رسالة لعرضها"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedMessage ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">من:</span>
                    <span className="font-medium">
                      {selectedMessage.sender_name || "مرسل غير معروف"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">إلى:</span>
                    <span className="font-medium">
                      {selectedMessage.receiver_name || "مستقبل غير معروف"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {format(
                      new Date(selectedMessage.created_at),
                      "dd MMMM yyyy - HH:mm",
                      { locale: ar }
                    )}
                  </div>
                </div>
                {getPriorityBadge(selectedMessage.priority)}
              </div>
              <Separator />
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{selectedMessage.body}</p>
              </div>
              {selectedMessage.sender_id !== user?.id && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setReceiverId(selectedMessage.sender_id);
                      setIsComposing(true);
                    }}
                  >
                    <Reply className="h-4 w-4 ms-2" />
                    رد
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>اختر رسالة من القائمة لعرض محتواها</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* نافذة إرسال رسالة جديدة */}
      <Dialog open={isComposing} onOpenChange={(open) => {
        setIsComposing(open);
        if (!open) setReceiverId("");
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إرسال رسالة جديدة</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="receiver_id">إلى *</Label>
              <Select
                value={receiverId}
                onValueChange={setReceiverId}
              >
                <SelectTrigger id="receiver_id">
                  <SelectValue placeholder="اختر المستقبل" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground text-center">
                      لا يوجد مستخدمون متاحون
                    </div>
                  ) : (
                    availableUsers.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.displayName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">الأولوية</Label>
              <Select name="priority" defaultValue="عادي">
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="عاجل">عاجل</SelectItem>
                  <SelectItem value="مهم">مهم</SelectItem>
                  <SelectItem value="عادي">عادي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">الموضوع *</Label>
              <Input
                id="subject"
                name="subject"
                placeholder="موضوع الرسالة"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">الرسالة *</Label>
              <Textarea
                id="body"
                name="body"
                rows={5}
                placeholder="اكتب رسالتك هنا..."
                required
              />
            </div>
            <Button
              type="submit"
              disabled={sendMessage.isPending || !receiverId}
              className="w-full"
            >
              {sendMessage.isPending ? "جاري الإرسال..." : "إرسال"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
