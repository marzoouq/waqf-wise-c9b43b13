import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/ui/use-toast";
import { format, arLocale as ar } from "@/lib/date";

interface ChatMessage {
  id: string;
  message: string;
  message_type: "user" | "bot";
  created_at: string;
}

interface ChatbotActionsProps {
  conversations: ChatMessage[];
  onClearHistory: () => Promise<void>;
  hasConversations: boolean;
}

export function ChatbotActions({ conversations, onClearHistory, hasConversations }: ChatbotActionsProps) {
  const { toast } = useToast();

  const handleExport = () => {
    try {
      const exportData = {
        exportedAt: new Date().toISOString(),
        conversationCount: conversations.length,
        conversations: conversations.map(msg => ({
          type: msg.message_type === "user" ? "المستخدم" : "المساعد",
          message: msg.message,
          timestamp: format(new Date(msg.created_at), "dd/MM/yyyy HH:mm", { locale: ar }),
        })),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `chatbot-conversations-${format(new Date(), "yyyy-MM-dd-HH-mm", { locale: ar })}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "تم التصدير",
        description: "تم تصدير المحادثات بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تصدير المحادثات",
        variant: "destructive",
      });
    }
  };

  if (!hasConversations) return null;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleExport}
        className="text-primary-foreground hover:bg-primary-foreground/10"
        title="تصدير المحادثات"
      >
        <Download className="h-4 w-4" />
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/10"
            title="مسح المحادثات"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>مسح سجل المحادثات</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من رغبتك في حذف جميع المحادثات ({conversations.length} رسالة)؟ 
              لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={onClearHistory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              مسح
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
