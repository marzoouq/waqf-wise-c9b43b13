import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Mail, MailOpen, Inbox, SendIcon } from "lucide-react";
import { useInternalMessages } from "@/hooks/useInternalMessages";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface InternalMessagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InternalMessagesDialog({
  open,
  onOpenChange,
}: InternalMessagesDialogProps) {
  const { user } = useAuth();
  const { inboxMessages, sentMessages, sendMessage, markAsRead, unreadCount } = useInternalMessages();
  const [activeTab, setActiveTab] = useState("inbox");
  const [newMessage, setNewMessage] = useState({
    receiver_id: "",
    subject: "",
    body: "",
  });

  const handleSendMessage = async () => {
    if (!newMessage.receiver_id || !newMessage.subject || !newMessage.body) {
      return;
    }

    await sendMessage({
      sender_id: user?.id || "",
      receiver_id: newMessage.receiver_id,
      subject: newMessage.subject,
      body: newMessage.body,
    });

    setNewMessage({ receiver_id: "", subject: "", body: "" });
    setActiveTab("sent");
  };

  const handleReadMessage = async (messageId: string, isRead: boolean) => {
    if (!isRead) {
      await markAsRead(messageId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>الرسائل الداخلية</DialogTitle>
          <DialogDescription>
            إدارة رسائلك مع الموظفين والإدارة
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="inbox" className="gap-2">
              <Inbox className="h-4 w-4" />
              الواردة ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="sent" className="gap-2">
              <SendIcon className="h-4 w-4" />
              المرسلة
            </TabsTrigger>
            <TabsTrigger value="compose" className="gap-2">
              <Send className="h-4 w-4" />
              إنشاء رسالة
            </TabsTrigger>
          </TabsList>

          {/* الرسائل الواردة */}
          <TabsContent value="inbox" className="space-y-3 max-h-[450px] overflow-y-auto">
            {inboxMessages.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>لا توجد رسائل واردة</p>
                </CardContent>
              </Card>
            ) : (
              inboxMessages.map((message) => (
                <Card 
                  key={message.id} 
                  className={`cursor-pointer hover:bg-muted/50 ${!message.is_read ? 'border-primary' : ''}`}
                  onClick={() => handleReadMessage(message.id, message.is_read)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {message.is_read ? (
                          <MailOpen className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Mail className="h-4 w-4 text-primary" />
                        )}
                        <h4 className={`font-semibold ${!message.is_read ? 'text-primary' : ''}`}>
                          {message.subject}
                        </h4>
                      </div>
                      {!message.is_read && <Badge>جديد</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{message.body}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(message.created_at), "dd MMMM yyyy - HH:mm", { locale: ar })}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* الرسائل المرسلة */}
          <TabsContent value="sent" className="space-y-3 max-h-[450px] overflow-y-auto">
            {sentMessages.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <SendIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>لا توجد رسائل مرسلة</p>
                </CardContent>
              </Card>
            ) : (
              sentMessages.map((message) => (
                <Card key={message.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{message.subject}</h4>
                      <Badge variant="outline">مرسلة</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{message.body}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(message.created_at), "dd MMMM yyyy - HH:mm", { locale: ar })}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* إنشاء رسالة جديدة */}
          <TabsContent value="compose" className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">إلى (معرف المستلم)</label>
                <Input
                  placeholder="أدخل معرف المستلم"
                  value={newMessage.receiver_id}
                  onChange={(e) => setNewMessage({ ...newMessage, receiver_id: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">الموضوع</label>
                <Input
                  placeholder="موضوع الرسالة"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">الرسالة</label>
                <Textarea
                  placeholder="اكتب رسالتك هنا..."
                  value={newMessage.body}
                  onChange={(e) => setNewMessage({ ...newMessage, body: e.target.value })}
                  rows={6}
                />
              </div>
              <Button onClick={handleSendMessage} className="w-full">
                <Send className="h-4 w-4 ml-2" />
                إرسال الرسالة
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
