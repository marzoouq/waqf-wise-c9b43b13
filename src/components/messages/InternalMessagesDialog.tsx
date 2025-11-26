import { useState, useEffect } from "react";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Mail, MailOpen, Inbox, SendIcon, Reply } from "lucide-react";
import { useInternalMessages } from "@/hooks/useInternalMessages";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { productionLogger } from "@/lib/logger/production-logger";

interface InternalMessagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InternalMessagesDialog({
  open,
  onOpenChange,
}: InternalMessagesDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { inboxMessages, sentMessages, sendMessage, markAsRead, unreadCount } = useInternalMessages();
  const [activeTab, setActiveTab] = useState("inbox");
  const [replyToMessage, setReplyToMessage] = useState<typeof inboxMessages[0] | null>(null);
  const [newMessage, setNewMessage] = useState({
    receiver_id: "",
    subject: "",
    body: "",
  });
  const [recipients, setRecipients] = useState<Array<{ id: string; name: string; role: string; roleKey: string }>>([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);

  // جلب قائمة المستخدمين المتاحين للمراسلة
  useEffect(() => {
    const fetchRecipients = async () => {
      setLoadingRecipients(true);
      try {
        // جلب دور المستخدم الحالي
        const { data: currentUserRole, error: currentRoleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user?.id)
          .single();

        if (currentRoleError) throw currentRoleError;

        // تحديد الأدوار المتاحة للمراسلة بناءً على دور المستخدم
        let allowedRoles: ('accountant' | 'admin' | 'archivist' | 'beneficiary' | 'cashier' | 'nazer' | 'user')[];
        
        console.log('📌 Current user role:', currentUserRole?.role);
        
        if (currentUserRole?.role === 'beneficiary') {
          // المستفيد يمكنه مراسلة الناظر والمشرف فقط
          allowedRoles = ['admin', 'nazer'];
        } else {
          // الإداريون يمكنهم مراسلة الجميع
          allowedRoles = ['admin', 'nazer', 'accountant', 'cashier', 'beneficiary', 'archivist'];
        }
        
        console.log('📌 Allowed roles:', allowedRoles);
        
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .in('role', allowedRoles)
          .neq('user_id', user?.id); // استبعاد المستخدم الحالي

        if (rolesError) throw rolesError;
        
        console.log('📌 User roles found:', userRoles?.length, userRoles);

        if (userRoles && userRoles.length > 0) {
          const userIds = userRoles.map(ur => ur.user_id);
          
          console.log('📌 User IDs to fetch profiles for:', userIds.length);
          
          // جلب بيانات المستخدمين
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('user_id, full_name')
            .in('user_id', userIds);

          if (profilesError) throw profilesError;
          
          console.log('📌 Profiles found:', profiles?.length, profiles);

          // دمج البيانات وترجمة الأدوار
          const roleTranslations: Record<string, string> = {
            'admin': 'مشرف',
            'nazer': 'ناظر',
            'accountant': 'محاسب',
            'cashier': 'صراف',
            'beneficiary': 'مستفيد',
            'archivist': 'أرشيفي'
          };

          // ترتيب الأدوار حسب الأهمية
          const roleOrder: Record<string, number> = {
            'nazer': 1,
            'admin': 2,
            'accountant': 3,
            'cashier': 4,
            'archivist': 5,
            'beneficiary': 6
          };

          const recipientsList = profiles?.map(profile => {
            const userRole = userRoles.find(ur => ur.user_id === profile.user_id);
            const roleName = userRole?.role || 'user';
            return {
              id: profile.user_id,
              name: profile.full_name || 'مستخدم',
              role: roleTranslations[roleName] || roleName,
              roleKey: roleName
            };
          })
          .sort((a, b) => {
            // ترتيب حسب الدور أولاً، ثم الاسم
            const roleCompare = (roleOrder[a.roleKey] || 999) - (roleOrder[b.roleKey] || 999);
            if (roleCompare !== 0) return roleCompare;
            return a.name.localeCompare(b.name, 'ar');
          }) || [];

          console.log('📧 Recipients loaded:', recipientsList.length, recipientsList);
          setRecipients(recipientsList);
        } else {
          console.log('⚠️ No user roles found');
          setRecipients([]);
        }
      } catch (error) {
        productionLogger.error('Error fetching recipients', error, {
          context: 'InternalMessagesDialog',
          severity: 'medium',
        });
        toast({
          title: "خطأ في تحميل المستلمين",
          description: "حدث خطأ أثناء تحميل قائمة المستلمين",
          variant: "destructive"
        });
      } finally {
        setLoadingRecipients(false);
      }
    };

    if (open && user?.id) {
      fetchRecipients();
    }
  }, [open, user?.id]); // إزالة toast من dependencies

  const handleReplyToMessage = (message: typeof inboxMessages[0]) => {
    setReplyToMessage(message);
    setNewMessage({
      receiver_id: message.sender_id,
      subject: message.subject.startsWith("رد: ") ? message.subject : `رد: ${message.subject}`,
      body: "",
    });
    setActiveTab("compose");
  };

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
    setReplyToMessage(null);
    setActiveTab("sent");
  };

  const handleReadMessage = async (messageId: string, isRead: boolean) => {
    if (!isRead) {
      await markAsRead(messageId);
    }
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="الرسائل الداخلية"
      description="إدارة رسائلك مع الموظفين والإدارة"
      size="lg"
    >
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
                  className={!message.is_read ? 'border-primary' : ''}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {message.is_read ? (
                          <MailOpen className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Mail className="h-4 w-4 text-primary" />
                        )}
                        <div>
                          <h4 className={`font-semibold ${!message.is_read ? 'text-primary' : ''}`}>
                            {message.subject}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            من: {message.sender?.full_name || 'مستخدم'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!message.is_read && <Badge>جديد</Badge>}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReplyToMessage(message)}
                          className="gap-1"
                        >
                          <Reply className="h-3 w-3" />
                          رد
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 whitespace-pre-wrap">{message.body}</p>
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
                      <div>
                        <h4 className="font-semibold">{message.subject}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          إلى: {message.receiver?.full_name || 'مستخدم'}
                        </p>
                      </div>
                      <Badge variant="outline">مرسلة</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 whitespace-pre-wrap">{message.body}</p>
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
            {replyToMessage && (
              <Card className="bg-muted/30">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Reply className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">رد على رسالة</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><strong>الموضوع:</strong> {replyToMessage.subject}</p>
                    <p className="line-clamp-2"><strong>الرسالة الأصلية:</strong> {replyToMessage.body}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setReplyToMessage(null);
                      setNewMessage({ receiver_id: "", subject: "", body: "" });
                    }}
                    className="mt-2"
                  >
                    إلغاء الرد
                  </Button>
                </CardContent>
              </Card>
            )}
            <div className="space-y-3">
              {!replyToMessage && (
                <div>
                  <label className="text-sm font-medium mb-1 block">إلى</label>
                  {loadingRecipients ? (
                    <div className="text-sm text-muted-foreground p-2">جاري تحميل المستلمين...</div>
                  ) : recipients.length === 0 ? (
                    <div className="text-sm text-destructive p-2">⚠️ لا يوجد مستلمون متاحون</div>
                  ) : (
                    <Select
                      value={newMessage.receiver_id}
                      onValueChange={(value) => setNewMessage({ ...newMessage, receiver_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المستلم" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {recipients.map((recipient) => (
                          <SelectItem key={recipient.id} value={recipient.id}>
                            {recipient.name} ({recipient.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
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
                  rows={8}
                />
              </div>
              <Button 
                onClick={handleSendMessage} 
                className="w-full"
                disabled={!newMessage.receiver_id || !newMessage.subject || !newMessage.body}
              >
                <Send className="h-4 w-4 ml-2" />
                إرسال الرسالة
              </Button>
            </div>
          </TabsContent>
        </Tabs>
    </ResponsiveDialog>
  );
}
