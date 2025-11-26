import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useMessages, type Message } from "@/hooks/useMessages";
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

export function MessageCenter() {
  const { user } = useAuth();
  const { messages, isLoading, unreadCount, markAsRead, sendMessage } = useMessages();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [receiverId, setReceiverId] = useState<string>("");
  
  // Fetch available users for messaging
  const { data: availableUsers = [] } = useQuery({
    queryKey: ["available-users"],
    queryFn: async () => {
      // جلب جميع المستخدمين بجميع أدوارهم
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .limit(200);
        
      if (error) throw error;
      
      if (!data || data.length === 0) return [];
      
      // جلب أسماء المستفيدين
      const userIds = [...new Set(data.map(u => u.user_id))];
      const { data: beneficiaries } = await supabase
        .from("beneficiaries")
        .select("user_id, full_name, beneficiary_number")
        .in("user_id", userIds);
        
      // تجميع المستخدمين حسب user_id وأدوارهم
      const userMap = new Map<string, { id: string; name: string; roles: string[] }>();
      
      data.forEach(u => {
        const beneficiary = beneficiaries?.find(b => b.user_id === u.user_id);
        const existingUser = userMap.get(u.user_id);
        
        if (existingUser) {
          existingUser.roles.push(u.role);
        } else {
          userMap.set(u.user_id, {
            id: u.user_id,
            name: beneficiary?.full_name || 
                  (u.role === 'nazer' ? 'الناظر' : 
                   u.role === 'admin' ? 'المشرف' :
                   u.role === 'accountant' ? 'المحاسب' :
                   u.role === 'cashier' ? 'أمين الصندوق' :
                   u.role === 'archivist' ? 'الأرشيفي' :
                   beneficiary?.beneficiary_number || 'مستخدم'),
            roles: [u.role]
          });
        }
      });
      
      return Array.from(userMap.values())
        .map(u => ({
          ...u,
          displayName: `${u.name} (${u.roles.join(', ')})`,
          role: u.roles[0] // للعرض فقط
        }))
        .sort((a, b) => {
          // ترتيب حسب الأدوار: nazer, admin, ثم المستفيدين
          const roleOrder: Record<string, number> = {
            nazer: 1,
            admin: 2,
            accountant: 3,
            cashier: 4,
            archivist: 5,
            beneficiary: 6,
            user: 7
          };
          return (roleOrder[a.role] || 999) - (roleOrder[b.role] || 999);
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
                  sendMessage.mutate(
                    {
                      receiver_id: receiverId,
                      subject: formData.get("subject") as string,
                      body: formData.get("body") as string,
                      priority: formData.get("priority") as string,
                    },
                    {
                      onSuccess: () => {
                        setIsComposing(false);
                        setReceiverId("");
                        e.currentTarget.reset();
                      },
                    }
                  );
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="receiver_id">إلى</Label>
                  <Select
                    value={receiverId}
                    onValueChange={setReceiverId}
                    required
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
