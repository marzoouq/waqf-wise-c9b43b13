import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { toast } from "@/hooks/ui/use-toast";

interface PrintButtonProps {
  data: unknown;
  title: string;
  onPrint?: () => void;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export const PrintButton = ({
  data,
  title,
  onPrint,
  variant = "outline",
  size = "sm",
  className,
}: PrintButtonProps) => {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      // Default print functionality
      window.print();
      toast({
        title: "جاري الطباعة",
        description: `جاري تحضير ${title} للطباعة...`,
      });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handlePrint}
      className={className}
    >
      <Printer className="h-4 w-4 ml-2" />
      طباعة
    </Button>
  );
};
