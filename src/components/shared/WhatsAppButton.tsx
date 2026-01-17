import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessageCircle, Send, Clock, AlertTriangle, Heart } from "lucide-react";

interface WhatsAppButtonProps {
  phone: string;
  tenantName: string;
  amount?: number;
  daysRemaining?: number;
  variant?: "icon" | "button" | "ghost";
  size?: "sm" | "default";
  showLabel?: boolean;
}

const formatPhoneNumber = (phone: string): string => {
  // إزالة أي أحرف غير رقمية
  let cleaned = phone.replace(/\D/g, "");
  
  // إذا كان الرقم يبدأ بـ 0، نضيف 966
  if (cleaned.startsWith("0")) {
    cleaned = "966" + cleaned.substring(1);
  }
  
  // إذا لم يبدأ بـ 966، نضيفها
  if (!cleaned.startsWith("966")) {
    cleaned = "966" + cleaned;
  }
  
  return cleaned;
};

const generateReminderMessage = (
  tenantName: string,
  amount: number,
  daysRemaining: number
): string => {
  return `مرحباً ${tenantName}،

نذكركم بموعد استحقاق الإيجار:
📅 المبلغ: ${amount.toLocaleString("ar-SA")} ريال
⏰ الأيام المتبقية: ${daysRemaining} يوم

شكراً لتعاونكم 🙏`;
};

const generateOverdueMessage = (
  tenantName: string,
  amount: number,
  daysOverdue: number
): string => {
  return `مرحباً ${tenantName}،

نود تذكيركم بوجود مبلغ مستحق:
💰 المبلغ المتأخر: ${amount.toLocaleString("ar-SA")} ريال
⚠️ عدد أيام التأخير: ${daysOverdue} يوم

يرجى التواصل معنا لترتيب الدفع
شكراً لتفهمكم 🙏`;
};

const generateThankYouMessage = (tenantName: string): string => {
  return `مرحباً ${tenantName}،

نشكركم على سداد مستحقاتكم في الوقت المحدد.
نقدر تعاونكم والتزامكم 💚

مع تحياتنا`;
};

const generateCustomMessage = (tenantName: string): string => {
  return `مرحباً ${tenantName}،

`;
};

const openWhatsApp = (phone: string, message: string) => {
  const formattedPhone = formatPhoneNumber(phone);
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  window.open(whatsappUrl, "_blank");
};

export function WhatsAppButton({
  phone,
  tenantName,
  amount = 0,
  daysRemaining = 0,
  variant = "icon",
  size = "default",
  showLabel = true,
}: WhatsAppButtonProps) {
  if (!phone) return null;

  const handleReminderMessage = () => {
    const message = generateReminderMessage(tenantName, amount, Math.abs(daysRemaining));
    openWhatsApp(phone, message);
  };

  const handleOverdueMessage = () => {
    const message = generateOverdueMessage(tenantName, amount, Math.abs(daysRemaining));
    openWhatsApp(phone, message);
  };

  const handleThankYouMessage = () => {
    const message = generateThankYouMessage(tenantName);
    openWhatsApp(phone, message);
  };

  const handleCustomMessage = () => {
    const message = generateCustomMessage(tenantName);
    openWhatsApp(phone, message);
  };

  // إذا كان هناك مبلغ ودفعة قادمة، نرسل تذكير مباشر
  const handleQuickMessage = () => {
    if (daysRemaining < 0) {
      // متأخر
      handleOverdueMessage();
    } else if (daysRemaining > 0) {
      // تذكير
      handleReminderMessage();
    } else {
      // رسالة عامة
      handleCustomMessage();
    }
  };

  if (variant === "button") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size={size}
            className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
          >
            <MessageCircle className="h-4 w-4 ms-2" />
            {showLabel && "واتساب"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleReminderMessage}>
            <Clock className="h-4 w-4 ms-2 text-blue-500" />
            تذكير بالدفعة
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleOverdueMessage}>
            <AlertTriangle className="h-4 w-4 ms-2 text-destructive" />
            تنبيه تأخير
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleThankYouMessage}>
            <Heart className="h-4 w-4 ms-2 text-green-500" />
            شكر على الدفع
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCustomMessage}>
            <Send className="h-4 w-4 ms-2 text-muted-foreground" />
            رسالة مخصصة
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (variant === "ghost") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size={size}
            className="text-green-600 hover:text-green-700 hover:bg-green-100"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleReminderMessage}>
            <Clock className="h-4 w-4 ms-2 text-blue-500" />
            تذكير بالدفعة
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleOverdueMessage}>
            <AlertTriangle className="h-4 w-4 ms-2 text-destructive" />
            تنبيه تأخير
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleThankYouMessage}>
            <Heart className="h-4 w-4 ms-2 text-green-500" />
            شكر على الدفع
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCustomMessage}>
            <Send className="h-4 w-4 ms-2 text-muted-foreground" />
            رسالة مخصصة
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
          title="إرسال واتساب"
        >
          <MessageCircle className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleReminderMessage}>
          <Clock className="h-4 w-4 ms-2 text-blue-500" />
          تذكير بالدفعة
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleOverdueMessage}>
          <AlertTriangle className="h-4 w-4 ms-2 text-destructive" />
          تنبيه تأخير
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleThankYouMessage}>
          <Heart className="h-4 w-4 ms-2 text-green-500" />
          شكر على الدفع
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCustomMessage}>
          <Send className="h-4 w-4 ms-2 text-muted-foreground" />
          رسالة مخصصة
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
