import React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MaskedValueProps {
  value: string | null | undefined;
  type: "iban" | "phone" | "amount" | "national_id";
  masked: boolean;
  showToggle?: boolean;
}

export function MaskedValue({ value, type, masked, showToggle = false }: MaskedValueProps) {
  const [isRevealed, setIsRevealed] = React.useState(false);

  if (!value) return <span className="text-muted-foreground">-</span>;

  const shouldMask = masked && !isRevealed;

  const getMaskedValue = () => {
    if (!shouldMask) return value;

    switch (type) {
      case "iban":
        // عرض أول حرفين وآخر 4 أرقام
        if (value.length > 6) {
          return `${value.substring(0, 2)}${"*".repeat(value.length - 6)}${value.slice(-4)}`;
        }
        return value;

      case "phone":
        // عرض آخر 4 أرقام فقط
        if (value.length > 4) {
          return `${"*".repeat(value.length - 4)}${value.slice(-4)}`;
        }
        return value;

      case "amount":
        // تقريب المبلغ لأقرب 1000
        const amount = parseFloat(value.replace(/[^\d.]/g, ""));
        if (!isNaN(amount)) {
          const rounded = Math.round(amount / 1000) * 1000;
          return `~${rounded.toLocaleString("ar-SA")} ريال`;
        }
        return value;

      case "national_id":
        // عرض أول رقمين وآخر رقمين
        if (value.length > 4) {
          return `${value.substring(0, 2)}${"*".repeat(value.length - 4)}${value.slice(-2)}`;
        }
        return value;

      default:
        return value;
    }
  };

  return (
    <span className="inline-flex items-center gap-2">
      <span className="font-mono">{getMaskedValue()}</span>
      {showToggle && masked && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsRevealed(!isRevealed)}
          className="h-6 w-6 p-0"
        >
          {isRevealed ? (
            <EyeOff className="h-3 w-3" />
          ) : (
            <Eye className="h-3 w-3" />
          )}
        </Button>
      )}
    </span>
  );
}
