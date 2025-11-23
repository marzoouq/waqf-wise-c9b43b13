import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  Mail,
  MailOpen,
  Send,
  AlertCircle,
  Info,
  AlertTriangle,
  Reply,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  subject: string;
  body: string;
  is_read: boolean;
  read_at: string | null;
  priority?: string;
  related_request_id?: string | null;
  parent_message_id?: string | null;
  request_id?: string | null;
  created_at: string;
  updated_at?: string;
  sender_name?: string;
  receiver_name?: string;
  sender_number?: string;
  receiver_number?: string;
}

export function MessageCenter() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isComposing, setIsComposing] = useState(false);

  // جلب الرسائل
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["messages", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("messages_with_users")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!user,
  });

  // تحديد الرسالة كمقروءة
  const markAsRead = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from("internal_messages")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", messageId)
        .eq("receiver_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });

  // إرسال رسالة جديدة
  const sendMessage = useMutation({
    mutationFn: async (message: {
      receiver_id: string;
      subject: string;
      body: string;
      priority: string;
    }) => {
      const { error } = await supabase.from("internal_messages").insert({
        sender_id: user?.id,
        ...message,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      setIsComposing(false);
      toast({
        title: "تم الإرسال",
        description: "تم إرسال الرسالة بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل إرسال الرسالة",
        variant: "destructive",
      });
    },
  });

  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
    if (!message.is_read && message.receiver_id === user?.id) {
      markAsRead.mutate(message.id);
    }
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) priority = "عادي";
    const config: Record<
      string,
      { icon: any; variant: "default" | "secondary" | "destructive" }
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

  const unreadCount = messages.filter(
    (m) => m.receiver_id === user?.id && !m.is_read
  ).length;

  return (
    <div className="grid gap-4 md:grid-cols-[300px_1fr]">
      {/* قائمة الرسائل */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            الرسائل {unreadCount > 0 && `(${unreadCount})`}
          </CardTitle>
          <Dialog open={isComposing} onOpenChange={setIsComposing}>
            <DialogTrigger asChild>
              <Button size="sm" variant="default">
                <Send className="h-4 w-4 ml-2" />
                رسالة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إرسال رسالة جديدة</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  sendMessage.mutate({
                    receiver_id: formData.get("receiver_id") as string,
                    subject: formData.get("subject") as string,
                    body: formData.get("body") as string,
                    priority: formData.get("priority") as string,
                  });
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="receiver_id">إلى</Label>
                  <Input
                    id="receiver_id"
                    name="receiver_id"
                    placeholder="معرف المستقبل"
                    required
                  />
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
                  <Label htmlFor="subject">الموضوع</Label>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="موضوع الرسالة"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="body">الرسالة</Label>
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
                  disabled={sendMessage.isPending}
                  className="w-full"
                >
                  {sendMessage.isPending ? "جاري الإرسال..." : "إرسال"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {messages.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                لا توجد رسائل
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id}>
                  <button
                    onClick={() => handleSelectMessage(message)}
                    className={`w-full p-4 text-right hover:bg-accent transition-colors ${
                      selectedMessage?.id === message.id ? "bg-accent" : ""
                    } ${
                      !message.is_read && message.receiver_id === user?.id
                        ? "font-semibold"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        {message.receiver_id === user?.id ? (
                          message.is_read ? (
                            <MailOpen className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Mail className="h-4 w-4 text-primary" />
                          )
                        ) : (
                          <Send className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm">
                          {message.receiver_id === user?.id
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
                      {format(new Date(message.created_at), "dd/MM/yyyy HH:mm", {
                        locale: ar,
                      })}
                    </div>
                  </button>
                  <Separator />
                </div>
              ))
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* محتوى الرسالة */}
      <Card>
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
                      setIsComposing(true);
                      // يمكن تعبئة حقول الرد هنا
                    }}
                  >
                    <Reply className="h-4 w-4 ml-2" />
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
    </div>
  );
}
